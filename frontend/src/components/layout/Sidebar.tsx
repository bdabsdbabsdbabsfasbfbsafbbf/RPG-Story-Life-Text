import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Map, Sword, Backpack, ScrollText,
  Settings, Shield, MessageCircle, BookOpen, SlidersHorizontal,
} from "lucide-react";
import { questsApi } from "../../services/api";
import { useAuthStore } from "../../store/authStore";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { user } = useAuthStore();
  const [hasActiveQuest, setHasActiveQuest] = useState(false);

  useEffect(() => {
    questsApi
      .progress()
      .then(({ data }) => {
        const active = Array.isArray(data)
          ? data.some((p: any) => p.status === "active")
          : false;
        setHasActiveQuest(active);
      })
      .catch(() => setHasActiveQuest(false));
  }, []);

  if (!isOpen) return null;

  const isAdmin = user?.role === "admin" || user?.role === "owner" || user?.role === "developer";

  const navItems = [
    { to: "/map", icon: Map, label: "Map" },
    { to: "/classes", icon: Sword, label: "Classes" },
    { to: "/inventory", icon: Backpack, label: "Inventory" },
    ...(hasActiveQuest ? [{ to: "/quests", icon: ScrollText, label: "Quests" }] : []),
    ...(isAdmin ? [{ to: "/admin", icon: SlidersHorizontal, label: "Admin" }] : []),
  ];

  return (
    <nav className="w-56 bg-dark-900/80 backdrop-blur-md border-r border-dark-700 flex flex-col py-4 overflow-y-auto shrink-0">
      <div className="px-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-dark-800 rounded-lg border border-dark-600">
          <Shield size={16} className="text-purple-400" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">Connected</p>
            <p className="text-xs font-mono text-green-400">Server #1</p>
          </div>
        </div>
      </div>

      <div className="space-y-1 px-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-purple-600/20 to-blue-600/10 text-purple-300 border border-purple-500/20"
                : "text-gray-400 hover:text-gray-200 hover:bg-dark-800/50"
            }`
          }
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-purple-600/20 to-blue-600/10 text-purple-300 border border-purple-500/20"
                  : "text-gray-400 hover:text-gray-200 hover:bg-dark-800/50"
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="mt-auto px-2 pt-4 border-t border-dark-700">
        <div className="space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                isActive ? "text-purple-300 bg-dark-800/50" : "text-gray-400 hover:text-gray-200 hover:bg-dark-800/50"
              }`
            }
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
          <NavLink
            to="/codex"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                isActive ? "text-purple-300 bg-dark-800/50" : "text-gray-400 hover:text-gray-200 hover:bg-dark-800/50"
              }`
            }
          >
            <BookOpen size={18} />
            <span>Codex</span>
          </NavLink>
          <NavLink
            to="/support"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                isActive ? "text-purple-300 bg-dark-800/50" : "text-gray-400 hover:text-gray-200 hover:bg-dark-800/50"
              }`
            }
          >
            <MessageCircle size={18} />
            <span>Support</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
