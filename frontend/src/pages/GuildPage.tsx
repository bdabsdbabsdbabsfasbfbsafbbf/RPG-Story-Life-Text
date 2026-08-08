import { useEffect, useState } from "react";
import { guildApi } from "../services/api";
import { Guild } from "../types";
import { Users, Shield, Plus, LogOut, Trophy, Star } from "lucide-react";
import toast from "react-hot-toast";

export function GuildPage() {
  const [guild, setGuild] = useState<Guild | null>(null);
  const [myGuild, setMyGuild] = useState<any>(null);
  const [requirements, setRequirements] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", tag: "", description: "" });

  useEffect(() => {
    Promise.all([
      guildApi.list(),
      guildApi.mine().catch(() => {}),
      guildApi.requirements().catch(() => {}),
    ]).then(([guilds, my, req]) => {
      setGuild(guilds.data);
      setMyGuild(my?.data || null);
      setRequirements(req?.data || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await guildApi.create(form);
      toast.success("Guild created!");
      setShowCreate(false);
      setForm({ name: "", tag: "", description: "" });
      setMyGuild({ guild: data });
      const { data: guilds } = await guildApi.list();
      setGuild(guilds);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create guild");
    }
  };

  const handleJoin = async (id: string) => {
    try {
      await guildApi.join(id);
      toast.success("Joined guild!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to join");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Users size={24} className="text-cyan-400" /> Guilds
        </h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Create Guild
        </button>
      </div>

      {myGuild && (
        <div className="panel p-4 border-cyan-500/30 bg-cyan-500/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg">{myGuild.guild.name}</h2>
              <p className="text-sm text-gray-400">[{myGuild.guild.tag}] • Level {myGuild.guild.level}</p>
            </div>
            <button onClick={async () => {
              try {
                await guildApi.leave(myGuild.guildId);
                setMyGuild(null);
                toast.success("Você saiu da guilda");
              } catch {}
            }} className="btn-danger flex items-center gap-2">
              <LogOut size={16} /> Leave
            </button>
          </div>
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} className="panel p-4 space-y-3">
          {requirements && (
            <div className="bg-dark-800 border border-amber-500/30 rounded-lg p-3 text-sm">
              <p className="text-amber-300 font-medium mb-1">Requisitos para criar guilda:</p>
              <p className="text-gray-300">
                Nível {requirements.requiredLevel} • {Number(requirements.requiredGold).toLocaleString()} Ouro • {Number(requirements.requiredDiamonds).toLocaleString()} Diamantes
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-rpg" placeholder="Nome da guilda" required />
            <input value={form.tag} onChange={e => setForm({...form, tag: e.target.value})} className="input-rpg" placeholder="TAG" maxLength={5} required />
          </div>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-rpg" placeholder="Descrição" rows={2} required />
          <button type="submit" className="btn-primary w-full">Criar Guilda</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.isArray(guild) && guild.map(g => (
          <div key={g.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display font-bold text-lg">{g.name}</h3>
                <p className="text-xs text-gray-500">[{g.tag}] • Nível {g.level}</p>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Users size={14} className="text-gray-500" />
                <span>{g.memberCount}/{g.maxMembers}</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 line-clamp-2 mb-3">{g.description}</p>
            <button onClick={() => handleJoin(g.id)} className="btn-secondary w-full text-sm">
              Join Guild
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
