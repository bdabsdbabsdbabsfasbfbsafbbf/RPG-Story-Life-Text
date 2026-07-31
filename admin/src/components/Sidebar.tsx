import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sword,
  Users,
  Zap,
  Skull,
  Map,
  Bot,
  ScrollText,
  Box,
  Calendar,
  Activity,
  Wrench,
  Shield,
  Swords,
  Medal,
  Trophy,
  FlaskConical,
  VenetianMask,
  LogOut,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  {
    to: '#',
    icon: <Sword size={18} />,
    label: 'Game Content',
    children: [
      { to: '/items', icon: <Box size={16} />, label: 'Items' },
      { to: '/classes', icon: <Users size={16} />, label: 'Classes' },
      { to: '/skills', icon: <Zap size={16} />, label: 'Skills' },
      { to: '/monsters', icon: <Skull size={16} />, label: 'Monsters/Bosses' },
      { to: '/maps', icon: <Map size={16} />, label: 'Maps' },
      { to: '/npcs', icon: <Bot size={16} />, label: 'NPCs' },
      { to: '/quests', icon: <ScrollText size={16} />, label: 'Quests' },
      { to: '/loot-tables', icon: <Box size={16} />, label: 'Loot Tables' },
      { to: '/events', icon: <Calendar size={16} />, label: 'Events' },
      { to: '/buffs', icon: <Activity size={16} />, label: 'Buffs/Debuffs' },
      { to: '/crafting', icon: <Wrench size={16} />, label: 'Crafting' },
      { to: '/titles', icon: <Medal size={16} />, label: 'Titles' },
      { to: '/achievements', icon: <Trophy size={16} />, label: 'Achievements' },
    ],
  },
  { to: '/players', icon: <Shield size={18} />, label: 'Players' },
  { to: '/guilds', icon: <Swords size={18} />, label: 'Guilds' },
  { to: '/settings', icon: <Wrench size={18} />, label: 'System Settings' },
  { to: '/audit', icon: <VenetianMask size={18} />, label: 'Audit Log' },
];

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const [open, setOpen] = useState(true);
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
        >
          {item.icon}
          <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {open && item.children && (
          <div className="ml-4 mt-1 space-y-0.5">
            {item.children.map((child) => (
              <NavItemComponent key={child.to} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
          isActive
            ? 'bg-accent-600/20 text-accent-400 font-medium'
            : 'text-gray-400 hover:text-white hover:bg-dark-700'
        }`
      }
    >
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-dark-900 border-r border-dark-700 flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-4 border-b border-dark-700">
        <h1 className="text-lg font-bold text-accent-400 flex items-center gap-2">
          <Sword size={20} />
          RPG Story Life
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => (
          <NavItemComponent key={item.to} item={item} />
        ))}
      </nav>

      <div className="p-4 border-t border-dark-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-accent-600 flex items-center justify-center text-xs font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
