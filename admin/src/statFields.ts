export interface StatField {
  key: string;
  label: string;
}

export interface StatGroup {
  label: string;
  fields: StatField[];
}

export const CORE_GROUP: StatGroup = {
  label: "Atributos Base",
  fields: [
    { key: "baseHp", label: "HP Base" },
    { key: "baseMana", label: "Mana Base" },
    { key: "baseAttack", label: "Ataque Base" },
    { key: "baseDefense", label: "Defesa Base" },
    { key: "baseMagic", label: "Magia Base" },
    { key: "baseMagicDefense", label: "Res. Mágica Base" },
    { key: "baseSpeed", label: "Velocidade Base" },
  ],
};

export const FLAT_GROUP: StatGroup = {
  label: "Atributos",
  fields: [
    { key: "attack", label: "Ataque" },
    { key: "defense", label: "Defesa" },
    { key: "magic", label: "Magia" },
    { key: "magicDefense", label: "Res. Mágica" },
    { key: "speed", label: "Velocidade" },
    { key: "maxHp", label: "HP Máx" },
    { key: "maxMana", label: "Mana Máx" },
  ],
};

export const PERCENT_GROUP: StatGroup = {
  label: "Atributos (%)",
  fields: [
    { key: "maxHpPercent", label: "HP Máx (%)" },
    { key: "maxManaPercent", label: "Mana Máx (%)" },
    { key: "attackPercent", label: "Ataque (%)" },
    { key: "defensePercent", label: "Defesa (%)" },
    { key: "magicPercent", label: "Magia (%)" },
    { key: "magicDefensePercent", label: "Res. Mágica (%)" },
    { key: "speedPercent", label: "Velocidade (%)" },
    { key: "hpPercent", label: "Vida (%)" },
    { key: "manaPercent", label: "Mana (%)" },
    { key: "maxHpBonus", label: "Bônus HP Máx" },
  ],
};

export const OFFENSIVE_GROUP: StatGroup = {
  label: "Ofensivo",
  fields: [
    { key: "damageBoost", label: "Bônus de Dano (%)" },
    { key: "physicalBoost", label: "Dano Físico (%)" },
    { key: "magicalBoost", label: "Dano Mágico (%)" },
    { key: "elementalDamage", label: "Dano Elemental (%)" },
    { key: "dotBoost", label: "Dano de DOT (%)" },
    { key: "dotDamagePercent", label: "Dano de DOT (%) bônus" },
    { key: "magicDamagePercent", label: "Dano Mágico (%) bônus" },
    { key: "trueDamage", label: "Dano Verdadeiro (%)" },
    { key: "armorPenetration", label: "Penetração de Armadura" },
    { key: "magicPenetration", label: "Penetração Mágica" },
    { key: "executeBonus", label: "Bônus de Execução (%)" },
    { key: "attackSpeedBonus", label: "Velocidade de Ataque (%)" },
    { key: "speedBonus", label: "Bônus de Velocidade (%)" },
  ],
};

export const DEFENSIVE_GROUP: StatGroup = {
  label: "Defensivo",
  fields: [
    { key: "damageResistance", label: "Resistência a Dano" },
    { key: "physicalResist", label: "Resistência Física" },
    { key: "magicalResist", label: "Resistência Mágica" },
    { key: "dotResistance", label: "Resistência a DOT" },
    { key: "darkResistance", label: "Resistência Sombria" },
    { key: "damageReductionPercent", label: "Redução de Dano (%)" },
    { key: "incomingDamageReduction", label: "Dano Recebido (%)" },
    { key: "dodge", label: "Esquiva (%)" },
    { key: "dodgeBonus", label: "Bônus de Esquiva (%)" },
    { key: "block", label: "Bloqueio (%)" },
    { key: "reflectPercent", label: "Refletir (%)" },
    { key: "absorbPercent", label: "Absorver (%)" },
  ],
};

export const CRIT_GROUP: StatGroup = {
  label: "Crítico",
  fields: [
    { key: "critChance", label: "Chance Crítica (%)" },
    { key: "critDamage", label: "Dano Crítico (%)" },
    { key: "critBonus", label: "Bônus de Crítico (%)" },
    { key: "critDamageBonus", label: "Bônus de Dano Crítico (%)" },
    { key: "critChancePercent", label: "Chance Crítica (%) bônus" },
    { key: "critDamagePercent", label: "Dano Crítico (%) bônus" },
    { key: "critScaling", label: "Scaling de Crítico" },
  ],
};

export const HEALING_GROUP: StatGroup = {
  label: "Cura e Regen",
  fields: [
    { key: "healingBoost", label: "Poder de Cura (%)" },
    { key: "healingReceived", label: "Cura Recebida (%)" },
    { key: "healingPower", label: "Poder de Cura" },
    { key: "healingPowerPercent", label: "Poder de Cura (%) bônus" },
    { key: "overhealPercent", label: "Overheal (%)" },
    { key: "regen", label: "Regen" },
    { key: "regenPercent", label: "Regen (%)" },
    { key: "healthRegen", label: "Regen de Vida" },
    { key: "healthRegenPercent", label: "Regen de Vida (%)" },
    { key: "hpRegenPercent", label: "Regen HP (%)" },
  ],
};

export const MANA_GROUP: StatGroup = {
  label: "Mana e Cooldown",
  fields: [
    { key: "manaRecovery", label: "Recuperação de Mana" },
    { key: "manaRegen", label: "Regen de Mana" },
    { key: "manaRegenPercent", label: "Regen de Mana (%)" },
    { key: "manaCostReduction", label: "Redução de Custo de Mana (%)" },
    { key: "manaSteal", label: "Roubo de Mana" },
    { key: "cooldownReduction", label: "Redução de CD (%)" },
    { key: "cooldownReductionPercent", label: "Redução de CD (%) bônus" },
    { key: "haste", label: "Haste" },
    { key: "cdrFlat", label: "CDR (plano)" },
    { key: "cooldownScaling", label: "Scaling de CD" },
    { key: "manaEfficiency", label: "Eficiência de Mana" },
  ],
};

export const VAMP_GROUP: StatGroup = {
  label: "Vampirismo",
  fields: [
    { key: "lifeSteal", label: "Roubo de Vida (%)" },
    { key: "lifeStealPercent", label: "Roubo de Vida (%) bônus" },
    { key: "lifeStealFlat", label: "Roubo de Vida (plano)" },
    { key: "magicVamp", label: "Vampirismo Mágico (%)" },
    { key: "spellVamp", label: "Vampirismo de Feitiços (%)" },
  ],
};

export const UTILITY_GROUP: StatGroup = {
  label: "Utilidade",
  fields: [
    { key: "xpBonus", label: "Bônus de XP (%)" },
    { key: "goldBonus", label: "Bônus de Gold (%)" },
    { key: "luckBonus", label: "Sorte" },
    { key: "dropRate", label: "Taxa de Drop (%)" },
    { key: "damagePerTick", label: "Dano por Tick" },
    { key: "procChance", label: "Chance de Ativação (%)" },
    { key: "procChancePercent", label: "Chance de Ativação (%) bônus" },
    { key: "triggerChance", label: "Chance de Gatilho (%)" },
    { key: "procCooldown", label: "CD do Proc (ms)" },
  ],
};

export const ALL_GROUPS: StatGroup[] = [
  CORE_GROUP,
  FLAT_GROUP,
  PERCENT_GROUP,
  OFFENSIVE_GROUP,
  DEFENSIVE_GROUP,
  CRIT_GROUP,
  HEALING_GROUP,
  MANA_GROUP,
  VAMP_GROUP,
  UTILITY_GROUP,
];

export const ALL_FIELDS: StatField[] = ALL_GROUPS.flatMap((g) => g.fields);

export const allKeysSet = new Set(ALL_FIELDS.map((f) => f.key));

export const EQUIP_GROUPS: StatGroup[] = [
  FLAT_GROUP,
  PERCENT_GROUP,
  OFFENSIVE_GROUP,
  DEFENSIVE_GROUP,
  CRIT_GROUP,
  HEALING_GROUP,
  MANA_GROUP,
  VAMP_GROUP,
  UTILITY_GROUP,
];

export const TRAIT_GROUPS: StatGroup[] = [
  OFFENSIVE_GROUP,
  DEFENSIVE_GROUP,
  CRIT_GROUP,
  HEALING_GROUP,
  MANA_GROUP,
  UTILITY_GROUP,
];

export const RACE_GROUPS: StatGroup[] = [
  CORE_GROUP,
  {
    label: "Recursos",
    fields: [
      { key: "manaRecovery", label: "Recuperação de Mana" },
      { key: "maxHp", label: "HP Máx" },
      { key: "maxMana", label: "Mana Máx" },
    ],
  },
];
