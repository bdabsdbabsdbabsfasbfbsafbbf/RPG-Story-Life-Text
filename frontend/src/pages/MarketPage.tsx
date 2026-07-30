import { useEffect, useState } from "react";
import { marketApi } from "../services/api";
import { MarketListing } from "../types";
import { ShoppingCart, Search, Filter, TrendingUp, Clock } from "lucide-react";
import toast from "react-hot-toast";

export function MarketPage() {
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    marketApi.list().then(({ data }) => setListings(data.listings)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = listings.filter(l => !search || l.item.name.toLowerCase().includes(search.toLowerCase()));

  const handleBuy = async (id: string) => {
    try {
      await marketApi.buy(id);
      toast.success("Item purchased!");
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Purchase failed");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <ShoppingCart size={24} className="text-orange-400" /> Market
        </h1>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings..." className="input-rpg pl-9" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(listing => (
          <div key={listing.id} className="card">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center">
                <TrendingUp size={22} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{listing.item.name}</p>
                <p className="text-xs text-gray-500 capitalize">{listing.item.rarity} • {listing.item.type}</p>
                <p className="text-xs text-gray-500">Seller: {listing.seller.displayName}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold font-mono text-yellow-400">{Number(listing.price).toLocaleString()} G</span>
              <button onClick={() => handleBuy(listing.id)} className="btn-primary text-sm">Buy</button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
          <p>No listings found</p>
        </div>
      )}
    </div>
  );
}
