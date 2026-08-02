import { Plus, X } from "lucide-react";

export type JsonFieldDef =
  | { mode: "record"; keyPlaceholder?: string; valueType: "number" | "string"; valuePlaceholder?: string; addLabel?: string }
  | { mode: "string-array"; placeholder?: string; addLabel?: string }
  | {
      mode: "object-array";
      fields: { name: string; label: string; type: "text" | "number" | "select"; options?: string[]; placeholder?: string }[];
      addLabel?: string;
    }
  | {
      mode: "fixed-record";
      fields: { key: string; label: string; valueType?: "number" | "string"; placeholder?: string }[];
      allowExtra?: boolean;
      extraKeyPlaceholder?: string;
    };

interface JsonFieldProps {
  schema: JsonFieldDef;
  value: any;
  onChange: (v: any) => void;
}

const inputClass =
  "w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-white focus:border-accent-500 focus:outline-none";

const addBtnClass =
  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-600/20 text-accent-400 border border-accent-600/30 hover:bg-accent-600/30 transition-colors";

export default function JsonField({ schema, value, onChange }: JsonFieldProps) {
  if (schema.mode === "fixed-record") {
    const current: Record<string, any> =
      value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const knownKeys = new Set(schema.fields.map((f) => f.key));

    const setKnown = (key: string, raw: string) => {
      const next = { ...current };
      if (raw === "") {
        delete next[key];
      } else {
        const field = schema.fields.find((f) => f.key === key);
        next[key] = field?.valueType === "string" ? raw : Number(raw);
      }
      onChange(next);
    };

    const extras: [string, any][] = Object.entries(current).filter(([k]) => !knownKeys.has(k));
    const setExtra = (key: string, v: any) => {
      const next: Record<string, any> = {};
      for (const [k, val] of extras) if (k !== key) next[k] = val;
      if (v !== "" && v !== null && v !== undefined) next[key] = v;
      onChange({ ...current, ...next });
    };
    const addExtra = () => {
      const next: Record<string, any> = { ...current };
      next[""] = 0;
      onChange(next);
    };

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {schema.fields.map((f) => (
            <div key={f.key}>
              <label className="block text-[11px] text-gray-500 mb-1">{f.label}</label>
              <input
                type={f.valueType === "string" ? "text" : "number"}
                step={f.valueType === "string" ? undefined : "any"}
                className={inputClass}
                placeholder={f.placeholder ?? (f.valueType === "string" ? "valor" : "0")}
                value={current[f.key] ?? ""}
                onChange={(e) => setKnown(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>
        {schema.allowExtra && (
          <div className="pt-2 border-t border-dark-600/60 space-y-2">
            <p className="text-[11px] text-gray-500">Extras</p>
            {extras.map(([k, v]) => (
              <div key={k + "-" + v} className="flex items-center gap-2">
                <input
                  type="text"
                  className={`${inputClass} flex-1`}
                  placeholder={schema.extraKeyPlaceholder || "chave"}
                  value={k}
                  onChange={(e) => setExtra(k, v)}
                />
                <input
                  type="number"
                  step="any"
                  className={`${inputClass} w-28`}
                  value={v}
                  onChange={(e) => setExtra(k, e.target.value === "" ? 0 : Number(e.target.value))}
                />
                <button
                  type="button"
                  onClick={() => setExtra(k, "")}
                  className="text-gray-500 hover:text-red-400 transition-colors shrink-0"
                  title="Remove"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addExtra} className={addBtnClass}>
              <Plus size={14} /> Adicionar
            </button>
          </div>
        )}
      </div>
    );
  }

  if (schema.mode === "record") {
    const entries: [string, any][] = Object.entries(
      value && typeof value === "object" && !Array.isArray(value) ? value : {}
    );
    const isNumber = schema.valueType === "number";

    const update = (key: string, v: any) => {
      const next: Record<string, any> = {};
      for (const [k, val] of entries) if (k !== key) next[k] = val;
      if (v !== "" && v !== null && v !== undefined) next[key] = v;
      onChange(next);
    };

    const add = () => {
      const next: Record<string, any> = {};
      for (const [k, val] of entries) next[k] = val;
      next[""] = isNumber ? 0 : "";
      onChange(next);
    };

    return (
      <div className="space-y-2">
        {entries.map(([k, v]) => (
          <div key={k + "-" + v} className="flex items-center gap-2">
            <input
              type="text"
              className={`${inputClass} flex-1`}
              placeholder={schema.keyPlaceholder || "key"}
              value={k}
              onChange={(e) => update(k, v)}
            />
            <input
              type={isNumber ? "number" : "text"}
              step={isNumber ? "any" : undefined}
              className={`${inputClass} w-28`}
              placeholder={schema.valuePlaceholder || (isNumber ? "0" : "value")}
              value={v}
              onChange={(e) =>
                update(k, isNumber ? (e.target.value === "" ? 0 : Number(e.target.value)) : e.target.value)
              }
            />
            <button
              type="button"
              onClick={() => update(k, "")}
              className="text-gray-500 hover:text-red-400 transition-colors shrink-0"
              title="Remove"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              className={`${inputClass} flex-1`}
              placeholder={schema.keyPlaceholder || "key"}
              value=""
              onChange={(e) => update(e.target.value, isNumber ? 0 : "")}
            />
            <input type={isNumber ? "number" : "text"} step={isNumber ? "any" : undefined} className={`${inputClass} w-28`} placeholder={isNumber ? "0" : "value"} value="" onChange={() => {}} disabled />
            <button type="button" disabled className="text-gray-700 cursor-not-allowed">
              <X size={16} />
            </button>
          </div>
        )}
        <button type="button" onClick={add} className={addBtnClass}>
          <Plus size={14} /> {schema.addLabel || "Adicionar"}
        </button>
      </div>
    );
  }

  if (schema.mode === "string-array") {
    const list = Array.isArray(value) ? value : [];

    return (
      <div className="space-y-2">
        {list.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              className={`${inputClass} flex-1`}
              placeholder={schema.placeholder || "valor"}
              value={item ?? ""}
              onChange={(e) => {
                const next = [...list];
                next[idx] = e.target.value;
                onChange(next);
              }}
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
        <button type="button" onClick={() => onChange([...list, ""])} className={addBtnClass}>
          <Plus size={14} /> {schema.addLabel || "Adicionar"}
        </button>
      </div>
    );
  }

  const list = Array.isArray(value) ? value : [];

  return (
    <div className="space-y-3">
      {list.map((item: any, idx: number) => (
        <div key={idx} className="border border-dark-600 rounded-lg p-3 space-y-2 relative">
          <button
            type="button"
            onClick={() => onChange(list.filter((_, i) => i !== idx))}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors"
            title="Remove"
          >
            <X size={16} />
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
            {schema.fields.map((f) => (
              <div key={f.name}>
                <label className="block text-[11px] text-gray-500 mb-1">{f.label}</label>
                {f.type === "select" ? (
                  <select
                    className={inputClass}
                    value={item?.[f.name] ?? ""}
                    onChange={(e) => {
                      const next = [...list];
                      next[idx] = { ...(item || {}), [f.name]: e.target.value };
                      onChange(next);
                    }}
                  >
                    <option value="">Selecione...</option>
                    {(f.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type === "number" ? "number" : "text"}
                    step={f.type === "number" ? "any" : undefined}
                    className={inputClass}
                    placeholder={f.placeholder}
                    value={item?.[f.name] ?? ""}
                    onChange={(e) => {
                      const next = [...list];
                      next[idx] = {
                        ...(item || {}),
                        [f.name]: f.type === "number" ? (e.target.value === "" ? 0 : Number(e.target.value)) : e.target.value,
                      };
                      onChange(next);
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          const empty: Record<string, any> = {};
          for (const f of schema.fields) empty[f.name] = f.type === "number" ? 0 : "";
          onChange([...list, empty]);
        }}
        className={addBtnClass}
      >
        <Plus size={14} /> {schema.addLabel || "Adicionar"}
      </button>
    </div>
  );
}
