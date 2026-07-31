import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";
import { CooldownManager } from "./cooldown.manager";

interface CombatInstance {
  id: string;
  characterId: string;
  monsterId: string;
  monster: any;
  state: "active" | "won" | "lost" | "fled";
  characterHp: number;
  characterMana: number;
  monsterHp: number;
  startTime: number;
  lastTick: number;
}

export class CombatService {
  private activeCombats: Map<string, CombatInstance> = new Map();
  private tickIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private prisma: PrismaClient,
    private redis: Redis
  ) {}

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
        class: true,
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
      state: "active",
      characterHp: character.currentHp,
      characterMana: character.currentMana,
      monsterHp: monster.hp,
      startTime: Date.now(),
      lastTick: Date.now(),
    };

    this.activeCombats.set(combat.id, combat);
    this.startCombatTick(combat);

    return combat;
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

      if (current.characterHp <= 0) {
        current.characterHp = 0;
        current.state = "lost";
        clearInterval(interval);
        this.tickIntervals.delete(combat.id);
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

    let damage = skill.baseDamage;
    if (skill.damageScaling) {
      const scaling = JSON.parse(skill.damageScaling);
      // Apply stat scaling
    }

    const isCritical = Math.random() * 100 < 10;
    if (isCritical) {
      damage = Math.floor(damage * 1.5);
    }

    const isDodged = Math.random() * 100 < 5;
    if (isDodged) {
      damage = 0;
    }

    combat.monsterHp -= damage;

    if (combat.monsterHp <= 0) {
      combat.monsterHp = 0;
      combat.state = "won";
      const interval = this.tickIntervals.get(combat.id);
      if (interval) clearInterval(interval);
      this.tickIntervals.delete(combat.id);

      // Reward player
      await this.grantRewards(characterId, combat.monster);
    }

    return {
      combatId: combat.id,
      skillId: skill.id,
      damage,
      isCritical,
      isDodged,
      characterHp: combat.characterHp,
      characterMana: combat.characterMana,
      monsterHp: combat.monsterHp,
      state: combat.state,
    };
  }

  private async grantRewards(characterId: string, monster: any): Promise<void> {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
    });
    if (!character) return;

    const xpGain = Number(monster.xpReward);
    const goldGain = Number(monster.goldReward);

    await this.prisma.character.update({
      where: { id: characterId },
      data: {
        experience: { increment: xpGain },
        currentHp: 100,
        currentMana: 50,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: character.userId },
    });
    if (user) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          experience: { increment: xpGain },
          gold: { increment: goldGain },
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
