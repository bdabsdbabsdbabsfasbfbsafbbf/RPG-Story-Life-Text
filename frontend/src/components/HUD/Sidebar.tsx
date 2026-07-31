import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import styles from './Sidebar.module.css';

const navItems = [
  { path: '/', label: 'Mapa', icon: '🗺' },
  { path: '/inventory', label: 'Inventário', icon: '🎒' },
  { path: '/equipment', label: 'Equipamentos', icon: '⚔' },
  { path: '/classes', label: 'Classes', icon: '📜' },
  { path: '/skills', label: 'Skills', icon: '⚡' },
  { path: '/quests', label: 'Missões', icon: '📋' },
  { path: '/market', label: 'Mercado', icon: '🏪' },
  { path: '/guild', label: 'Guilda', icon: '🏰' },
  { path: '/party', label: 'Party', icon: '👥' },
  { path: '/settings', label: 'Config', icon: '⚙' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>R</span>
          <span className={styles.logoText}>RPG Story Life</span>
        </div>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.avatar ? (
              <img src={user.avatar} alt="" className={styles.avatarImg} />
            ) : (
              <span className={styles.avatarPlaceholder}>
                {user?.username?.charAt(0)?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div className={styles.userName}>{user?.username || 'Player'}</div>
          <div className={styles.userRole}>{user?.role || 'player'}</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <button onClick={logout} className={styles.logoutBtn}>
          Sair
        </button>
      </div>
    </aside>
  );
}
