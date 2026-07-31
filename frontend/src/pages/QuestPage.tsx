import { useEffect, useState } from "react";
import { questsApi } from "../services/api";
import { Quest } from "../types";
import { ScrollText, CheckCircle, Clock, Star, Gift } from "lucide-react";
import toast from "react-hot-toast";

export function QuestPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    Promise.all([questsApi.list(), questsApi.progress().catch(() => [])])
      .then(([q, p]) => {
        setQuests(q.data);
        setProgress(p.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await questsApi.accept(id);
      toast.success("Quest accepted!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to accept quest");
    }
  };

  const handleClaim = async (id: string) => {
    try {
      await questsApi.claim(id);
      toast.success("Rewards claimed!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to claim rewards");
    }
  };

  const getQuestStatus = (questId: string) => {
    const p = progress.find(p => p.questId === questId);
    return p?.status || null;
  };

  const filtered = quests.filter(q => filter === "all" || q.type === filter);
  const questTypes = ["all", ...new Set(quests.map(q => q.type))];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <ScrollText size={24} className="text-green-400" /> Quests
        </h1>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(quest => {
          const status = getQuestStatus(quest.id);
          return (
            <div key={quest.id} className={`card ${
              status === "completed" ? "border-green-500/30 bg-green-500/5" :
              status === "claimed" ? "border-gray-600/30 opacity-60" : ""
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ScrollText size={18} className={
                    status === "completed" ? "text-green-400" :
                    status === "claimed" ? "text-gray-500" : "text-gray-400"
                  } />
                  <h3 className="font-medium">{quest.title}</h3>
                </div>
                {status && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    status === "completed" ? "bg-green-500/20 text-green-400" :
                    status === "claimed" ? "bg-gray-500/20 text-gray-400" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>
                    {status}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{quest.description}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><Star size={12} /> Lv.{quest.requiredLevel}</span>
                <span className="capitalize">{quest.type}</span>
                <span className="capitalize">{quest.difficulty}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-yellow-400">{Number(quest.goldReward).toLocaleString()} G</span>
                  <span className="text-purple-400">{Number(quest.xpReward).toLocaleString()} XP</span>
                </div>
                {!status && (
                  <button onClick={() => handleAccept(quest.id)} className="btn-primary text-sm">Accept</button>
                )}
                {status === "completed" && (
                  <button onClick={() => handleClaim(quest.id)} className="btn-primary text-sm flex items-center gap-1">
                    <Gift size={14} /> Claim
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
