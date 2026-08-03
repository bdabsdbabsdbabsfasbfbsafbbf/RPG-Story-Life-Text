import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, X } from "lucide-react";
import { adminApi } from "../api";
import JsonField from "../components/JsonField";
import {
  effectActionFields,
  scalingFields,
  effectKindOptions,
  effectCategoryOptions,
  refreshBehaviorOptions,
  damageTypeOptions,
  parseJsonArray,
} from "../dslFields";

const inputClass =
  "w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none";

const addBtnClass =
  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-600/20 text-accent-400 border border-accent-600/30 hover:bg-accent-600/30 transition-colors";

// Stats disponíveis para "efeito de status" — aplicados enquanto o efeito estiver ativo
const STAT_OPTIONS: Array<{ key: string; label: string }> = [
  { key: "hp", label: "Vida (HP)" },
  { key: "mana", label: "Mana" },
  { key: "defense", label: "Defesa (reduz dano tomado)" },
  { key: "dodge", label: "Esquiva" },
  { key: "damagePercent", label: "Dano (%)" },
  { key: "cooldownReduction", label: "Redução de Recarga (%)" },
  { key: "attack", label: "Ataque" },
  { key: "magic", label: "Magia" },
  { key: "magicDefense", label: "Defesa Mágica" },
  { key: "speed", label: "Velocidade" },
  { key: "attackPower", label: "Poder de Ataque" },
  { key: "spellPower", label: "Poder de Magia" },
  { key: "critChance", label: "Chance de Crítico" },
  { key: "critDamage", label: "Dano Crítico" },
  { key: "magicDamagePercent", label: "Dano Mágico (%)" },
  { key: "healingPercent", label: "Cura (%)" },
  { key: "dotPercent", label: "Dano Contínuo (%)" },
  { key: "manaCostReduction", label: "Redução de Custo de Mana (%)" },
  { key: "healthRegenPerTick", label: "Regeneração de Vida" },
  { key: "manaRegenPerTick", label: "Regeneração de Mana" },
];

function StatModifierEditor({ value, onChange }: { value: any[]; onChange: (v: any[]) => void }) {
  const list = Array.isArray(value) ? value : [];
  const update = (idx: number, patch: any) => {
    const next = [...list];
    next[idx] = { ...(next[idx] || {}), ...patch };
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {list.map((m, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <select className={inputClass} value={m?.stat ?? ""} onChange={(e) => update(idx, { stat: e.target.value })}>
            <option value="">Em quê?</option>
            {STAT_OPTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <select className={`${inputClass} w-28`} value={m?.kind ?? "flat"} onChange={(e) => update(idx, { kind: e.target.value })}>
            <option value="flat">Flat</option>
            <option value="percent">Percentual</option>
          </select>
          <input
            type="number"
            step="any"
            className={`${inputClass} w-24`}
            placeholder="valor"
            value={m?.value ?? ""}
            onChange={(e) => update(idx, { value: Number(e.target.value) })}
          />
          <button
            type="button"
            onClick={() => onChange(list.filter((_, i) => i !== idx))}
            className="text-gray-500 hover:text-red-400 transition-colors shrink-0"
            title="Remove"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...list, { stat: "", kind: "flat", value: 0 }])} className={addBtnClass}>
        <Plus size={14} /> Adicionar modificador
      </button>
    </div>
  );
}

interface EffectLite {
  id: string;
  name: string;
  slug: string;
  description: string;
  kind: string;
  category: string;
  maxStacks: number;
  duration: number;
  tickInterval: number;
  isActive: boolean;
}

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  kind: "buff",
  category: "utility",
  maxStacks: 1,
  duration: 0,
  refreshBehavior: "refresh",
  stackLoss: {} as Record<string, number>,
  priority: 0,
  tickInterval: 0,
  tickDamageBase: 0,
  tickDamageScaling: [] as any[],
  tickDamageType: "physical",
  tickHealingBase: 0,
  tickHealingScaling: [] as any[],
  shieldBase: 0,
  shieldScaling: [] as any[],
  reflectPercent: 0,
  hitkillChance: 0,
  statModifiers: [] as any[],
  onMaxStacks: [] as any[],
  onExpire: [] as any[],
  onTick: [] as any[],
  exclusiveGroup: "",
  isActive: true,
};

const parseNested = (raw: any) => {
  const arr = parseJsonArray(raw?.scaling);
  return {
    base: Number(raw?.base) || 0,
    scaling: arr,
    damageType: raw?.damageType ?? "physical",
  };
};

export default function EffectsPage() {
  const [effects, setEffects] = useState<EffectLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...defaultForm });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.effects.list();
      setEffects(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load effects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultForm });
    setModalOpen(true);
  };

  const openEdit = (e: any) => {
    setEditing(e);
    let stackLoss: Record<string, number> = {};
    try { stackLoss = e.stackLoss ? JSON.parse(e.stackLoss) : {}; } catch { stackLoss = {}; }
    const td = parseNested(e.tickDamage);
    const th = parseNested(e.tickHealing);
    const shield = parseNested(e.shield);
    setForm({
      name: e.name ?? "",
      slug: e.slug ?? "",
      description: e.description ?? "",
      icon: e.icon ?? "",
      kind: e.kind ?? "buff",
      category: e.category ?? "utility",
      maxStacks: e.maxStacks ?? 1,
      duration: e.duration ?? 0,
      refreshBehavior: e.refreshBehavior ?? "refresh",
      stackLoss: stackLoss && typeof stackLoss === "object" ? stackLoss : {},
      priority: e.priority ?? 0,
      tickInterval: e.tickInterval ?? 0,
      tickDamageBase: td.base,
      tickDamageScaling: td.scaling,
      tickDamageType: td.damageType,
      tickHealingBase: th.base,
      tickHealingScaling: th.scaling,
      shieldBase: shield.base,
      shieldScaling: shield.scaling,
      reflectPercent: Number(e.reflect?.percent) || 0,
      hitkillChance: Number(e.hitkillChance) || 0,
      statModifiers: (() => {
        let raw: any = {};
        try { raw = e.statModifiers ? JSON.parse(e.statModifiers) : {}; } catch { raw = {}; }
        const list: any[] = [];
        for (const [kind, map] of Object.entries(raw || {})) {
          if ((kind !== "flat" && kind !== "percent") || !map || typeof map !== "object") continue;
          for (const [stat, value] of Object.entries(map as Record<string, number>)) {
            const v = Number(value) || 0;
            if (v !== 0) list.push({ stat, kind, value: v });
          }
        }
        return list;
      })(),
      onMaxStacks: parseJsonArray(e.onMaxStacks),
      onExpire: parseJsonArray(e.onExpire),
      onTick: parseJsonArray(e.onTick),
      exclusiveGroup: e.exclusiveGroup ?? "",
      isActive: e.isActive ?? true,
    });
    setModalOpen(true);
  };

  const buildPayload = () => {
    const tickDamage: Record<string, any> = {};
    if (Number(form.tickDamageBase)) tickDamage.base = Number(form.tickDamageBase);
    if (Array.isArray(form.tickDamageScaling) && form.tickDamageScaling.length) tickDamage.scaling = form.tickDamageScaling;
    if (form.tickDamageType && form.tickDamageType !== "physical") tickDamage.damageType = form.tickDamageType;

    const tickHealing: Record<string, any> = {};
    if (Number(form.tickHealingBase)) tickHealing.base = Number(form.tickHealingBase);
    if (Array.isArray(form.tickHealingScaling) && form.tickHealingScaling.length) tickHealing.scaling = form.tickHealingScaling;

    const shield: Record<string, any> = {};
    if (Number(form.shieldBase)) shield.base = Number(form.shieldBase);
    if (Array.isArray(form.shieldScaling) && form.shieldScaling.length) shield.scaling = form.shieldScaling;

    const statModifiers: { flat: Record<string, number>; percent: Record<string, number> } = { flat: {}, percent: {} };
    for (const m of (Array.isArray(form.statModifiers) ? form.statModifiers : []) as Array<{ stat?: string; kind?: string; value?: number }>) {
      if (!m?.stat || (m.kind !== "flat" && m.kind !== "percent")) continue;
      const v = Number(m.value) || 0;
      if (v !== 0) statModifiers[m.kind][m.stat] = v;
    }

    const payload: Record<string, any> = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `effect-${Date.now()}`,
      description: form.description,
      icon: form.icon || null,
      kind: form.kind,
      category: form.category,
      maxStacks: Number(form.maxStacks) || 1,
      duration: Number(form.duration) || 0,
      refreshBehavior: form.refreshBehavior,
      priority: Number(form.priority) || 0,
      tickInterval: Number(form.tickInterval) || 0,
      exclusiveGroup: form.exclusiveGroup || null,
      isActive: !!form.isActive,
      stackLoss: JSON.stringify(form.stackLoss || {}),
      tickDamage: JSON.stringify(tickDamage),
      tickHealing: JSON.stringify(tickHealing),
      shield: JSON.stringify(shield),
      reflect: JSON.stringify(form.reflectPercent > 0 ? { percent: Number(form.reflectPercent) } : {}),
      hitkillChance: form.hitkillChance > 0 ? Number(form.hitkillChance) : null,
      statModifiers: JSON.stringify(statModifiers),
      onMaxStacks: JSON.stringify(form.onMaxStacks || []),
      onExpire: JSON.stringify(form.onExpire || []),
      onTick: JSON.stringify(form.onTick || []),
    };
    return payload;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editing?.id) {
        await adminApi.effects.update(editing.id, payload);
        toast.success("Effect updated");
      } else {
        await adminApi.effects.create(payload);
        toast.success("Effect created");
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e: any) => {
    if (!window.confirm(`Delete effect "${e.name}"?`)) return;
    try {
      await adminApi.effects.delete(e.id);
      toast.success("Effect deleted");
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const row = (name: string, label: string, span2 = false) => (
    <div key={name} className={span2 ? "sm:col-span-2" : ""}>
      <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
      <input
        type="number"
        value={form[name] ?? 0}
        onChange={(ev) => setForm({ ...form, [name]: Number(ev.target.value) })}
        className={inputClass}
      />
    </div>
  );

  const selectRow = (name: string, label: string, options: string[]) => (
    <div key={name}>
      <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
      <select value={form[name] ?? ""} onChange={(ev) => setForm({ ...form, [name]: ev.target.value })} className={inputClass}>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Effects</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <span className="text-lg leading-none">+</span> New
        </button>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Kind</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Stacks</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Duration (ms)</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Tick (ms)</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Active</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {effects.map((e) => (
                <tr key={e.id} className="border-b border-dark-700 hover:bg-dark-800/50">
                  <td className="py-2.5 px-4">
                    <span className="font-mono text-[11px] text-gray-500" title={e.id}>{String(e.id ?? "").slice(0, 8)}</span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-medium text-white">{e.name}</span>
                    <p className="text-xs text-gray-500 max-w-xs truncate">{e.description}</p>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      e.kind === "dot" || e.kind === "debuff" ? "bg-red-500/20 text-red-400"
                      : e.kind === "hot" ? "bg-emerald-500/20 text-emerald-400"
                      : e.kind === "shield" || e.kind === "reflect" ? "bg-cyan-500/20 text-cyan-400"
                      : e.kind === "hitkill" ? "bg-purple-500/20 text-purple-400"
                      : e.kind === "silence" || e.kind === "stun" ? "bg-amber-500/20 text-amber-400"
                      : "bg-blue-500/20 text-blue-400"}`}>
                      {e.kind}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-gray-400">{e.category || "-"}</td>
                  <td className="py-2.5 px-4 font-mono text-xs">{e.maxStacks}</td>
                  <td className="py-2.5 px-4 font-mono text-xs">{e.duration}</td>
                  <td className="py-2.5 px-4 font-mono text-xs">{e.tickInterval}</td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${e.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-600/20 text-gray-400"}`}>
                      {e.isActive ? "on" : "off"}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(e)} className="text-blue-400 hover:text-blue-300 mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(e)} className="text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && effects.length === 0 && (
            <p className="text-center text-gray-500 py-8">No effects yet — click "New" to add one</p>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => { setModalOpen(false); setEditing(null); }}>
          <div
            className="bg-dark-800 border border-dark-600 rounded-xl p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editing?.id ? "Edit Effect" : "New Effect"}</h2>
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
                  <label className="block text-sm text-gray-400 mb-1.5">Slug</label>
                  <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} placeholder="ex.: bleed" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Icon</label>
                  <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={inputClass} placeholder="e.g. 'Droplets'" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Exclusive Group</label>
                  <input type="text" value={form.exclusiveGroup} onChange={(e) => setForm({ ...form, exclusiveGroup: e.target.value })} className={inputClass} placeholder="grupo mutuamente exclusivo (opcional)" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1.5">Description *</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-y`} rows={2} required />
                </div>
                {selectRow("kind", "Kind", effectKindOptions)}
                {selectRow("category", "Category", effectCategoryOptions)}
                {selectRow("refreshBehavior", "Refresh Behavior", refreshBehaviorOptions)}
                {row("maxStacks", "Max Stacks")}
                {row("duration", "Duration (ms)")}
                {row("tickInterval", "Tick Interval (ms)")}
                {row("priority", "Priority")}
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1.5">Stack Loss (decai com o tempo)</label>
                  <JsonField
                    schema={{ mode: "record", valueType: "number", addLabel: "Adicionar", keyPlaceholder: "intervalMs / amount", valuePlaceholder: "valor" }}
                    value={form.stackLoss}
                    onChange={(v) => setForm({ ...form, stackLoss: v })}
                  />
                </div>
                {form.kind === "dot" && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1.5">Tick Damage (DOT)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">Base</label>
                        <input type="number" value={form.tickDamageBase} onChange={(e) => setForm({ ...form, tickDamageBase: Number(e.target.value) })} className={inputClass} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-gray-500 mb-1">Tipo de Dano</label>
                        <select value={form.tickDamageType} onChange={(e) => setForm({ ...form, tickDamageType: e.target.value })} className={inputClass}>
                          {damageTypeOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <JsonField
                      schema={{ mode: "object-array", addLabel: "Adicionar scaling", fields: scalingFields }}
                      value={form.tickDamageScaling}
                      onChange={(v) => setForm({ ...form, tickDamageScaling: v })}
                    />
                  </div>
                )}
                {form.kind === "hot" && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1.5">Tick Healing (HOT)</label>
                    <div className="mb-3">
                      <label className="block text-[11px] text-gray-500 mb-1">Base</label>
                      <input type="number" value={form.tickHealingBase} onChange={(e) => setForm({ ...form, tickHealingBase: Number(e.target.value) })} className={inputClass} />
                    </div>
                    <JsonField
                      schema={{ mode: "object-array", addLabel: "Adicionar scaling", fields: scalingFields }}
                      value={form.tickHealingScaling}
                      onChange={(v) => setForm({ ...form, tickHealingScaling: v })}
                    />
                  </div>
                )}
                {form.kind === "shield" && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1.5">Escudo (anula dano)</label>
                    <div className="mb-3">
                      <label className="block text-[11px] text-gray-500 mb-1">Base (pontos de escudo por stack)</label>
                      <input type="number" value={form.shieldBase} onChange={(e) => setForm({ ...form, shieldBase: Number(e.target.value) })} className={inputClass} />
                    </div>
                    <JsonField
                      schema={{ mode: "object-array", addLabel: "Adicionar scaling", fields: scalingFields }}
                      value={form.shieldScaling}
                      onChange={(v) => setForm({ ...form, shieldScaling: v })}
                    />
                  </div>
                )}
                {form.kind === "reflect" && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Refletir — Dano refletido (%)</label>
                    <input type="number" value={form.reflectPercent} onChange={(e) => setForm({ ...form, reflectPercent: Number(e.target.value) })} className={inputClass} />
                    <p className="text-[11px] text-gray-500 mt-1">Percentual do dano recebido devolvido ao atacante (soma por stack)</p>
                  </div>
                )}
                {form.kind === "hitkill" && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Hitkill — Chance de golpe letal (%)</label>
                    <input type="number" value={form.hitkillChance} onChange={(e) => setForm({ ...form, hitkillChance: Number(e.target.value) })} className={inputClass} />
                    <p className="text-[11px] text-gray-500 mt-1">Chance de aniquilar o alvo instantaneamente ao acertar (soma por stack)</p>
                  </div>
                )}
                {(form.kind === "silence" || form.kind === "stun") && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500 bg-dark-900 border border-dark-600 rounded-lg px-3 py-2">
                      {form.kind === "silence"
                        ? "Silêncio: o alvo não consegue usar skills enquanto o efeito durar."
                        : "Stun: o alvo não consegue agir (skills nem auto-ataques) enquanto o efeito durar."}{" "}
                      Use o campo "Duration (ms)" acima.
                    </p>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1.5">Stat Modifiers — efeito de status (aplica enquanto ativo)</label>
                  <p className="text-[11px] text-gray-500 mb-2">
                    Funciona com skills de gatilho "auto" (gera stacks) ou skills ativas que aplicam o efeito. Os modificadores valem enquanto o efeito durar e somam por stack. Percentuais usam o valor como % (ex.: 10 = +10%).
                  </p>
                  <StatModifierEditor value={form.statModifiers} onChange={(v) => setForm({ ...form, statModifiers: v })} />
                </div>
                <details className="sm:col-span-2 bg-dark-900 border border-dark-600 rounded-lg px-3 py-2">
                  <summary className="text-xs text-gray-500 cursor-pointer select-none uppercase tracking-wider">Gatilhos avançados (ações DSL)</summary>
                  <div className="mt-3 space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">On Max Stacks (ações)</label>
                      <JsonField
                        schema={{ mode: "object-array", addLabel: "Adicionar ação", fields: effectActionFields }}
                        value={form.onMaxStacks}
                        onChange={(v) => setForm({ ...form, onMaxStacks: v })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">On Expire (ações)</label>
                      <JsonField
                        schema={{ mode: "object-array", addLabel: "Adicionar ação", fields: effectActionFields }}
                        value={form.onExpire}
                        onChange={(v) => setForm({ ...form, onExpire: v })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">On Tick (ações)</label>
                      <JsonField
                        schema={{ mode: "object-array", addLabel: "Adicionar ação", fields: effectActionFields }}
                        value={form.onTick}
                        onChange={(v) => setForm({ ...form, onTick: v })}
                      />
                    </div>
                  </div>
                </details>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Active</label>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      checked={!!form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 accent-accent-500"
                    />
                    <span className="text-sm text-gray-400">{form.isActive ? "Yes" : "No"}</span>
                  </div>
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
