import { useEffect, useState } from "react";
import { inventoryApi, classesApi, authApi, marketApi } from "../services/api";
import { InventoryItem } from "../types";
import { Backpack, Search, Filter, ArrowUpDown, Star, Swords, Check, Lock, Coins } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const rarityOrder: Record<string, number> = {
  common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, mythic: 5, artifact: 6,
};

interface UnlockedClass {
  id: string;
  rank: number;
  isActive: boolean;
  gameClass: { id: string; name: string; slug: string; role: string };
}

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [classes, setClasses] = useState<UnlockedClass[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [switching, setSwitching] = useState(false);
  const [selling, setSelling] = useState(false);
  const [listing, setListing] = useState(false);
  const [listPrice, setListPrice] = useState(0);
  const [listQty, setListQty] = useState(1);
  const { selectedCharacter } = useGameStore();
  const { setUser } = useAuthStore();

  useEffect(() => {
    classesApi.list()
      .then(({ data }) => setCatalog(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const loadItems = () => {
    inventoryApi.list()
      .then(({ data }) => setItems(data))
      .catch(() => {});
  };

  useEffect(() => {
    inventoryApi.list()
      .then(({ data }) => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const refreshUser = async () => {
    try {
      const { data } = await authApi.me();
      if (data) setUser(data);
    } catch {}
  };

  const handleSellNow = async () => {
    if (!selectedItem) return;
    setSelling(true);
    try {
      await marketApi.sellNow({ inventoryId: selectedItem.id });
      toast.success(`Vendido por ${selectedItem.item.sellPrice}G!`);
      setSelectedItem(null);
      loadItems();
      refreshUser();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Falha ao vender");
    } finally {
      setSelling(false);
    }
  };

  const handleList = async () => {
    if (!selectedItem || listPrice <= 0) return;
    setSelling(true);
    try {
      await marketApi.sell({
        inventoryId: selectedItem.id,
        price: listPrice,
        quantity: selectedItem.quantity > 1 ? listQty : undefined,
      });
      toast.success("Item anunciado no mercado!");
      setSelectedItem(null);
      setListing(false);
      loadItems();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Falha ao anunciar");
    } finally {
      setSelling(false);
    }
  };

  const loadClasses = () => {
    if (!selectedCharacter?.id) return;
    classesApi.listClasses(selectedCharacter.id)
      .then(({ data }) => setClasses(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadClasses();
  }, [selectedCharacter?.id]);

  const handleEquipClass = async (classId: string) => {
    if (!selectedCharacter) return;
    setSwitching(true);
    try {
      await classesApi.switchClass(selectedCharacter.id, classId);
      toast.success("Classe equipada!");
      loadClasses();
      const { data } = await authApi.me();
      if (data) setUser(data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Falha ao equipar classe");
    } finally {
      setSwitching(false);
    }
  };

  const filtered = items
    .filter(i => filterType === "all" || i.item.type === filterType)
    .filter(i => !search || i.item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (rarityOrder[b.item.rarity] || 0) - (rarityOrder[a.item.rarity] || 0));

  const types = ["all", ...new Set(items.map(i => i.item.type))];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Backpack size={24} className="text-purple-400" /> Inventory
          <span className="text-sm text-gray-500 font-normal">({items.length} items)</span>
        </h1>
      </div>

      {classes.length > 0 && (
        <div className="panel p-4">
          <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
            <Swords size={16} className="text-blue-400" /> Classes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {classes.map((p) => {
              const equipped = !!p.isActive;
              return (
                <div key={p.id} className={`card-hover p-3 flex items-center justify-between gap-3 ${equipped ? "border-purple-500/40" : ""}`}>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{p.gameClass?.name}</p>
                    <p className="text-[11px] text-gray-500 capitalize">
                      {p.gameClass?.role} • Rank {p.rank}
                    </p>
                  </div>
                  {equipped ? (
                    <span className="flex items-center gap-1 text-xs text-purple-400 px-2 py-1 shrink-0">
                      <Check size={13} /> Equipada
                    </span>
                  ) : (
                    <button
                      onClick={() => handleEquipClass(p.gameClass?.id)}
                      disabled={switching}
                      className="btn-primary text-xs px-3 py-1.5 shrink-0 disabled:opacity-50"
                    >
                      {switching ? "Equipando..." : "Equipar"}
                    </button>
                  )}
                </div>
              );
            })}
            {catalog
              .filter((c) => !classes.some((p) => p.gameClass?.id === c.id))
              .map((c) => {
                const lockedLevel = c.requiredLevel > 1 && (selectedCharacter?.level ?? 0) < c.requiredLevel;
                return (
                  <div key={c.id} className="card-hover p-3 flex items-center justify-between gap-3 opacity-70">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate flex items-center gap-1.5">
                        {lockedLevel ? <Lock size={12} className="text-gray-500" /> : null}
                        {c.name}
                      </p>
                      <p className="text-[11px] text-gray-500 capitalize">{c.role}</p>
                    </div>
                    {lockedLevel ? (
                      <span className="text-xs text-yellow-500 px-2 py-1 shrink-0 whitespace-nowrap">
                        Requer Lv.{c.requiredLevel}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEquipClass(c.id)}
                        disabled={switching}
                        className="btn-primary text-xs px-3 py-1.5 shrink-0 disabled:opacity-50"
                      >
                        {switching ? "Equipando..." : "Equipar"}
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search items..."
            className="input-rpg pl-9"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                filterType === type
                  ? "bg-purple-600 text-white"
                  : "bg-dark-700 text-gray-400 hover:text-gray-200"
              }`}
            >
              {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(inv => (
          <button
            key={inv.id}
            onClick={() => setSelectedItem(inv)}
            className={`card-hover text-left relative border-rarity-${inv.item.rarity || "common"} border`}
          >
            {inv.isEquipped && (
              <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded font-bold">
                EQUIPPED
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
                inv.item.rarity === "rare" ? "from-blue-600 to-purple-600" :
                inv.item.rarity === "epic" ? "from-purple-600 to-pink-600" :
                inv.item.rarity === "legendary" ? "from-orange-500 to-yellow-500" :
                inv.item.rarity === "mythic" ? "from-red-500 to-purple-600" :
                "from-dark-600 to-dark-500"
              } flex items-center justify-center`}>
                <Star size={22} className="text-white/80" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{inv.item.name}</p>
                <p className={`text-xs capitalize text-rarity-${inv.item.rarity || "common"}`}>
                  {inv.item.rarity}
                </p>
                <p className="text-xs text-gray-500 capitalize">{inv.item.type} {inv.item.level > 1 ? `• Lv.${inv.item.level}` : ""}</p>
                {inv.quantity > 1 && (
                  <p className="text-xs text-gray-500">x{inv.quantity}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Backpack size={48} className="mx-auto mb-3 opacity-50" />
          <p>No items found</p>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
          <div className="panel p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${
                selectedItem.item.rarity === "rare" ? "from-blue-600 to-purple-600" :
                selectedItem.item.rarity === "epic" ? "from-purple-600 to-pink-600" :
                "from-dark-600 to-dark-500"
              } flex items-center justify-center`}>
                <Star size={32} className="text-white/80" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-display font-bold">{selectedItem.item.name}</h3>
                <p className={`text-sm capitalize text-rarity-${selectedItem.item.rarity || "common"}`}>
                  {selectedItem.item.rarity} {selectedItem.item.type}
                </p>
                <p className="text-sm text-gray-400 mt-1">{selectedItem.item.description}</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-gray-500 hover:text-gray-300">✕</button>
            </div>

            {selectedItem.item.stats && (
              <div className="bg-dark-800/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-2">Stats</p>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  {Object.entries(JSON.parse(selectedItem.item.stats) as Record<string, number>).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                      <span className="font-mono text-green-400">+{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {listing ? (
              <div className="bg-dark-800/50 rounded-lg p-3 mb-4 space-y-3">
                <p className="text-xs text-gray-400">Anunciar no mercado</p>
                <input
                  type="number"
                  min={1}
                  value={listPrice || ""}
                  onChange={e => setListPrice(parseInt(e.target.value) || 0)}
                  placeholder="Preço (ouro)"
                  className="input-rpg"
                />
                {selectedItem.quantity > 1 && (
                  <input
                    type="number"
                    min={1}
                    max={selectedItem.quantity}
                    value={listQty}
                    onChange={e => setListQty(Math.min(selectedItem.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                    placeholder={`Quantidade (máx. ${selectedItem.quantity})`}
                    className="input-rpg"
                  />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleList}
                    disabled={selling || listPrice <= 0}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {selling ? "Anunciando..." : "Confirmar anúncio"}
                  </button>
                  <button onClick={() => setListing(false)} className="btn-secondary">Voltar</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    // TODO: implement equip
                    setSelectedItem(null);
                  }}
                  className="btn-primary flex-1"
                >
                  {selectedItem.isEquipped ? "Unequip" : "Equip"}
                </button>
                <button
                  onClick={handleSellNow}
                  disabled={selling || !selectedItem.item.isSellable}
                  title={selectedItem.item.isSellable ? undefined : "Item não pode ser vendido"}
                  className="btn-secondary flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Coins size={14} /> {selling ? "Vendendo..." : `Vender (${selectedItem.item.sellPrice}G)`}
                </button>
              </div>
            )}

            {!listing && selectedItem.item.isTradable && (
              <button
                onClick={() => {
                  setListPrice(selectedItem.item.sellPrice * 3 || 1);
                  setListQty(1);
                  setListing(true);
                }}
                className="mt-2 w-full text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Anunciar no mercado
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
