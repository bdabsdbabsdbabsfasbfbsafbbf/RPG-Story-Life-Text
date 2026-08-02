import { useState } from "react";
import { CORE_GROUP, FLAT_GROUP, PERCENT_GROUP, OFFENSIVE_GROUP, DEFENSIVE_GROUP, CRIT_GROUP, HEALING_GROUP, MANA_GROUP, VAMP_GROUP, UTILITY_GROUP, StatGroup } from "./statFields";

export const kindOptions = ["attack", "heal", "buff", "debuff", "summon", "mobility", "control", "defense", "channel"];
export const triggerOptions = ["auto", "active", "ultimate"];
export const targetOptions = ["enemy", "self"];
export const damageTypeOptions = ["physical", "magic", "true"];
export const effectKindOptions = ["buff", "debuff", "hot", "dot"];
export const effectCategoryOptions = ["defense", "offense", "control", "mobility", "utility", "recovery"];
export const refreshBehaviorOptions = ["refresh", "extend", "overwrite", "stack"];

export const actionOptions = [
  "damage",
  "heal",
  "mana",
  "applyEffect",
  "removeEffect",
  "consumeStacks",
  "summon",
  "leech",
];

export const conditionTypeOptions = [
  "hasEffect",
  "stacksAtLeast",
  "stacksAtMost",
  "hpPercentBelow",
  "hpPercentAbove",
  "manaPercentAtLeast",
  "combatRoundAtLeast",
];

export const actionFields = [
  { name: "action", label: "Ação", type: "select" as const, options: actionOptions },
  { name: "amount", label: "Quantidade Base", type: "number" as const },
  { name: "effect", label: "Efeito (slug)", type: "text" as const, placeholder: "bleed, fortify…" },
  { name: "stacks", label: "Stacks", type: "number" as const },
  { name: "target", label: "Alvo", type: "select" as const, options: targetOptions },
  { name: "damageType", label: "Tipo de Dano", type: "select" as const, options: damageTypeOptions },
  { name: "percent", label: "Percentual (heal %/leech)", type: "number" as const },
  { name: "name", label: "Nome (summon)", type: "text" as const },
  { name: "duration", label: "Duração (ms, summon)", type: "number" as const },
  { name: "attackPercent", label: "Ataque % (summon)", type: "number" as const },
  { name: "hpPercent", label: "HP % (summon)", type: "number" as const },
];

export const conditionFields = [
  { name: "type", label: "Condição", type: "select" as const, options: conditionTypeOptions },
  { name: "effect", label: "Efeito (slug)", type: "text" as const, placeholder: "bleed, mark…" },
  { name: "stacks", label: "Stacks", type: "number" as const },
  { name: "percent", label: "Percentual (HP/Mana)", type: "number" as const },
  { name: "round", label: "Rodada", type: "number" as const },
];

export const skillModifierFields = [
  { name: "skillSlug", label: "Skill (slug)", type: "text" as const, placeholder: "ass-execucao" },
  { name: "damagePercent", label: "Dano %", type: "number" as const },
  { name: "cooldownPercent", label: "Cooldown %", type: "number" as const },
  { name: "manaPercent", label: "Mana %", type: "number" as const },
  { name: "healPercent", label: "Cura %", type: "number" as const },
];

export const effectModifierFields = [
  { name: "effectSlug", label: "Efeito (slug)", type: "text" as const, placeholder: "bleed, burn…" },
  { name: "durationPercent", label: "Duração %", type: "number" as const },
  { name: "tickPercent", label: "Tick %", type: "number" as const },
  { name: "damagePercent", label: "Dano %", type: "number" as const },
  { name: "healPercent", label: "Cura %", type: "number" as const },
  { name: "stacksBonus", label: "Bônus de Stacks", type: "number" as const },
];

export const scalingFields = [
  { name: "stat", label: "Stat", type: "text" as const, placeholder: "attack, spellPower…" },
  { name: "factor", label: "Fator", type: "number" as const },
];

export const passiveFlatGroups: StatGroup[] = [
  CORE_GROUP,
  FLAT_GROUP,
  OFFENSIVE_GROUP,
  DEFENSIVE_GROUP,
  CRIT_GROUP,
  HEALING_GROUP,
  MANA_GROUP,
  VAMP_GROUP,
  UTILITY_GROUP,
];

export const passivePercentGroups: StatGroup[] = [
  PERCENT_GROUP,
  OFFENSIVE_GROUP,
  DEFENSIVE_GROUP,
  CRIT_GROUP,
  HEALING_GROUP,
  MANA_GROUP,
  VAMP_GROUP,
  UTILITY_GROUP,
];

export const emptyStatModifiers = () => ({ flat: {} as Record<string, number>, percent: {} as Record<string, number> });

export const parseJsonArray = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const parseStatModifiers = (raw: any): { flat: Record<string, number>; percent: Record<string, number> } => {
  let parsed: any = {};
  if (raw && typeof raw === "object" && !Array.isArray(raw)) parsed = raw;
  else if (typeof raw === "string" && raw.trim()) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }
  }
  if (parsed && typeof parsed === "object" && ("flat" in parsed || "percent" in parsed)) {
    return {
      flat: parsed.flat && typeof parsed.flat === "object" ? parsed.flat : {},
      percent: parsed.percent && typeof parsed.percent === "object" ? parsed.percent : {},
    };
  }
  return { flat: parsed || {}, percent: {} };
};

const inputClass =
  "w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none";

export function JsonArrayEditor({ value, onChange }: { value: any[]; onChange: (v: any[]) => void }) {
  const [raw, setRaw] = useState(() => JSON.stringify(value ?? [], null, 2));
  const [error, setError] = useState<string | null>(null);

  const handle = (text: string) => {
    setRaw(text);
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        setError(null);
        onChange(parsed);
      } else {
        setError("O JSON precisa ser um array");
      }
    } catch {
      setError("JSON inválido");
    }
  };

  return (
    <div>
      <textarea
        value={raw}
        onChange={(e) => handle(e.target.value)}
        rows={6}
        spellCheck={false}
        className={`${inputClass} resize-y font-mono text-xs`}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
