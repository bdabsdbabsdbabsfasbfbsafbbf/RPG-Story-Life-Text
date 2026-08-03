import { useState, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { authApi, redeemApi, adminApi } from "../services/api";
import { Settings, User as UserIcon, Mail, Crown, Star, TrendingUp, Zap, Calendar, Ticket, Download, Upload } from "lucide-react";
import toast from "react-hot-toast";

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [adminBusy, setAdminBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isAdmin = user?.role === "admin" || user?.role === "owner";

  const handleExport = async () => {
    setAdminBusy(true);
    try {
      const { data } = await adminApi.exportContent();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `content-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup exportado!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Falha ao exportar");
    } finally {
      setAdminBusy(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAdminBusy(true);
    try {
      const payload = JSON.parse(await file.text());
      const { data } = await adminApi.importContent(payload);
      const total = Object.values(data.counts || {}).reduce((a: number, b: any) => a + b, 0);
      toast.success(`Importado: ${total} registros!`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Arquivo inválido");
    } finally {
      setAdminBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      const { data } = await authApi.updateMe({ displayName: displayName.trim() });
      setUser(data);
      toast.success("Settings saved!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setRedeeming(true);
    try {
      const { data } = await redeemApi.redeem(code.trim().toUpperCase());
      if (user) {
        setUser({ ...user, gold: data.gold, diamonds: data.diamonds });
      }
      const classesGranted = Array.isArray(data.classes) && data.classes.length > 0
        ? ` Classe(s) desbloqueada(s): ${data.classes.join(", ")}`
        : "";
      toast.success(`Código resgatado! +${Number(data.gold).toLocaleString()} gold, +${data.diamonds} diamantes, +${Number(data.experience).toLocaleString()} XP${classesGranted}`);
      setCode("");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Código inválido");
    } finally {
      setRedeeming(false);
    }
  };

  const rows = [
    { icon: UserIcon, label: "Username", value: user?.username },
    { icon: Mail, label: "Email", value: user?.email || "-" },
    { icon: Crown, label: "Role", value: user?.role },
    { icon: Star, label: "Level", value: user?.level || 1 },
    { icon: TrendingUp, label: "Gold", value: (user?.gold ?? 0).toLocaleString() },
    { icon: Zap, label: "Diamonds", value: user?.diamonds || 0 },
    { icon: Calendar, label: "Member since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-" },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2">
        <Settings size={24} className="text-purple-400" /> Settings
      </h1>

      <div className="panel p-4 space-y-4">
        <h2 className="font-display font-semibold">Account</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3 bg-dark-800 border border-dark-600 rounded-lg px-3 py-2.5">
              <row.icon size={16} className="text-gray-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-gray-500 uppercase tracking-wide">{row.label}</p>
                <p className="text-sm truncate">{String(row.value ?? "-")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="panel p-4 space-y-3">
        <h2 className="font-display font-semibold">Display name</h2>
        <div className="flex gap-3">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input-rpg flex-1"
            maxLength={30}
            required
          />
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        <p className="text-xs text-gray-500">O nome mostrado no jogo. Máximo de 30 caracteres.</p>
      </form>

      <form onSubmit={handleRedeem} className="panel p-4 space-y-3">
        <h2 className="font-display font-semibold flex items-center gap-2">
          <Ticket size={16} className="text-yellow-400" /> Resgatar código
        </h2>
        <div className="flex gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="input-rpg flex-1 font-mono uppercase"
            placeholder="EX: BEMVINDO"
            maxLength={30}
            required
          />
          <button type="submit" disabled={redeeming} className="btn-primary">
            {redeeming ? "Resgatando..." : "Resgatar"}
          </button>
        </div>
        <p className="text-xs text-gray-500">Códigos dão gold, diamantes, XP e itens. Cada código pode ser usado uma vez.</p>
      </form>

      {isAdmin && (
        <div className="panel p-4 space-y-3">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <Crown size={16} className="text-yellow-400" /> Admin — backup de conteúdo
          </h2>
          <p className="text-xs text-gray-500">
            Exporta ou restaura todas as tabelas de conteúdo (classes, itens, monstros, mapas, quests, skills, efeitos, NPCs e drops).
          </p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={handleExport} disabled={adminBusy} className="btn-primary flex items-center gap-1.5 disabled:opacity-50">
              <Download size={14} /> {adminBusy ? "Processando..." : "Exportar backup"}
            </button>
            <button onClick={() => fileRef.current?.click()} disabled={adminBusy} className="btn-secondary flex items-center gap-1.5 disabled:opacity-50">
              <Upload size={14} /> Importar backup
            </button>
            <input ref={fileRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
          </div>
        </div>
      )}
    </div>
  );
}
