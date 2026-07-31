import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { mapsApi } from "../services/api";
import { Map as MapType } from "../types";
import { Sword, Map, Users, ScrollText, TrendingUp, Zap, Shield, Star } from "lucide-react";

export function DashboardPage() {
  const { user } = useAuthStore();
  const [maps, setMaps] = useState<MapType[]>([]);

  useEffect(() => {
    mapsApi.list().then(({ data }) => setMaps(data)).catch(() => {});
  }, []);

  const statCards = [
    { label: "Level", value: user?.level || 1, icon: Star, color: "from-purple-500 to-purple-600" },
    { label: "Gold", value: (user?.gold ?? 0).toLocaleString(), icon: TrendingUp, color: "from-yellow-500 to-yellow-600" },
    { label: "Diamonds", value: user?.diamonds || 0, icon: Zap, color: "from-cyan-500 to-cyan-600" },
    { label: "Characters", value: user?.characters?.length || 0, icon: Users, color: "from-blue-500 to-blue-600" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Welcome back, <span className="glow-text">{user?.displayName}</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Your adventure continues...</p>
        </div>
        <Link to="/class/shadowstalker" className="btn-primary flex items-center gap-2">
          <Sword size={16} /> Classes
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="panel p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
              <card.icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">{card.value}</p>
              <p className="text-xs text-gray-400">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-display font-semibold mb-3 flex items-center gap-2">
            <Map size={18} className="text-purple-400" /> Available Maps
          </h2>
          <div className="space-y-2">
            {maps.map((map) => (
              <Link
                key={map.id}
                to={`/map/${map.slug}`}
                className="card-hover flex items-center justify-between group"
              >
                <div>
                  <p className="font-medium group-hover:text-purple-300 transition-colors">{map.name}</p>
                  <p className="text-xs text-gray-500">{map.region} • Level {map.requiredLevel}+</p>
                </div>
                <div className="text-xs text-gray-500">{map.npcs?.length || 0} NPCs</div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-display font-semibold mb-3 flex items-center gap-2">
            <ScrollText size={18} className="text-cyan-400" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: "/inventory", label: "Inventory", icon: Sword, color: "from-purple-500 to-blue-500" },
              { to: "/quests", label: "Quests", icon: ScrollText, color: "from-green-500 to-emerald-500" },
              { to: "/guild", label: "Guild", icon: Users, color: "from-cyan-500 to-teal-500" },
              { to: "/market", label: "Market", icon: TrendingUp, color: "from-orange-500 to-red-500" },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="card-hover flex flex-col items-center justify-center py-6 gap-2"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                  <action.icon size={24} className="text-white" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
