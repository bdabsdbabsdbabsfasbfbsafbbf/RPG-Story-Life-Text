import { useEffect, useState } from "react";
import { inventoryApi, classesApi, authApi } from "../services/api";
import { InventoryItem } from "../types";
import { Backpack, Search, Filter, ArrowUpDown, Star, Swords, Check } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const rarityOrder: Record<string, number> = {
  common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, mythic: 5, artifact: 6,
};

const rarityColors: Record<string, string> = {
  common: "text-gray-400 border-gray-600",
  uncommon: "text-green-400 border-green-500/30",
  rare: "text-blue-400 border-blue-500/30",
  epic: "text-purple-400 border-purple-500/30",
  legendary: "text-orange-400 border-orange-500/30",
  mythic: "text-red-400 border-red-500/30",
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
  const [switching, setSwitching] = useState(false);
  const { selectedCharacter } = useGameStore();
  const { setUser } = useAuthStore();

  useEffect(() => {
    inventoryApi.list()
      .then(({ data }) => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
            className={`card-hover text-left relative ${rarityColors[inv.item.rarity] || "border-dark-600"}`}
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
                <p className={`text-xs capitalize ${rarityColors[inv.item.rarity]?.split(" ")[0] || "text-gray-400"}`}>
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
                <p className={`text-sm capitalize ${rarityColors[selectedItem.item.rarity]?.split(" ")[0] || "text-gray-400"}`}>
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
              <button className="btn-secondary">Sell ({selectedItem.item.sellPrice}G)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
