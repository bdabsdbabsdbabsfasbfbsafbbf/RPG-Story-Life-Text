import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { adminApi } from "../../services/api";
import { GameLimits } from "../../types";
import { Shield, Coins, Gem, Crown, Star, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const formatNumber = (n: number) => n.toLocaleString("pt-BR");

export default function AdminPanel() {
  const { user } = useAuthStore();
  const [limits, setLimits] = useState<GameLimits | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin" || user?.role === "owner" || user?.role === "developer";

  useEffect(() => {
    if (!isAdmin) return;
    adminApi
      .getLimits()
      .then(({ data }) => setLimits(data))
      .catch(() => toast.error("Falha ao carregar limites"))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <Shield size={32} className="mx-auto mb-2 text-red-400" />
        <p className="font-display font-semibold text-lg">Acesso negado</p>
        <p className="text-sm text-gray-400">Apenas administradores podem acessar esta área.</p>
      </div>
    );
  }

  const set = (key: keyof GameLimits) => (value: string) => {
    if (!limits) return;
    const num = Math.max(0, Number(value.replace(/\D/g, "")) || 0);
    setLimits({ ...limits, [key]: num });
  };

  const save = () => {
    if (!limits) return;
    setSaving(true);
    adminApi
      .updateLimits(limits)
      .then(() => toast.success("Limites salvos!"))
      .catch(() => toast.error("Falha ao salvar limites"))
      .finally(() => setSaving(false));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Shield size={22} className="text-purple-400" /> Painel Administrativo
        </h1>
        <p className="text-gray-400 text-sm mt-1">Limites globais de economia e progressão do jogo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="panel p-4 flex items-center gap-3 border-purple-500/30 bg-purple-500/5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0">
            <Crown size={20} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono">{limits ? formatNumber(limits.maxLevel) : "..."}</p>
            <p className="text-xs text-gray-400">Level máximo</p>
          </div>
        </div>
        <div className="panel p-4 flex items-center gap-3 border-yellow-500/30 bg-yellow-500/5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shrink-0">
            <Coins size={20} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono">{limits ? formatNumber(limits.maxGold) : "..."}</p>
            <p className="text-xs text-gray-400">Gold máximo</p>
          </div>
        </div>
        <div className="panel p-4 flex items-center gap-3 border-cyan-500/30 bg-cyan-500/5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shrink-0">
            <Gem size={20} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono">{limits ? formatNumber(limits.maxDiamonds) : "..."}</p>
            <p className="text-xs text-gray-400">Diamantes máximo</p>
          </div>
        </div>
      </div>

      <div className="panel p-4">
        <h2 className="font-display font-semibold flex items-center gap-2 mb-3">
          <Star size={16} className="text-yellow-400" /> Limites do Jogo
        </h2>
        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "maxLevel" as const, label: "Level máximo", hint: "Nenhum personagem sobe além disso", icon: Crown, color: "text-purple-400" },
                { key: "maxGold" as const, label: "Gold máximo", hint: "O ouro não passa deste valor", icon: Coins, color: "text-yellow-400" },
                { key: "maxDiamonds" as const, label: "Diamantes máximo", hint: "Os diamantes não passam deste valor", icon: Gem, color: "text-cyan-400" },
                { key: "xpPerLevel" as const, label: "XP por nível", hint: "Ex: 1250 = do nível 1 ao 2 precisa de 1.250 XP", icon: Star, color: "text-blue-400" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="flex items-center gap-2 text-sm font-medium mb-1">
                    <field.icon size={14} className={field.color} /> {field.label}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={limits ? formatNumber(limits[field.key]) : ""}
                    onChange={(e) => set(field.key)(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">{field.hint}</p>
                </div>
              ))}
            </div>
            <button onClick={save} disabled={saving || !limits} className="btn-primary flex items-center gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Salvando..." : "Salvar limites"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
