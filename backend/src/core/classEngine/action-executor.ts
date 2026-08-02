import { Action, BattleEntity, Condition, DerivedStats, EffectDef, Scaling } from "./types";
import { applyEffect, enforceExclusiveGroups, EffectModifiers } from "./effect-manager";

export interface ActionContext {
  actor: BattleEntity;
  target: BattleEntity;
  // stats atualizadas do ator (com buffs/passivas) e do alvo (com debuffs)
  actorStats: DerivedStats;
  targetStats: DerivedStats;
  messages: string[];
  // busca efeito por slug (para applyEffect) e modificadores ativos da classe
  resolveEffect: (slug: string) => EffectDef | undefined;
  effectModifiers: (effectSlug: string) => EffectModifiers | null;
  // modificadores da skill sendo executada (de passivas da classe)
  getSkillModifiers: () => { damagePercent?: number; healPercent?: number } | null;
  // callbacks para estados extras (summons, vitória)
  onSummon?: (name: string, attack: number, hp: number, duration: number) => void;
  onKill?: () => void;
}

export interface ActionResult {
  damage: number;
  healed: number;
  isCritical: boolean;
  isDodged: boolean;
  appliedEffects: string[];
  removedEffects: string[];
  consumedStacks: number;
  messages: string[];
  hit: boolean;
}

export function emptyResult(): ActionResult {
  return { damage: 0, healed: 0, isCritical: false, isDodged: false, appliedEffects: [], removedEffects: [], consumedStacks: 0, messages: [], hit: false };
}

function scaleValue(base: number, scaling: Scaling[] | undefined, stats: DerivedStats): number {
  let total = base || 0;
  if (scaling) {
    for (const s of scaling) {
      const v = stats[s.stat];
      if (typeof v === "number" && Number.isFinite(v)) {
        total += v * (s.factor || 0);
      }
    }
  }
  return total;
}

export function rollDodge(target: BattleEntity, targetStats: DerivedStats): boolean {
  return Math.random() * 100 < Math.min(60, targetStats.dodge);
}

export function computeDamageAmount(
  action: Extract<Action, { action: "damage" }>,
  actor: BattleEntity,
  actorStats: DerivedStats,
  target: BattleEntity,
  targetStats: DerivedStats,
  ctx: ActionContext
): { amount: number; isCritical: boolean; isDodged: boolean } {
  const raw = scaleValue(action.amount ?? 0, action.scaling, actorStats);
  const critRoll = Math.random() * 100;
  const isCritical = action.crit !== false && critRoll < actorStats.critChance;
  const isDodged = action.crit !== false && rollDodge(target, targetStats);

  if (isDodged) {
    return { amount: 0, isCritical: false, isDodged: true };
  }

  const critMult = isCritical ? actorStats.critDamage / 100 : 1;
  let amount = raw * critMult;

  const type = action.damageType || "physical";
  if (type === "physical" || type === "magic") {
    const def = type === "physical" ? targetStats.defense : targetStats.magicDefense;
    if (!action.ignoreDefense) {
      const reduction = def / (def + 100);
      amount *= 1 - reduction;
    }
  }

  const skillMods = ctx.getSkillModifiers();
  let boost = 0;
  if (type === "magic") boost += actorStats.magicDamagePercent;
  boost += actorStats.damagePercent;
  if (skillMods?.damagePercent) boost += skillMods.damagePercent;
  amount *= 1 + boost / 100;

  return { amount: Math.max(1, Math.floor(amount)), isCritical, isDodged: false };
}

// Executa uma lista de ações dentro de um contexto de batalha.
export function executeActions(actions: Action[], ctx: ActionContext, result: ActionResult): void {
  for (const action of actions) {
    switch (action.action) {
      case "damage": {
        const { amount, isCritical, isDodged } = computeDamageAmount(action, ctx.actor, ctx.actorStats, ctx.target, ctx.targetStats, ctx);
        if (isDodged) {
          result.isDodged = true;
          result.messages.push(`O ataque foi esquivado!`);
          continue;
        }
        if (amount <= 0) continue;
        ctx.target.hp = Math.max(0, ctx.target.hp - amount);
        result.damage += amount;
        result.isCritical = result.isCritical || isCritical;
        result.hit = true;
        result.messages.push(isCritical ? `Dano crítico de ${amount}!` : `Causou ${amount} de dano`);
        if (ctx.target.hp <= 0) {
          ctx.onKill?.();
        }
        break;
      }
      case "heal": {
        const raw = action.percentOfMax ? (action.percentOfMax / 100) * ctx.actorStats.hp : scaleValue(action.amount ?? 0, action.scaling, ctx.actorStats);
        const skillMods = ctx.getSkillModifiers();
        let amount = raw * (1 + (ctx.actorStats.healingPercent + (skillMods?.healPercent ?? 0)) / 100);
        const cap = Math.floor(ctx.actor.maxHp * (1 + ctx.actorStats.overhealPercent / 100));
        const applied = Math.min(cap, Math.floor(ctx.actor.hp + amount)) - ctx.actor.hp;
        if (applied > 0) {
          ctx.actor.hp += applied;
          result.healed += applied;
          result.messages.push(`Curou ${applied} de vida`);
        }
        break;
      }
      case "mana": {
        const amount = Math.floor(scaleValue(action.amount ?? 0, action.scaling, ctx.actorStats));
        ctx.actor.mana = Math.min(ctx.actor.maxMana, Math.max(0, ctx.actor.mana + amount));
        result.messages.push(`Mana ${amount >= 0 ? "+" : ""}${amount}`);
        break;
      }
      case "applyEffect": {
        const effect = ctx.resolveEffect(action.effect);
        if (!effect) continue;
        const target = action.target === "self" ? ctx.actor : ctx.target;
        const mods = ctx.effectModifiers(effect.slug);
        const { effects } = applyEffect(target.effects, effect, action.stacks ?? 1, { modifiers: mods });
        target.effects = enforceExclusiveGroups(effects, effect);
        result.appliedEffects.push(effect.name);
        result.messages.push(
          action.target === "self"
            ? `Aplicou ${effect.name} em si mesmo`
            : `Aplicou ${effect.name} no inimigo`
        );
        break;
      }
      case "removeEffect": {
        const target = action.target === "self" ? ctx.actor : ctx.target;
        const { removed } = removeEffectLocal(target.effects, action.effect, action.stacks);
        if (removed > 0) {
          result.removedEffects.push(action.effect);
          result.messages.push(`Removeu stacks de ${action.effect}`);
        }
        break;
      }
      case "consumeStacks": {
        const target = action.target === "self" ? ctx.actor : ctx.target;
        const before = target.effects.find((e) => e.effect.slug === action.effect)?.stacks ?? 0;
        const removed = Math.min(before, action.stacks ?? before);
        target.effects = target.effects.filter((e) => {
          if (e.effect.slug !== action.effect) return true;
          e.stacks -= removed;
          return e.stacks > 0;
        });
        result.consumedStacks += removed;
        if (removed > 0) result.messages.push(`Consumiu ${removed} stacks de ${action.effect}`);
        break;
      }
      case "summon": {
        const attack = Math.floor((ctx.actorStats.attackPower * (action.attackPercent ?? 50)) / 100);
        const hp = Math.floor((ctx.actorStats.hp * (action.hpPercent ?? 20)) / 100);
        ctx.onSummon?.(action.name, Math.max(1, attack), Math.max(1, hp), action.duration ?? 30000);
        result.messages.push(`Invocou ${action.name}!`);
        break;
      }
      case "leech": {
        if (result.damage > 0) {
          const heal = Math.floor(result.damage * ((action.percent ?? 20) / 100));
          ctx.actor.hp = Math.min(ctx.actor.maxHp, ctx.actor.hp + heal);
          result.healed += heal;
          result.messages.push(`Roubou ${heal} de vida`);
        }
        break;
      }
    }
  }
}

function removeEffectLocal(effects: any[], slug: string, amount?: number): { removed: number } {
  if (amount === undefined) {
    const before = effects.length;
    for (let i = effects.length - 1; i >= 0; i--) {
      if (effects[i].effect.slug === slug) effects.splice(i, 1);
    }
    return { removed: before - effects.length };
  }
  let removed = 0;
  for (const e of effects) {
    if (e.effect.slug !== slug) continue;
    const r = Math.min(e.stacks, amount);
    e.stacks -= r;
    removed += r;
    amount -= r;
    if (amount <= 0) break;
  }
  for (let i = effects.length - 1; i >= 0; i--) {
    if (effects[i].stacks <= 0) effects.splice(i, 1);
  }
  return { removed };
}

// Avalia condições (gates de skill, passivas condicionais, eventos)
export function evaluateConditions(conditions: Condition[] | undefined, ctx: { player: BattleEntity; monster: BattleEntity; round: number }): boolean {
  if (!conditions || conditions.length === 0) return true;
  const { player, monster, round } = ctx;
  for (const c of conditions) {
    switch (c.type) {
      case "hasEffect":
        if (!player.effects.some((e) => e.effect.slug === c.effect)) return false;
        break;
      case "stacksAtLeast": {
        const e = player.effects.find((x) => x.effect.slug === c.effect);
        if (!e || e.stacks < (c.stacks ?? 1)) return false;
        break;
      }
      case "stacksAtMost": {
        const e = player.effects.find((x) => x.effect.slug === c.effect);
        if (e && e.stacks > (c.stacks ?? 1)) return false;
        break;
      }
      case "hpPercentBelow":
        if (player.hp / Math.max(1, player.maxHp) * 100 >= (c.percent ?? 50)) return false;
        break;
      case "hpPercentAbove":
        if (player.hp / Math.max(1, player.maxHp) * 100 <= (c.percent ?? 50)) return false;
        break;
      case "manaPercentAtLeast":
        if (player.mana / Math.max(1, player.maxMana) * 100 < (c.percent ?? 20)) return false;
        break;
      case "combatRoundAtLeast":
        if (round < (c.round ?? 5)) return false;
        break;
    }
  }
  return true;
}

export function describeConditions(conditions: Condition[] | undefined): string[] {
  if (!conditions || conditions.length === 0) return [];
  const out: string[] = [];
  for (const c of conditions) {
    switch (c.type) {
      case "hasEffect": out.push(`Requer efeito ${c.effect}`); break;
      case "stacksAtLeast": out.push(`Requer ${c.stacks}× ${c.effect}`); break;
      case "stacksAtMost": out.push(`Máx. ${c.stacks}× ${c.effect}`); break;
      case "hpPercentBelow": out.push(`Vida abaixo de ${c.percent}%`); break;
      case "hpPercentAbove": out.push(`Vida acima de ${c.percent}%`); break;
      case "manaPercentAtLeast": out.push(`Mana acima de ${c.percent}%`); break;
      case "combatRoundAtLeast": out.push(`A partir do round ${c.round}`); break;
    }
  }
  return out;
}
