import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { adminApi } from "../api";
import JsonField from "../components/JsonField";

interface GameClassLite {
  id: string;
  name: string;
}

const inputClass =
  "w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none";

const defaultSkill = {
  name: "",
  description: "",
  icon: "",
  type: "active",
  subType: "melee",
  cooldown: 0,
  manaCost: 0,
  castTime: 0,
  range: 5,
  targetType: "enemy",
  rankRequired: 1,
  baseDamage: 0,
  damageType: "physical",
  healingBase: 0,
  sortOrder: 0,
  isActive: true,
  effects: [] as any[],
  buffsApplied: [] as string[],
  debuffsApplied: [] as string[],
};

const typeOptions = ["auto", "active", "passive", "ultimate"];
const subTypeOptions = ["melee", "ranged", "spell", "heal", "buff", "debuff", "dot", "aoe", "channel"];
const targetTypeOptions = ["self", "enemy", "ally", "area", "all"];
const damageTypeOptions = ["physical", "magic", "true"];

const effectTypeOptions = [
  "stat_bonus", "stat_boost", "damage_increase", "damage_reduction",
  "critical_chance", "critical_damage", "cooldown_reduction", "life_steal",
  "mana_regen", "health_regen", "resistance", "reflect", "absorb", "chance_proc",
];

const defaultPassive = {
  name: "",
  description: "",
  icon: "",
  rankRequired: 1,
  effectType: "stat_bonus",
  statModifiers: {} as Record<string, number>,
  effectData: {} as Record<string, any>,
};

const baseStatFields = [
  { key: "attack", label: "Ataque" },
  { key: "defense", label: "Defesa" },
  { key: "magic", label: "Magia" },
  { key: "magicDefense", label: "Res. Mágica" },
  { key: "speed", label: "Velocidade" },
  { key: "maxHp", label: "HP Máx" },
  { key: "maxMana", label: "Mana Máx" },
  { key: "maxHpPercent", label: "HP Máx (%)" },
  { key: "maxManaPercent", label: "Mana Máx (%)" },
];

const passiveStatFieldsByType: Record<string, { key: string; label: string }[]> = {
  stat_bonus: [
    ...baseStatFields,
    { key: "baseHp", label: "HP Base" },
    { key: "baseMana", label: "Mana Base" },
    { key: "baseAttack", label: "Ataque Base" },
    { key: "baseDefense", label: "Defesa Base" },
    { key: "baseMagic", label: "Magia Base" },
    { key: "baseMagicDefense", label: "Res. Mágica Base" },
    { key: "baseSpeed", label: "Velocidade Base" },
    { key: "manaRecovery", label: "Regen de Mana" },
    { key: "attackScaling", label: "Scaling Ataque" },
    { key: "magicScaling", label: "Scaling Magia" },
    { key: "critScaling", label: "Scaling Crit" },
    { key: "dodgeScaling", label: "Scaling Esquiva" },
    { key: "cooldownScaling", label: "Scaling CD" },
    { key: "manaEfficiency", label: "Efic. Mana" },
  ],
  stat_boost: [
    ...baseStatFields,
    { key: "attackPercent", label: "Ataque (%)" },
    { key: "defensePercent", label: "Defesa (%)" },
    { key: "magicPercent", label: "Magia (%)" },
    { key: "magicDefensePercent", label: "Res. Mágica (%)" },
    { key: "speedPercent", label: "Velocidade (%)" },
    { key: "hpPercent", label: "Vida (%)" },
    { key: "manaPercent", label: "Mana (%)" },
    { key: "attackFlat", label: "Ataque (plano)" },
    { key: "defenseFlat", label: "Defesa (plano)" },
  ],
  damage_increase: [
    { key: "attack", label: "Ataque" },
    { key: "magic", label: "Magia" },
    { key: "attackPercent", label: "Ataque (%)" },
    { key: "magicPercent", label: "Magia (%)" },
    { key: "damagePercent", label: "Dano Total (%)" },
    { key: "skillDamagePercent", label: "Dano de Skill (%)" },
    { key: "baseDamagePercent", label: "Dano Base (%)" },
    { key: "damageBonus", label: "Bônus de Dano" },
    { key: "critChance", label: "Chance Crítica (%)" },
    { key: "critDamage", label: "Dano Crítico (%)" },
  ],
  damage_reduction: [
    { key: "defense", label: "Defesa" },
    { key: "magicDefense", label: "Res. Mágica" },
    { key: "defensePercent", label: "Defesa (%)" },
    { key: "magicDefensePercent", label: "Res. Mágica (%)" },
    { key: "damageReductionPercent", label: "Redução de Dano (%)" },
    { key: "incomingDamageReduction", label: "Dano Recebido (%)" },
    { key: "damageReduction", label: "Redução (plano)" },
  ],
  critical_chance: [
    { key: "critChance", label: "Chance Crítica (%)" },
    { key: "critChancePercent", label: "Chance Crítica (%) bônus" },
    { key: "critDamage", label: "Dano Crítico (%)" },
    { key: "critDamagePercent", label: "Dano Crítico (%) bônus" },
    { key: "attackPercent", label: "Ataque (%)" },
    { key: "critScaling", label: "Scaling Crit" },
  ],
  critical_damage: [
    { key: "critDamage", label: "Dano Crítico (%)" },
    { key: "critDamagePercent", label: "Dano Crítico (%) bônus" },
    { key: "critChance", label: "Chance Crítica (%)" },
    { key: "critChancePercent", label: "Chance Crítica (%) bônus" },
  ],
  cooldown_reduction: [
    { key: "cooldownReduction", label: "Redução de CD (%)" },
    { key: "cooldownReductionPercent", label: "Redução de CD (%) bônus" },
    { key: "cdrFlat", label: "CDR (plano)" },
    { key: "haste", label: "Haste" },
    { key: "cooldownScaling", label: "Scaling CD" },
  ],
  life_steal: [
    { key: "lifeSteal", label: "Roubo de Vida (%)" },
    { key: "lifeStealPercent", label: "Roubo de Vida (%) bônus" },
    { key: "lifeStealFlat", label: "Roubo (plano)" },
    { key: "damagePercent", label: "Dano Total (%)" },
    { key: "magicVamp", label: "Vampirismo Mágico (%)" },
  ],
  mana_regen: [
    { key: "manaRegen", label: "Regen de Mana" },
    { key: "manaRegenPercent", label: "Regen de Mana (%)" },
    { key: "manaRecovery", label: "Recuperação de Mana" },
    { key: "maxManaPercent", label: "Mana Máx (%)" },
    { key: "maxMana", label: "Mana Máx" },
  ],
  health_regen: [
    { key: "healthRegen", label: "Regen de Vida" },
    { key: "healthRegenPercent", label: "Regen de Vida (%)" },
    { key: "hpRegenPercent", label: "Regen HP (%)" },
    { key: "maxHpPercent", label: "HP Máx (%)" },
    { key: "maxHp", label: "HP Máx" },
  ],
  resistance: [
    { key: "defense", label: "Defesa" },
    { key: "magicDefense", label: "Res. Mágica" },
    { key: "resistancePercent", label: "Resistência (%)" },
    { key: "ailmentResistance", label: "Res. a Status (%)" },
    { key: "statusResistance", label: "Res. a Efeitos (%)" },
    { key: "slowResist", label: "Res. Lentidão (%)" },
    { key: "stunResist", label: "Res. Stun (%)" },
  ],
  reflect: [
    { key: "reflectPercent", label: "Refletir (%)" },
    { key: "reflectFlat", label: "Refletir (plano)" },
    { key: "reflectDamagePercent", label: "Dano Refletido (%)" },
    { key: "defense", label: "Defesa" },
  ],
  absorb: [
    { key: "absorbPercent", label: "Absorver (%)" },
    { key: "absorbFlat", label: "Absorver (plano)" },
    { key: "shieldPercent", label: "Escudo (%)" },
    { key: "maxHpPercent", label: "HP Máx (%)" },
  ],
  chance_proc: [
    { key: "procChance", label: "Chance de Ativação (%)" },
    { key: "procChancePercent", label: "Chance de Ativação (%) bônus" },
    { key: "triggerChance", label: "Chance de Gatilho (%)" },
    { key: "procCooldown", label: "CD do Proc (ms)" },
    { key: "critChance", label: "Chance Crítica (%)" },
  ],
};

export default function SkillsPage() {
  const [searchParams] = useSearchParams();
  const urlClassId = searchParams.get("class") || "";
  const urlTab = searchParams.get("tab") === "passives" ? "passives" : "skills";
  const [classes, setClasses] = useState<GameClassLite[]>([]);
  const [selectedClassId, setSelectedClassId] = useState(urlClassId);
  const [tab, setTab] = useState<"skills" | "passives">(urlTab);
  const [skills, setSkills] = useState<any[]>([]);
  const [passives, setPassives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...defaultSkill });
  const [saving, setSaving] = useState(false);
  const [passiveModalOpen, setPassiveModalOpen] = useState(false);
  const [passiveEditing, setPassiveEditing] = useState<any>(null);
  const [passiveForm, setPassiveForm] = useState<any>({ ...defaultPassive });

  useEffect(() => {
    adminApi.classes
      .list()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : [];
        setClasses(list);
        if (list.length > 0) {
          const initial = urlClassId && list.some((c) => c.id === urlClassId) ? urlClassId : list[0].id;
          setSelectedClassId(initial);
        }
      })
      .catch(() => toast.error("Failed to load classes"));
  }, []);

  const load = async (classId: string) => {
    if (!classId) return;
    setLoading(true);
    try {
      const { data } = await adminApi.skills.list(classId);
      setSkills(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load skills");
    } finally {
      setLoading(false);
    }
  };

  const loadPassives = async (classId: string) => {
    if (!classId) return;
    setLoading(true);
    try {
      const { data } = await adminApi.passives.list(classId);
      setPassives(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load passives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "skills") load(selectedClassId);
    else loadPassives(selectedClassId);
  }, [selectedClassId, tab]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultSkill });
    setModalOpen(true);
  };

  const parseJsonArray = (raw: any): any[] => {
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

  const openEdit = (skill: any) => {
    setEditing(skill);
    setForm({
      name: skill.name ?? "",
      description: skill.description ?? "",
      icon: skill.icon ?? "",
      type: skill.type ?? "active",
      subType: skill.subType ?? "melee",
      cooldown: skill.cooldown ?? 0,
      manaCost: skill.manaCost ?? 0,
      castTime: skill.castTime ?? 0,
      range: skill.range ?? 5,
      targetType: skill.targetType ?? "enemy",
      rankRequired: skill.rankRequired ?? 1,
      baseDamage: skill.baseDamage ?? 0,
      damageType: skill.damageType ?? "physical",
      healingBase: skill.healingBase ?? 0,
      sortOrder: skill.sortOrder ?? 0,
      isActive: skill.isActive ?? true,
      effects: parseJsonArray(skill.effects),
      buffsApplied: parseJsonArray(skill.buffsApplied),
      debuffsApplied: parseJsonArray(skill.debuffsApplied),
    });
    setModalOpen(true);
  };

  const buildPayload = () => {
    const payload: Record<string, any> = {
      name: form.name,
      description: form.description,
      icon: form.icon || null,
      type: form.type,
      subType: form.subType || null,
      cooldown: Number(form.cooldown) || 0,
      manaCost: Number(form.manaCost) || 0,
      castTime: Number(form.castTime) || 0,
      range: Number(form.range) || 5,
      targetType: form.targetType,
      rankRequired: Number(form.rankRequired) || 1,
      baseDamage: Number(form.baseDamage) || 0,
      damageType: form.damageType,
      healingBase: Number(form.healingBase) || 0,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: !!form.isActive,
    };
    for (const key of ["effects", "buffsApplied", "debuffsApplied"] as const) {
      const raw = form[key];
      payload[key] = Array.isArray(raw) && raw.length > 0 ? JSON.stringify(raw) : null;
    }
    return payload;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editing?.id) {
        await adminApi.skills.update(editing.id, payload);
        toast.success("Skill updated");
      } else {
        await adminApi.skills.create(selectedClassId, payload);
        toast.success("Skill created");
      }
      setModalOpen(false);
      setEditing(null);
      load(selectedClassId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (skill: any) => {
    if (!window.confirm(`Delete skill "${skill.name}"?`)) return;
    try {
      await adminApi.skills.delete(skill.id);
      toast.success("Skill deleted");
      load(selectedClassId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const openCreatePassive = () => {
    setPassiveEditing(null);
    setPassiveForm({ ...defaultPassive });
    setPassiveModalOpen(true);
  };

  const openEditPassive = (p: any) => {
    setPassiveEditing(p);
    let statModifiers: Record<string, number> = {};
    let effectData: Record<string, any> = {};
    try { statModifiers = p.statModifiers ? JSON.parse(p.statModifiers) : {}; } catch { statModifiers = {}; }
    try { effectData = p.effectData ? JSON.parse(p.effectData) : {}; } catch { effectData = {}; }
    setPassiveForm({
      name: p.name ?? "",
      description: p.description ?? "",
      icon: p.icon ?? "",
      rankRequired: p.rankRequired ?? 1,
      effectType: p.effectType ?? "stat_bonus",
      statModifiers: typeof statModifiers === "object" ? statModifiers : {},
      effectData: typeof effectData === "object" ? effectData : {},
    });
    setPassiveModalOpen(true);
  };

  const handleSubmitPassive = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        name: passiveForm.name,
        description: passiveForm.description,
        icon: passiveForm.icon || null,
        rankRequired: Number(passiveForm.rankRequired) || 1,
        effectType: passiveForm.effectType,
        statModifiers: passiveForm.statModifiers && Object.keys(passiveForm.statModifiers).length ? JSON.stringify(passiveForm.statModifiers) : null,
        effectData: passiveForm.effectData && Object.keys(passiveForm.effectData).length ? JSON.stringify(passiveForm.effectData) : null,
      };
      if (passiveEditing?.id) {
        await adminApi.passives.update(passiveEditing.id, payload);
        toast.success("Passive updated");
      } else {
        await adminApi.passives.create(selectedClassId, payload);
        toast.success("Passive created");
      }
      setPassiveModalOpen(false);
      setPassiveEditing(null);
      loadPassives(selectedClassId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePassive = async (p: any) => {
    if (!window.confirm(`Delete passive "${p.name}"?`)) return;
    try {
      await adminApi.passives.delete(p.id);
      toast.success("Passive deleted");
      loadPassives(selectedClassId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const renderField = (
    field: { name: string; label: string; type?: string; options?: string[] },
    span2 = false
  ) => {
    const value = form[field.name];
    if (field.type === "select") {
      return (
        <select value={value ?? ""} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} className={inputClass}>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    if (field.type === "boolean") {
      return (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.checked })}
            className="w-4 h-4 accent-accent-500"
          />
          <span className="text-sm text-gray-400">{value ? "Yes" : "No"}</span>
        </div>
      );
    }
    if (field.type === "textarea" || span2) {
      return (
        <textarea
          value={value ?? ""}
          onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
          className={`${inputClass} resize-y`}
          rows={3}
        />
      );
    }
    return (
      <input
        type="number"
        value={value ?? 0}
        onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
        className={inputClass}
      />
    );
  };

  const row = (field: { name: string; label: string; type?: string; options?: string[] }, span2 = false) => (
    <div key={field.name} className={span2 ? "sm:col-span-2" : ""}>
      <label className="block text-sm text-gray-400 mb-1.5">{field.label}</label>
      {renderField(field, span2)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Skills</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-dark-900 border border-dark-600 rounded-lg p-0.5">
            <button
              onClick={() => setTab("skills")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${tab === "skills" ? "bg-accent-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Habilidades
            </button>
            <button
              onClick={() => setTab("passives")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${tab === "passives" ? "bg-accent-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Passivas
            </button>
          </div>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={tab === "skills" ? openCreate : openCreatePassive}
            className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <span className="text-lg leading-none">+</span> New
          </button>
        </div>
      </div>

      {tab === "passives" ? (
        <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Rank</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Effect Type</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Stat Modifiers</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {passives.map((p) => (
                  <tr key={p.id} className="border-b border-dark-700 hover:bg-dark-800/50">
                    <td className="py-2.5 px-4">
                      <span className="font-mono text-[11px] text-gray-500" title={p.id}>{String(p.id ?? "").slice(0, 8)}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-medium text-white">{p.name}</span>
                      <p className="text-xs text-gray-500 max-w-xs truncate">{p.description}</p>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-mono text-xs text-gray-400">Rank {p.rankRequired}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-600/20 text-gray-400">{p.effectType}</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs text-gray-400">
                      {(() => {
                        try { return Object.entries(JSON.parse(p.statModifiers || "{}")).map(([k, v]) => `${k}: ${v}`).join(", ") || "-"; } catch { return "-"; }
                      })()}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <button onClick={() => openEditPassive(p)} className="text-blue-400 hover:text-blue-300 mr-3">
                        Edit
                      </button>
                      <button onClick={() => handleDeletePassive(p)} className="text-red-400 hover:text-red-300">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && passives.length === 0 && (
              <p className="text-center text-gray-500 py-8">No passives for this class — click "New" to add one</p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Subtype</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Cooldown</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Mana</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Damage</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Rank</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((s) => (
                <tr key={s.id} className="border-b border-dark-700 hover:bg-dark-800/50">
                  <td className="py-2.5 px-4">
                    <span className="font-mono text-[11px] text-gray-500" title={s.id}>{String(s.id ?? "").slice(0, 8)}</span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-medium text-white">{s.name}</span>
                    <p className="text-xs text-gray-500 max-w-xs truncate">{s.description}</p>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      s.type === "ultimate" ? "bg-purple-500/20 text-purple-400" : s.type === "passive" ? "bg-gray-600/20 text-gray-400" : "bg-accent-500/20 text-accent-400"
                    }`}>
                      {s.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-gray-400">{s.subType || "-"}</td>
                  <td className="py-2.5 px-4 font-mono text-xs">{s.cooldown}</td>
                  <td className="py-2.5 px-4 font-mono text-xs">{s.manaCost}</td>
                  <td className="py-2.5 px-4 font-mono text-xs">{s.baseDamage || s.healingBase || 0}</td>
                  <td className="py-2.5 px-4">{s.rankRequired}</td>
                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(s)} className="text-blue-400 hover:text-blue-300 mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(s)} className="text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && skills.length === 0 && (
            <p className="text-center text-gray-500 py-8">No skills for this class — click "New" to add one</p>
          )}
        </div>
      </div>
      )}

      {passiveModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => { setPassiveModalOpen(false); setPassiveEditing(null); }}>
          <div
            className="bg-dark-800 border border-dark-600 rounded-xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{passiveEditing?.id ? "Edit Passive" : "New Passive"}</h2>
              <button onClick={() => { setPassiveModalOpen(false); setPassiveEditing(null); }} className="text-gray-500 hover:text-gray-300 text-xl leading-none">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitPassive} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Name *</label>
                  <input type="text" value={passiveForm.name} onChange={(e) => setPassiveForm({ ...passiveForm, name: e.target.value })} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Icon</label>
                  <input type="text" value={passiveForm.icon} onChange={(e) => setPassiveForm({ ...passiveForm, icon: e.target.value })} className={inputClass} placeholder="e.g. 'Shield'" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1.5">Description *</label>
                  <textarea value={passiveForm.description} onChange={(e) => setPassiveForm({ ...passiveForm, description: e.target.value })} className={`${inputClass} resize-y`} rows={2} required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Rank Required</label>
                  <input type="number" min={1} max={10} value={passiveForm.rankRequired} onChange={(e) => setPassiveForm({ ...passiveForm, rankRequired: Number(e.target.value) })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Effect Type</label>
                  <select value={passiveForm.effectType} onChange={(e) => setPassiveForm({ ...passiveForm, effectType: e.target.value })} className={inputClass}>
                    {effectTypeOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1.5">Stat Modifiers (só valores — muda conforme o Effect Type)</label>
                  <JsonField
                    schema={{ mode: "fixed-record", allowExtra: true, extraKeyPlaceholder: "outro stat", fields: passiveStatFieldsByType[passiveForm.effectType] || passiveStatFieldsByType.stat_bonus }}
                    value={passiveForm.statModifiers}
                    onChange={(v) => setPassiveForm({ ...passiveForm, statModifiers: v })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1.5">Effect Data (JSON)</label>
                  <JsonField
                    schema={{ mode: "record", valueType: "string", addLabel: "Adicionar dado", keyPlaceholder: "chave", valuePlaceholder: "valor" }}
                    value={passiveForm.effectData}
                    onChange={(v) => setPassiveForm({ ...passiveForm, effectData: v })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setPassiveModalOpen(false); setPassiveEditing(null); }} className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : passiveEditing?.id ? "Save changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => { setModalOpen(false); setEditing(null); }}>
          <div
            className="bg-dark-800 border border-dark-600 rounded-xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editing?.id ? "Edit Skill" : "New Skill"}</h2>
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="text-gray-500 hover:text-gray-300 text-xl leading-none">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Icon</label>
                  <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={inputClass} placeholder="e.g. 'Flame'" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1.5">Description *</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-y`} rows={2} required />
                </div>
                {row({ name: "type", label: "Type", type: "select", options: typeOptions })}
                {row({ name: "subType", label: "Subtype", type: "select", options: subTypeOptions })}
                {row({ name: "targetType", label: "Target", type: "select", options: targetTypeOptions })}
                {row({ name: "damageType", label: "Damage Type", type: "select", options: damageTypeOptions })}
                {row({ name: "cooldown", label: "Cooldown (ms)" })}
                {row({ name: "manaCost", label: "Mana Cost" })}
                {row({ name: "castTime", label: "Cast Time (ms)" })}
                {row({ name: "range", label: "Range" })}
                {row({ name: "baseDamage", label: "Base Damage" })}
                {row({ name: "healingBase", label: "Base Healing" })}
                {row({ name: "rankRequired", label: "Rank Required" })}
                {row({ name: "sortOrder", label: "Sort Order" })}
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Active</label>
                  {renderField({ name: "isActive", label: "Active", type: "boolean" })}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1.5">Effects</label>
                  <JsonField
                    schema={{
                      mode: "object-array",
                      addLabel: "Adicionar efeito",
                      fields: [
                        { name: "type", label: "Tipo", type: "select", options: ["damage", "heal", "stun", "silence", "slow", "root", "knockback", "shield", "cleanse", "buff", "taunt", "fear", "charm", "teleport", "revive"] },
                        { name: "value", label: "Valor", type: "number" },
                        { name: "duration", label: "Duração (ms)", type: "number" },
                        { name: "chance", label: "Chance (%)", type: "number" },
                      ],
                    }}
                    value={form.effects}
                    onChange={(v) => setForm({ ...form, effects: v })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1.5">Buffs Aplicados</label>
                  <JsonField
                    schema={{ mode: "string-array", placeholder: "nome/ID do buff" }}
                    value={form.buffsApplied}
                    onChange={(v) => setForm({ ...form, buffsApplied: v })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1.5">Debuffs Aplicados</label>
                  <JsonField
                    schema={{ mode: "string-array", placeholder: "nome/ID do debuff" }}
                    value={form.debuffsApplied}
                    onChange={(v) => setForm({ ...form, debuffsApplied: v })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : editing?.id ? "Save changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
