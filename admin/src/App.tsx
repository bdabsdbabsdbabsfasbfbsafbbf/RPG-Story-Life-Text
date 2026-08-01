import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import GuildSettingsPage from "./pages/GuildSettingsPage";
import SkillsPage from "./pages/SkillsPage";
import CrudPage from "./pages/CrudPage";
import { crudConfigs } from "./crudConfigs";
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        {crudConfigs.map((config) => (
          <Route
            key={config.key}
            path={`/${config.key}`}
            element={<CrudPage config={config} />}
          />
        ))}
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/guild-settings" element={<GuildSettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
