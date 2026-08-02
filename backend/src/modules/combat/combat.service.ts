import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";
import { CooldownManager } from "./cooldown.manager";
import { getGameLimits } from "../../core/gameLimits";

interface CombatInstance {
  id: string;
  characterId: string;
  monsterId: string;
  monster: any;
  characterName: string;
  characterLevel: number;
  attack: number;
  magic: number;
  monsterName: string;
  monsterLevel: number;
  monsterMaxHp: number;
  skills: any[];
  state: "active" | "won" | "lost" | "fled";
  characterHp: number;
  characterMana: number;
  maxHp: number;
  maxMana: number;
  monsterHp: number;
  startTime: number;
  lastTick: number;
}

export class CombatService {
  private activeCombats: Map<string, CombatInstance> = new Map();
  private tickIntervals: Map<string, NodeJS.Timeout> = new Map();
  private onTickListener: ((payload: any) => void) | null = null;

  constructor(
    private prisma: PrismaClient,
    private redis: Redis
  ) {}

  setOnTick(listener: (payload: any) => void): void {
    this.onTickListener = listener;
  }

  async startCombat(characterId: string, monsterId: string): Promise<CombatInstance> {
    const existing = Array.from(this.activeCombats.values()).find(
      (c) => c.characterId === characterId && c.state === "active"
    );
    if (existing) {
      throw new Error("Already in combat");
    }

    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: {
        class: { include: { skills: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } } },
        combatStats: true,
        equipment: {
          include: {
            weapon: true,
            helmet: true,
            chestplate: true,
            pants: true,
            boots: true,
            gloves: true,
            shield: true,
            amulet: true,
            ring1: true,
            ring2: true,
            cape: true,
            relic: true,
            pet: true,
          },
        },
      },
    });

    if (!character) throw new Error("Character not found");

    const monster = await this.prisma.monster.findUnique({
      where: { id: monsterId },
    });
    if (!monster) throw new Error("Monster not found");

    const combat: CombatInstance = {
      id: uuidv4(),
      characterId,
      monsterId,
      monster,
      characterName: character.name,
      characterLevel: character.level,
      attack: character.class.baseAttack,
      magic: character.class.baseMagic,
      monsterName: monster.name,
      monsterLevel: monster.level ?? 1,
      monsterMaxHp: monster.hp,
      skills: character.class.skills || [],
      state: "active",
      characterHp: character.currentHp,
      characterMana: character.currentMana,
      maxHp: character.class.baseHp,
      maxMana: character.class.baseMana,
      monsterHp: monster.hp,
      startTime: Date.now(),
      lastTick: Date.now(),
    };

    this.activeCombats.set(combat.id, combat);
    this.startCombatTick(combat);

    return { ...combat, combatId: combat.id } as CombatInstance & { combatId: string };
  }

  private computeSkillDamage(skill: any, attack: number, magic: number): number {
    let damage = skill.baseDamage ?? 0;
    if (skill.damageScaling) {
      try {
        const scaling = JSON.parse(skill.damageScaling);
        damage += Math.floor(
          (Number(scaling.attack) || 0) * attack + (Number(scaling.magic) || 0) * magic
        );
      } catch {
        // ignore malformed scaling
      }
    }
    return Math.max(0, damage);
  }

  private startCombatTick(combat: CombatInstance): void {
    const interval = setInterval(async () => {
      const current = this.activeCombats.get(combat.id);
      if (!current || current.state !== "active") {
        clearInterval(interval);
        return;
      }

      current.lastTick = Date.now();

      // Monster auto-attacks character
      const monsterDamage = Math.max(1, current.monster.attack - 5);
      current.characterHp -= monsterDamage;

      // Player auto-attacks with the class "auto" skill
      const autoSkill = (current.skills || []).find((s: any) => s.type === "auto");
      let playerDamage = 0;
      let playerSkillName = autoSkill?.name ?? "Ataque";
      if (autoSkill) {
        playerDamage = this.computeSkillDamage(autoSkill, current.attack, current.magic);
        const isDodged = Math.random() * 100 < 5;
        if (isDodged) playerDamage = 0;
        current.monsterHp -= playerDamage;
      }

      const payload: any = {
        combatId: current.id,
        characterId: current.characterId,
        damage: monsterDamage,
        playerDamage,
        playerSkillName,
        characterHp: Math.max(0, current.characterHp),
        characterMana: current.characterMana,
        maxHp: current.maxHp,
        maxMana: current.maxMana,
        monsterHp: Math.max(0, current.monsterHp),
        monsterName: current.monsterName,
        monsterMaxHp: current.monsterMaxHp,
        state: current.state,
        attacker: "monster",
      };

      if (current.characterHp <= 0) {
        current.characterHp = 0;
        current.state = "lost";
        payload.state = "lost";
        clearInterval(interval);
        this.tickIntervals.delete(combat.id);
      } else if (current.monsterHp <= 0) {
        current.monsterHp = 0;
        current.state = "won";
        payload.state = "won";
        payload.rewards = await this.grantRewards(current.characterId, current.monster);
        clearInterval(interval);
        this.tickIntervals.delete(combat.id);
      }

      if (this.onTickListener) {
        this.onTickListener(payload);
      }
    }, 2000);

    this.tickIntervals.set(combat.id, interval);
  }

  async useSkill(characterId: string, combatId: string, skillId: string): Promise<any> {
    const combat = this.activeCombats.get(combatId);
    if (!combat || combat.characterId !== characterId) {
      throw new Error("Combat not found");
    }
    if (combat.state !== "active") {
      throw new Error("Combat is over");
    }

    const skill = await this.prisma.skill.findUnique({
      where: { id: skillId },
    });
    if (!skill) throw new Error("Skill not found");

    if (combat.characterMana < skill.manaCost) {
      throw new Error("Not enough mana");
    }

    combat.characterMana -= skill.manaCost;

    const attack = combat.attack;
    const magic = combat.magic;

    let damage = this.computeSkillDamage(skill, attack, magic);

    const isCritical = Math.random() * 100 < 10;
    if (isCritical) {
      damage = Math.floor(damage * 1.5);
    }

    const isDodged = Math.random() * 100 < 5;
    if (isDodged) {
      damage = 0;
    }

    let healed = 0;
    if (skill.healingBase > 0) {
      healed = Math.floor(skill.healingBase);
      if (skill.damageScaling) {
        try {
          const scaling = JSON.parse(skill.damageScaling);
          healed += Math.floor(
            (Number(scaling.magic) || 0) * magic + (Number(scaling.attack) || 0) * attack
          );
        } catch {
          // ignore malformed scaling
        }
      }
      combat.characterHp = Math.min(combat.maxHp, combat.characterHp + healed);
    }

    const appliedBuffs: string[] = [];
    if (skill.buffsApplied) {
      let buffIds: any[] = [];
      try {
        buffIds = JSON.parse(skill.buffsApplied);
      } catch {
        buffIds = [];
      }
      if (Array.isArray(buffIds) && buffIds.length > 0) {
        const buffs = await this.prisma.buff.findMany({
          where: { id: { in: buffIds.map(String) } },
        });
        for (const buff of buffs) {
          await this.prisma.activeBuff.create({
            data: {
              characterId,
              buffId: buff.id,
              stacks: 1,
              remainingDuration: buff.duration,
              expiresAt: new Date(Date.now() + buff.duration),
            },
          });
          appliedBuffs.push(buff.name);
        }
      }
    }

    combat.monsterHp -= damage;

    let rewards: any = null;
    if (combat.monsterHp <= 0) {
      combat.monsterHp = 0;
      combat.state = "won";
      const interval = this.tickIntervals.get(combat.id);
      if (interval) clearInterval(interval);
      this.tickIntervals.delete(combat.id);

      // Reward player
      rewards = await this.grantRewards(characterId, combat.monster);
    }

    return {
      combatId: combat.id,
      skillId: skill.id,
      skillName: skill.name,
      damage,
      healed,
      appliedBuffs,
      isCritical,
      isDodged,
      characterHp: combat.characterHp,
      characterMana: combat.characterMana,
      maxHp: combat.maxHp,
      maxMana: combat.maxMana,
      monsterHp: combat.monsterHp,
      monsterName: combat.monsterName,
      monsterMaxHp: combat.monsterMaxHp,
      skills: combat.skills,
      state: combat.state,
      rewards,
    };
  }

  private async grantRewards(characterId: string, monster: any): Promise<any> {
    const [character, limits] = await Promise.all([
      this.prisma.character.findUnique({
        where: { id: characterId },
        include: { class: true, trait: true, classProgress: { where: { isActive: true } } },
      }),
      getGameLimits(),
    ]);
    if (!character) return null;

    const traitMods: any = (character.trait?.modifiers as any) ?? {};
    const xpBonus = 1 + (Number(traitMods.xpBonus) || 0) / 100;
    const goldBonus = 1 + (Number(traitMods.goldBonus) || 0) / 100;
    const xpGain = Math.floor(Number(monster.xpReward || 0) * xpBonus);
    const goldGain = Math.floor(Number(monster.goldReward || 0) * goldBonus);

    let levelUps = 0;
    let updatedCharacter = await this.prisma.character.update({
      where: { id: characterId },
      data: { experience: { increment: xpGain } },
      select: { id: true, level: true, experience: true },
    });
    while (
      updatedCharacter.level < limits.maxLevel &&
      updatedCharacter.experience >= BigInt(updatedCharacter.level * limits.xpPerLevel)
    ) {
      updatedCharacter = await this.prisma.character.update({
        where: { id: characterId },
        data: { level: { increment: 1 } },
        select: { id: true, level: true, experience: true },
      });
      levelUps++;
    }

    await this.prisma.character.update({
      where: { id: characterId },
      data: { currentHp: character.class.baseHp, currentMana: character.class.baseMana },
    });

    let classXpGain = 0;
    if (character.classProgress && character.classProgress.length > 0) {
      await this.prisma.characterClass.update({
        where: { id: character.classProgress[0].id },
        data: { experience: { increment: xpGain } },
      });
      classXpGain = xpGain;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: character.userId },
    });
    if (user) {
      const maxGold = BigInt(limits.maxGold);
      const newGold = user.gold + BigInt(goldGain);
      const clampedGold = newGold > maxGold ? maxGold : newGold;
      const actualGoldGain = clampedGold > user.gold ? Number(clampedGold - user.gold) : 0;
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          experience: { increment: xpGain },
          gold: { increment: actualGoldGain },
        },
      });
    }

    await this.updateQuestKillProgress(character.userId, monster);

    return { xpGain, goldGain, levelUps, classXpGain };
  }

  private async updateQuestKillProgress(userId: string, monster: any): Promise<void> {
    const progresses = await this.prisma.questProgress.findMany({
      where: { userId, status: "active" },
      include: { quest: true },
    });

    for (const progress of progresses) {
      let objectives: any[] = [];
      try {
        objectives = JSON.parse(progress.quest.objectives || "[]");
      } catch {
        continue;
      }
      if (!Array.isArray(objectives) || objectives.length === 0) continue;

      let current: Record<string, any> = {};
      try {
        current = JSON.parse(progress.progress || "{}");
      } catch {
        current = {};
      }

      const keyOf = (obj: any) =>
        String(obj?.id ?? `${obj?.type}-${obj?.monsterName ?? obj?.monsterId}`);

      let changed = false;
      for (const obj of objectives) {
        if (obj?.type !== "kill") continue;
        const target = obj?.monsterName ?? obj?.monsterId;
        if (!target) continue;
        if (target !== monster.name && target !== String(monster.id)) continue;
        const key = keyOf(obj);
        current[key] = (Number(current[key]) || 0) + 1;
        changed = true;
      }
      if (!changed) continue;

      let allDone = true;
      for (const obj of objectives) {
        if (obj?.type !== "kill") continue;
        const count = Number(current[keyOf(obj)]) || 0;
        if (count < Number(obj?.amount ?? 1)) {
          allDone = false;
          break;
        }
      }

      await this.prisma.questProgress.update({
        where: { id: progress.id },
        data: {
          progress: JSON.stringify(current),
          ...(allDone ? { status: "completed" } : {}),
        },
      });
    }
  }

  getCombat(combatId: string): CombatInstance | undefined {
    return this.activeCombats.get(combatId);
  }

  getCharacterCombat(characterId: string): CombatInstance | undefined {
    return Array.from(this.activeCombats.values()).find(
      (c) => c.characterId === characterId && c.state === "active"
    );
  }
}
