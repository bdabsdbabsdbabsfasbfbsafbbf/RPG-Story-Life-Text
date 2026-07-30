import { prisma } from '../../../shared/infrastructure/database/PrismaClient';
import { RedisClient } from '../../../shared/infrastructure/cache/RedisClient';
import { SocketServer } from '../../../shared/infrastructure/websocket/SocketServer';
import { eventBus } from '../../../shared/domain/GameEvent';
import { logger } from '../../../shared/infrastructure/logger/Logger';

interface CombatState {
  playerId: string;
  targetId: string;
  isActive: boolean;
  skills: Map<string, { lastUsed: number; cooldown: number }>;
  autoAttack: { lastUsed: number; cooldown: number };
  stacks: Map<string, { count: number; expiresAt: number }>;
  buffs: Map<string, { duration: number; appliedAt: number; stacks: number }>;
  debuffs: Map<string, { duration: number; appliedAt: number; stacks: number }>;
}

export class CombatManager {
  private static activeCombats: Map<string, CombatState> = new Map();
  private static tickInterval: NodeJS.Timeout | null = null;

  static startCombat(playerId: string, targetId: string): CombatState {
    const combatId = `${playerId}:${targetId}`;
    
    const state: CombatState = {
      playerId,
      targetId,
      isActive: true,
      skills: new Map(),
      autoAttack: { lastUsed: 0, cooldown: 1000 },
      stacks: new Map(),
      buffs: new Map(),
      debuffs: new Map(),
    };

    this.activeCombats.set(combatId, state);

    eventBus.publish({
      type: 'combat.started',
      payload: { playerId, targetId },
      timestamp: new Date(),
    });

    SocketServer.emitToPlayer(playerId, 'combat-started', { targetId });

    if (!this.tickInterval) {
      this.startTickLoop();
    }

    return state;
  }

  static stopCombat(playerId: string, targetId: string): void {
    const combatId = `${playerId}:${targetId}`;
    const state = this.activeCombats.get(combatId);
    if (state) {
      state.isActive = false;
      this.activeCombats.delete(combatId);

      eventBus.publish({
        type: 'combat.ended',
        payload: { playerId, targetId },
        timestamp: new Date(),
      });

      SocketServer.emitToPlayer(playerId, 'combat-ended', { targetId });
    }
  }

  static getCombatState(playerId: string, targetId: string): CombatState | undefined {
    return this.activeCombats.get(`${playerId}:${targetId}`);
  }

  private static startTickLoop(): void {
    this.tickInterval = setInterval(() => {
      this.processCombatTick();
    }, 1000);
  }

  private static async processCombatTick(): Promise<void> {
    for (const [combatId, state] of this.activeCombats) {
      if (!state.isActive) continue;

      try {
        await this.processAutoAttack(state);
        await this.processDOTS(state);
        await this.processBuffTicks(state);
        await this.processStackDecay(state);
      } catch (error) {
        logger.error(`Combat tick error for ${combatId}:`, error);
      }
    }
  }

  private static async processAutoAttack(state: CombatState): Promise<void> {
    const now = Date.now();
    if (now - state.autoAttack.lastUsed >= state.autoAttack.cooldown) {
      state.autoAttack.lastUsed = now;
      const damage = await this.calculateDamage(state.playerId, state.targetId, 'physical', 1.0);
      await this.applyDamage(state.targetId, damage, state.playerId);
      
      SocketServer.emitToPlayer(state.playerId, 'combat-damage', {
        type: 'auto-attack',
        damage,
        targetId: state.targetId,
      });
    }
  }

  static async useSkill(playerId: string, targetId: string, skillId: string): Promise<void> {
    const combatId = `${playerId}:${targetId}`;
    const state = this.activeCombats.get(combatId);
    if (!state) throw new Error('Combat not active');

    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      include: { effects: true },
    });

    if (!skill) throw new Error('Skill not found');

    const skillState = state.skills.get(skillId) || { lastUsed: 0, cooldown: skill.cooldownMs };
    const now = Date.now();

    if (now - skillState.lastUsed < skillState.cooldown) {
      SocketServer.emitToPlayer(playerId, 'skill-cooldown', {
        skillId,
        remaining: skillState.cooldown - (now - skillState.lastUsed),
      });
      return;
    }

    skillState.lastUsed = now;
    skillState.cooldown = skill.cooldownMs;
    state.skills.set(skillId, skillState);

    for (const effect of skill.effects) {
      await this.processSkillEffect(effect, playerId, targetId, state);
    }

    SocketServer.emitToPlayer(playerId, 'skill-used', {
      skillId: skill.id,
      skillName: skill.name,
      targetId,
    });
  }

  private static async processSkillEffect(
    effect: any,
    playerId: string,
    targetId: string,
    state: CombatState
  ): Promise<void> {
    switch (effect.effectType) {
      case 'DAMAGE': {
        const damage = await this.calculateDamage(playerId, targetId, 'physical', effect.value);
        await this.applyDamage(targetId, damage, playerId);
        break;
      }
      case 'HEAL': {
        await this.applyHeal(playerId, effect.value);
        break;
      }
      case 'BUFF': {
        if (effect.buffId) {
          state.buffs.set(effect.buffId, {
            duration: effect.duration || 5000,
            appliedAt: Date.now(),
            stacks: effect.stacks || 1,
          });
          SocketServer.emitToPlayer(playerId, 'buff-applied', {
            buffId: effect.buffId,
            duration: effect.duration,
            stacks: effect.stacks,
          });
        }
        break;
      }
      case 'DEBUFF': {
        state.debuffs.set(effect.buffId || effect.id, {
          duration: effect.duration || 5000,
          appliedAt: Date.now(),
          stacks: effect.stacks || 1,
        });
        SocketServer.emitToPlayer(playerId, 'debuff-applied', {
          debuffId: effect.buffId || effect.id,
          targetId,
          duration: effect.duration,
        });
        break;
      }
      case 'STACK': {
        const stackKey = effect.stackType || effect.id;
        const existingStack = state.stacks.get(stackKey) || { count: 0, expiresAt: Date.now() + (effect.duration || 10000) };
        existingStack.count = Math.min(existingStack.count + (effect.stackAmount || 1), effect.stackMax || 10);
        existingStack.expiresAt = Date.now() + (effect.duration || 10000);
        state.stacks.set(stackKey, existingStack);

        if (existingStack.count >= (effect.stackMax || 10)) {
          const explosionDamage = effect.stackExplodeDamage || (existingStack.count * 50);
          await this.applyDamage(targetId, explosionDamage, playerId);
          state.stacks.delete(stackKey);
          SocketServer.emitToPlayer(playerId, 'stack-explosion', {
            stackType: stackKey,
            damage: explosionDamage,
          });
        } else {
          SocketServer.emitToPlayer(playerId, 'stack-gained', {
            stackType: stackKey,
            count: existingStack.count,
            maxStacks: effect.stackMax || 10,
          });
        }
        break;
      }
      case 'DOT': {
        break;
      }
      case 'STUN': {
        break;
      }
      case 'SHIELD': {
        break;
      }
    }
  }

  static async calculateDamage(
    attackerId: string,
    defenderId: string,
    damageType: string,
    multiplier: number = 1.0
  ): Promise<number> {
    const attacker = await prisma.player.findUnique({
      where: { id: attackerId },
      include: {
        stats: true,
        equipment: { include: { item: true } },
      },
    });

    const defender = await prisma.player.findUnique({
      where: { id: defenderId },
      include: { stats: true },
    });

    if (!attacker?.stats || !defender?.stats) return 0;

    let baseDamage: number;
    let defense: number;

    if (damageType === 'physical') {
      baseDamage = attacker.stats.attack;
      defense = defender.stats.defense;
    } else if (damageType === 'magical') {
      baseDamage = attacker.stats.magic;
      defense = defender.stats.magicDefense;
    } else {
      baseDamage = attacker.stats.attack + attacker.stats.magic;
      defense = 0;
    }

    const penetration = damageType === 'physical'
      ? attacker.stats.armorPenetration
      : attacker.stats.magicPenetration;

    const effectiveDefense = Math.max(0, defense - penetration);
    const damageReduction = effectiveDefense / (effectiveDefense + 100);
    const rawDamage = baseDamage * multiplier * (1 + attacker.stats.criticalChance / 100);
    
    let finalDamage = Math.max(1, Math.floor(rawDamage * (1 - damageReduction)));

    // Critical hit
    const critRoll = Math.random() * 100;
    if (critRoll < attacker.stats.criticalChance) {
      finalDamage = Math.floor(finalDamage * (attacker.stats.criticalDamage / 100));
    }

    // Dodge check
    const dodgeRoll = Math.random() * 100;
    if (dodgeRoll < defender.stats.dodge) {
      return 0;
    }

    // Block check
    const blockRoll = Math.random() * 100;
    if (blockRoll < defender.stats.block) {
      finalDamage = Math.floor(finalDamage * 0.5);
    }

    return finalDamage;
  }

  private static async applyDamage(targetId: string, damage: number, attackerId: string): Promise<void> {
    await RedisClient.hincrby(`player:${targetId}:combat`, 'damageTaken', damage);
    
    SocketServer.emitToPlayer(attackerId, 'damage-dealt', {
      targetId,
      damage,
      timestamp: Date.now(),
    });
    
    SocketServer.emitToPlayer(targetId, 'damage-taken', {
      attackerId,
      damage,
      timestamp: Date.now(),
    });
  }

  private static async applyHeal(targetId: string, amount: number): Promise<void> {
    SocketServer.emitToPlayer(targetId, 'heal-received', {
      amount,
      timestamp: Date.now(),
    });
  }

  private static async processDOTS(state: CombatState): Promise<void> {
    const now = Date.now();
    for (const [debuffId, debuff] of state.debuffs) {
      if (now - debuff.appliedAt >= debuff.duration) {
        state.debuffs.delete(debuffId);
        SocketServer.emitToPlayer(state.playerId, 'debuff-expired', { debuffId });
      }
    }
  }

  private static async processBuffTicks(state: CombatState): Promise<void> {
    const now = Date.now();
    for (const [buffId, buff] of state.buffs) {
      if (now - buff.appliedAt >= buff.duration) {
        state.buffs.delete(buffId);
        SocketServer.emitToPlayer(state.playerId, 'buff-expired', { buffId });
      }
    }
  }

  private static async processStackDecay(state: CombatState): Promise<void> {
    const now = Date.now();
    for (const [stackKey, stack] of state.stacks) {
      if (now >= stack.expiresAt) {
        state.stacks.delete(stackKey);
        SocketServer.emitToPlayer(state.playerId, 'stack-expired', { stackType: stackKey });
      }
    }
  }

  static getPlayerCombatInfo(playerId: string): {
    inCombat: boolean;
    skills: Record<string, { lastUsed: number; cooldown: number; remaining: number }>;
    cd: Record<string, number>;
  } {
    const now = Date.now();
    const skills: Record<string, { lastUsed: number; cooldown: number; remaining: number }> = {};
    const cd: Record<string, number> = {};

    for (const [combatId, state] of this.activeCombats) {
      if (state.playerId === playerId) {
        state.skills.forEach((skillState, skillId) => {
          const remaining = Math.max(0, skillState.cooldown - (now - skillState.lastUsed));
          skills[skillId] = { ...skillState, remaining };
          cd[skillId] = remaining;
        });
        return {
          inCombat: state.isActive,
          skills,
          cd,
        };
      }
    }

    return { inCombat: false, skills: {}, cd: {} };
  }

  static async onPlayerLevelUp(playerId: string): Promise<void> {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { stats: true },
    });
    if (!player?.stats) return;

    const level = player.level;
    const hpIncrease = Math.floor(level * 10);
    const manaIncrease = Math.floor(level * 5);
    const statIncrease = Math.floor(level * 2);

    await prisma.playerStats.update({
      where: { playerId },
      data: {
        maxHp: { increment: hpIncrease },
        maxMana: { increment: manaIncrease },
        attack: { increment: statIncrease },
        defense: { increment: statIncrease },
      },
    });

    await prisma.player.update({
      where: { id: playerId },
      data: {
        hp: { increment: hpIncrease },
        mana: { increment: manaIncrease },
      },
    });
  }
}
