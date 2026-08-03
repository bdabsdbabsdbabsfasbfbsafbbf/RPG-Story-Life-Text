import { User } from "../../types";
import { Menu, MessageSquare, LogOut, ChevronLeft, ChevronRight, Crown } from "lucide-react";

interface TopBarProps {
  user: User | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onToggleChat: () => void;
  onLogout: () => void;
}

export function TopBar({ user, sidebarOpen, onToggleSidebar, onToggleChat, onLogout }: TopBarProps) {
  return (
    <header className="h-14 bg-dark-900/90 backdrop-blur-md border-b border-dark-700 flex items-center px-4 gap-3 z-50">
      <button onClick={onToggleSidebar} className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
        {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
      </button>

      <div className="flex items-center gap-2 flex-1">
        <span className="font-display text-lg font-bold glow-text">RPG Story Life</span>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            {user.vipUntil && new Date(user.vipUntil).getTime() > Date.now() && (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
                <Crown size={13} className="text-yellow-400" />
                <span className="text-yellow-400 text-xs font-bold uppercase">VIP</span>
              </div>
            )}
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded-md">
              <span className="text-yellow-400 font-mono">{(user.gold ?? 0).toLocaleString()}</span>
              <span className="text-yellow-500">G</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 rounded-md">
              <span className="text-cyan-400 font-mono">{user.diamonds ?? 0}</span>
              <span className="text-cyan-500">♦</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 rounded-md">
              <span className="text-purple-400 font-mono">Lv.{user.level ?? 1}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-2 py-1 hover:bg-dark-700 rounded-lg transition-colors cursor-pointer">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                {(user.displayName || user.username)?.[0] ?? "?"}
              </div>
            )}
            <span className="text-sm">{user.displayName || user.username}</span>
          </div>

          <button onClick={onToggleChat} className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
            <MessageSquare size={18} />
          </button>

          <button onClick={onLogout} className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-red-400">
            <LogOut size={18} />
          </button>
        </div>
      )}
    </header>
  );
}
