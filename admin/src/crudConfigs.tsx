import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { CrudConfig } from "./pages/CrudPage";
import { EQUIP_GROUPS, TRAIT_GROUPS, RACE_GROUPS } from "./statFields";

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

const STAT_BASE_FIELDS = [
  { key: "hp", label: "HP" },
  { key: "mana", label: "Mana" },
  { key: "attack", label: "Ataque" },
  { key: "defense", label: "Defesa" },
  { key: "magic", label: "Magia" },
  { key: "magicDefense", label: "Res. Mágica" },
  { key: "speed", label: "Velocidade" },
];

const STAT_SCALING_FIELDS = [
  { key: "attackPowerPerAttack", label: "AtkPower/Ataque" },
  { key: "spellPowerPerMagic", label: "SpellPower/Magia" },
  { key: "critChancePerSpeed", label: "CritChance/Velocidade" },
  { key: "critDamageBase", label: "CritDamage Base (%)" },
  { key: "dodgePerSpeed", label: "Esquiva/Velocidade" },
  { key: "attackSpeedMs", label: "Attack Speed (ms)" },
  { key: "manaRegenPerTick", label: "Mana Regen/Tick" },
  { key: "healthRegenPerTick", label: "HP Regen/Tick" },
  { key: "threatPerAttack", label: "Ameaça/Ataque" },
  { key: "aggroPerHit", label: "Aggro/Golpe" },
];

export const crudConfigs: CrudConfig[] = [
  {
    key: "classes",
    title: "Classes",
    columns: [
      idColumn,
      { key: "name", label: "Name", render: (v) => <span className="font-medium text-white">{v}</span> },
      { key: "role", label: "Role" },
      { key: "combatType", label: "Combat" },
      { key: "rankMax", label: "Max Rank" },
      {
        key: "isStarter",
        label: "Starter",
        render: (v) => boolBadge(v, "bg-accent-500/20 text-accent-400", "bg-gray-600/20 text-gray-400"),
      },
      {
        key: "statModelId",
        label: "Stat Model",
        render: (v) => (v ? <span className="font-mono text-[11px] text-gray-500" title={v}>{String(v).slice(0, 8)}</span> : <span className="text-gray-600">—</span>),
      },
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
      { name: "icon", label: "Icon", type: "text", placeholder: "e.g. 'Swords'" },
      {
        name: "role",
        label: "Role",
        type: "select",
        required: true,
        defaultValue: "hybrid",
        options: ["tank", "dps", "healer", "support", "hybrid"],
      },
      {
        name: "combatType",
        label: "Combat Type",
        type: "select",
        required: true,
        defaultValue: "melee",
        options: ["melee", "ranged", "caster"],
      },
      { name: "rankMax", label: "Max Rank", type: "number", defaultValue: 10 },
      { name: "statModelId", label: "Stat Model ID", type: "text", hint: "ID do StatModel ligado (ver página Stat Models)" },
      {
        name: "resource",
        label: "Resource",
        type: "json",
        jsonSchema: { mode: "record", valueType: "number", addLabel: "Adicionar recurso", keyPlaceholder: "manaOnHit, manaOnKill, manaRegenPerTick…", valuePlaceholder: "valor" },
      },
      { name: "isStarter", label: "Starter Class (available on character creation)", type: "boolean", defaultValue: false },
      { name: "isActive", label: "Active", type: "boolean", defaultValue: true },
      { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 },
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
      { name: "stats", label: "Stats", type: "json", jsonSchema: { mode: "fixed-record", groups: EQUIP_GROUPS } },
      { name: "requirements", label: "Requirements", type: "json", jsonSchema: { mode: "fixed-record", fields: [
          { key: "level", label: "Level" },
        ] } },
      { name: "effects", label: "Effects", type: "json", jsonSchema: { mode: "fixed-record", fields: [
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
    key: "statModels",
    title: "Stat Models",
    columns: [
      idColumn,
      { key: "name", label: "Name", render: (v) => <span className="font-medium text-white">{v}</span> },
      { key: "slug", label: "Slug", render: (v) => <span className="text-xs text-gray-500">{v}</span> },
      { key: "base", label: "Base", render: jsonPreview },
      { key: "perLevel", label: "Per Level", render: jsonPreview },
      { key: "isActive", label: "Active", render: (v) => boolBadge(v) },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, hint: "Unique, lowercase" },
      { name: "description", label: "Description", type: "textarea", required: true },
      {
        name: "base",
        label: "Base (nível 1)",
        type: "json",
        jsonSchema: { mode: "fixed-record", fields: STAT_BASE_FIELDS },
      },
      {
        name: "perLevel",
        label: "Per Level (crescimento)",
        type: "json",
        jsonSchema: { mode: "fixed-record", fields: STAT_BASE_FIELDS },
      },
      {
        name: "scaling",
        label: "Scaling (derivados)",
        type: "json",
        jsonSchema: { mode: "fixed-record", fields: STAT_SCALING_FIELDS },
      },
      { name: "isActive", label: "Active", type: "boolean", defaultValue: true },
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
        jsonSchema: { mode: "fixed-record", groups: RACE_GROUPS },
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
        jsonSchema: { mode: "fixed-record", groups: TRAIT_GROUPS },
        hint: "Todos em percentual (%)",
      },
      { name: "isActive", label: "Active", type: "boolean", defaultValue: true },
    ],
  },
];
