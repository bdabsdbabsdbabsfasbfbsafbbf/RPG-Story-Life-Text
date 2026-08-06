#!/usr/bin/env node
// Gerador de classes via IA (grátis): Gemini 2.5 Flash (padrão) + fallback Groq (Llama 3.3 70B).
// Uso: node scripts/generate-class.js "classe tanque com skill que reflete dano" [--count 3]
// Chaves: GEMINI_API_KEY e/ou GROQ_API_KEY (variáveis de ambiente ou .env na raiz do repo).

const fs = require("fs");
const path = require("path");

// ===== Config =====
const ROOT = path.resolve(__dirname, "..");
const SEED_FILE = path.join(ROOT, "backend", "prisma", "seed-content.js");
const ENV_FILE = path.join(ROOT, ".env");
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) return;
  for (const line of fs.readFileSync(ENV_FILE, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();

// ===== Templates de statModel (campos base/scaling/conversions são LEGADO — engine usa só coreStats) =====
const CATEGORY_TEMPLATES = {
  tank: {
    base: { hp: 140, mana: 60, magic: 4, speed: 5, attack: 14, defense: 16, magicDefense: 12 },
    scaling: { aggroPerHit: 30, dodgePerSpeed: 0.25, critDamageBase: 150, threatPerAttack: 25, manaRegenPerTick: 4, critChancePerSpeed: 0.5, healthRegenPerTick: 2, spellPowerPerMagic: 1, attackPowerPerAttack: 1 },
    conversions: [
      { stat: "strength", target: "attackPower", factor: 1.5 },
      { stat: "endurance", target: "hp", factor: 12 },
      { stat: "endurance", target: "defense", factor: 0.8 },
      { stat: "dexterity", target: "hitChance", factor: 0.3 },
    ],
    combatStatsBase: { hitChance: 100, critChance: 2, critMultiplier: 150, evasion: 1, cooldownReduction: 0 },
    bonuses: { damageResistance: 10, physicalResistance: 15, magicalResistance: 10, threatPerAttack: 25 },
  },
  caster: {
    base: { hp: 90, mana: 130, magic: 20, speed: 6, attack: 6, defense: 8, magicDefense: 12 },
    scaling: { aggroPerHit: 10, dodgePerSpeed: 0.25, critDamageBase: 150, threatPerAttack: 10, manaRegenPerTick: 12, critChancePerSpeed: 0.5, healthRegenPerTick: 1, spellPowerPerMagic: 1, attackPowerPerAttack: 1 },
    conversions: [
      { stat: "intellect", target: "spellPower", factor: 1.5 },
      { stat: "wisdom", target: "mana", factor: 8 },
      { stat: "wisdom", target: "magicDefense", factor: 0.6 },
      { stat: "luck", target: "critChance", factor: 0.1 },
    ],
    combatStatsBase: { hitChance: 95, critChance: 5, critMultiplier: 160, evasion: 1, cooldownReduction: 5 },
    bonuses: { magicalBoost: 10 },
  },
  melee: {
    base: { hp: 110, mana: 70, magic: 6, speed: 12, attack: 20, defense: 10, magicDefense: 8 },
    scaling: { aggroPerHit: 10, dodgePerSpeed: 0.8, critDamageBase: 180, threatPerAttack: 15, manaRegenPerTick: 6, critChancePerSpeed: 1.2, healthRegenPerTick: 2, spellPowerPerMagic: 1, attackPowerPerAttack: 1 },
    conversions: [
      { stat: "strength", target: "attackPower", factor: 1.3 },
      { stat: "dexterity", target: "hitChance", factor: 0.5 },
      { stat: "luck", target: "critChance", factor: 0.15 },
      { stat: "luck", target: "critDamage", factor: 1.2 },
    ],
    combatStatsBase: { hitChance: 100, critChance: 8, critMultiplier: 180, evasion: 4, cooldownReduction: 3 },
    bonuses: { physicalBoost: 8, penetration: 5 },
  },
  support: {
    base: { hp: 100, mana: 120, magic: 16, speed: 6, attack: 8, defense: 10, magicDefense: 12 },
    scaling: { aggroPerHit: 10, dodgePerSpeed: 0.25, critDamageBase: 150, threatPerAttack: 10, manaRegenPerTick: 10, critChancePerSpeed: 0.5, healthRegenPerTick: 2, spellPowerPerMagic: 1, attackPowerPerAttack: 1 },
    conversions: [
      { stat: "intellect", target: "spellPower", factor: 1.2 },
      { stat: "wisdom", target: "mana", factor: 10 },
      { stat: "wisdom", target: "manaRegenPerTick", factor: 0.4 },
    ],
    combatStatsBase: { hitChance: 100, critChance: 3, critMultiplier: 150, evasion: 2, cooldownReduction: 8 },
    bonuses: { healingBoost: 15, damageResistance: 5 },
  },
  hybrid: {
    base: { hp: 100, mana: 100, magic: 12, speed: 7, attack: 12, defense: 10, magicDefense: 10 },
    scaling: { aggroPerHit: 12, dodgePerSpeed: 0.3, critDamageBase: 155, threatPerAttack: 12, manaRegenPerTick: 8, critChancePerSpeed: 0.6, healthRegenPerTick: 2, spellPowerPerMagic: 1, attackPowerPerAttack: 1 },
    conversions: [
      { stat: "strength", target: "attackPower", factor: 1.1 },
      { stat: "intellect", target: "spellPower", factor: 1.1 },
      { stat: "luck", target: "critChance", factor: 0.1 },
    ],
    combatStatsBase: { hitChance: 100, critChance: 5, critMultiplier: 155, evasion: 2, cooldownReduction: 4 },
    bonuses: { damageBoost: 4, healingBoost: 4 },
  },
};

// ===== Conversão oficial (espelha backend/src/core/classEngine/stat-calculator.ts) =====
const CONVERSION = {
  strength: { attackPower: 0.5, physicalDamagePercent: 0.25, penetration: 0.25 },
  intellect: { spellPower: 0.5, magicalDamagePercent: 0.25, penetration: 0.25 },
  endurance: { hp: 0.5, physicalResistance: 0.25, magicalResistance: 0.25 },
  dexterity: { hitChance: 0.25, dodge: 0.25 },
  wisdom: { mana: 0.5, manaRegenPerTick: 0.25, healingPercent: 0.25, cooldownReduction: 0.25 },
  luck: { critChance: 0.25, critDamage: 0.25 },
};
const BASE = {
  hp: 100, mana: 50, attack: 10, defense: 10, magic: 10, magicDefense: 10, speed: 10,
  hitChance: 85, critChance: 2, critDamage: 150, dodge: 3, manaRegenPerTick: 5, healthRegenPerTick: 1,
  attackPower: 0, spellPower: 0, physicalDamagePercent: 0, magicalDamagePercent: 0,
  physicalResistance: 0, magicalResistance: 0, penetration: 0, healingPercent: 0,
  cooldownReduction: 0, dotPercent: 0, manaCostReduction: 0, damagePercent: 0,
};

const CORE_KEYS = ["strength", "intellect", "endurance", "dexterity", "wisdom", "luck"];
const VALID_ROLES = ["tank", "mage", "dps", "assassin", "support", "hybrid"];
const VALID_CATEGORIES = Object.keys(CATEGORY_TEMPLATES);
const VALID_KINDS = ["attack", "buff", "debuff", "heal", "shield", "utility"];
const VALID_TRIGGERS = ["auto", "active", "ultimate"];
const VALID_TARGETS = ["enemy", "self", "ally"];
const VALID_DAMAGE_TYPES = ["physical", "magic", "true"];
const VALID_ACTIONS = ["damage", "heal", "applyEffect", "mana"];
const VALID_EFFECT_KINDS = ["buff", "debuff", "hot", "dot", "shield", "reflect", "hitkill", "silence", "stun", "nuke"];
const VALID_SCALE_STATS = ["attack", "magic", "defense", "hp", "mana"];
const FLAT_PASSIVE_KEYS = ["attack", "defense", "magic", "magicDefense", "hp", "mana", "speed", "critChance", "critDamage", "dodge", "hitChance", "manaRegenPerTick", "healthRegenPerTick", "cooldownReduction", "attackPower", "spellPower", "physicalResistance", "magicalResistance", "damageResistance", "penetration"];
const PERCENT_PASSIVE_KEYS = ["hp", "mana", "attack", "defense", "magic", "magicDefense", "speed", "critChance", "critDamage", "dodge", "hitChance", "cooldownReduction", "manaCostReduction", "damagePercent", "physicalDamagePercent", "magicDamagePercent", "healingPercent", "dotPercent", "overhealPercent"];

// ===== Prompt =====
function buildPrompt(idea) {
  const coreStatsLine = CORE_KEYS.join(", ");
  return `Você é um designer de classes de um MMORPG de texto. Gere UMA classe completa seguindo EXATAMENTE o contrato abaixo.

CONTRATO (responda apenas com JSON válido, sem markdown):

{
  "class": {
    "name": "Nome pt-BR da classe",
    "slug": "slug-unico-kebab-case",
    "description": "Uma frase curta.",
    "lore": "2-3 frases de história.",
    "icon": "Nome de ícone lucide (ex: Sword, Wand2, Shield, Skull, HeartPulse)",
    "element": "fire|water|nature|light|dark|thunder|ice|earth|arcane",
    "rarity": "common|uncommon|rare|epic|legendary|mythic",
    "difficulty": "easy|medium|hard",
    "role": "tank|mage|dps|assassin|support|hybrid",
    "combatType": "melee|ranged",
    "statModelSlug": "sm-NOMEDACLASSE-kebab-case (NUNCA reutilize: tank, caster, dps, support, hybrid)",
    "requiredLevel": 1,
    "price": 0,
    "sortOrder": 99
  },
  "statModel": {
    "name": "Nome do stat model",
    "slug": "igual a statModelSlug da classe",
    "description": "Frase curta.",
    "category": "tank|caster|melee|support|hybrid",
    "coreStats": { "strength": 0, "intellect": 0, "endurance": 0, "dexterity": 0, "wisdom": 0, "luck": 0 }
  },
  "skills": [ ... ],
  "passives": [ ... ],
  "effects": [ ... ]
}

REGRAS DE CORE STATS (${coreStatsLine}):
- Valores inteiros de 0 a 12.
- SOMA TOTAL entre 15 e 25 pontos.
- Distribua de acordo com a fantasy da classe (tank = endurance/strength; mage = intellect; assassino = dexterity/luck; suporte = wisdom/intellect).

REGRAS DE SKILLS (2 a 5 skills):
- A PRIMEIRA skill é o ataque automático: trigger "auto", kind "attack", target "enemy", cooldown 2000, manaCost 0, rankRequired 1, sortOrder 1, actions: [{ action: "damage", amount: 6-10, scaling: [{ stat: "attack"|"magic", factor: 0.8-1.2 }], damageType: "physical"|"magic" }].
- Demais skills: trigger "active" (rankRequired 1, 3 ou 5) ou "ultimate" (rankRequired 8), cooldown 3000-30000, manaCost 5-35, sortOrder crescente.
- Ações válidas (actions):
  • { action: "damage", amount: <n>, scaling: [{ stat: "attack"|"magic", factor: <0.5-2> }], damageType: "physical"|"magic" }
  • { action: "heal", amount: <n>, scaling: [{ stat: "magic", factor: <0.5-1.5> }] }
  • { action: "applyEffect", effect: "<slug-do-efeito>", target: "self"|"enemy", stacks: <1-3> }
- Toda skill que usar applyEffect DEVE referenciar um efeito existente em "effects" (você gera) ou um já existente no jogo (furia-do-guerreiro, armadura-arcana, passo-das-sombras, foco-arcano, bencao-da-luz, sangramento, chama-arcana, veneno-corrosivo).

REGRAS DE PASSIVAS (exatamente 3):
- rankRequired: 1, 4 e 7. sortOrder: 1, 2, 3.
- statModifiers: { flat: { <chave>: <n> }, percent: { <chave>: <n> } } — use um ou ambos.
- Chaves flat válidas: ${FLAT_PASSIVE_KEYS.join(", ")}.
- Chaves percent válidas: ${PERCENT_PASSIVE_KEYS.join(", ")} (valores em %).

REGRAS DE EFFECTS (somente se alguma skill precisar de efeito novo):
- kind: ${VALID_EFFECT_KINDS.join("|")}
- Efeito de REFLETIR dano (kind "reflect"): { name, slug, description, kind: "reflect", category: "defense", duration: 8000-15000, maxStacks: 1, refreshBehavior: "refresh", reflect: { percent: 15-40 } }.
- Buff/Debuff de stat: { name, slug, description, kind: "buff"|"debuff", category: "stat", duration: 10000-20000, maxStacks: 1-3, refreshBehavior: "stack", statModifiers: { flat: { <chave>: <n> } } }.
- DOT/HOT: { kind: "dot"|"hot", category: "damage"|"healing", duration: 8000-12000, tickInterval: 2000, tickDamage: { base: <n>, scaling: [{ stat: "attack"|"magic", factor: 0.3-0.5 }], damageType: "physical"|"magic" } ou tickHealing: { base: <n>, scaling: [{ stat: "magic", factor: 0.5 }] } }.

PEDIDO DO USUÁRIO (atenda fielmente, incluindo tema, fantasia, elementos e mecânicas pedidos):
"${idea}"

Exemplo de skill com reflect (se o pedido for reflect):
- effect: { name: "Armadura Espinhosa", slug: "armadura-espinhosa", description: "Espinhos mágicos refletem dano ao atacante.", kind: "reflect", category: "defense", duration: 10000, maxStacks: 1, refreshBehavior: "refresh", reflect: { percent: 30 } }
- skill: { name: "Espinhos Arcanos", slug: "espinhos-arcanos", description: "Envolve-se em espinhos que refletem dano.", kind: "buff", trigger: "active", target: "self", cooldown: 12000, manaCost: 15, rankRequired: 3, sortOrder: 2, actions: [{ action: "applyEffect", effect: "armadura-espinhosa", target: "self", stacks: 1 }] }`;
}

// ===== Providers =====
async function callGemini(systemPrompt, idea) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY não definida");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.8 },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini: resposta vazia");
  return text;
}

async function callGroq(systemPrompt, idea) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY não definida");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "Você gera JSON válido seguindo o contrato do usuário. Responda SOMENTE com o JSON." },
        { role: "user", content: systemPrompt },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq: resposta vazia");
  return text;
}

function extractJson(text) {
  let cleaned = text.trim();
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) cleaned = fence[1].trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Resposta não contém JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

// ===== Validação / normalização =====
function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalize(raw, errors) {
  if (!raw || typeof raw !== "object") throw new Error("JSON inválido: objeto raiz ausente");
  const cls = raw.class || raw.gameClass;
  if (!cls || !cls.name) throw new Error("JSON inválido: campo class.name ausente");

  const sm = raw.statModel || {};
  const stats = {};
  let total = 0;
  for (const k of CORE_KEYS) {
    const v = Math.max(0, Math.min(12, Math.round(num(sm.coreStats?.[k], 0))));
    stats[k] = v;
    total += v;
  }
  if (total < 15 || total > 25) errors.push(`Soma de coreStats (${total}) fora do orçamento 15-25 — ajustar manualmente`);

  const role = VALID_ROLES.includes(cls.role) ? cls.role : "hybrid";
  const category = VALID_CATEGORIES.includes(sm.category) ? sm.category : "hybrid";
  // Slug SEMPRE derivado do nome (o modelo costuma inventar slugs inválidos).
  const classSlug = slugify(cls.name);
  const smSlug = `sm-${classSlug}`;

  const skills = Array.isArray(raw.skills) && raw.skills.length > 0 ? raw.skills : [];
  if (skills.length === 0) errors.push("Nenhuma skill gerada");
  if (!skills.some((s) => s.trigger === "auto")) errors.push("Falta o ataque automático (trigger 'auto')");

  const passives = Array.isArray(raw.passives) ? raw.passives : [];
  if (passives.length !== 3) errors.push(`Esperado 3 passivas, veio ${passives.length}`);

  const effects = Array.isArray(raw.effects) ? raw.effects : [];

  // Referências de applyEffect precisam existir em effects ou na pool do jogo
  const existingEffects = new Set([
    "furia-do-guerreiro", "armadura-arcana", "passo-das-sombras", "foco-arcano",
    "bencao-da-luz", "sangramento", "chama-arcana", "veneno-corrosivo",
    ...effects.map((e) => slugify(e.slug || e.name)),
  ]);
  for (const skill of skills) {
    for (const action of skill.actions || []) {
      if (action.action === "applyEffect" && !existingEffects.has(slugify(action.effect))) {
        errors.push(`Skill "${skill.name}" referencia efeito inexistente: ${action.effect}`);
      }
    }
  }

  // Normaliza e valida skills
  const normalizedSkills = skills.map((s, i) => {
    const actions = (s.actions || []).map((a) => {
      const action = { ...a };
      if (!VALID_ACTIONS.includes(action.action)) errors.push(`Skill "${s.name}": ação inválida "${action.action}"`);
      if (action.action === "damage" && !VALID_DAMAGE_TYPES.includes(action.damageType)) action.damageType = "physical";
      if (Array.isArray(action.scaling)) {
        action.scaling = action.scaling.map((sc) => ({
          stat: VALID_SCALE_STATS.includes(sc?.stat) ? sc.stat : "attack",
          factor: num(sc?.factor, 1),
        }));
      } else if (["damage", "heal"].includes(action.action)) {
        action.scaling = [{ stat: action.damageType === "magic" ? "magic" : "attack", factor: 1 }];
      }
      return action;
    });
    return {
      name: s.name,
      slug: slugify(s.slug || s.name),
      description: s.description || "",
      icon: s.icon || null,
      kind: VALID_KINDS.includes(s.kind) ? s.kind : "attack",
      trigger: VALID_TRIGGERS.includes(s.trigger) ? s.trigger : "active",
      target: VALID_TARGETS.includes(s.target) ? s.target : "enemy",
      cooldown: Math.max(0, Math.round(num(s.cooldown, 0))),
      manaCost: Math.max(0, Math.round(num(s.manaCost, 0))),
      rankRequired: [1, 3, 5, 8].includes(num(s.rankRequired, 1)) ? num(s.rankRequired, 1) : i === 0 ? 1 : 3,
      sortOrder: Math.round(num(s.sortOrder, i + 1)),
      actions,
    };
  });

  // Normaliza passivas
  const normalizedPassives = passives.map((p, i) => {
    const flat = {};
    const percent = {};
    for (const [k, v] of Object.entries(p.statModifiers?.flat || {})) {
      if (FLAT_PASSIVE_KEYS.includes(k)) flat[k] = num(v, 0);
      else errors.push(`Passiva "${p.name}": chave flat inválida "${k}"`);
    }
    for (const [k, v] of Object.entries(p.statModifiers?.percent || {})) {
      // Chaves só suportadas como flat (resistências etc.) são movidas para flat,
      // senão a passiva ficaria vazia e sem efeito no jogo.
      if (PERCENT_PASSIVE_KEYS.includes(k)) percent[k] = num(v, 0);
      else if (FLAT_PASSIVE_KEYS.includes(k)) {
        flat[k] = num(v, 0);
        errors.push(`Passiva "${p.name}": "${k}" em percent — movida para flat`);
      } else {
        errors.push(`Passiva "${p.name}": chave percent inválida "${k}"`);
      }
    }
    // Garante que a passiva sempre tenha ao menos um modificador.
    if (Object.keys(flat).length === 0 && Object.keys(percent).length === 0) {
      flat.defense = 5;
      errors.push(`Passiva "${p.name}": sem modificadores válidos — aplicado flat defense +5 como padrão`);
    }
    return {
      name: p.name,
      slug: slugify(p.slug || p.name),
      description: p.description || "",
      rankRequired: [1, 4, 7][i] || num(p.rankRequired, [1, 4, 7][i] || 1),
      sortOrder: i + 1,
      statModifiers: { flat, percent },
    };
  });

  // Normaliza effects
  const normalizedEffects = effects.map((e) => {
    const eff = {
      name: e.name,
      slug: slugify(e.slug || e.name),
      description: e.description || "",
      kind: VALID_EFFECT_KINDS.includes(e.kind) ? e.kind : "buff",
      category: e.category || "utility",
      duration: Math.round(num(e.duration, 0)),
      maxStacks: Math.round(num(e.maxStacks, 1)),
      refreshBehavior: e.refreshBehavior || "refresh",
    };
    if (eff.kind === "reflect") {
      eff.reflect = { percent: Math.min(60, Math.max(5, Math.round(num(e.reflect?.percent, 30)))) };
    } else if (eff.kind === "dot") {
      eff.tickInterval = Math.round(num(e.tickInterval, 2000));
      eff.tickDamage = e.tickDamage || {};
    } else if (eff.kind === "hot") {
      eff.tickInterval = Math.round(num(e.tickInterval, 2000));
      eff.tickHealing = e.tickHealing || {};
    } else {
      eff.statModifiers = e.statModifiers || {};
    }
    return eff;
  });

  return {
    cls: {
      name: cls.name,
      slug: classSlug,
      description: cls.description || "",
      lore: cls.lore || "",
      icon: cls.icon || "Swords",
      element: cls.element || "arcane",
      rarity: cls.rarity || "uncommon",
      difficulty: cls.difficulty || "medium",
      role,
      combatType: cls.combatType === "ranged" ? "ranged" : "melee",
      statModel: smSlug,
      requiredLevel: Math.max(1, Math.round(num(cls.requiredLevel, 1))),
      price: Math.max(0, Math.round(num(cls.price, 0))),
      sortOrder: Math.round(num(cls.sortOrder, 99)),
    },
    sm: {
      name: sm.name || `${cls.name} Stats`,
      slug: smSlug,
      description: sm.description || "",
      category,
      coreStats: stats,
    },
    skills: normalizedSkills,
    passives: normalizedPassives,
    effects: normalizedEffects,
    errors,
  };
}

// ===== Prévia de stats (nível 1, sem arma) — espelha computeStats =====
function statPreview(gen) {
  const stats = { ...BASE };
  for (const k of CORE_KEYS) {
    const v = gen.sm.coreStats[k] || 0;
    for (const [target, factor] of Object.entries(CONVERSION[k] || {})) {
      stats[target] += v * factor;
    }
  }
  for (const p of gen.passives) {
    const flat = p.statModifiers?.flat || {};
    const percent = p.statModifiers?.percent || {};
    for (const [k, v] of Object.entries(flat)) {
      if (k in stats) stats[k] += v;
      else if (k === "attackPower") stats.attackPower += v;
      else if (k === "spellPower") stats.spellPower += v;
    }
    for (const k of ["hp", "mana", "attack", "defense", "magic", "magicDefense", "speed"]) {
      stats[k] *= 1 + (num(percent[k], 0) / 100);
    }
    for (const k of ["critChance", "critDamage", "dodge", "hitChance", "cooldownReduction"]) {
      stats[k] += num(percent[k], 0);
    }
    for (const k of ["physicalDamagePercent", "magicalDamagePercent", "healingPercent", "dotPercent", "damagePercent"]) {
      stats[k] += num(percent[k], 0);
    }
  }
  stats.hp = Math.floor(stats.hp);
  stats.mana = Math.floor(stats.mana);
  stats.attackPower = Math.max(1, Math.floor(stats.attackPower));
  stats.spellPower = Math.max(1, Math.floor(stats.spellPower));
  stats.hitChance = Math.min(100, Math.max(0, Math.round(stats.hitChance * 10) / 10));
  stats.critChance = Math.max(0, Math.round(stats.critChance * 10) / 10);
  stats.critDamage = Math.max(50, Math.round(stats.critDamage * 10) / 10);
  stats.dodge = Math.min(60, Math.max(0, Math.round(stats.dodge * 10) / 10));
  return stats;
}

// ===== Checagem de colisões com o seed =====
function checkCollisions(gen) {
  let seed = "";
  try {
    seed = fs.readFileSync(SEED_FILE, "utf8");
  } catch {
    return [];
  }
  const warnings = [];
  const hay = seed.toLowerCase();
  for (const slug of [gen.cls.slug, gen.sm.slug, ...gen.skills.map((s) => s.slug), ...gen.passives.map((p) => p.slug), ...gen.effects.map((e) => e.slug)]) {
    if (hay.includes(`"${slug}"`)) warnings.push(`Possível colisão no seed: "${slug}"`);
  }
  return warnings;
}

// ===== Output =====
function jsStr(s) {
  return JSON.stringify(String(s ?? "")).replace(/</g, "\\u003c");
}

function printEffect(e) {
  const parts = [
    `name: ${jsStr(e.name)}`,
    `slug: ${jsStr(e.slug)}`,
    `description: ${jsStr(e.description)}`,
    `kind: ${jsStr(e.kind)}`,
    `category: ${jsStr(e.category)}`,
    `duration: ${e.duration}`,
    `maxStacks: ${e.maxStacks}`,
    `refreshBehavior: ${jsStr(e.refreshBehavior)}`,
  ];
  if (e.reflect) parts.push(`reflect: { percent: ${e.reflect.percent} }`);
  if (e.tickDamage) parts.push(`tickDamage: ${JSON.stringify(e.tickDamage)}`);
  if (e.tickHealing) parts.push(`tickHealing: ${JSON.stringify(e.tickHealing)}`);
  if (e.statModifiers) parts.push(`statModifiers: ${JSON.stringify(e.statModifiers)}`);
  return `  { ${parts.join(", ")} },`;
}

function printStatModel(gen) {
  const tpl = CATEGORY_TEMPLATES[gen.sm.category] || CATEGORY_TEMPLATES.hybrid;
  const core = gen.sm.coreStats;
  return [
    "  {",
    `    name: ${jsStr(gen.sm.name)},`,
    `    slug: ${jsStr(gen.sm.slug)},`,
    `    description: ${jsStr(gen.sm.description)},`,
    `    category: ${jsStr(gen.sm.category)},`,
    `    base: ${JSON.stringify(tpl.base)},`,
    `    scaling: ${JSON.stringify(tpl.scaling)},`,
    `    coreStats: { strength: ${core.strength}, intellect: ${core.intellect}, endurance: ${core.endurance}, dexterity: ${core.dexterity}, wisdom: ${core.wisdom}, luck: ${core.luck} },`,
    `    conversions: ${JSON.stringify(tpl.conversions)},`,
    `    combatStatsBase: ${JSON.stringify(tpl.combatStatsBase)},`,
    `    bonuses: ${JSON.stringify(tpl.bonuses)},`,
    "  },",
  ].join("\n");
}

function printClass(gen) {
  const c = gen.cls;
  const lines = [
    "  {",
    `    name: ${jsStr(c.name)},`,
    `    slug: ${jsStr(c.slug)},`,
    `    description: ${jsStr(c.description)},`,
    `    lore: ${jsStr(c.lore)},`,
    `    icon: ${jsStr(c.icon)},`,
    `    element: ${jsStr(c.element)},`,
    `    rarity: ${jsStr(c.rarity)},`,
    `    difficulty: ${jsStr(c.difficulty)},`,
    `    role: ${jsStr(c.role)},`,
    `    combatType: ${jsStr(c.combatType)},`,
    `    statModel: ${jsStr(c.statModel)},`,
    `    requiredLevel: ${c.requiredLevel},`,
    `    price: ${c.price},`,
    `    sortOrder: ${c.sortOrder},`,
    "  },",
  ];
  return lines.join("\n");
}

function printAction(a) {
  const parts = [`action: ${jsStr(a.action)}`];
  if (a.action === "damage") parts.push(`amount: ${a.amount ?? 0}`, `scaling: ${JSON.stringify(a.scaling)}`, `damageType: ${jsStr(a.damageType)}`);
  if (a.action === "heal") parts.push(`amount: ${a.amount ?? 0}`, `scaling: ${JSON.stringify(a.scaling)}`);
  if (a.action === "applyEffect") parts.push(`effect: ${jsStr(a.effect)}`, `target: ${jsStr(a.target)}`, `stacks: ${a.stacks ?? 1}`);
  if (a.action === "mana") parts.push(`amount: ${a.amount ?? 0}`, `target: ${jsStr(a.target || "self")}`);
  return `{ ${parts.join(", ")} }`;
}

function printSkill(s) {
  const parts = [
    `name: ${jsStr(s.name)}`,
    `slug: ${jsStr(s.slug)}`,
    `description: ${jsStr(s.description)}`,
    `kind: ${jsStr(s.kind)}`,
    `trigger: ${jsStr(s.trigger)}`,
    `target: ${jsStr(s.target)}`,
    `cooldown: ${s.cooldown}`,
    `manaCost: ${s.manaCost}`,
    `rankRequired: ${s.rankRequired}`,
    `sortOrder: ${s.sortOrder}`,
  ];
  if (s.icon) parts.push(`icon: ${jsStr(s.icon)}`);
  parts.push(`actions: [${s.actions.map(printAction).join(", ")}]`);
  return `      { ${parts.join(", ")} },`;
}

function printPassive(p) {
  const parts = [
    `name: ${jsStr(p.name)}`,
    `slug: ${jsStr(p.slug)}`,
    `description: ${jsStr(p.description)}`,
    `rankRequired: ${p.rankRequired}`,
    `sortOrder: ${p.sortOrder}`,
    `statModifiers: ${JSON.stringify(p.statModifiers)}`,
  ];
  return `      { ${parts.join(", ")} },`;
}

function printClassSkills(gen) {
  return [
    "  {",
    `    class: ${jsStr(gen.cls.slug)},`,
    "    skills: [",
    ...gen.skills.map(printSkill),
    "    ],",
    "    passives: [",
    ...gen.passives.map(printPassive),
    "    ],",
    "  },",
  ].join("\n");
}

function printPreview(gen) {
  const s = statPreview(gen);
  return [
    "PREVIEW — stats nível 1 (sem arma, sem itens):",
    `  HP ${s.hp} | Mana ${s.mana}`,
    `  Attack Power ${s.attackPower} (soma +DPS da arma) | Spell Power ${s.spellPower}`,
    `  Hit ${s.hitChance}% | Crit ${s.critChance}% / ${s.critDamage}% | Dodge ${s.dodge}%`,
    `  Mana/tick ${s.manaRegenPerTick} | Vida/tick ${s.healthRegenPerTick} | CDR ${s.cooldownReduction}%`,
    `  Dano físico ${s.physicalDamagePercent}% | Dano mágico ${s.magicalDamagePercent}% | Penetração ${s.penetration}%`,
    `  Res. física ${s.physicalResistance}% | Res. mágica ${s.magicalResistance}% | Cura ${s.healingPercent}%`,
  ].join("\n");
}

// ===== Fluxo principal =====
async function generate(idea, providerLog) {
  const prompt = buildPrompt(idea);
  let text = null;
  let lastErr = null;
  const attempts = [
    { name: "Gemini", fn: callGemini },
    { name: "Groq", fn: callGroq },
  ];
  for (const attempt of attempts) {
    if (attempt.name === "Gemini" && !process.env.GEMINI_API_KEY) continue;
    if (attempt.name === "Groq" && !process.env.GROQ_API_KEY) continue;
    for (let retry = 0; retry < 2; retry++) {
      try {
        text = await attempt.fn(prompt, idea);
        providerLog.push(`Usando: ${attempt.name} (${attempt.name === "Gemini" ? GEMINI_MODEL : GROQ_MODEL})${retry > 0 ? ` após ${retry} retry` : ""}`);
        return extractJson(text);
      } catch (err) {
        lastErr = err;
        if (retry === 0) {
          console.log(`  ${attempt.name} falhou (${err.message.slice(0, 120)}), tentando de novo...`);
        } else {
          console.log(`  ${attempt.name} falhou novamente: ${err.message.slice(0, 160)}`);
        }
      }
    }
  }
  throw lastErr || new Error("Nenhum provider disponível (defina GEMINI_API_KEY ou GROQ_API_KEY)");
}

async function main() {
  const args = process.argv.slice(2);
  const countIdx = args.indexOf("--count");
  const count = countIdx !== -1 ? Math.max(1, parseInt(args[countIdx + 1], 10) || 1) : 1;
  const idea = args.filter((a, i) => !(args[i - 1] === "--count" || a === "--count")).join(" ").trim();

  if (!idea) {
    console.log("Uso: node scripts/generate-class.js \"descrição da classe\" [--count N]");
    console.log("");
    console.log("Exemplo: node scripts/generate-class.js \"classe tanque de gelo com skill que reflete dano e passivas defensivas\" --count 3");
    console.log("");
    console.log("Chaves de API (grátis):");
    console.log("  Gemini: https://aistudio.google.com/apikey  ->  GEMINI_API_KEY");
    console.log("  Groq:   https://console.groq.com/keys       ->  GROQ_API_KEY");
    console.log("");
    console.log("Crie um arquivo .env na raiz do repo com uma ou as duas chaves:");
    console.log("  GEMINI_API_KEY=...");
    console.log("  GROQ_API_KEY=...");
    process.exit(1);
  }

  const geminiOk = !!process.env.GEMINI_API_KEY;
  const groqOk = !!process.env.GROQ_API_KEY;
  if (!geminiOk && !groqOk) {
    console.log("Nenhuma chave de API encontrada. Crie o arquivo .env na raiz com GEMINI_API_KEY e/ou GROQ_API_KEY (ver instruções acima).");
    process.exit(1);
  }
  console.log(`Providers: ${geminiOk ? `Gemini ✓` : "Gemini ✗"} | ${groqOk ? "Groq ✓" : "Groq ✗"} — gemini primeiro, groq de fallback`);

  for (let i = 0; i < count; i++) {
    const label = count > 1 ? `\n[Classe ${i + 1}/${count}]\n` : "";
    console.log(`${label}Gerando: "${idea}"${count > 1 ? " (variação)" : ""}...`);
    const providerLog = [];
    const raw = await generate(idea, providerLog);
    const errors = [];
    const gen = normalize(raw, errors);

    console.log("  " + providerLog.join(" "));
    for (const w of errors) console.log(`  ⚠ ${w}`);
    for (const w of checkCollisions(gen)) console.log(`  ⚠ ${w}`);

    const out = [];
    if (gen.effects.length > 0) {
      out.push("=== 1) COLE NO ARRAY `effects` (seed-content.js) ===\n" + gen.effects.map(printEffect).join("\n") + "\n");
    }
    out.push(
      "=== 2) COLE NO ARRAY `statModels` ===\n" + printStatModel(gen) + "\n",
      "=== 3) COLE NO ARRAY `starterClasses` (ou `vipClasses` se for VIP) ===\n" + printClass(gen) + "\n",
      "=== 4) COLE NO ARRAY `classSkills` ===\n" + printClassSkills(gen) + "\n",
      printPreview(gen)
    );
    const banner = `\n=== CLASSE GERADA: ${gen.cls.name} (${gen.cls.slug}) ===\n`;
    console.log(banner + out.join("\n"));
  }
}

main().catch((err) => {
  console.error("Erro:", err.message);
  process.exit(1);
});
