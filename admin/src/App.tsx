import { useState, useEffect } from "react";
import { adminApi } from "./api";
import { LayoutDashboard, Sword, Package, Skull, Map, ScrollText, Zap, Users, Shield, Activity, Box, Menu } from "lucide-react";

type Tab = "dashboard" | "classes" | "items" | "monsters" | "maps" | "quests" | "skills" | "buffs" | "users";

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "classes", label: "Classes", icon: Sword },
  { id: "items", label: "Items", icon: Package },
  { id: "monsters", label: "Monsters", icon: Skull },
  { id: "maps", label: "Maps", icon: Map },
  { id: "quests", label: "Quests", icon: ScrollText },
  { id: "skills", label: "Skills", icon: Zap },
  { id: "buffs", label: "Buffs/Debuffs", icon: Activity },
  { id: "users", label: "Users", icon: Users },
];

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold font-mono">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}

function EditorModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DataTable({ columns, data, onEdit, onDelete }: { columns: { key: string; label: string; render?: (val: any) => any }[]; data: any[]; onEdit: (item: any) => void; onDelete: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dark-600">
            {columns.map(col => (
              <th key={col.key} className="text-left py-3 px-3 text-gray-400 font-medium">{col.label}</th>
            ))}
            <th className="text-right py-3 px-3 text-gray-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={item.id || i} className="border-b border-dark-700 hover:bg-dark-800/50">
              {columns.map(col => (
                <td key={col.key} className="py-2.5 px-3">{col.render ? col.render(item[col.key]) : item[col.key] ?? "-"}</td>
              ))}
              <td className="py-2.5 px-3 text-right">
                <button onClick={() => onEdit(item)} className="text-blue-400 hover:text-blue-300 mr-2">Edit</button>
                <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-300">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && <p className="text-center text-gray-500 py-8">No data</p>}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [data, setData] = useState<any>({});
  const [editItem, setEditItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "dashboard") {
        const { data: s } = await adminApi.stats();
        setStats(s);
      } else {
        const fetcher = (adminApi as any)[activeTab];
        if (fetcher?.list) {
          const { data: d } = await fetcher.list();
          setData((prev: any) => ({ ...prev, [activeTab]: Array.isArray(d) ? d : d[activeTab] || [] }));
        }
      }
    } catch {}
    setLoading(false);
  };

  const handleSave = async (table: string, payload: any) => {
    try {
      if (editItem?.id) {
        await (adminApi as any)[table].update(editItem.id, payload);
      } else {
        await (adminApi as any)[table].create(payload);
      }
      setEditItem(null);
      loadData();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDelete = async (table: string, id: string) => {
    try {
      await (adminApi as any)[table].delete(id);
      loadData();
    } catch {}
  };

  const renderEditor = () => {
    if (!editItem && activeTab === "classes") {
      return (
        <EditorModal title="Create Class" onClose={() => setEditItem(null)}>
          <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); handleSave("classes", Object.fromEntries(fd)); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input name="name" placeholder="Name" className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm" required />
              <input name="slug" placeholder="Slug" className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm" required />
            </div>
            <textarea name="description" placeholder="Description" rows={2} className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm" required />
            <textarea name="lore" placeholder="Lore" rows={2} className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm" />
            <input name="icon" placeholder="Icon key" className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm" />
            <div className="grid grid-cols-3 gap-2">
              <select name="element" className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm">
                <option value="fire">Fire</option><option value="water">Water</option><option value="earth">Earth</option>
                <option value="wind">Wind</option><option value="light">Light</option><option value="dark">Dark</option><option value="neutral">Neutral</option>
              </select>
              <select name="rarity" className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm">
                <option value="common">Common</option><option value="uncommon">Uncommon</option><option value="rare">Rare</option>
                <option value="epic">Epic</option><option value="legendary">Legendary</option><option value="mythic">Mythic</option>
              </select>
              <select name="difficulty" className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm">
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option><option value="expert">Expert</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select name="role" className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm">
                <option value="tank">Tank</option><option value="support">Support</option><option value="mage">Mage</option>
                <option value="dps">DPS</option><option value="assassin">Assassin</option><option value="hybrid">Hybrid</option>
              </select>
              <select name="statModel" className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm">
                <option value="tank">Tank</option><option value="hybrid">Hybrid</option><option value="luckHybrid">Luck Hybrid</option>
                <option value="powerCaster">Power Caster</option><option value="physicalDPS">Physical DPS</option>
                <option value="magicDPS">Magic DPS</option><option value="support">Support</option>
                <option value="assassin">Assassin</option><option value="bruiser">Bruiser</option><option value="battleMage">Battle Mage</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select name="unlockMethod" className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm">
                <option value="auto">Auto</option><option value="quest">Quest</option><option value="item">Item</option>
                <option value="level">Level</option><option value="currency">Currency</option>
              </select>
              <input name="requiredLevel" type="number" placeholder="Required Level" defaultValue="1" className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm" />
            </div>
            <p className="text-xs text-gray-500 font-semibold mt-2">Core Base Stats</p>
            <div className="grid grid-cols-4 gap-2">
              {["baseHp", "baseMana", "baseAttack", "baseDefense", "baseMagic", "baseMagicDefense", "baseSpeed", "manaRecovery"].map(f => (
                <input key={f} name={f} type="number" placeholder={f.replace("base", "")} defaultValue={f === "manaRecovery" ? "5" : "10"} step={f === "manaRecovery" ? "0.1" : "1"} className="w-full px-2 py-1.5 bg-dark-700 border border-dark-500 rounded-lg text-xs" />
              ))}
            </div>
            <p className="text-xs text-gray-500 font-semibold mt-2">Scaling Config</p>
            <div className="grid grid-cols-4 gap-2">
              {["attackScaling", "magicScaling", "critScaling", "critDamageBase", "dodgeScaling", "cooldownScaling", "manaEfficiency"].map(f => (
                <input key={f} name={f} type="number" placeholder={f} defaultValue="1" step="0.01" className="w-full px-2 py-1.5 bg-dark-700 border border-dark-500 rounded-lg text-xs" />
              ))}
            </div>
            <button type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium">Create Class</button>
          </form>
        </EditorModal>
      );
    }

    if (!editItem && activeTab === "skills") {
      return (
        <EditorModal title="Create Skill" onClose={() => setEditItem(null)}>
          <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); handleSave("skills", Object.fromEntries(fd)); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input name="name" placeholder="Skill Name" className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm" required />
              <input name="classId" placeholder="Class ID" className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm" required />
            </div>
            <textarea name="description" placeholder="Description" rows={2} className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm" required />
            <div className="grid grid-cols-3 gap-2">
              <select name="type" className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm">
                <option value="active">Active</option><option value="passive">Passive</option><option value="ultimate">Ultimate</option>
              </select>
              <input name="subType" placeholder="Sub Type (melee/spell/buff)" className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm" />
              <select name="targetType" className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm">
                <option value="self">Self</option><option value="enemy">Enemy</option><option value="ally">Ally</option><option value="area">Area</option>
              </select>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <input name="cooldown" type="number" placeholder="Cooldown (ms)" defaultValue="0" className="w-full px-2 py-1.5 bg-dark-700 border border-dark-500 rounded-lg text-xs" />
              <input name="manaCost" type="number" placeholder="Mana Cost" defaultValue="0" className="w-full px-2 py-1.5 bg-dark-700 border border-dark-500 rounded-lg text-xs" />
              <input name="castTime" type="number" placeholder="Cast Time (ms)" defaultValue="0" className="w-full px-2 py-1.5 bg-dark-700 border border-dark-500 rounded-lg text-xs" />
              <input name="range" type="number" placeholder="Range" defaultValue="5" className="w-full px-2 py-1.5 bg-dark-700 border border-dark-500 rounded-lg text-xs" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input name="baseDamage" type="number" placeholder="Base Damage" defaultValue="0" className="w-full px-2 py-1.5 bg-dark-700 border border-dark-500 rounded-lg text-xs" />
              <select name="damageType" className="w-full px-2 py-1.5 bg-dark-700 border border-dark-500 rounded-lg text-xs">
                <option value="physical">Physical</option><option value="magic">Magic</option><option value="true">True</option>
              </select>
              <input name="rankRequired" type="number" placeholder="Rank Required" defaultValue="1" className="w-full px-2 py-1.5 bg-dark-700 border border-dark-500 rounded-lg text-xs" />
            </div>
            <button type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium">Create Skill</button>
          </form>
        </EditorModal>
      );
    }
    return null;
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-56" : "w-0"} transition-all bg-dark-900 border-r border-dark-700 flex flex-col shrink-0 overflow-hidden`}>
        <div className="p-4 border-b border-dark-700">
          <h1 className="font-bold text-sm glow-text">Admin Panel</h1>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === tab.id ? "bg-purple-600/20 text-purple-300" : "text-gray-400 hover:text-gray-200 hover:bg-dark-800"
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 bg-dark-900 border-b border-dark-700 flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-dark-700 rounded"><Menu size={18} /></button>
          <span className="text-sm font-medium capitalize">{activeTab}</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {loading && <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>}

          {!loading && activeTab === "dashboard" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Dashboard</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={stats.totalUsers || 0} icon={Users} color="from-purple-500 to-purple-600" />
                <StatCard label="Classes" value={stats.totalClasses || 0} icon={Sword} color="from-blue-500 to-blue-600" />
                <StatCard label="Items" value={stats.totalItems || 0} icon={Package} color="from-green-500 to-green-600" />
                <StatCard label="Monsters" value={stats.totalMonsters || 0} icon={Skull} color="from-red-500 to-red-600" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Maps" value={stats.totalMaps || 0} icon={Map} color="from-cyan-500 to-cyan-600" />
                <StatCard label="Quests" value={stats.totalQuests || 0} icon={ScrollText} color="from-yellow-500 to-yellow-600" />
                <StatCard label="Skills" value={stats.totalSkills || 0} icon={Zap} color="from-orange-500 to-orange-600" />
                <StatCard label="Active Players" value={stats.activePlayers || 0} icon={Activity} color="from-emerald-500 to-emerald-600" />
              </div>
            </div>
          )}

          {!loading && activeTab === "classes" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Classes</h2>
                <button onClick={() => setEditItem({})} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm">+ New</button>
              </div>
              <DataTable
                columns={[{ key: "name", label: "Name" }, { key: "role", label: "Role" }, { key: "statModel", label: "Stat Model" }, { key: "rarity", label: "Rarity" }, { key: "element", label: "Element" }, { key: "baseHp", label: "HP" }]}
                data={data.classes || []}
                onEdit={(item) => setEditItem(item)}
                onDelete={(id) => handleDelete("classes", id)}
              />
              {editItem && renderEditor()}
            </div>
          )}

          {!loading && activeTab === "items" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Items</h2>
                <button onClick={() => setEditItem({})} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm">+ New</button>
              </div>
              <DataTable
                columns={[{ key: "name", label: "Name" }, { key: "type", label: "Type" }, { key: "rarity", label: "Rarity" }, { key: "level", label: "Level" }, { key: "buyPrice", label: "Price" }]}
                data={data.items || []}
                onEdit={(item) => setEditItem(item)}
                onDelete={(id) => handleDelete("items", id)}
              />
            </div>
          )}

          {!loading && activeTab === "monsters" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Monsters</h2>
                <button onClick={() => setEditItem({})} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm">+ New</button>
              </div>
              <DataTable
                columns={[{ key: "name", label: "Name" }, { key: "level", label: "Level" }, { key: "hp", label: "HP" }, { key: "attack", label: "ATK" }, { key: "isBoss", label: "Boss", render: (v: boolean) => v ? "Yes" : "No" }]}
                data={data.monsters || []}
                onEdit={(item) => setEditItem(item)}
                onDelete={(id) => handleDelete("monsters", id)}
              />
            </div>
          )}

          {!loading && activeTab === "maps" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Maps</h2>
                <button onClick={() => setEditItem({})} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm">+ New</button>
              </div>
              <DataTable
                columns={[{ key: "name", label: "Name" }, { key: "region", label: "Region" }, { key: "requiredLevel", label: "Min Lv" }]}
                data={data.maps || []}
                onEdit={(item) => setEditItem(item)}
                onDelete={(id) => handleDelete("maps", id)}
              />
            </div>
          )}

          {!loading && activeTab === "skills" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Skills</h2>
                <button onClick={() => setEditItem({})} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm">+ New</button>
              </div>
              <DataTable
                columns={[{ key: "name", label: "Name" }, { key: "type", label: "Type" }, { key: "subType", label: "SubType" }, { key: "rankRequired", label: "Rank" }, { key: "baseDamage", label: "DMG" }, { key: "manaCost", label: "MP" }]}
                data={data.skills || []}
                onEdit={(item) => setEditItem(item)}
                onDelete={(id) => handleDelete("skills", id)}
              />
              {editItem && renderEditor()}
            </div>
          )}

          {!loading && activeTab === "quests" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Quests</h2>
                <button onClick={() => setEditItem({})} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm">+ New</button>
              </div>
              <DataTable
                columns={[{ key: "title", label: "Title" }, { key: "type", label: "Type" }, { key: "difficulty", label: "Difficulty" }, { key: "requiredLevel", label: "Min Lv" }, { key: "xpReward", label: "XP" }]}
                data={data.quests || []}
                onEdit={(item) => setEditItem(item)}
                onDelete={(id) => handleDelete("quests", id)}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
