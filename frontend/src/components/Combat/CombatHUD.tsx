import { CombatUpdate } from "../../types";
import { Heart, Zap, Shield, Sword, Skull } from "lucide-react";

interface CombatHUDProps {
  combat: CombatUpdate;
}

export function CombatHUD({ combat }: CombatHUDProps) {
  const playerHpPercent = (combat.characterHp / 100) * 100;
  const monsterHpPercent = (combat.monsterHp / 100) * 100;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
      <div className="panel p-4 min-w-[400px] max-w-[600px]">
        <div className="grid grid-cols-2 gap-4">
          {/* Player */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-purple-400" />
              <span className="text-xs font-medium">Player</span>
            </div>
            <div className="stat-bar h-3">
              <div className="stat-bar-fill bg-gradient-to-r from-red-500 to-red-600" style={{ width: `${playerHpPercent}%` }} />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-red-400">HP</span>
              <span className="font-mono">{combat.characterHp}</span>
            </div>
          </div>

          {/* Monster */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Skull size={16} className="text-red-400" />
              <span className="text-xs font-medium">Enemy</span>
            </div>
            <div className="stat-bar h-3">
              <div className="stat-bar-fill bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${monsterHpPercent}%` }} />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-red-400">HP</span>
              <span className="font-mono">{combat.monsterHp}</span>
            </div>
          </div>
        </div>

        {combat.state !== "active" && (
          <div className="text-center mt-2 text-sm font-bold">
            {combat.state === "won" ? "Victory!" : combat.state === "lost" ? "Defeated..." : ""}
          </div>
        )}
      </div>
    </div>
  );
}
