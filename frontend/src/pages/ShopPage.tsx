import { useEffect, useState } from "react";
import { shopApi, authApi } from "../services/api";
import { ShoppingBag, Gem, Crown, Trophy, Coins } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

interface ShopProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: "diamond_pack" | "vip" | "pass_premium";
  currency: "diamond" | "money";
  price: number;
  diamondAmount: number;
  vipDays: number;
  icon?: string | null;
}

const typeMeta: Record<ShopProduct["type"], { label: string; icon: any; color: string }> = {
  diamond_pack: { label: "Diamantes", icon: Gem, color: "text-cyan-400" },
  vip: { label: "VIP", icon: Crown, color: "text-yellow-400" },
  pass_premium: { label: "Passe Premium", icon: Trophy, color: "text-purple-400" },
};

export function ShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<ShopProduct | null>(null);
  const [buying, setBuying] = useState(false);
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    shopApi
      .list()
      .then(({ data }) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const refreshUser = async () => {
    try {
      const { data } = await authApi.me();
      if (data) setUser(data);
    } catch {}
  };

  const handlePurchase = async () => {
    if (!confirm) return;
    setBuying(true);
    try {
      const { data } = await shopApi.purchase(confirm.id);
      toast.success(`Compra realizada! ${data.detail}`);
      if (data.note) toast(data.note, { icon: "🛒" });
      setConfirm(null);
      refreshUser();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Falha na compra");
    } finally {
      setBuying(false);
    }
  };

  const vipActive = !!user?.vipUntil && new Date(user.vipUntil).getTime() > Date.now();

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const groups = ["diamond_pack", "vip", "pass_premium"]
    .map((type) => ({ type: type as ShopProduct["type"], items: products.filter((p) => p.type === type) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <ShoppingBag size={24} className="text-purple-400" /> Loja
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1.5 bg-dark-800 border border-dark-600 rounded-lg px-3 py-1.5">
            <Gem size={14} className="text-cyan-400" /> {user?.diamonds ?? 0}
          </span>
          {vipActive ? (
            <span className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-lg px-3 py-1.5">
              <Crown size={14} /> VIP até {new Date(user.vipUntil!).toLocaleDateString()}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-dark-800 border border-dark-600 rounded-lg px-3 py-1.5 text-gray-400">
              <Crown size={14} /> Sem VIP
            </span>
          )}
        </div>
      </div>

      {groups.map((group) => (
        <div key={group.type}>
          <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
            <GroupIcon type={group.type} /> {typeMeta[group.type].label}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.items.map((product) => {
              const meta = typeMeta[product.type];
              const Icon = meta.icon;
              const diamondPrice = product.currency === "diamond";
              const enough = diamondPrice && (user?.diamonds ?? 0) >= product.price;
              return (
                <div key={product.id} className="panel p-4 flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600/30 to-blue-600/20 border border-purple-500/20 flex items-center justify-center">
                      <Icon size={20} className={meta.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{product.name}</p>
                      {product.type === "vip" && (
                        <p className="text-[11px] text-yellow-400">+10% XP • +10% ouro</p>
                      )}
                      {product.type === "pass_premium" && (
                        <p className="text-[11px] text-purple-400">Temporada atual</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-4 flex-1">{product.description}</p>
                  <button
                    onClick={() => setConfirm(product)}
                    className={`w-full text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
                      diamondPrice
                        ? enough
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90"
                          : "bg-dark-700 text-gray-500"
                        : "btn-primary"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      {diamondPrice ? <Gem size={14} className="text-cyan-300" /> : <Coins size={14} />}
                      {diamondPrice ? `${product.price} 💎` : `R$ ${(product.price / 100).toFixed(2)}`}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {groups.length === 0 && (
        <div className="panel p-8 text-center text-gray-500">
          <ShoppingBag size={48} className="mx-auto mb-3 opacity-50" />
          <p>Nenhum produto disponível no momento.</p>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setConfirm(null)}>
          <div className="panel p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-display font-bold mb-2">Confirmar compra</h3>
            <p className="text-sm text-gray-400 mb-4">{confirm.name}</p>
            <div className="bg-dark-800/50 rounded-lg p-3 mb-4 text-sm">
              {confirm.type === "vip" && (
                <p className="text-yellow-300 flex items-center gap-1.5"><Crown size={14} /> {confirm.vipDays} dias de VIP (bônus ativos durante o período)</p>
              )}
              {confirm.type === "diamond_pack" && (
                <p className="text-cyan-300 flex items-center gap-1.5"><Gem size={14} /> +{confirm.diamondAmount} diamantes</p>
              )}
              {confirm.type === "pass_premium" && (
                <p className="text-purple-300 flex items-center gap-1.5"><Trophy size={14} /> Passe Premium da temporada</p>
              )}
              <p className="text-gray-400 mt-2 flex items-center gap-1.5">
                {confirm.currency === "diamond" ? <Gem size={14} /> : <Coins size={14} />}
                Custo: {confirm.currency === "diamond" ? `${confirm.price} diamantes` : `R$ ${(confirm.price / 100).toFixed(2)}`}
              </p>
              {confirm.currency === "diamond" && (user?.diamonds ?? 0) < confirm.price && (
                <p className="text-red-400 text-xs mt-2">Saldo insuficiente de diamantes.</p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirm(null)} className="btn-secondary flex-1">Cancelar</button>
              <button
                onClick={handlePurchase}
                disabled={buying || (confirm.currency === "diamond" && (user?.diamonds ?? 0) < confirm.price)}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {buying ? "Comprando..." : "Comprar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupIcon({ type }: { type: ShopProduct["type"] }) {
  const Icon = typeMeta[type].icon;
  return <Icon size={16} className={typeMeta[type].color} />;
}
