import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { mapsApi, npcApi, questsApi } from "../services/api";
import { Map as MapType } from "../types";
import { getSocket } from "../services/socket";
import {
  ArrowLeft, Skull, Store, ScrollText, Navigation, Shield, Map as MapIcon,
  X, ShoppingBag, CheckCircle2, Clock, Gift, Lock,
} from "lucide-react";
import toast from "react-hot-toast";

interface NpcDetail {
  id: string;
  name: string;
  type: string;
  shopItems?: { id: string; price: string | number; item: { id: string; name: string; description: string; type: string; rarity: string } }[];
  quests?: { id: string; title: string; description: string; requiredLevel: number; xpReward: string | number; goldReward: string | number }[];
}

interface QuestProgressEntry {
  questId: string;
  status: "active" | "completed" | "claimed";
}

export function MapPage() {
  const { slug } = useParams<{ slug: string }>();
  const [map, setMap] = useState<MapType | null>(null);
  const [maps, setMaps] = useState<MapType[]>([]);
  const [loading, setLoading] = useState(true);
  const [npc, setNpc] = useState<NpcDetail | null>(null);
  const [npcLoading, setNpcLoading] = useState(false);
  const [questProgress, setQuestProgress] = useState<QuestProgressEntry[]>([]);
  const [buyingItemId, setBuyingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(true);
      mapsApi.list()
        .then(({ data }) => setMaps(data))
        .catch(() => {})
        .finally(() => setLoading(false));
      return;
    }
    setLoading(true);
    mapsApi.get(slug).then(({ data }) => {
      setMap(data);
      const socket = getSocket();
      if (socket) socket.emit("map:join", data.id);
    }).catch(() => {}).finally(() => setLoading(false));

    return () => {
      const socket = getSocket();
      if (socket) socket.emit("map:leave");
    };
  }, [slug]);

  useEffect(() => {
    questsApi.progress().then(({ data }) => {
      if (Array.isArray(data)) setQuestProgress(data);
    }).catch(() => {});
  }, [npc]);

  const openNpc = async (npcId: string) => {
    setNpcLoading(true);
    setNpc(null);
    try {
      const { data } = await npcApi.get(npcId);
      setNpc(data);
    } catch {
      toast.error("Failed to load NPC");
    } finally {
      setNpcLoading(false);
    }
  };

  const buyItem = async (itemId: string) => {
    if (!npc) return;
    setBuyingItemId(itemId);
    try {
      const { data } = await npcApi.buy(npc.id, { itemId, quantity: 1 });
      toast.success(`${data.quantity}x ${data.item} comprado (${data.totalPrice} gold)`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Purchase failed");
    } finally {
      setBuyingItemId(null);
    }
  };

  const acceptQuest = async (questId: string) => {
    try {
      await questsApi.accept(questId);
      toast.success("Quest aceita!");
      const { data } = await questsApi.progress();
      if (Array.isArray(data)) setQuestProgress(data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to accept quest");
    }
  };

  const claimQuest = async (questId: string) => {
    try {
      await questsApi.claim(questId);
      toast.success("Recompensa resgatada!");
      const { data } = await questsApi.progress();
      if (Array.isArray(data)) setQuestProgress(data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to claim rewards");
    }
  };

  const questStatus = (questId: string) => questProgress.find((p) => p.questId === questId)?.status;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (!slug) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <MapIcon size={22} className="text-purple-400" /> Mapa Mundi
          </h1>
          <p className="text-sm text-gray-400 mt-1">Escolha um local para explorar.</p>
        </div>
        {maps.length === 0 && <p className="text-gray-500 text-sm">Nenhum mapa disponível.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {maps.map((m) => (
            <Link key={m.id} to={`/map/${m.slug}`} className="card-hover block p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-lg">{m.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{m.description}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-md whitespace-nowrap">Lv.{m.requiredLevel}+</span>
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                <span className="px-2 py-0.5 bg-dark-700 rounded-md capitalize">{m.region}</span>
                <span className="flex items-center gap-1"><Skull size={12} /> {m.monsters?.length || 0} monstros</span>
                <span className="flex items-center gap-1"><ScrollText size={12} /> {m.npcs?.length || 0} NPCs</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (!map) return <div className="text-center py-12 text-gray-400">Map not found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/map" className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold">{map.name}</h1>
          <p className="text-sm text-gray-400">{map.description}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-dark-700 rounded-md">{map.region}</span>
          <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-md">Lv.{map.requiredLevel}+</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="panel p-4">
            <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
              <Skull size={16} className="text-red-400" /> Monsters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {map.monsters?.map((mm) => (
                <Link
                  key={mm.id}
                  to={`/combat/${mm.monster.id}`}
                  className="card-hover flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    mm.monster.isBoss ? "bg-red-500/20" : mm.monster.isElite ? "bg-yellow-500/20" : "bg-dark-700"
                  }`}>
                    <Skull size={20} className={mm.monster.isBoss ? "text-red-400" : mm.monster.isElite ? "text-yellow-400" : "text-gray-400"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{mm.monster.name}</p>
                    <p className="text-xs text-gray-500">
                      Lv.{mm.monster.level} • {mm.monster.element} • HP: {mm.monster.hp}
                    </p>
                  </div>
                  {mm.monster.isBoss && <span className="text-xs text-red-400 font-bold">BOSS</span>}
                </Link>
              ))}
              {(!map.monsters || map.monsters.length === 0) && (
                <p className="text-gray-500 text-sm col-span-2 py-4 text-center">No monsters in this area</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-4">
            <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
              <Store size={16} className="text-cyan-400" /> NPCs
            </h2>
            <div className="space-y-2">
              {map.npcs?.map((mn) => (
                <button
                  key={mn.id}
                  onClick={() => openNpc(mn.npc.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-dark-700/50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center">
                    {mn.npc.type === "vendor" ? <Store size={16} className="text-cyan-400" /> :
                     mn.npc.type === "quest_giver" ? <ScrollText size={16} className="text-green-400" /> :
                     <Shield size={16} className="text-purple-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{mn.npc.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{mn.npc.type?.replace("_", " ")}</p>
                  </div>
                </button>
              ))}
              {(!map.npcs || map.npcs.length === 0) && (
                <p className="text-gray-500 text-sm py-2">Nenhum NPC nesta área.</p>
              )}
            </div>
          </div>

          <div className="panel p-4">
            <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
              <Navigation size={16} className="text-purple-400" /> Connections
            </h2>
            <div className="space-y-2">
              {map.connections?.map((conn) => (
                <Link
                  key={conn.id}
                  to={`/map/${conn.toMap.slug}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-dark-700/50 transition-colors text-sm"
                >
                  <ArrowLeft size={14} className="text-gray-500" />
                  <span>{conn.toMap.name}</span>
                  {conn.requiredLevel > 1 && (
                    <span className="text-xs text-yellow-500 ml-auto">Lv.{conn.requiredLevel}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* NPC modal */}
      {npc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setNpc(null)}>
          <div className="panel w-full max-w-lg max-h-[80vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-bold text-lg">{npc.name}</h2>
                <p className="text-xs text-gray-500 capitalize">{npc.type?.replace("_", " ")}</p>
              </div>
              <button onClick={() => setNpc(null)} className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            {npc.type === "vendor" && (
              <div className="space-y-2">
                {npc.shopItems && npc.shopItems.length > 0 ? (
                  npc.shopItems.map((offer) => (
                    <div key={offer.id} className="card p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-dark-700 flex items-center justify-center">
                        <ShoppingBag size={16} className="text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{offer.item.name}</p>
                        <p className="text-[11px] text-gray-500 line-clamp-1">{offer.item.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm text-yellow-400">{Number(offer.price).toLocaleString()} gold</p>
                        <button
                          onClick={() => buyItem(offer.item.id)}
                          disabled={buyingItemId === offer.item.id}
                          className="btn-secondary text-xs px-3 py-1 mt-1 disabled:opacity-50"
                        >
                          {buyingItemId === offer.item.id ? "..." : "Comprar"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Esta loja está vazia.</p>
                )}
              </div>
            )}

            {npc.type === "quest_giver" && (
              <div className="space-y-2">
                {npc.quests && npc.quests.length > 0 ? (
                  npc.quests.map((q) => {
                    const status = questStatus(q.id);
                    return (
                      <div key={q.id} className="card p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{q.title}</p>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{q.description}</p>
                            <p className="text-[11px] text-gray-500 mt-2">
                              <span className="text-purple-400">+{Number(q.xpReward)} XP</span> •{" "}
                              <span className="text-yellow-400">+{Number(q.goldReward)} gold</span>
                              {q.requiredLevel > 1 && <> • <span className="text-yellow-500">Lv.{q.requiredLevel}+</span></>}
                            </p>
                          </div>
                          <div className="shrink-0">
                            {!status && (
                              <button onClick={() => acceptQuest(q.id)} className="btn-primary text-xs px-3 py-1.5">
                                Aceitar
                              </button>
                            )}
                            {status === "active" && (
                              <span className="flex items-center gap-1 text-xs text-green-400 px-2 py-1">
                                <Clock size={12} /> Em progresso
                              </span>
                            )}
                            {status === "completed" && (
                              <button onClick={() => claimQuest(q.id)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                                <Gift size={12} /> Resgatar
                              </button>
                            )}
                            {status === "claimed" && (
                              <span className="flex items-center gap-1 text-xs text-gray-400 px-2 py-1">
                                <CheckCircle2 size={12} /> Concluída
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma quest disponível.</p>
                )}
              </div>
            )}

            {npc.type && npc.type !== "vendor" && npc.type !== "quest_giver" && (
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Lock size={14} /> Funcionalidade em breve.
              </p>
            )}
          </div>
        </div>
      )}

      {npcLoading && !npc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
