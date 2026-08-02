import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { CrudConfig } from "./pages/CrudPage";

const boolBadge = (v: any, yesClass = "bg-green-500/20 text-green-400", noClass = "bg-gray-600/20 text-gray-400") => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v ? yesClass : noClass}`}>
    {v ? "Yes" : "No"}
  </span>
);

const jsonPreview = (v: any) => (
  <span className="text-xs text-gray-500">{v ? JSON.stringify(v).slice(0, 40) : "-"}</span>
);

const idColumn = {
  key: "id",
  label: "ID",
  render: (v: any) => (
    <span className="font-mono text-[11px] text-gray-500" title={v}>
      {String(v ?? "").slice(0, 8)}
    </span>
  ),
};

export const crudConfigs: CrudConfig[] = [
  {
    key: "classes",
    title: "Classes",
    columns: [
      idColumn,
      { key: "name", label: "Name", render: (v) => <span className="font-medium text-white">{v}</span> },
      { key: "role", label: "Role" },
      { key: "element", label: "Element" },
      { key: "rarity", label: "Rarity" },
      { key: "requiredLevel", label: "Min Level" },
      {
        key: "isStarter",
        label: "Starter",
        render: (v) => boolBadge(v, "bg-accent-500/20 text-accent-400", "bg-gray-600/20 text-gray-400"),
      },
      { key: "baseHp", label: "Base HP" },
      { key: "baseAttack", label: "Base ATK" },
      { key: "isActive", label: "Active", render: (v) => boolBadge(v) },
      {
        key: "_passives",
        label: "Passivas",
        render: (_v, item) => (
          <Link
            to={`/skills?class=${item.id}&tab=passives`}
            className="inline-flex items-center gap-1 text-xs text-green-400 hover:text-green-300"
            title="Editar passivas desta classe"
          >
            <Sparkles size={12} /> Passivas
          </Link>
        ),
      },
    ],
    extraActions: (item) => (
      <Link
        to={`/skills?class=${item.id}&tab=passives`}
        className="inline-flex items-center gap-1 text-xs text-green-400 hover:text-green-300 mr-3"
        title="Editar passivas desta classe"
      >
        <Sparkles size={14} /> Passivas
      </Link>
    ),
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, placeholder: "e.g. cavaleiro", hint: "Lowercase, no spaces, unique" },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "lore", label: "Lore", type: "textarea" },
      { name: "icon", label: "Icon", type: "text", placeholder: "e.g. 'Swords'" },
      {
        name: "element",
        label: "Element",
        type: "select",
        required: true,
        defaultValue: "neutral",
        options: ["fire", "water", "earth", "wind", "light", "dark", "neutral"],
      },
      {
        name: "rarity",
        label: "Rarity",
        type: "select",
        required: true,
        defaultValue: "common",
        options: ["common", "uncommon", "rare", "epic", "legendary", "mythic"],
      },
      {
        name: "difficulty",
        label: "Difficulty",
        type: "select",
        required: true,
        defaultValue: "easy",
        options: ["easy", "medium", "hard", "expert"],
      },
      {
        name: "role",
        label: "Role",
        type: "select",
        required: true,
        defaultValue: "hybrid",
        options: ["tank", "support", "mage", "dps", "assassin", "hybrid"],
      },
      {
        name: "statModel",
        label: "Stat Model",
        type: "select",
        defaultValue: "hybrid",
        options: ["tank", "hybrid", "luckHybrid", "powerCaster", "physicalDPS", "magicDPS", "support", "assassin", "bruiser", "battleMage"],
      },
      { name: "requiredLevel", label: "Required Level", type: "number", defaultValue: 1 },
      {
        name: "unlockMethod",
        label: "Método de desbloqueio",
        type: "select",
        defaultValue: "auto",
        options: ["auto", "quest", "item", "level", "currency"],
      },
      { name: "unlockData", label: "Unlock Data", type: "text", hint: "JSON: questId, itemId, requiredLevel ou currencyCost" },
      { name: "requiredQuests", label: "Required Quests (IDs separados por vírgula)", type: "text" },
      { name: "isStarter", label: "Starter Class (available on character creation)", type: "boolean", defaultValue: false },
      { name: "isActive", label: "Active", type: "boolean", defaultValue: true },
      { name: "baseHp", label: "HP Base", type: "number", defaultValue: 100 },
      { name: "baseMana", label: "Mana Base", type: "number", defaultValue: 50 },
      { name: "baseAttack", label: "Ataque Base", type: "number", defaultValue: 10 },
      { name: "baseDefense", label: "Defesa Base", type: "number", defaultValue: 10 },
      { name: "baseMagic", label: "Magia Base", type: "number", defaultValue: 10 },
      { name: "baseMagicDefense", label: "Res. Mágica Base", type: "number", defaultValue: 10 },
      { name: "baseSpeed", label: "Velocidade Base", type: "number", defaultValue: 10 },
      { name: "manaRecovery", label: "Regen de Mana (por tick)", type: "number", defaultValue: 5, step: "0.1" },
      { name: "attackScaling", label: "Scaling de Ataque", type: "number", defaultValue: 1, step: "0.01" },
      { name: "magicScaling", label: "Scaling de Magia", type: "number", defaultValue: 1, step: "0.01" },
      { name: "critScaling", label: "Crit Scaling (por ponto)", type: "number", defaultValue: 0.05, step: "0.01" },
      { name: "critDamageBase", label: "Dano Crítico Base (%)", type: "number", defaultValue: 150, step: "0.01" },
      { name: "dodgeScaling", label: "Dodge Scaling (por ponto)", type: "number", defaultValue: 0.02, step: "0.01" },
      { name: "cooldownScaling", label: "CDR Scaling (por ponto)", type: "number", defaultValue: 0, step: "0.01" },
      { name: "manaEfficiency", label: "Eficiência de Mana", type: "number", defaultValue: 1, step: "0.01" },
    ],
  },
  {
    key: "items",
    title: "Items",
    columns: [
      idColumn,
      { key: "name", label: "Name", render: (v) => <span className="font-medium text-white">{v}</span> },
      { key: "type", label: "Type" },
      { key: "rarity", label: "Rarity" },
      { key: "level", label: "Level" },
      { key: "tier", label: "Tier" },
      { key: "isActive", label: "Active", render: (v) => boolBadge(v) },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "icon", label: "Icon", type: "text" },
      { name: "type", label: "Type", type: "text", required: true, placeholder: "weapon, armor, consumable, material..." },
      { name: "subtype", label: "Subtype", type: "text", placeholder: "sword, potion, helmet..." },
      { name: "rarity", label: "Rarity", type: "select", required: true, defaultValue: "common", options: ["common", "uncommon", "rare", "epic", "legendary", "mythic"] },
      { name: "level", label: "Level", type: "number", defaultValue: 1 },
      { name: "tier", label: "Tier", type: "number", defaultValue: 1 },
      { name: "buyPrice", label: "Buy Price", type: "number", defaultValue: 0 },
      { name: "sellPrice", label: "Sell Price", type: "number", defaultValue: 0 },
      { name: "stats", label: "Stats", type: "json", jsonSchema: { mode: "fixed-record", allowExtra: true, extraKeyPlaceholder: "outro stat", fields: [
          { key: "attack", label: "Ataque" },
          { key: "defense", label: "Defesa" },
          { key: "magic", label: "Magia" },
          { key: "magicDefense", label: "Res. Mágica" },
          { key: "speed", label: "Velocidade" },
          { key: "maxHp", label: "HP Máx" },
          { key: "maxMana", label: "Mana Máx" },
          { key: "critChance", label: "Chance Crítica (%)" },
          { key: "critDamage", label: "Dano Crítico (%)" },
          { key: "dodge", label: "Esquiva (%)" },
        ] } },
      { name: "requirements", label: "Requirements", type: "json", jsonSchema: { mode: "fixed-record", allowExtra: true, extraKeyPlaceholder: "requisito", fields: [
          { key: "level", label: "Level" },
        ] } },
      { name: "effects", label: "Effects", type: "json", jsonSchema: { mode: "fixed-record", allowExtra: true, extraKeyPlaceholder: "efeito", fields: [
          { key: "heal", label: "Cura" },
          { key: "manaRestore", label: "Recupera Mana" },
          { key: "shield", label: "Escudo" },
          { key: "damage", label: "Dano" },
        ] } },
      { name: "isTradable", label: "Tradable", type: "boolean", defaultValue: true },
      { name: "isSellable", label: "Sellable", type: "boolean", defaultValue: true },
      { name: "isStackable", label: "Stackable", type: "boolean", defaultValue: false },
      { name: "isActive", label: "Active", type: "boolean", defaultValue: true },
    ],
  },
  {
    key: "monsters",
    title: "Monsters / Bosses",
    columns: [
      idColumn,
      { key: "name", label: "Name", render: (v) => <span className="font-medium text-white">{v}</span> },
      { key: "level", label: "Level" },
      { key: "hp", label: "HP" },
      { key: "attack", label: "Attack" },
      { key: "isElite", label: "Elite", render: (v) => boolBadge(v) },
      { key: "isBoss", label: "Boss", render: (v) => boolBadge(v, "bg-red-500/20 text-red-400") },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "imageUrl", label: "Image URL", type: "text" },
      { name: "level", label: "Level", type: "number", defaultValue: 1 },
      { name: "hp", label: "HP", type: "number", defaultValue: 50 },
      { name: "mana", label: "Mana", type: "number", defaultValue: 20 },
      { name: "attack", label: "Attack", type: "number", defaultValue: 10 },
      { name: "defense", label: "Defense", type: "number", defaultValue: 5 },
      { name: "magic", label: "Magic", type: "number", defaultValue: 5 },
      { name: "magicDefense", label: "Magic Defense", type: "number", defaultValue: 5 },
      { name: "speed", label: "Speed", type: "number", defaultValue: 10 },
      { name: "xpReward", label: "XP Reward", type: "number", defaultValue: 10 },
      { name: "goldReward", label: "Gold Reward", type: "number", defaultValue: 5 },
      { name: "isElite", label: "Elite", type: "boolean", defaultValue: false },
      { name: "isBoss", label: "Boss", type: "boolean", defaultValue: false },
      { name: "faction", label: "Faction", type: "text" },
      { name: "element", label: "Element", type: "text" },
    ],
  },
  {
    key: "maps",
    title: "Maps",
    columns: [
      idColumn,
      { key: "name", label: "Name", render: (v) => <span className="font-medium text-white">{v}</span> },
      { key: "slug", label: "Slug", render: (v) => <span className="text-xs text-gray-500">{v}</span> },
      { key: "region", label: "Region" },
      { key: "requiredLevel", label: "Min Level" },
      { key: "isPvPZone", label: "PvP", render: (v) => boolBadge(v) },
      { key: "isActive", label: "Active", render: (v) => boolBadge(v) },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, hint: "Unique, lowercase" },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "imageUrl", label: "Image URL", type: "text" },
      { name: "region", label: "Region", type: "text", required: true },
      { name: "requiredLevel", label: "Required Level", type: "number", defaultValue: 1 },
      { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "isPvPZone", label: "PvP Zone", type: "boolean", defaultValue: false },
      { name: "isActive", label: "Active", type: "boolean", defaultValue: true },
    ],
  },
  {
    key: "quests",
    title: "Quests",
    columns: [
      idColumn,
      { key: "title", label: "Title", render: (v) => <span className="font-medium text-white">{v}</span> },
      { key: "type", label: "Type" },
      { key: "difficulty", label: "Difficulty" },
      { key: "requiredLevel", label: "Min Level" },
      { key: "isRepeatable", label: "Repeatable", render: (v) => boolBadge(v) },
      { key: "isActive", label: "Active", render: (v) => boolBadge(v) },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "type", label: "Type", type: "text", required: true, placeholder: "main, side, daily, event..." },
      { name: "difficulty", label: "Difficulty", type: "select", defaultValue: "easy", options: ["easy", "medium", "hard", "expert"] },
      { name: "requiredLevel", label: "Required Level", type: "number", defaultValue: 1 },
      { name: "xpReward", label: "XP Reward", type: "number", defaultValue: 0 },
      { name: "goldReward", label: "Gold Reward", type: "number", defaultValue: 0 },
      { name: "objectives", label: "Objectives", type: "json", jsonSchema: { mode: "object-array", addLabel: "Adicionar objetivo", fields: [
          { name: "type", label: "Tipo", type: "select", options: ["kill", "collect", "talk", "reach", "use", "escort", "defeat_boss"] },
          { name: "monsterName", label: "Alvo (nome ou ID)", type: "text", placeholder: "ex: Rato da Floresta" },
          { name: "amount", label: "Quantidade", type: "number" },
        ] } },
      { name: "itemRewards", label: "Item Rewards", type: "json", jsonSchema: { mode: "object-array", addLabel: "Adicionar recompensa", fields: [
          { name: "itemId", label: "Item ID", type: "text" },
          { name: "itemName", label: "Nome do Item", type: "text" },
          { name: "quantity", label: "Quantidade", type: "number" },
        ] } },
      { name: "isRepeatable", label: "Repeatable", type: "boolean", defaultValue: false },
      { name: "isActive", label: "Active", type: "boolean", defaultValue: true },
      { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 },
    ],
  },
  {
    key: "buffs",
    title: "Buffs / Debuffs",
    columns: [
      idColumn,
      { key: "name", label: "Name", render: (v) => <span className="font-medium text-white">{v}</span> },
      { key: "type", label: "Type" },
      { key: "duration", label: "Duration (ms)", render: (v) => <span className="font-mono text-xs">{v ?? 0}</span> },
      { key: "maxStacks", label: "Max Stacks" },
      { key: "statModifiers", label: "Stat Modifiers", render: jsonPreview },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "type", label: "Type", type: "text", required: true, placeholder: "buff, debuff, dot, hot..." },
      { name: "icon", label: "Icon", type: "text" },
      { name: "duration", label: "Duration (ms)", type: "number", defaultValue: 0 },
      { name: "maxStacks", label: "Max Stacks", type: "number", defaultValue: 1 },
      { name: "tickInterval", label: "Tick Interval (ms)", type: "number", defaultValue: 0 },
      { name: "tickEffect", label: "Tick Effect", type: "text", placeholder: "damage, heal..." },
      { name: "statModifiers", label: "Stat Modifiers", type: "json", jsonSchema: { mode: "fixed-record", allowExtra: true, extraKeyPlaceholder: "outro stat", fields: [
          { key: "attack", label: "Ataque" },
          { key: "defense", label: "Defesa" },
          { key: "magic", label: "Magia" },
          { key: "magicDefense", label: "Res. Mágica" },
          { key: "speed", label: "Velocidade" },
          { key: "maxHp", label: "HP Máx" },
          { key: "maxMana", label: "Mana Máx" },
          { key: "critChance", label: "Chance Crítica (%)" },
          { key: "critDamage", label: "Dano Crítico (%)" },
          { key: "dodge", label: "Esquiva (%)" },
        ] }, hint: "Valores negativos reduzem o stat" },
      { name: "specialEffect", label: "Special Effect", type: "text" },
      { name: "stackBehavior", label: "Stack Behavior", type: "select", defaultValue: "independent", options: ["independent", "overwrite", "refresh", "accumulate"] },
    ],
  },
  {
    key: "races",
    title: "Races",
    columns: [
      idColumn,
      { key: "name", label: "Name", render: (v) => <span className="font-medium text-white">{v}</span> },
      { key: "slug", label: "Slug", render: (v) => <span className="text-xs text-gray-500">{v}</span> },
      { key: "description", label: "Description", render: (v) => <span className="text-gray-400 max-w-xs truncate block">{v}</span> },
      { key: "traits", label: "Modifiers", render: jsonPreview },
      { key: "isActive", label: "Active", render: (v) => boolBadge(v) },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, hint: "Unique, lowercase" },
      { name: "description", label: "Description", type: "textarea", required: true },
      {
        name: "traits",
        label: "Stat Modifiers",
        type: "json",
        jsonSchema: { mode: "fixed-record", allowExtra: true, extraKeyPlaceholder: "outro stat", fields: [
          { key: "baseHp", label: "HP Base" },
          { key: "baseAttack", label: "Ataque Base" },
          { key: "baseDefense", label: "Defesa Base" },
          { key: "baseMagic", label: "Magia Base" },
          { key: "baseMagicDefense", label: "Res. Mágica Base" },
          { key: "baseSpeed", label: "Velocidade Base" },
          { key: "manaRecovery", label: "Regen de Mana" },
        ] },
      },
      { name: "isActive", label: "Active", type: "boolean", defaultValue: true },
    ],
  },
  {
    key: "traits",
    title: "Traits",
    columns: [
      idColumn,
      { key: "name", label: "Name", render: (v) => <span className="font-medium text-white">{v}</span> },
      { key: "slug", label: "Slug", render: (v) => <span className="text-xs text-gray-500">{v}</span> },
      { key: "description", label: "Description", render: (v) => <span className="text-gray-400 max-w-xs truncate block">{v}</span> },
      { key: "modifiers", label: "Modifiers", render: jsonPreview },
      { key: "isActive", label: "Active", render: (v) => boolBadge(v) },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, hint: "Unique, lowercase" },
      { name: "description", label: "Description", type: "textarea", required: true },
      {
        name: "modifiers",
        label: "Modifiers",
        type: "json",
        jsonSchema: { mode: "fixed-record", allowExtra: true, extraKeyPlaceholder: "outro modificador", fields: [
          { key: "xpBonus", label: "Bônus de XP (%)" },
          { key: "goldBonus", label: "Bônus de Gold (%)" },
          { key: "critBonus", label: "Chance Crítica (%)" },
          { key: "dodgeBonus", label: "Esquiva (%)" },
          { key: "cooldownReduction", label: "Redução de CD (%)" },
        ] },
        hint: "Todos em percentual (%)",
      },
      { name: "isActive", label: "Active", type: "boolean", defaultValue: true },
    ],
  },
];
