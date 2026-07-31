import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { connectSocket, disconnectSocket } from "../../services/socket";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ChatPanel } from "./ChatPanel";
import { CombatHUD } from "../Combat/CombatHUD";
import { useGameStore } from "../../store/gameStore";

export function GameLayout() {
  const { user, logout, accessToken } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const combat = useGameStore((s) => s.combat);

  useEffect(() => {
    if (!accessToken) return;
    connectSocket(accessToken);
    return () => disconnectSocket();
  }, [accessToken]);

  return (
    <div className="h-screen flex flex-col bg-dark-950 overflow-hidden">
      <TopBar
        user={user}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleChat={() => setChatOpen(!chatOpen)}
        onLogout={logout}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>

        {chatOpen && <ChatPanel />}
      </div>

      {combat && combat.state === "active" && <CombatHUD combat={combat} />}
    </div>
  );
}
