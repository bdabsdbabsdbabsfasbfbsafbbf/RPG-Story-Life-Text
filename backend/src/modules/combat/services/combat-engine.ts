import { Character } from '../../characters/domain/character.entity';
import { SkillEntity, SkillType } from '../../skills/domain/skill.entity';
import { EquipmentEntity, EquipmentSlot } from '../../equipment/domain/equipment.entity';
import { logger } from '../../../shared/utils/logger';
import { EventEmitter } from 'eventemitter3';

interface CombatState {
  characterId: string;
  targetId: string;
  currentHp: number;
  maxHp: number;
  currentMana: number;
  maxMana: number;
  currentStamina: number;
  maxStamina: number;
  cooldowns: Map<string, number>;
  buffs: Map<string, ActiveBuff>;
  debuffs: Map<string, ActiveDebuff>;
  stacks: Map<string, StackState>;
  isAlive: boolean;
  isInCombat: boolean;
  lastAttackTime: number;
}

interface ActiveBuff {
  id: string;
  name: string;
  value: number;
  remainingDuration: number;
  maxDuration: number;
  stacks: number;
  maxStacks: number;
  tickInterval: number;
  lastTick: number;
}

interface ActiveDebuff {
  id: string;
  name: string;
  value: number;
  remainingDuration: number;
  maxDuration: number;
  stacks: number;
  maxStacks: number;
  tickInterval: number;
  lastTick: number;
  tickDamage: number;
}

interface StackState {
  name: string;
  currentStacks: number;
  maxStacks: number;
  effects: Record<string, number>;
  expiresAt: number;
}

interface CombatResult {
  type: string;
  value: number;
  isCritical: boolean;
  isDodged: boolean;
  isBlocked: boolean;
  effects: Array<{ type: string; name: string; duration?: number; stacks?: number }>;
  timestamp: number;
}

export class CombatEngine extends EventEmitter {
  private activeCombats: Map<string, CombatState> = new Map();
  private tickIntervals: Map<string, NodeJS.Timeout> = new Map();

  private readonly BASE_ATTACK_COOLDOWN = 1000;
  private readonly COMBAT_TICK_RATE = 100;

  startCombat(character: Character, targetId: string, targetName: string): CombatState {
    const state: CombatState = {
      characterId: character.id,
      targetId,
      currentHp: character.currentHp,
      maxHp: character.maxHp,
      currentMana: character.currentMana,
      maxMana: character.maxMana,
      currentStamina: character.currentStamina,
      maxStamina: character.maxStamina,
      cooldowns: new Map(),
      buffs: new Map(),
      debuffs: new Map(),
      stacks: new Map(),
      isAlive: true,
      isInCombat: true,
      lastAttackTime: 0,
    };

    this.activeCombats.set(character.id, state);
    this.startTickLoop(character.id);
    return state;
  }

  private startTickLoop(characterId: string): void {
    const interval = setInterval(() => {
      this.processTick(characterId);
    }, this.COMBAT_TICK_RATE);
    this.tickIntervals.set(characterId, interval);
  }

  private processTick(characterId: string): void {
    const state = this.activeCombats.get(characterId);
    if (!state || !state.isAlive) {
      this.endCombat(characterId);
      return;
    }

    const now = Date.now();
    this.processCooldowns(state, now);
    this.processBuffs(state, now);
    this.processDebuffs(state, now);
    this.processStacks(state, now);

    this.emit('combat:tick', { characterId, state });
  }

  private processCooldowns(state: CombatState, now: number): void {
    state.cooldowns.forEach((readyAt, skillId) => {
      if (now >= readyAt) {
        state.cooldowns.delete(skillId);
        this.emit('cooldown:ready', { characterId: state.characterId, skillId });
      }
    });
  }

  private processBuffs(state: CombatState, now: number): void {
    state.buffs.forEach((buff, key) => {
      buff.remainingDuration -= this.COMBAT_TICK_RATE;
      if (buff.tickInterval > 0 && now - buff.lastTick >= buff.tickInterval) {
        buff.lastTick = now;
        this.emit('buff:tick', {
          characterId: state.characterId,
          buff: buff.name,
          value: buff.value,
        });
      }
      if (buff.remainingDuration <= 0) {
        state.buffs.delete(key);
        this.emit('buff:expired', {
          characterId: state.characterId,
          buff: buff.name,
        });
      }
    });
  }

  private processDebuffs(state: CombatState, now: number): void {
    state.debuffs.forEach((debuff, key) => {
      debuff.remainingDuration -= this.COMBAT_TICK_RATE;
      if (debuff.tickInterval > 0 && now - debuff.lastTick >= debuff.tickInterval) {
        debuff.lastTick = now;
        const damage = debuff.tickDamage * debuff.stacks;
        state.currentHp -= damage;
        this.emit('debuff:tick', {
          characterId: state.characterId,
          debuff: debuff.name,
          damage,
          stacks: debuff.stacks,
        });
        if (state.currentHp <= 0) {
          state.currentHp = 0;
          state.isAlive = false;
          this.emit('character:death', { characterId: state.characterId });
        }
      }
      if (debuff.remainingDuration <= 0) {
        state.debuffs.delete(key);
        this.emit('debuff:expired', {
          characterId: state.characterId,
          debuff: debuff.name,
        });
      }
    });
  }

  private processStacks(state: CombatState, now: number): void {
    state.stacks.forEach((stack, key) => {
      if (stack.expiresAt > 0 && now >= stack.expiresAt) {
        if (stack.currentStacks >= stack.maxStacks) {
          this.triggerMaxStackEffect(state, stack);
        }
        state.stacks.delete(key);
      }
    });
  }

  private triggerMaxStackEffect(state: CombatState, stack: StackState): void {
    if (stack.effects.onMaxStacks) {
      this.emit('stack:max', {
        characterId: state.characterId,
        stack: stack.name,
        effect: stack.effects.onMaxStacks,
        stacks: stack.currentStacks,
      });
    }
  }

  useSkill(
    characterId: string,
    skill: SkillEntity,
    attackerStats: Record<string, number>,
    targetStats?: Record<string, number>
  ): CombatResult | null {
    const state = this.activeCombats.get(characterId);
    if (!state || !state.isAlive) return null;

    const now = Date.now();
    const cooldownKey = skill.id;

    if (state.cooldowns.has(cooldownKey)) {
      return null;
    }

    if (skill.type === SkillType.PASSIVE) {
      this.applyPassive(state, skill);
      return null;
    }

    if (state.currentMana < skill.manaCost) return null;
    if (state.currentStamina < skill.staminaCost) return null;

    state.currentMana -= skill.manaCost;
    state.currentStamina -= skill.staminaCost;
    state.cooldowns.set(cooldownKey, now + skill.cooldown);

    const result: CombatResult = {
      type: skill.name,
      value: 0,
      isCritical: false,
      isDodged: false,
      isBlocked: false,
      effects: [],
      timestamp: now,
    };

    const cdr = attackerStats.cooldownReduction || 0;
    const actualCooldown = skill.cooldown * (1 - cdr / 100);
    state.cooldowns.set(cooldownKey, now + actualCooldown);

    if (skill.damage) {
      let baseDamage = skill.damage.base || 0;
      if (skill.damage.scaling) {
        for (const [stat, scale] of Object.entries(skill.damage.scaling)) {
          baseDamage += (attackerStats[stat] || 0) * scale;
        }
      }

      const critChance = (attackerStats.criticalChance || 5) / 100;
      const critDamage = attackerStats.criticalDamage || 150;
      result.isCritical = Math.random() < critChance;
      result.value = result.isCritical
        ? Math.floor(baseDamage * (critDamage / 100))
        : Math.floor(baseDamage);

      const dodgeChance = (targetStats?.dodge || 0) / 100;
      result.isDodged = Math.random() < dodgeChance;

      const blockChance = (targetStats?.block || 0) / 100;
      result.isBlocked = Math.random() < blockChance;

      if (result.isDodged) result.value = 0;
      if (result.isBlocked) result.value = Math.floor(result.value * 0.5);
    }

    if (skill.healing) {
      let baseHealing = skill.healing.base || 0;
      if (skill.healing.scaling) {
        for (const [stat, scale] of Object.entries(skill.healing.scaling)) {
          baseHealing += (attackerStats[stat] || 0) * scale;
        }
      }
      state.currentHp = Math.min(state.maxHp, state.currentHp + baseHealing);
      result.value = baseHealing;
    }

    if (skill.buffs) {
      for (const buffData of skill.buffs) {
        this.applyBuff(state, buffData);
        result.effects.push({
          type: 'buff',
          name: buffData.type,
          duration: buffData.duration,
          stacks: buffData.maxStacks,
        });
      }
    }

    if (skill.debuffs) {
      for (const debuffData of skill.debuffs) {
        this.applyDebuff(state, debuffData);
        result.effects.push({
          type: 'debuff',
          name: debuffData.type,
          duration: debuffData.duration,
          stacks: debuffData.maxStacks,
        });
      }
    }

    if (skill.stackEffects) {
      if (skill.stackEffects.generateStack) {
        this.addStack(state, skill.stackEffects.generateStack, skill.stackEffects.maxStacks || 10, {});
      }
      if (skill.stackEffects.consumeStack) {
        this.consumeStack(state, skill.stackEffects.consumeStack);
      }
    }

    return result;
  }

  basicAttack(
    characterId: string,
    attackerStats: Record<string, number>,
    targetStats?: Record<string, number>
  ): CombatResult | null {
    const state = this.activeCombats.get(characterId);
    if (!state || !state.isAlive) return null;

    const now = Date.now();
    const attackSpeed = attackerStats.attackSpeed || 100;
    const cooldownMs = this.BASE_ATTACK_COOLDOWN / (attackSpeed / 100);

    if (now - state.lastAttackTime < cooldownMs) return null;
    state.lastAttackTime = now;

    const attack = attackerStats.attack || 10;
    const armorPen = (attackerStats.armorPenetration || 0) / 100;
    const defense = (targetStats?.defense || 0) * (1 - armorPen);
    let damage = Math.max(1, attack - defense * 0.5);

    const critChance = (attackerStats.criticalChance || 5) / 100;
    const critDamage = attackerStats.criticalDamage || 150;
    const isCrit = Math.random() < critChance;

    if (isCrit) {
      damage *= critDamage / 100;
    }

    const isDodged = Math.random() < ((targetStats?.dodge || 0) / 100);
    if (isDodged) damage = 0;

    const lifeSteal = (attackerStats.lifeSteal || 0) / 100;
    if (lifeSteal > 0) {
      state.currentHp = Math.min(state.maxHp, state.currentHp + Math.floor(damage * lifeSteal));
    }

    return {
      type: 'Basic Attack',
      value: Math.floor(damage),
      isCritical: isCrit,
      isDodged,
      isBlocked: false,
      effects: [],
      timestamp: now,
    };
  }

  private applyBuff(state: CombatState, buffData: { type: string; value: number; duration: number; maxStacks?: number }): void {
    const key = buffData.type;
    const existing = state.buffs.get(key);
    if (existing) {
      existing.stacks = Math.min(existing.maxStacks, existing.stacks + 1);
      existing.remainingDuration = buffData.duration;
    } else {
      state.buffs.set(key, {
        id: key,
        name: buffData.type,
        value: buffData.value,
        remainingDuration: buffData.duration,
        maxDuration: buffData.duration,
        stacks: 1,
        maxStacks: buffData.maxStacks || 1,
        tickInterval: 0,
        lastTick: Date.now(),
      });
    }
  }

  private applyDebuff(state: CombatState, debuffData: { type: string; value: number; duration: number; maxStacks?: number }): void {
    const key = debuffData.type;
    const existing = state.debuffs.get(key);
    if (existing) {
      existing.stacks = Math.min(existing.maxStacks, existing.stacks + 1);
      existing.remainingDuration = debuffData.duration;
    } else {
      state.debuffs.set(key, {
        id: key,
        name: debuffData.type,
        value: debuffData.value,
        remainingDuration: debuffData.duration,
        maxDuration: debuffData.duration,
        stacks: 1,
        maxStacks: debuffData.maxStacks || 1,
        tickInterval: 1000,
        lastTick: Date.now(),
        tickDamage: debuffData.value,
      });
    }
  }

  private addStack(state: CombatState, name: string, maxStacks: number, effects: Record<string, number>): void {
    const existing = state.stacks.get(name);
    if (existing) {
      existing.currentStacks = Math.min(existing.maxStacks, existing.currentStacks + 1);
      if (existing.currentStacks >= existing.maxStacks) {
        this.triggerMaxStackEffect(state, existing);
        existing.currentStacks = 0;
      }
    } else {
      state.stacks.set(name, {
        name,
        currentStacks: 1,
        maxStacks,
        effects,
        expiresAt: Date.now() + 30000,
      });
    }
  }

  private consumeStack(state: CombatState, name: string): number {
    const existing = state.stacks.get(name);
    if (!existing) return 0;
    const stacks = existing.currentStacks;
    state.stacks.delete(name);
    return stacks;
  }

  private applyPassive(state: CombatState, skill: SkillEntity): void {
    if (skill.buffs) {
      for (const buff of skill.buffs) {
        state.buffs.set(`passive:${skill.id}:${buff.type}`, {
          id: `passive:${skill.id}`,
          name: buff.type,
          value: buff.value,
          remainingDuration: Infinity,
          maxDuration: Infinity,
          stacks: 1,
          maxStacks: buff.maxStacks || 1,
          tickInterval: 0,
          lastTick: Date.now(),
        });
      }
    }
  }

  isSkillReady(characterId: string, skillId: string): boolean {
    const state = this.activeCombats.get(characterId);
    if (!state) return false;
    return !state.cooldowns.has(skillId);
  }

  getRemainingCooldown(characterId: string, skillId: string): number {
    const state = this.activeCombats.get(characterId);
    if (!state) return 0;
    const readyAt = state.cooldowns.get(skillId);
    if (!readyAt) return 0;
    return Math.max(0, readyAt - Date.now());
  }

  getCombatState(characterId: string): CombatState | undefined {
    return this.activeCombats.get(characterId);
  }

  endCombat(characterId: string): void {
    const interval = this.tickIntervals.get(characterId);
    if (interval) clearInterval(interval);
    this.tickIntervals.delete(characterId);
    this.activeCombats.delete(characterId);
    this.emit('combat:end', { characterId });
  }

  getActiveCombatCount(): number {
    return this.activeCombats.size;
  }
}

export const combatEngine = new CombatEngine();
