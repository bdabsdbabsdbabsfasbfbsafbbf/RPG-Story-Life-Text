import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import { CooldownManager } from "./cooldown.manager";
import { getGameLimits } from "../../core/gameLimits";
import { Battle, TICK_MS } from "../../core/classEngine/battle";
import { SkillDef, PassiveDef, EffectDef, ActiveEffectRuntime } from "../../core/classEngine/types";
import { StatsInput } from "../../core/classEngine/stat-calculator";

function parseJson(value: any, fallback: any = null): any {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function asActionArray(value: any): any[] {
  const arr = parseJson(value, []);
  return Array.isArray(arr) ? arr : [];
}

function parseSkill(s: any): SkillDef {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug || s.id,
    description: s.description || "",
    icon: s.icon || null,
    kind: s.kind || "attack",
    trigger: s.trigger || "active",
    target: s.target || "enemy",
    cooldown: Number(s.cooldown) || 0,
    manaCost: Number(s.manaCost) || 0,
    castTime: Number(s.castTime) || 0,
    channelMs: Number(s.channelMs) || 0,
    rankRequired: Number(s.rankRequired) || 1,
    scaling: asActionArray(s.scaling),
    actions: asActionArray(s.actions),
    conditions: asActionArray(s.conditions),
    onConditionMet: asActionArray(s.onConditionMet),
    events: asActionArray(s.events),
  };
}

function parsePassive(p: any): PassiveDef {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug || p.id,
    description: p.description || "",
    rankRequired: Number(p.rankRequired) || 1,
    statModifiers: parseJson(p.statModifiers, {}),
    skillModifiers: asActionArray(p.skillModifiers),
    effectModifiers: asActionArray(p.effectModifiers),
    conditions: asActionArray(p.conditions),
    events: asActionArray(p.events),
  };
}

function parseEffect(e: any): EffectDef {
  return {
    id: e.id,
    name: e.name,
    slug: e.slug,
    description: e.description || "",
    icon: e.icon || null,
    kind: e.kind || "buff",
    category: e.category || "utility",
    maxStacks: Number(e.maxStacks) || 1,
    duration: Number(e.duration) || 0,
    refreshBehavior: e.refreshBehavior || "refresh",
    stackLoss: parseJson(e.stackLoss, {}),
    priority: Number(e.priority) || 0,
    tickInterval: Number(e.tickInterval) || 0,
    tickDamage: parseJson(e.tickDamage, {}),
    tickHealing: parseJson(e.tickHealing, {}),
    statModifiers: parseJson(e.statModifiers, {}),
    onMaxStacks: asActionArray(e.onMaxStacks),
    onExpire: asActionArray(e.onExpire),
    onTick: asActionArray(e.onTick),
    exclusiveGroup: e.exclusiveGroup || null,
  };
}

function serializeSkillForClient(s: SkillDef, mods: { damagePercent?: number; healPercent?: number } | null): any {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    icon: s.icon,
    kind: s.kind,
    trigger: s.trigger,
    type: s.trigger,
    target: s.target,
    cooldown: s.cooldown,
    manaCost: s.manaCost,
    castTime: s.castTime,
    channelMs: s.channelMs,
    rankRequired: s.rankRequired,
    sortOrder: 0,
    scaling: s.scaling,
    actions: s.actions,
    conditions: s.conditions,
    requirements: s.conditions && s.conditions.length > 0 ? s.conditions.map((c: any) => c.type) : [],
    healingBase: s.actions.some((a: any) => a.action === "heal") ? 1 : 0,
    damageModifier: mods?.damagePercent || 0,
    healModifier: mods?.healPercent || 0,
  };
}

interface ActiveCombat {
  battle: Battle;
  characterId: string;
  characterName: string;
  characterLevel: number;
  monsterId: string;
  monster: any;
  skills: SkillDef[];
  state: "active" | "won" | "lost" | "fled";
  characterHp: number;
  characterMana: number;
  monsterHp: number;
  startTime: number;
  tickInterval: NodeJS.Timeout;
}

export class CombatService {
  private activeCombats: Map<string, ActiveCombat> = new Map();
  private onTickListener: ((payload: any) => void) | null = null;

  constructor(
    private prisma: PrismaClient,
    private redis: Redis
  ) {}

  setOnTick(listener: (payload: any) => void): void {
    this.onTickListener = listener;
  }

  async startCombat(characterId: string, monsterId: string): Promise<any> {
    const existing = Array.from(this.activeCombats.values()).find(
      (c) => c.characterId === characterId && c.state === "active"
    );
    if (existing) {
      throw new Error("Você já está em combate!");
    }

    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: {
        class: {
          include: {
            statModel: true,
            skills: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
            passives: { where: { isActive: true }, orderBy: { rankRequired: "asc" } },
          },
        },
        race: true,
        trait: true,
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
        classProgress: { where: { isActive: true } },
      },
    });

    if (!character) throw new Error("Personagem não encontrado");
    const gameClass = character.class;
    if (!gameClass) throw new Error("Personagem sem classe");

    const monster = await this.prisma.monster.findUnique({
      where: { id: monsterId },
    });
    if (!monster) throw new Error("Monstro não encontrado");

    const rank = character.classProgress?.[0]?.rank ?? 1;

    // Catálogo de efeitos (para skills que aplicam por slug)
    const effectRows = await this.prisma.effect.findMany({ where: { isActive: true } });
    const effects: EffectDef[] = effectRows.map(parseEffect);

    const skills: SkillDef[] = (gameClass.skills || []).map(parseSkill);
    const passives: PassiveDef[] = (gameClass.passives || [])
      .filter((p: any) => (p.rankRequired ?? 1) <= rank)
      .map(parsePassive);

    // Stats de equipamento (item.stats JSON)
    const equipmentStats: Array<Record<string, any>> = [];
    if (character.equipment) {
      const slots = [
        "weapon", "helmet", "chestplate", "pants", "boots", "gloves",
        "shield", "amulet", "ring1", "ring2", "cape", "relic", "pet",
      ];
      for (const slot of slots) {
        const item = (character.equipment as any)[slot];
        if (item?.stats) {
          const parsed = parseJson(item.stats, null);
          if (parsed && typeof parsed === "object") equipmentStats.push(parsed);
        }
      }
    }

    const statsInput: StatsInput = {
      level: character.level,
      statModel: {
        base: parseJson(gameClass.statModel?.base, {}),
        perLevel: parseJson(gameClass.statModel?.perLevel, {}),
        scaling: parseJson(gameClass.statModel?.scaling, {}),
      },
      resource: parseJson(gameClass.resource, {}),
      passives,
      raceTraits: parseJson(character.race?.traits, null),
      traitModifiers: parseJson(character.trait?.modifiers, null),
      equipmentStats,
    };

    const battle = new Battle({
      characterId: character.id,
      characterName: character.name,
      characterLevel: character.level,
      statsInput,
      rank,
      skills,
      passives,
      effects,
      monster,
      classResource: parseJson(gameClass.resource, {}),
      onEnd: (state) => {
        const entry = this.activeCombats.get(battle.id);
        if (entry) entry.state = state;
      },
      syncPlayerEffects: async (runtimeEffects: ActiveEffectRuntime[]) => {
        await this.syncPlayerEffects(character.id, runtimeEffects);
      },
    });

    const entry: ActiveCombat = {
      battle,
      characterId: character.id,
      characterName: character.name,
      characterLevel: character.level,
      monsterId: monster.id,
      monster,
      skills,
      state: "active",
      characterHp: battle.player.hp,
      characterMana: battle.player.mana,
      monsterHp: monster.hp,
      startTime: Date.now(),
      tickInterval: setInterval(() => this.tick(battle.id), TICK_MS),
    };
    this.activeCombats.set(battle.id, entry);

    const snap = battle.snapshot();
    const stats = battle.player.stats;

    return {
      combatId: battle.id,
      characterId: character.id,
      characterName: character.name,
      characterLevel: character.level,
      monsterId: monster.id,
      monsterName: monster.name,
      monsterLevel: monster.level ?? 1,
      monsterMaxHp: monster.hp,
      skills: skills.map((s) => serializeSkillForClient(s, battle.getSkillModifiersFor(s.slug))),
      stats: {
        hp: stats.hp,
        mana: stats.mana,
        attack: stats.attack,
        defense: stats.defense,
        magic: stats.magic,
        magicDefense: stats.magicDefense,
        speed: stats.speed,
        attackPower: stats.attackPower,
        spellPower: stats.spellPower,
        critChance: stats.critChance,
        critDamage: stats.critDamage,
        dodge: stats.dodge,
        attackSpeedMs: stats.attackSpeedMs,
        manaRegenPerTick: stats.manaRegenPerTick,
      },
      state: "active",
      characterHp: snap.characterHp,
      characterMana: snap.characterMana,
      maxHp: snap.maxHp,
      maxMana: snap.maxMana,
      monsterHp: snap.monsterHp,
      playerEffects: snap.playerEffects,
      monsterEffects: snap.monsterEffects,
    };
  }

  private async syncPlayerEffects(characterId: string, runtimeEffects: ActiveEffectRuntime[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.activeEffect.deleteMany({ where: { characterId } }),
      ...runtimeEffects.map((e) =>
        this.prisma.activeEffect.create({
          data: {
            characterId,
            effectId: e.effect.id,
            stacks: e.stacks,
            remainingMs: e.remainingMs,
            expiresAt: e.effect.duration > 0 ? new Date(Date.now() + e.remainingMs) : null,
            nextTickAt: e.nextTickAt ? new Date(e.nextTickAt) : null,
          },
        })
      ),
    ]);
  }

  private tick(combatId: string): void {
    const entry = this.activeCombats.get(combatId);
    if (!entry) return;

    entry.battle.tick();

    if (entry.state === "active" && entry.battle.state !== "active") {
      entry.state = entry.battle.state;
    }

    const snap = entry.battle.snapshot();
    entry.characterHp = snap.characterHp;
    entry.characterMana = snap.characterMana;
    entry.monsterHp = snap.monsterHp;

    const payload: any = {
      combatId,
      characterId: entry.characterId,
      characterHp: snap.characterHp,
      characterMana: snap.characterMana,
      maxHp: snap.maxHp,
      maxMana: snap.maxMana,
      monsterHp: snap.monsterHp,
      monsterName: entry.monster.name,
      monsterMaxHp: snap.monsterMaxHp,
      monsterEffects: snap.monsterEffects,
      playerEffects: snap.playerEffects,
      messages: snap.messages,
      state: entry.state,
    };

    const ended = entry.state !== "active";
    if (ended) {
      clearInterval(entry.tickInterval);
      this.activeCombats.delete(combatId);
      if (entry.state === "won") {
        entry.battle.finish().catch(() => {});
        this.grantRewards(entry.characterId, entry.monster, entry.battle.player.maxHp, entry.battle.player.maxMana).then((rewards) => {
          payload.rewards = rewards;
          if (this.onTickListener) this.onTickListener(payload);
        });
        return;
      }
      if (entry.state === "lost") {
        entry.battle.finish().catch(() => {});
        this.prisma.character
          .update({ where: { id: entry.characterId }, data: { currentHp: 0 } })
          .catch(() => {});
      }
    }

    if (this.onTickListener) {
      this.onTickListener(payload);
    }
  }

  async useSkill(characterId: string, combatId: string, skillId: string): Promise<any> {
    const entry = this.activeCombats.get(combatId);
    if (!entry || entry.characterId !== characterId) {
      throw new Error("Combate não encontrado");
    }
    if (entry.state !== "active") {
      throw new Error("O combate já terminou");
    }

    const skill = entry.skills.find((s) => s.id === skillId);
    if (!skill) throw new Error("Skill não encontrada");

    const result = entry.battle.useSkill(skill);
    if (!result.ok) {
      throw new Error(result.error || "Não foi possível usar a skill");
    }

    if (entry.battle.getEffectsDirty()) {
      entry.battle.syncEffects().catch(() => {});
    }

    const snap = entry.battle.snapshot();
    const payload: any = {
      combatId,
      skillId: skill.id,
      skillName: skill.name,
      damage: result.damage,
      healed: result.healed,
      isCritical: result.isCritical,
      isDodged: result.isDodged,
      appliedBuffs: result.appliedEffects,
      appliedEffects: result.appliedEffects,
      removedEffects: result.removedEffects,
      consumedStacks: result.consumedStacks,
      messages: [...result.messages, ...snap.messages],
      channeling: result.channeling,
      channelMs: result.channelMs,
      cooldowns: entry.battle.cooldownInfo(),
      characterHp: snap.characterHp,
      characterMana: snap.characterMana,
      maxHp: snap.maxHp,
      maxMana: snap.maxMana,
      monsterHp: snap.monsterHp,
      monsterName: entry.monster.name,
      monsterMaxHp: snap.monsterMaxHp,
      monsterEffects: snap.monsterEffects,
      playerEffects: snap.playerEffects,
      state: entry.state,
    };

    if (entry.battle.state === "won") {
      entry.state = "won";
      clearInterval(entry.tickInterval);
      this.activeCombats.delete(combatId);
      entry.battle.finish().catch(() => {});
      payload.rewards = await this.grantRewards(entry.characterId, entry.monster, entry.battle.player.maxHp, entry.battle.player.maxMana);
      payload.state = "won";
    }

    return payload;
  }

  async flee(characterId: string, combatId: string): Promise<any> {
    const entry = this.activeCombats.get(combatId);
    if (!entry || entry.characterId !== characterId) {
      throw new Error("Combate não encontrado");
    }
    if (entry.state !== "active") {
      throw new Error("O combate já terminou");
    }

    const escaped = Math.random() < 0.7;

    const snap = entry.battle.snapshot();
    const payload: any = {
      combatId,
      characterId: entry.characterId,
      state: entry.state,
      characterHp: snap.characterHp,
      characterMana: snap.characterMana,
      maxHp: snap.maxHp,
      maxMana: snap.maxMana,
      monsterHp: snap.monsterHp,
      monsterName: entry.monster.name,
      monsterMaxHp: snap.monsterMaxHp,
      fled: escaped,
      messages: [],
    };

    if (escaped) {
      entry.state = "fled";
      payload.state = "fled";
      clearInterval(entry.tickInterval);
      this.activeCombats.delete(combatId);
      entry.battle.finish().catch(() => {});
      this.prisma.character
        .update({
          where: { id: characterId },
          data: { currentHp: snap.characterHp, currentMana: snap.characterMana },
        })
        .catch(() => {});
    } else {
      // A fuga falhou: o monstro ataca
      const oldHp = entry.battle.player.hp;
      entry.battle.monsterAttack();
      payload.damage = Math.max(0, oldHp - entry.battle.player.hp);
      payload.attacker = "monster";
      const s2 = entry.battle.snapshot();
      payload.characterHp = s2.characterHp;
      payload.monsterHp = s2.monsterHp;
      payload.messages = s2.messages;
      if (entry.battle.state === "lost") {
        entry.state = "lost";
        payload.state = "lost";
        clearInterval(entry.tickInterval);
        this.activeCombats.delete(combatId);
        entry.battle.finish().catch(() => {});
        this.prisma.character
          .update({ where: { id: characterId }, data: { currentHp: 0 } })
          .catch(() => {});
      }
    }

    return payload;
  }

  async useItem(characterId: string, combatId: string, inventoryId: string): Promise<any> {
    const entry = this.activeCombats.get(combatId);
    if (!entry || entry.characterId !== characterId) {
      throw new Error("Combate não encontrado");
    }
    if (entry.state !== "active") {
      throw new Error("O combate já terminou");
    }

    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      select: { userId: true },
    });
    if (!character) throw new Error("Personagem não encontrado");

    const inv = await this.prisma.inventory.findFirst({
      where: { id: inventoryId, userId: character.userId },
      include: { item: true },
    });
    if (!inv || inv.quantity <= 0) throw new Error("Item não encontrado");

    const item = inv.item;
    if (item.type !== "consumable" && item.type !== "potion") {
      throw new Error("Este item não pode ser usado em combate");
    }

    let heal = 0;
    let manaRestore = 0;
    const effectsRaw = parseJson(item.effects, null);
    if (Array.isArray(effectsRaw)) {
      for (const e of effectsRaw) {
        if (e?.type === "heal") heal += Number(e.value) || 0;
        else if (e?.type === "manaRestore") manaRestore += Number(e.value) || 0;
      }
    } else if (effectsRaw && typeof effectsRaw === "object") {
      heal = Number(effectsRaw.heal) || 0;
      manaRestore = Number(effectsRaw.manaRestore) || 0;
    }

    if (heal <= 0 && manaRestore <= 0) {
      throw new Error("Este item não pode ser usado em combate");
    }

    const hpBefore = entry.battle.player.hp;
    const manaBefore = entry.battle.player.mana;
    entry.battle.useItem(heal, manaRestore);
    const actualHeal = entry.battle.player.hp - hpBefore;
    const actualMana = entry.battle.player.mana - manaBefore;

    if (inv.quantity > 1) {
      await this.prisma.inventory.update({
        where: { id: inv.id },
        data: { quantity: { decrement: 1 } },
      });
    } else {
      await this.prisma.inventory.delete({ where: { id: inv.id } });
    }

    const snap = entry.battle.snapshot();
    return {
      combatId,
      characterId: entry.characterId,
      inventoryId: inv.id,
      itemName: item.name,
      healed: actualHeal,
      manaRestored: actualMana,
      characterHp: snap.characterHp,
      characterMana: snap.characterMana,
      maxHp: snap.maxHp,
      maxMana: snap.maxMana,
      monsterHp: snap.monsterHp,
      monsterName: entry.monster.name,
      monsterMaxHp: snap.monsterMaxHp,
      playerEffects: snap.playerEffects,
      monsterEffects: snap.monsterEffects,
      state: entry.state,
    };
  }

  private async grantRewards(characterId: string, monster: any, restoreHp: number, restoreMana: number): Promise<any> {
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
      data: { currentHp: restoreHp, currentMana: restoreMana },
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

  getCombat(combatId: string): ActiveCombat | undefined {
    return this.activeCombats.get(combatId);
  }

  getCharacterCombat(characterId: string): ActiveCombat | undefined {
    return Array.from(this.activeCombats.values()).find(
      (c) => c.characterId === characterId && c.state === "active"
    );
  }
}
