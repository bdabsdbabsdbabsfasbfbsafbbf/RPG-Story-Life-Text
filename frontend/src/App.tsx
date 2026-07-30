import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import GameLayout from './components/layout/GameLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import InventoryPage from './pages/InventoryPage';
import EquipmentPage from './pages/EquipmentPage';
import ClassesPage from './pages/ClassesPage';
import ClassDetailPage from './pages/ClassDetailPage';
import SkillsPage from './pages/SkillsPage';
import QuestsPage from './pages/QuestsPage';
import GuildPage from './pages/GuildPage';
import MarketPage from './pages/MarketPage';
import MailPage from './pages/MailPage';
import ShopPage from './pages/ShopPage';
import CombatPage from './pages/CombatPage';
import SettingsPage from './pages/SettingsPage';
import AuthCallback from './pages/AuthCallback';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/" element={<ProtectedRoute><GameLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="map/:slug" element={<MapPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="equipment" element={<EquipmentPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="classes/:slug" element={<ClassDetailPage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="quests" element={<QuestsPage />} />
        <Route path="guild" element={<GuildPage />} />
        <Route path="market" element={<MarketPage />} />
        <Route path="mail" element={<MailPage />} />
        <Route path="shop/:npcSlug" element={<ShopPage />} />
        <Route path="combat" element={<CombatPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
