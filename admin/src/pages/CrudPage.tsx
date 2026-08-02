import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../api";
import JsonField, { JsonFieldDef } from "../components/JsonField";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "boolean" | "json";
  options?: string[];
  optionsFrom?: string;
  required?: boolean;
  defaultValue?: any;
  step?: string;
  placeholder?: string;
  hint?: string;
  jsonSchema?: JsonFieldDef;
}

export interface ColumnConfig {
  key: string;
  label: string;
  render?: (value: any, item?: any) => any;
}

export interface CrudConfig {
  key: string;
  title: string;
  columns: ColumnConfig[];
  fields: FieldConfig[];
  extraActions?: (item: any) => React.ReactNode;
}

interface CrudPageProps {
  config: CrudConfig;
}

const inputClass =
  "w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none";

export default function CrudPage({ config }: CrudPageProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [remoteOptions, setRemoteOptions] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const sources = config.fields.filter((f) => f.optionsFrom);
    if (sources.length === 0) return;
    sources.forEach((f) => {
      (adminApi as any)[f.optionsFrom!]
        .list()
        .then(({ data }: any) =>
          setRemoteOptions((prev) => ({ ...prev, [f.optionsFrom!]: Array.isArray(data) ? data : [] }))
        )
        .catch(() => {});
    });
  }, [config.key]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await (adminApi as any)[config.key].list();
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to load ${config.title}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [config.key]);

  const buildDefaults = () => {
    const defaults: Record<string, any> = {};
    for (const field of config.fields) {
      if (field.jsonSchema) {
        defaults[field.name] = field.jsonSchema.mode === "record" ? {} : [];
      } else {
        defaults[field.name] = field.defaultValue ?? (field.type === "boolean" ? false : field.type === "number" ? 0 : "");
      }
    }
    return defaults;
  };

  const openCreate = () => {
    setEditing(null);
    setForm(buildDefaults());
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    const values: Record<string, any> = {};
    for (const field of config.fields) {
      const raw = item[field.name];
      if (field.type === "json") {
        if (field.jsonSchema) {
          let parsed = raw;
          if (typeof raw === "string" && raw.trim()) {
            try { parsed = JSON.parse(raw); } catch { parsed = undefined; }
          }
          values[field.name] = parsed ?? (field.jsonSchema.mode === "record" ? {} : []);
        } else {
          values[field.name] = raw ? JSON.stringify(raw, null, 2) : "";
        }
      } else if (field.type === "number") {
        values[field.name] = raw ?? 0;
      } else if (field.type === "boolean") {
        values[field.name] = !!raw;
      } else {
        values[field.name] = raw ?? "";
      }
    }
    setForm(values);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const buildPayload = () => {
    const payload: Record<string, any> = {};
    for (const field of config.fields) {
      let value = form[field.name];
      if (field.type === "json") {
        payload[field.name] = field.jsonSchema ? JSON.stringify(value) : value && value.trim() ? value : null;
      } else if (field.type === "number") {
        payload[field.name] = Number(value) || 0;
      } else if (field.type === "boolean") {
        payload[field.name] = !!value;
      } else {
        payload[field.name] = value;
      }
    }
    return payload;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editing?.id) {
        await (adminApi as any)[config.key].update(editing.id, payload);
        toast.success(`${config.title}: updated`);
      } else {
        await (adminApi as any)[config.key].create(payload);
        toast.success(`${config.title}: created`);
      }
      closeModal();
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!window.confirm(`Delete this ${config.key.slice(0, -1)}?`)) return;
    try {
      await (adminApi as any)[config.key].delete(item.id);
      toast.success(`${config.title}: deleted`);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const renderField = (field: FieldConfig) => {
    const value = form[field.name];
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            value={value ?? ""}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
            className={`${inputClass} resize-y`}
            rows={3}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      case "select": {
        const options = field.optionsFrom
          ? remoteOptions[field.optionsFrom] || []
          : field.options || [];
        const optionLabel = (opt: any) => {
          if (typeof opt === "string") return opt;
          return opt.slug && opt.slug !== opt.name ? `${opt.name} (${opt.slug})` : opt.name;
        };
        return (
          <select
            value={value ?? ""}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
            className={inputClass}
            required={field.required}
          >
            <option value="">{field.optionsFrom ? "Nenhum" : "Select..."}</option>
            {options.map((opt: any) => (
              <option key={typeof opt === "string" ? opt : opt.id} value={typeof opt === "string" ? opt : opt.id}>
                {optionLabel(opt)}
              </option>
            ))}
          </select>
        );
      }
      case "boolean":
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
      case "number":
        return (
          <input
            type="number"
            step={field.step || "1"}
            value={value ?? 0}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
            className={inputClass}
            required={field.required}
          />
        );
      case "json":
        if (field.jsonSchema) {
          return (
            <JsonField
              schema={field.jsonSchema}
              value={value}
              onChange={(v) => setForm({ ...form, [field.name]: v })}
            />
          );
        }
        return (
          <textarea
            value={value ?? ""}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
            className={`${inputClass} resize-y font-mono text-xs`}
            rows={5}
            placeholder='{"key": "value"}'
          />
        );
      default:
        return (
          <input
            type="text"
            value={value ?? ""}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
            className={inputClass}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{config.title}</h1>
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
                {config.columns.map((col) => (
                  <th key={col.key} className="text-left py-3 px-4 text-gray-400 font-medium">
                    {col.label}
                  </th>
                ))}
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-dark-700 hover:bg-dark-800/50">
                  {config.columns.map((col) => (
                    <td key={col.key} className="py-2.5 px-4">
                      {col.render ? col.render(item[col.key], item) : item[col.key] ?? "-"}
                    </td>
                  ))}
                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    {config.extraActions && config.extraActions(item)}
                    <button
                      onClick={() => openEdit(item)}
                      className="text-blue-400 hover:text-blue-300 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && items.length === 0 && (
            <p className="text-center text-gray-500 py-8">No {config.title.toLowerCase()} yet — click "New" to add one</p>
          )}
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-dark-800 border border-dark-600 rounded-xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
                {editing?.id ? `Edit ${config.title}` : `New ${config.title}`}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-300 text-xl leading-none">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {config.fields.map((field) => (
                  <div key={field.name} className={field.type === "textarea" || field.type === "json" ? "sm:col-span-2" : ""}>
                    <label className="block text-sm text-gray-400 mb-1.5">{field.label}</label>
                    {renderField(field)}
                    {field.hint && <p className="text-xs text-gray-500 mt-1">{field.hint}</p>}
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
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
