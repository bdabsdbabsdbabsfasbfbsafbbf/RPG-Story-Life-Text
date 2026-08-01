import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../api";
import { RefreshCw, ShieldCheck, ShieldOff } from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  displayName: string | null;
  email: string | null;
  role: string;
  level: number;
  gold: string | number;
  diamonds: number;
  isOnline: boolean;
  isBanned: boolean;
  createdAt: string;
  _count?: { characters: number };
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.users.list();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleAdmin = async (user: AdminUser) => {
    const newRole = user.role === "admin" ? "player" : "admin";
    try {
      await adminApi.users.update(user.id, { role: newRole });
      toast.success(`${user.username} is now ${newRole}`);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const toggleBan = async (user: AdminUser) => {
    try {
      await adminApi.users.update(user.id, { isBanned: !user.isBanned });
      toast.success(`${user.username} ${user.isBanned ? "unbanned" : "banned"}`);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update ban");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-lg text-gray-300 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Level</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Gold</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Diamonds</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Characters</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-dark-700 hover:bg-dark-800/50">
                  <td className="py-2.5 px-4">
                    <p className="font-medium text-white">{u.username}</p>
                    <p className="text-xs text-gray-500">{u.email || u.displayName || "—"}</p>
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === "admin" || u.role === "owner"
                          ? "bg-accent-500/20 text-accent-400"
                          : "bg-gray-600/20 text-gray-400"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">{u.level}</td>
                  <td className="py-2.5 px-4 font-mono">{Number(u.gold).toLocaleString()}</td>
                  <td className="py-2.5 px-4 font-mono">{u.diamonds}</td>
                  <td className="py-2.5 px-4">{u._count?.characters ?? 0}</td>
                  <td className="py-2.5 px-4">
                    <span className="flex items-center gap-1.5 text-xs">
                      <span className={`w-2 h-2 rounded-full ${u.isOnline ? "bg-green-500" : "bg-gray-600"}`} />
                      {u.isBanned ? (
                        <span className="text-red-400">Banned</span>
                      ) : u.isOnline ? (
                        <span className="text-green-400">Online</span>
                      ) : (
                        <span className="text-gray-500">Offline</span>
                      )}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-xs text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => toggleAdmin(u)}
                      className="inline-flex items-center gap-1 text-xs text-accent-400 hover:text-accent-300 mr-3"
                    >
                      {u.role === "admin" ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                      {u.role === "admin" ? "Revoke admin" : "Make admin"}
                    </button>
                    <button
                      onClick={() => toggleBan(u)}
                      className={`text-xs ${u.isBanned ? "text-green-400 hover:text-green-300" : "text-red-400 hover:text-red-300"}`}
                    >
                      {u.isBanned ? "Unban" : "Ban"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && users.length === 0 && (
            <p className="text-center text-gray-500 py-8">No users found</p>
          )}
        </div>
      </div>
    </div>
  );
}
