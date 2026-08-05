import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { mapsApi, npcApi, questsApi, raidApi, craftApi, authApi } from "../services/api";
import { Map as MapType } from "../types";
import { getSocket } from "../services/socket";
import {
  ArrowLeft, Skull, Store, ScrollText, Navigation, Shield, Map as MapIcon,
  X, ShoppingBag, CheckCircle2, Clock, Gift, Lock, Swords, Hammer, Crown,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

interface NpcDetail {
  id: string;
  name: string;
  type: string;
  shopItems?: { id: string; price: string | number; currency?: string; itemId?: string | null; enchantmentId?: string | null; classId?: string | null; requiredLevel?: number; class?: { name: string; slug: string } | null; item: { id: string; name: string; description: string; type: string; rarity: string; icon?: string | null; attackSpeedMs?: number; dps?: number; requiredVip?: boolean } | null; enchantment?: { name: string; slug: string; description: string; icon?: string | null; requiredVip?: boolean } | null }[];
  quests?: { id: string; title: string; description: string; requiredLevel: number; requiredRank: number; requiredQuestIds?: string | null; xpReward: string | number; goldReward: string | number }[];
}

interface QuestProgressEntry {
  questId: string;
  status: "active" | "completed" | "claimed";
}

interface RaidStatusEntry {
  map: MapType;
  attemptsUsed: number;
  maxAttempts: number;
  resetsInMs: number;
}

interface CraftRecipe {
  id: string;
  name: string;
  description: string;
  resultItemId: string;
  resultQuantity: number;
  requiredLevel: number;
  ingredients: string;
  isActive: boolean;
  resultItem?: { name: string } | null;
}

function parseIngredients(raw: string): { itemName: string; quantity: number }[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatRaidReset(ms: number): string {
  if (ms <= 0) return "pronto";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const SHOP_TYPES = new Set(["vendor", "shop"]);
const QUEST_TYPES = new Set(["quest_giver", "quest"]);

function isShopNpc(type?: string | null) {
  return !!type && SHOP_TYPES.has(type);
}

function isQuestNpc(type?: string | null) {
  return !!type && QUEST_TYPES.has(type);
}

export function MapPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, setUser } = useAuthStore();
  const [map, setMap] = useState<MapType | null>(null);
  const [maps, setMaps] = useState<MapType[]>([]);
  const [raidStatus, setRaidStatus] = useState<Record<string, RaidStatusEntry>>({});
  const [loading, setLoading] = useState(true);
  const [npc, setNpc] = useState<NpcDetail | null>(null);
  const [npcLoading, setNpcLoading] = useState(false);
  const [questProgress, setQuestProgress] = useState<QuestProgressEntry[]>([]);
  const [buyingItemId, setBuyingItemId] = useState<string | null>(null);
  const [crafts, setCrafts] = useState<CraftRecipe[]>([]);
  const [craftingId, setCraftingId] = useState<string | null>(null);

  const refreshUser = async () => {
    try {
      const { data } = await authApi.me();
      if (data.user) setUser(data.user);
    } catch { /* ignore */ }
  };

  const loadCrafts = () => {
    craftApi.list().then(({ data }) => {
      if (Array.isArray(data)) setCrafts(data);
    }).catch(() => {});
  };

  useEffect(() => {
    loadCrafts();
  }, []);

  const craftItem = async (recipe: CraftRecipe) => {
    setCraftingId(recipe.id);
    try {
      const { data } = await craftApi.craft(recipe.id);
      toast.success(data.message || "Craftado!");
      loadCrafts();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Falha ao craftar.");
    } finally {
      setCraftingId(null);
    }
  };

  useEffect(() => {
    raidApi.status().then(({ data }) => {
      if (Array.isArray(data)) {
        const mapById: Record<string, RaidStatusEntry> = {};
        for (const entry of data) mapById[entry.map.id] = entry;
        setRaidStatus(mapById);
      }
    }).catch(() => {});
  }, []);

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

  const buyItem = async (offer: { item?: { id: string } | null; enchantment?: { name: string } | null; enchantmentId?: string | null; itemId?: string | null; price: string | number; currency?: string }) => {
    if (!npc) return;
    const isEnchantment = !!offer.enchantmentId;
    setBuyingItemId(isEnchantment ? offer.enchantmentId! : offer.itemId!);
    try {
      const payload = isEnchantment
        ? { enchantmentId: offer.enchantmentId!, quantity: 1 }
        : { itemId: offer.itemId!, quantity: 1 };
      const { data } = await npcApi.buy(npc.id, payload);
      const currency = data.currency === "diamond" ? "diamantes" : "gold";
      toast.success(`${data.quantity}x ${data.item} comprado (${data.totalPrice} ${currency})`);
      if (currency === "diamantes") refreshUser();
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
      window.dispatchEvent(new Event("quests-changed"));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to accept quest");
    }
  };

  const claimQuest = async (questId: string) => {
    try {
      const { data } = await questsApi.claim(questId);
      let msg = `Recompensa resgatada! +${data.xpGain ?? 0} XP, +${data.goldGain ?? 0} gold`;
      if (Array.isArray(data.items) && data.items.length > 0) {
        msg += ` • Itens: ${data.items.map((it: { itemName: string; quantity: number }) => `${it.quantity}x ${it.itemName}`).join(", ")}`;
      }
      toast.success(msg, { duration: 5000 });
      const { data: prog } = await questsApi.progress();
      if (Array.isArray(prog)) setQuestProgress(prog);
      window.dispatchEvent(new Event("quests-changed"));
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
          {maps.map((m) => {
            const raid = raidStatus[m.id];
            const isRaid = m.type === "raid";
            return (
              <Link key={m.id} to={`/map/${m.slug}`} className="card-hover block p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-lg">{m.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{m.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {isRaid && (
                      <span className="text-[10px] px-2 py-0.5 bg-red-500/15 text-red-400 rounded-md font-bold tracking-wider flex items-center gap-1">
                        <Swords size={10} /> RAID
                      </span>
                    )}
                    <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-md whitespace-nowrap">Lv.{m.requiredLevel}+</span>
                  </div>
                </div>
                {isRaid && raid && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-red-400">Tentativas: {raid.attemptsUsed}/{raid.maxAttempts}</span>
                    <span className="text-gray-500">• Reset em {formatRaidReset(raid.resetsInMs)}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                  <span className="px-2 py-0.5 bg-dark-700 rounded-md capitalize">{m.region}</span>
                  <span className="flex items-center gap-1"><Skull size={12} /> {m.monsters?.length || 0} monstros</span>
                  <span className="flex items-center gap-1"><ScrollText size={12} /> {m.npcs?.length || 0} NPCs</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  if (!map) return <div className="text-center py-12 text-gray-400">Map not found</div>;

  const raid = raidStatus[map.id];
  const isRaid = map.type === "raid";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/map" className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            {map.name}
            {isRaid && (
              <span className="text-[10px] px-2 py-0.5 bg-red-500/15 text-red-400 rounded-md font-bold tracking-wider flex items-center gap-1">
                <Swords size={10} /> RAID
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-400">{map.description}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-dark-700 rounded-md">{map.region}</span>
          <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-md">Lv.{map.requiredLevel}+</span>
        </div>
      </div>

      {isRaid && (
        <div className={`panel p-4 border ${raid && raid.attemptsUsed >= raid.maxAttempts ? "border-red-500/40 bg-red-500/5" : "border-red-500/20 bg-red-500/5"}`}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Swords size={18} className="text-red-400" />
              <p className="font-display font-semibold text-sm">Tentativas de raid</p>
            </div>
            {raid ? (
              <>
                <span className="text-sm text-red-300 font-mono">
                  {raid.attemptsUsed} / {raid.maxAttempts} usadas
                </span>
                <span className="text-xs text-gray-400">
                  Reset em <span className="text-purple-300 font-mono">{formatRaidReset(raid.resetsInMs)}</span>
                </span>
                {raid.attemptsUsed >= raid.maxAttempts && (
                  <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded-md">
                    Tentativas esgotadas — volte após o reset!
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-500">Status indisponível</span>
            )}
          </div>
        </div>
      )}

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
                    {isShopNpc(mn.npc.type) ? <Store size={16} className="text-cyan-400" /> :
                     isQuestNpc(mn.npc.type) ? <ScrollText size={16} className="text-green-400" /> :
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

            {isShopNpc(npc.type) && (
              <div className="space-y-2">
                {npc.shopItems && npc.shopItems.length > 0 ? (
                  npc.shopItems.map((offer) => {
                    const isEnchantment = !!offer.enchantmentId;
                    const label = isEnchantment ? offer.enchantment?.name ?? "Encantamento" : offer.item?.name ?? "-";
                    const description = isEnchantment ? offer.enchantment?.description ?? "" : offer.item?.description ?? "";
                    return (
                      <div key={offer.id} className="card p-3 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden ${isEnchantment ? "bg-purple-500/20" : "bg-dark-700"}`}>
                          {isEnchantment ? (
                            offer.enchantment?.icon ? (
                              <img src={offer.enchantment.icon} alt="" className="w-full h-full object-contain p-0.5" style={{ imageRendering: "pixelated" }} />
                            ) : (
                              <ShoppingBag size={16} className="text-purple-400" />
                            )
                          ) : offer.item?.icon ? (
                            <img src={offer.item.icon} alt="" className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
                          ) : (
                            <ShoppingBag size={16} className="text-cyan-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {label}
                            {isEnchantment && <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 align-middle">encantamento</span>}
                          </p>
                          <p className="text-[11px] text-gray-500 line-clamp-1">{description}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {!isEnchantment && offer.item?.type === "weapon" && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/15 text-orange-300 rounded-md">
                                DPS {Number(offer.item.dps || 0).toLocaleString()} · {Number(offer.item.attackSpeedMs) > 0 ? `${(Number(offer.item.attackSpeedMs) / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}s` : "vel. da classe"}
                              </span>
                            )}
                            {offer.item?.requiredVip && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/15 text-yellow-300 rounded-md flex items-center gap-1">
                                <Crown size={9} /> VIP
                              </span>
                            )}
                            {offer.enchantment?.requiredVip && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/15 text-yellow-300 rounded-md flex items-center gap-1">
                                <Crown size={9} /> VIP
                              </span>
                            )}
                            {offer.class && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/15 text-purple-300 rounded-md flex items-center gap-1">
                                <Shield size={9} /> Classe: {offer.class.name}
                              </span>
                            )}
                            {Number(offer.requiredLevel) > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/15 text-yellow-300 rounded-md">
                                Nv. {offer.requiredLevel}+
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm text-yellow-400">
                            {Number(offer.price).toLocaleString()} {offer.currency === "diamond" ? "💎" : "gold"}
                          </p>
                          {offer.currency === "diamond" && (
                            <p className="text-[10px] text-cyan-400/80">diamantes</p>
                          )}
                          <button
                            onClick={() => buyItem(offer)}
                            disabled={buyingItemId === (isEnchantment ? offer.enchantmentId : offer.itemId)}
                            className="btn-secondary text-xs px-3 py-1 mt-1 disabled:opacity-50"
                          >
                            {buyingItemId === (isEnchantment ? offer.enchantmentId : offer.itemId) ? "..." : "Comprar"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">Esta loja está vazia.</p>
                )}
              </div>
            )}

            {isShopNpc(npc.type) && crafts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-dark-700">
                <h3 className="font-display font-semibold text-sm mb-2 flex items-center gap-2">
                  <Hammer size={14} className="text-orange-400" /> Craftar
                </h3>
                <div className="space-y-2">
                  {crafts.map((recipe) => {
                    const ings = parseIngredients(recipe.ingredients);
                    return (
                      <div key={recipe.id} className="card p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0">
                          <Hammer size={16} className="text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{recipe.resultItem?.name ?? "Item"} <span className="text-gray-500">x{recipe.resultQuantity}</span></p>
                          <p className="text-[11px] text-gray-500 line-clamp-1">{recipe.description}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {Number(recipe.requiredLevel) > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/15 text-yellow-300 rounded-md">
                                Nv. {recipe.requiredLevel}+
                              </span>
                            )}
                            {ings.map((ing, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-dark-700 text-gray-300 rounded-md">
                                {ing.quantity}x {ing.itemName}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => craftItem(recipe)}
                          disabled={craftingId === recipe.id}
                          className="btn-secondary text-xs px-3 py-1 mt-1 shrink-0 disabled:opacity-50"
                        >
                          {craftingId === recipe.id ? "..." : "Craftar"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isQuestNpc(npc.type) && (
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
                              {q.requiredRank > 1 && <> • <span className="text-orange-400">Rank {q.requiredRank}+</span></>}
                              {q.requiredQuestIds && (
                                <span className="flex items-center gap-1 text-sky-400">
                                  <Lock size={10} /> Cadeia: complete a quest anterior
                                </span>
                              )}
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

            {npc.type && !isShopNpc(npc.type) && !isQuestNpc(npc.type) && (
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
