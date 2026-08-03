import { useEffect, useState } from "react";
import { seasonsApi } from "../services/api";
import { Trophy, Gift, Lock, Check, Coins, Zap, Star, Gem } from "lucide-react";
import toast from "react-hot-toast";

const PASS_XP_PER_LEVEL = 1000;

interface SeasonData {
  season: { id: string; name: string; description: string; startsAt: string; endsAt: string } | null;
  tiers: { id: string; level: number; freeRewards: any[]; premiumRewards: any[] }[];
  pass: { level: number; experience: number; isPremium: boolean; claimedTiers: string[] } | null;
}

function describeReward(r: any): { label: string; icon: any; premium: boolean } {
  switch (r?.type) {
    case "gold":
      return { label: `+${Number(r.value || 0).toLocaleString()}G`, icon: Coins, premium: false };
    case "experience":
      return { label: `+${Number(r.value || 0).toLocaleString()} XP`, icon: Zap, premium: false };
    case "classXp":
      return { label: `+${Number(r.value || 0).toLocaleString()} XP Classe`, icon: Star, premium: false };
    case "item":
      return { label: `${r.quantity || 1}x ${r.slug || r.itemName || r.name}`, icon: Gift, premium: false };
    case "gem":
      return { label: `+${Number(r.value || 0)} gemas`, icon: Gem, premium: true };
    default:
      return { label: "Recompensa", icon: Gift, premium: false };
  }
}

export function SeasonPage() {
  const [data, setData] = useState<SeasonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const load = () => {
    seasonsApi
      .me()
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleClaim = async (tierId: string) => {
    setClaiming(tierId);
    try {
      await seasonsApi.claim(tierId);
      toast.success("Recompensas do tier reivindicadas!");
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Falha ao reivindicar");
    } finally {
      setClaiming(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!data?.season) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Trophy size={24} className="text-yellow-400" /> Season
        </h1>
        <div className="panel p-8 text-center text-gray-500">
          <Trophy size={48} className="mx-auto mb-3 opacity-50" />
          <p>Nenhuma temporada ativa no momento.</p>
        </div>
      </div>
    );
  }

  const pass = data.pass;
  const level = pass?.level ?? 1;
  const xpInto = (pass?.experience ?? 0) % PASS_XP_PER_LEVEL;
  const claimed = new Set(pass?.claimedTiers ?? []);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2">
        <Trophy size={24} className="text-yellow-400" /> {data.season.name}
      </h1>

      <div className="panel p-4">
        <p className="text-sm text-gray-400 mb-3">{data.season.description}</p>
        <p className="text-xs text-gray-500">
          Termina em {new Date(data.season.endsAt).toLocaleDateString()}
        </p>
      </div>

      <div className="panel p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-semibold">Seu passe</h2>
          <span className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-lg">
            Nível {level}
          </span>
        </div>
        <div className="h-2.5 bg-dark-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-300"
            style={{ width: `${(xpInto / PASS_XP_PER_LEVEL) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {xpInto.toLocaleString()} / {PASS_XP_PER_LEVEL.toLocaleString()} XP até o nível {level + 1} • Ganhe XP de passe em combates e quests
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.tiers.map((tier) => {
          const isClaimed = claimed.has(tier.id);
          const isLocked = level < tier.level;
          const freeRewards = tier.freeRewards?.length
            ? tier.freeRewards.map(describeReward)
            : [{ label: "—", icon: Gift, premium: false }];
          const premiumRewards = tier.premiumRewards?.length
            ? tier.premiumRewards.map(describeReward)
            : [];

          return (
            <div
              key={tier.id}
              className={`panel p-4 relative ${isClaimed ? "opacity-60" : ""} ${isLocked && !isClaimed ? "opacity-70" : ""}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-bold text-lg text-yellow-400">Nível {tier.level}</span>
                {isClaimed ? (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <Check size={13} /> Reivindicado
                  </span>
                ) : isLocked ? (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Lock size={12} /> Requer nível {tier.level}
                  </span>
                ) : (
                  <button
                    onClick={() => handleClaim(tier.id)}
                    disabled={claiming === tier.id}
                    className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50"
                  >
                    {claiming === tier.id ? "Reivindicando..." : "Reivindicar"}
                  </button>
                )}
              </div>

              <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1.5">Grátis</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {freeRewards.map((r, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs bg-dark-800 border border-dark-600 rounded-lg px-2 py-1">
                    <r.icon size={12} className="text-green-400" /> {r.label}
                  </span>
                ))}
              </div>

              {premiumRewards.length > 0 && (
                <>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1.5">Premium</p>
                  <div className="flex flex-wrap gap-1.5">
                    {premiumRewards.map((r, i) => (
                      <span key={i} className="flex items-center gap-1 text-xs bg-dark-800 border border-yellow-500/30 rounded-lg px-2 py-1">
                        <r.icon size={12} className="text-yellow-400" /> {r.label}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
