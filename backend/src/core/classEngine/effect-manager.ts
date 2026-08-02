import { ActiveEffectRuntime, EffectDef } from "./types";

export interface EffectModifiers {
  durationPercent?: number;
  tickPercent?: number;
  damagePercent?: number;
  healPercent?: number;
  stacksBonus?: number;
}

export interface ApplyEffectResult {
  gainedStacks: number;
  maxed: boolean;
  refreshed: boolean;
}

function findModifier(effectModifiers: Array<{ effectSlug: string; [k: string]: any }>, slug: string): EffectModifiers | null {
  if (!effectModifiers || effectModifiers.length === 0) return null;
  const match = effectModifiers.find((m) => m.effectSlug === slug) || effectModifiers.find((m) => m.effectSlug === "*");
  return (match as EffectModifiers) || null;
}

export function applyEffect(
  effects: ActiveEffectRuntime[],
  effect: EffectDef,
  stacks: number,
  opts?: { modifiers?: EffectModifiers | null; now?: number }
): { effects: ActiveEffectRuntime[]; result: ApplyEffectResult } {
  const now = opts?.now ?? Date.now();
  const mods = opts?.modifiers ?? null;
  const durationMod = (mods?.durationPercent ?? 0) / 100;
  const stacksBonus = mods?.stacksBonus ?? 0;
  const gainedStacks = Math.max(1, Math.floor(stacks) + (stacksBonus || 0));

  const existing = effects.find((e) => e.effect.slug === effect.slug);

  if (existing) {
    const maxStacks = effect.maxStacks;
    let newStacks: number;
    let maxed = false;

    switch (effect.refreshBehavior) {
      case "extend":
        newStacks = Math.min(maxStacks, existing.stacks + gainedStacks);
        existing.remainingMs = existing.remainingMs + Math.floor(effect.duration * (1 + durationMod));
        break;
      case "overwrite":
        newStacks = Math.min(maxStacks, gainedStacks);
        existing.remainingMs = effect.duration > 0 ? Math.floor(effect.duration * (1 + durationMod)) : 0;
        break;
      case "stack":
        newStacks = Math.min(maxStacks, existing.stacks + gainedStacks);
        break;
      case "refresh":
      default:
        newStacks = Math.min(maxStacks, existing.stacks + gainedStacks);
        existing.remainingMs = effect.duration > 0 ? Math.floor(effect.duration * (1 + durationMod)) : 0;
        break;
    }

    maxed = newStacks >= maxStacks && existing.stacks < maxStacks;
    existing.stacks = newStacks;
    if (existing.nextTickAt === null && effect.tickInterval > 0) {
      existing.nextTickAt = now + effect.tickInterval;
    }
    return {
      effects,
      result: { gainedStacks: existing.stacks, maxed, refreshed: true },
    };
  }

  const runtime: ActiveEffectRuntime = {
    effect,
    stacks: Math.min(Math.max(1, gainedStacks), Math.max(1, effect.maxStacks)),
    remainingMs: effect.duration > 0 ? Math.floor(effect.duration * (1 + durationMod)) : 0,
    nextTickAt: effect.tickInterval > 0 ? now + effect.tickInterval : null,
  };
  effects.push(runtime);
  return { effects, result: { gainedStacks: runtime.stacks, maxed: false, refreshed: false } };
}

// Aplica exclusividade: efeitos do mesmo grupo exclusivo são removidos (o novo vence).
export function enforceExclusiveGroups(effects: ActiveEffectRuntime[], effect: EffectDef): ActiveEffectRuntime[] {
  if (!effect.exclusiveGroup) return effects;
  return effects.filter(
    (e) => e.effect.id === effect.id || (e.effect.exclusiveGroup && e.effect.exclusiveGroup !== effect.exclusiveGroup) || !e.effect.exclusiveGroup
  );
}

export function consumeStacks(effects: ActiveEffectRuntime[], slug: string, amount: number): { effects: ActiveEffectRuntime[]; removed: number } {
  const idx = effects.findIndex((e) => e.effect.slug === slug);
  if (idx === -1) return { effects, removed: 0 };
  const removed = Math.min(effects[idx].stacks, Math.max(0, amount));
  effects[idx].stacks -= removed;
  if (effects[idx].stacks <= 0) {
    effects.splice(idx, 1);
  }
  return { effects, removed };
}

export function removeEffect(effects: ActiveEffectRuntime[], slug: string, amount?: number): { effects: ActiveEffectRuntime[]; removed: number } {
  if (amount === undefined) {
    const before = effects.length;
    const after = effects.filter((e) => e.effect.slug !== slug);
    return { effects: after, removed: before - after.length };
  }
  return consumeStacks(effects, slug, amount);
}

export function getEffect(effects: ActiveEffectRuntime[], slug: string): ActiveEffectRuntime | undefined {
  return effects.find((e) => e.effect.slug === slug);
}

// Processa duração, ticks e perda de stacks. Retorna eventos gerados no passo.
export interface TickStepEvents {
  expired: ActiveEffectRuntime[];
  ticked: Array<{ effect: EffectDef; stacks: number }>;
  stacksLost: Array<{ effect: EffectDef; stacks: number }>;
}

export function processEffectStep(effects: ActiveEffectRuntime[], stepMs: number, now: number): { effects: ActiveEffectRuntime[]; events: TickStepEvents } {
  const events: TickStepEvents = { expired: [], ticked: [], stacksLost: [] };
  const remaining: ActiveEffectRuntime[] = [];

  for (const e of effects) {
    // Duração
    if (e.remainingMs > 0) {
      e.remainingMs = Math.max(0, e.remainingMs - stepMs);
    }
    // Tick (HOT/DOT)
    if (e.nextTickAt !== null && e.nextTickAt !== undefined && now >= e.nextTickAt) {
      events.ticked.push({ effect: e.effect, stacks: e.stacks });
      if (e.effect.tickInterval > 0) {
        e.nextTickAt = now + e.effect.tickInterval;
      }
    }
    // Perda de stack
    const loss = e.effect.stackLoss;
    if (loss.intervalMs && loss.amount && e.stacks > 1) {
      const lost = Math.min(e.stacks - 1, loss.amount);
      if (lost > 0) {
        events.stacksLost.push({ effect: e.effect, stacks: lost });
        e.stacks -= lost;
      }
    }
    // Expiração: só efeitos com duração finita (duration > 0)
    if (e.effect.duration > 0 && e.remainingMs <= 0) {
      events.expired.push(e);
      continue;
    }
    remaining.push(e);
  }

  return { effects: remaining, events };
}

export function serializeEffects(effects: ActiveEffectRuntime[]) {
  return effects.map((e) => ({
    slug: e.effect.slug,
    name: e.effect.name,
    kind: e.effect.kind,
    stacks: e.stacks,
    remainingMs: e.remainingMs,
  }));
}
