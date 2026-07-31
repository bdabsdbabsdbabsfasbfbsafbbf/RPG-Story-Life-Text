import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSocket } from "../services/socket";
import { useGameStore } from "../store/gameStore";
import { useAuthStore } from "../store/authStore";
import { CombatUpdate } from "../types";
import { ArrowLeft, Sword, Shield, Zap, Skull, Heart } from "lucide-react";

export function CombatPage() {
  const { monsterId } = useParams<{ monsterId: string }>();
  const { selectedCharacter } = useGameStore();
  const { user } = useAuthStore();
  const [combat, setCombat] = useState<CombatUpdate | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("combat:started", (data: any) => {
      setCombat(data);
      setCombatLog(["Combat started!"]);
      setLoading(false);
    });

    socket.on("combat:skillUsed", (data: CombatUpdate) => {
      setCombat(data);
      const log: string[] = [];
      if (data.isCritical) log.push("Critical hit!");
      if (data.isDodged) log.push("Attack dodged!");
      if ((data.damage ?? 0) > 0) log.push(`Dealt ${data.damage} damage`);
      setCombatLog(prev => [...prev.slice(-19), ...log]);
    });

    socket.on("combat:error", (data: any) => {
      setCombatLog(prev => [...prev, `Error: ${data.message}`]);
      setLoading(false);
    });

    return () => {
      socket.off("combat:started");
      socket.off("combat:skillUsed");
      socket.off("combat:error");
    };
  }, [socket]);

  const startCombat = () => {
    if (!socket || !monsterId) return;
    setLoading(true);
    socket.emit("combat:start", { monsterId });
  };

  const useSkill = (skillId: string) => {
    if (!socket || !combat) return;
    socket.emit("combat:useSkill", { combatId: combat.combatId, skillId });
  };

  const characterHpPercent = combat ? (combat.characterHp / 100) * 100 : 100;
  const monsterHpPercent = combat ? (combat.monsterHp / 100) * 100 : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/map/battleon" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200">
        <ArrowLeft size={16} /> Back to map
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Player Side */}
        <div className="panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold">{selectedCharacter?.name || user?.displayName || "Player"}</h2>
              <p className="text-xs text-gray-400">Level {selectedCharacter?.level || user?.level || 1}</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-400">HP</span>
                <span className="font-mono">{combat?.characterHp || 100}</span>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill bg-gradient-to-r from-red-500 to-red-600" style={{ width: `${characterHpPercent}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400">Mana</span>
                <span className="font-mono">{combat?.characterMana || 50}</span>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: "50%" }} />
              </div>
            </div>
          </div>

          {combat && combat.state === "active" && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Skills</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => useSkill("shadow-strike")} className="card-hover py-3 text-center">
                  <Sword size={18} className="mx-auto mb-1 text-purple-400" />
                  <span className="text-xs">Shadow Strike</span>
                  <span className="text-[10px] text-gray-500 block">4s CD</span>
                </button>
                <button onClick={() => useSkill("shadow-dance")} className="card-hover py-3 text-center">
                  <Zap size={18} className="mx-auto mb-1 text-blue-400" />
                  <span className="text-xs">Shadow Dance</span>
                  <span className="text-[10px] text-gray-500 block">8s CD</span>
                </button>
              </div>
            </div>
          )}

          {!combat && (
            <button onClick={startCombat} disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Engaging..." : "Engage Combat"}
            </button>
          )}

          {combat && combat.state === "won" && (
            <div className="text-center py-4">
              <p className="text-green-400 font-bold text-lg">Victory!</p>
              <Link to="/map/battleon" className="btn-primary mt-3 inline-block">Return</Link>
            </div>
          )}

          {combat && combat.state === "lost" && (
            <div className="text-center py-4">
              <p className="text-red-400 font-bold text-lg">Defeated</p>
              <button onClick={startCombat} className="btn-primary mt-3">Try Again</button>
            </div>
          )}
        </div>

        {/* Monster Side */}
        <div className="panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center">
              <Skull size={24} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold">{monsterId?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</h2>
              <p className="text-xs text-gray-400">Monster</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-red-400">HP</span>
              <span className="font-mono">{combat?.monsterHp || 100}</span>
            </div>
            <div className="stat-bar">
              <div className="stat-bar-fill bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${monsterHpPercent}%` }} />
            </div>
          </div>

          {combat && combat.state === "active" && (
            <div className="flex items-center gap-2 justify-center py-4">
              <Heart size={16} className="text-red-400 animate-pulse" />
              <span className="text-sm text-gray-400">Engaged</span>
            </div>
          )}
        </div>
      </div>

      {/* Combat Log */}
      {combatLog.length > 0 && (
        <div className="panel p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Combat Log</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {combatLog.map((log, i) => (
              <p key={i} className="text-sm text-gray-300 font-mono">
                {log}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
