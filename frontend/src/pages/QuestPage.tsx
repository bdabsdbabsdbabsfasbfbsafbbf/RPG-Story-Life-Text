import { useEffect, useState } from "react";
import { questsApi } from "../services/api";
import { ScrollText, CheckCircle, Clock, Star, Gift, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export function QuestPage() {
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    try {
      const { data } = await questsApi.progress();
      setProgress(Array.isArray(data) ? data : []);
    } catch {
      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAbandon = async (questId: string, title: string) => {
    if (!window.confirm(`Cancelar a quest "${title}"?`)) return;
    try {
      await questsApi.abandon(questId);
      toast.success("Quest cancelada!");
      load();
      window.dispatchEvent(new Event("quests-changed"));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to cancel quest");
    }
  };

  const handleClaim = async (questId: string) => {
    try {
      const { data } = await questsApi.claim(questId);
      let msg = `Recompensa resgatada! +${data.xpGain ?? 0} XP, +${data.goldGain ?? 0} gold`;
      if (Array.isArray(data.items) && data.items.length > 0) {
        msg += ` • Itens: ${data.items.map((it: { itemName: string; quantity: number }) => `${it.quantity}x ${it.itemName}`).join(", ")}`;
      }
      toast.success(msg, { duration: 5000 });
      load();
      window.dispatchEvent(new Event("quests-changed"));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to claim rewards");
    }
  };

  const mine = progress.filter((p) => p.status === "active" || p.status === "completed");
  const questTypes = ["all", ...new Set(mine.map((p) => p.quest.type))];
  const filtered = mine.filter((p) => filter === "all" || p.quest.type === filter);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <ScrollText size={24} className="text-green-400" /> Quests
        </h1>
      </div>

      {mine.length === 0 && (
        <div className="card p-8 text-center text-gray-400">
          <p className="mb-1">Você não tem nenhuma quest ativa.</p>
          <p className="text-sm">Fale com um NPC de quests no mapa para aceitar uma missão.</p>
        </div>
      )}

      {mine.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {questTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium capitalize transition-colors ${
                filter === type ? "bg-green-600 text-white" : "bg-dark-700 text-gray-400 hover:text-gray-200"
              }`}
            >
              {type === "all" ? "All" : type}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => {
          const quest = p.quest;
          const status = p.status;
          return (
            <div key={p.id} className={`card ${
              status === "completed" ? "border-green-500/30 bg-green-500/5" : ""
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ScrollText size={18} className={status === "completed" ? "text-green-400" : "text-blue-400"} />
                  <h3 className="font-medium">{quest.title}</h3>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  status === "completed" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                }`}>
                  {status === "completed" ? "completed" : "active"}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{quest.description}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><Star size={12} /> Lv.{quest.requiredLevel}</span>
                <span className="capitalize">{quest.type}</span>
                <span className="capitalize">{quest.difficulty}</span>
                {status === "active" && (
                  <span className="flex items-center gap-1 ml-auto"><Clock size={12} /> Em progresso</span>
                )}
                {status === "completed" && (
                  <span className="flex items-center gap-1 ml-auto"><CheckCircle size={12} /> Pronta para resgatar</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-yellow-400">{Number(quest.goldReward).toLocaleString()} G</span>
                  <span className="text-purple-400">{Number(quest.xpReward).toLocaleString()} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  {status === "active" && (
                    <button onClick={() => handleAbandon(quest.id, quest.title)} className="btn-danger text-sm flex items-center gap-1">
                      <XCircle size={14} /> Cancelar
                    </button>
                  )}
                  {status === "completed" && (
                    <button onClick={() => handleClaim(quest.id)} className="btn-primary text-sm flex items-center gap-1">
                      <Gift size={14} /> Claim
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
