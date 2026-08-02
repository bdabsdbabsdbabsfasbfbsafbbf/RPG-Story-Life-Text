import { useEffect, useState } from "react";
import { adminApi } from "../api";
import {
  Users,
  Shield,
  Package,
  Swords,
  ScrollText,
  Skull,
  RefreshCw,
  Gamepad2,
  Sparkles,
} from "lucide-react";

interface Stats {
  totalUsers?: number;
  totalCharacters?: number;
  totalClasses?: number;
  totalItems?: number;
  totalGuilds?: number;
  totalQuests?: number;
  totalMonsters?: number;
  totalMaps?: number;
  totalSkills?: number;
  totalEffects?: number;
  totalStatModels?: number;
  totalRaces?: number;
  totalTraits?: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | undefined;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold font-mono">{value ?? "-"}</p>
        <p className="text-xs text-gray-400 truncate">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.stats();
      setStats(data);
    } catch {
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-lg text-gray-300 hover:text-white hover:border-dark-400 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading && !stats.totalUsers ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-dark-800 border border-dark-600 rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <StatCard label="Users" value={stats.totalUsers} icon={Users} color="from-blue-500 to-blue-600" />
            <StatCard label="Characters" value={stats.totalCharacters} icon={Gamepad2} color="from-purple-500 to-purple-600" />
            <StatCard label="Guilds" value={stats.totalGuilds} icon={Swords} color="from-amber-500 to-amber-600" />
            <StatCard label="Classes" value={stats.totalClasses} icon={Shield} color="from-green-500 to-green-600" />
            <StatCard label="Items" value={stats.totalItems} icon={Package} color="from-cyan-500 to-cyan-600" />
            <StatCard label="Monsters" value={stats.totalMonsters} icon={Skull} color="from-red-500 to-red-600" />
            <StatCard label="Maps" value={stats.totalMaps} icon={Gamepad2} color="from-emerald-500 to-emerald-600" />
            <StatCard label="Quests" value={stats.totalQuests} icon={ScrollText} color="from-indigo-500 to-indigo-600" />
            <StatCard label="Skills" value={stats.totalSkills} icon={Sparkles} color="from-yellow-500 to-yellow-600" />
            <StatCard label="Effects" value={stats.totalEffects} icon={Sparkles} color="from-pink-500 to-pink-600" />
            <StatCard label="Stat Models" value={stats.totalStatModels} icon={Shield} color="from-lime-500 to-lime-600" />
            <StatCard label="Races" value={stats.totalRaces} icon={Users} color="from-teal-500 to-teal-600" />
            <StatCard label="Traits" value={stats.totalTraits} icon={Sparkles} color="from-orange-500 to-orange-600" />
          </div>
          <p className="text-xs text-gray-500">Data refreshed from production database.</p>
        </>
      )}
    </div>
  );
}
