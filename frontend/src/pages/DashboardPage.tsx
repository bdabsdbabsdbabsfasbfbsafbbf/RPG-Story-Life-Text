import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { mapsApi } from "../services/api";
import { Map as MapType } from "../types";
import { Sword, Map, Users, ScrollText, TrendingUp, Zap, Shield, Star, UserPlus } from "lucide-react";

export function DashboardPage() {
  const { user } = useAuthStore();
  const [maps, setMaps] = useState<MapType[]>([]);

  useEffect(() => {
    mapsApi.list().then(({ data }) => setMaps(data)).catch(() => {});
  }, []);

  const hasCharacter = !!user?.characters && user.characters.length > 0;
  const character = hasCharacter ? user!.characters![0] : null;
  const classSlug = character?.class?.slug;

  const statCards = [
    { label: "Level do personagem", value: character?.level ?? user?.level ?? 1, icon: Star, color: "from-purple-500 to-purple-600" },
    { label: "Gold", value: (user?.gold ?? 0).toLocaleString(), icon: TrendingUp, color: "from-yellow-500 to-yellow-600" },
    { label: "Diamonds", value: user?.diamonds || 0, icon: Zap, color: "from-cyan-500 to-cyan-600" },
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
        <Link to={hasCharacter ? (classSlug ? `/class/${classSlug}` : "/classes") : "/character/create"} className="btn-primary flex items-center gap-2">
          <Sword size={16} /> Classes
        </Link>
      </div>

      {!hasCharacter && (
        <Link to="/character/create" className="card-hover block border-purple-500/40 bg-gradient-to-r from-purple-600/10 to-blue-600/10 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0">
              <UserPlus size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-lg">Crie seu personagem</h2>
              <p className="text-sm text-gray-400">
                Escolha uma das 4 classes iniciais, role sua raça e trait e comece a jornada!
              </p>
            </div>
            <span className="btn-primary text-sm">Criar agora</span>
          </div>
        </Link>
      )}

      {hasCharacter && character && (
        <div className="panel p-4 border-cyan-500/30 bg-cyan-500/5">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-cyan-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-400">Selected character</p>
              <p className="font-display font-bold">
                {character.name}{" "}
                <span className="text-sm text-purple-400 font-mono">Lv.{character.level}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {character.class?.name || "Sem classe"}
                {character.race?.name && <> • Raça: {character.race.name}</>}
                {character.trait?.name && <> • Trait: {character.trait.name}</>}
              </p>
              {(character.experience !== undefined || character.experienceToNext) && (
                <div className="mt-2 max-w-xs">
                  <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                    <span>XP para o próximo level</span>
                    <span className="font-mono">{character.experience ?? 0} / {character.experienceToNext ?? 150}</span>
                  </div>
                  <div className="stat-bar h-1.5">
                    <div
                      className="stat-bar-fill bg-gradient-to-r from-purple-500 to-blue-500"
                      style={{ width: `${Math.min(100, ((character.experience ?? 0) / (character.experienceToNext ?? 150)) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <span className="text-sm text-gray-400">Level {character.level}</span>
          </div>
        </div>
      )}

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
