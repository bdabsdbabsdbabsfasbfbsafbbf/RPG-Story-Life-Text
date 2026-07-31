import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import GameLayout from './components/layout/GameLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import InventoryPage from './pages/InventoryPage';
import ClassPage from './pages/ClassPage';
import QuestPage from './pages/QuestPage';
import GuildPage from './pages/GuildPage';
import MarketPage from './pages/MarketPage';
import CombatPage from './pages/CombatPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<ProtectedRoute><GameLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="map/:slug" element={<MapPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="classes" element={<ClassPage />} />
        <Route path="class/:slug" element={<ClassPage />} />
        <Route path="quests" element={<QuestPage />} />
        <Route path="guild" element={<GuildPage />} />
        <Route path="market" element={<MarketPage />} />
        <Route path="combat" element={<CombatPage />} />
        <Route path="combat/:monsterId" element={<CombatPage />} />
      </Route>
    </Routes>
  );
}
