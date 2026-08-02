import { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../api";

const inputClass =
  "w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none";

const labelClass = "block text-[11px] text-gray-500 mb-1";

interface GameMap {
  id: string;
  name: string;
  slug: string;
  monsters?: any[];
}

interface Option {
  id: string;
  name: string;
}

export default function monstersPage() {
  const [maps, setMaps] = useState<GameMap[]>([]);
  const [monsters, setMonsters] = useState<Option[]>([]);
  const [selected, setSelected] = useState<GameMap | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<Record<string, any>>({});
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [mapsRes, monstersRes] = await Promise.all([
        adminApi.maps.list(),
        adminApi.monsters.list(),
      ]);
      const mapList = Array.isArray(mapsRes.data) ? mapsRes.data : [];
      setMaps(mapList);
      setMonsters(Array.isArray(monstersRes.data) ? monstersRes.data : []);
      if (selected) {
        const updated = mapList.find((m: any) => m.id === selected.id);
        if (updated) setSelected(updated);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredMaps = useMemo(() => {
    if (!filter.trim()) return maps;
    const q = filter.toLowerCase();
    return maps.filter((m) => m.name.toLowerCase().includes(q) || m.slug.toLowerCase().includes(q));
  }, [maps, filter]);

  const selectedMonsters = useMemo(() => selected?.monsters ?? [], [selected]);

  const monsterName = (id: string) => monsters.find((m) => m.id === id)?.name ?? id;

  const resetForm = () => {
    setForm({ monsterId: "", spawnRate: 1, minLevel: 1, maxLevel: 1, maxInstances: 10, respawnTime: 15000, positionX: 0, positionY: 0 });
    setEditing(null);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      monsterId: s.monsterId ?? "",
      spawnRate: Number(s.spawnRate) ?? 1,
      minLevel: Number(s.minLevel) ?? 1,
      maxLevel: Number(s.maxLevel) ?? 1,
      maxInstances: Number(s.maxInstances) ?? 10,
      respawnTime: Number(s.respawnTime) ?? 15000,
      positionX: Number(s.positionX) ?? 0,
      positionY: Number(s.positionY) ?? 0,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected || !form.monsterId) {
      toast.error("Escolha um monstro");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        mapId: selected.id,
        monsterId: form.monsterId,
        spawnRate: Number(form.spawnRate) || 1,
        minLevel: Number(form.minLevel) || 1,
        maxLevel: Number(form.maxLevel) || 1,
        maxInstances: Number(form.maxInstances) || 10,
        respawnTime: Number(form.respawnTime) || 15000,
        positionX: Number(form.positionX) || 0,
        positionY: Number(form.positionY) || 0,
      };
      if (editing?.id) {
        await adminApi.mapMonsters.update(editing.id, payload);
        toast.success("Monstro atualizado");
      } else {
        await adminApi.mapMonsters.create(payload);
        toast.success("Monstro adicionado ao mapa");
      }
      resetForm();
      await load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: any) => {
    if (!window.confirm(`Remover "${monsterName(s.monsterId)}" do mapa "${selected?.name}"?`)) return;
    try {
      await adminApi.mapMonsters.delete(s.id);
      toast.success("Removido");
      await load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monstros em Mapas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quais monstros aparecem em cada mapa e com que frequência. Crie monstros na página Monsters.
          </p>
        </div>
        <button onClick={load} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-sm transition-colors">
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Lista de mapas */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden h-fit">
          <div className="p-4 border-b border-dark-600">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar mapa..."
              className={inputClass}
            />
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {loading && <p className="text-center text-gray-500 py-8">Loading...</p>}
            {!loading && filteredMaps.length === 0 && (
              <p className="text-center text-gray-500 py-8">Nenhum mapa — crie um na página Maps</p>
            )}
            {filteredMaps.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className={`w-full text-left px-4 py-3 border-b border-dark-700 transition-colors ${
                  selected?.id === m.id ? "bg-accent-600/20 border-l-2 border-l-accent-500" : "hover:bg-dark-700/50"
                }`}
              >
                <span className="font-medium text-white block">{m.name}</span>
                <span className="text-xs text-gray-500">
                  {m.slug} • {m.monsters?.length ?? 0} monstros
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Detalhes do mapa selecionado */}
        {selected ? (
          <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-600 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">{selected.name}</h3>
                <p className="text-xs text-gray-500">Monstros deste mapa</p>
              </div>
              <button onClick={resetForm} className="text-xs text-accent-400 hover:text-accent-300">
                + Adicionar monstro
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-b border-dark-700 grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
              <div className="col-span-2 sm:col-span-4">
                <label className={labelClass}>Monstro *</label>
                <select value={form.monsterId ?? ""} onChange={(e) => setForm({ ...form, monsterId: e.target.value })} className={inputClass}>
                  <option value="">Selecionar monstro...</option>
                  {monsters.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Spawn Rate</label>
                <input type="number" step="0.1" value={form.spawnRate ?? 1} onChange={(e) => setForm({ ...form, spawnRate: Number(e.target.value) })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nível mín.</label>
                <input type="number" value={form.minLevel ?? 1} onChange={(e) => setForm({ ...form, minLevel: Number(e.target.value) })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nível máx.</label>
                <input type="number" value={form.maxLevel ?? 1} onChange={(e) => setForm({ ...form, maxLevel: Number(e.target.value) })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Máx. instâncias</label>
                <input type="number" value={form.maxInstances ?? 10} onChange={(e) => setForm({ ...form, maxInstances: Number(e.target.value) })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Respawn (ms)</label>
                <input type="number" value={form.respawnTime ?? 15000} onChange={(e) => setForm({ ...form, respawnTime: Number(e.target.value) })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Posição X</label>
                <input type="number" value={form.positionX ?? 0} onChange={(e) => setForm({ ...form, positionX: Number(e.target.value) })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Posição Y</label>
                <input type="number" value={form.positionY ?? 0} onChange={(e) => setForm({ ...form, positionY: Number(e.target.value) })} className={inputClass} />
              </div>
              <div className="col-span-2 sm:col-span-4 flex justify-end gap-2">
                {editing && (
                  <button type="button" onClick={resetForm} className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
                    Cancel
                  </button>
                )}
                <button type="submit" disabled={saving} className="px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : editing?.id ? "Salvar alterações" : "Adicionar ao mapa"}
                </button>
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-600">
                    <th className="text-left py-2.5 px-4 text-gray-400 font-medium">Monstro</th>
                    <th className="text-left py-2.5 px-4 text-gray-400 font-medium">Spawn</th>
                    <th className="text-left py-2.5 px-4 text-gray-400 font-medium">Níveis</th>
                    <th className="text-left py-2.5 px-4 text-gray-400 font-medium">Máx.</th>
                    <th className="text-left py-2.5 px-4 text-gray-400 font-medium">Respawn (ms)</th>
                    <th className="text-left py-2.5 px-4 text-gray-400 font-medium">Posição</th>
                    <th className="text-right py-2.5 px-4 text-gray-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMonsters.map((s) => (
                    <tr key={s.id} className="border-b border-dark-700 hover:bg-dark-800/50">
                      <td className="py-2.5 px-4 font-medium text-white">{monsterName(s.monsterId)}</td>
                      <td className="py-2.5 px-4 font-mono text-xs">{s.spawnRate}</td>
                      <td className="py-2.5 px-4 font-mono text-xs">{s.minLevel}–{s.maxLevel}</td>
                      <td className="py-2.5 px-4 font-mono text-xs">{s.maxInstances}</td>
                      <td className="py-2.5 px-4 font-mono text-xs">{s.respawnTime}</td>
                      <td className="py-2.5 px-4 font-mono text-xs">
                        {s.positionX !== null && s.positionX !== undefined ? `${s.positionX}, ${s.positionY}` : "-"}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <button onClick={() => openEdit(s)} className="text-blue-400 hover:text-blue-300 mr-3">Edit</button>
                        <button onClick={() => handleDelete(s)} className="text-red-400 hover:text-red-300">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {selectedMonsters.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-gray-500">Nenhum monstro neste mapa ainda</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-600 rounded-xl flex items-center justify-center p-16">
            <p className="text-gray-500">Selecione um mapa para gerenciar os monstros</p>
          </div>
        )}
      </div>
    </div>
  );
}
