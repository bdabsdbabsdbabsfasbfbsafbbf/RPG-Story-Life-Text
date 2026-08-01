import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getSocket } from "../services/socket";
import { useGameStore } from "../store/gameStore";
import { useAuthStore } from "../store/authStore";
import { CombatUpdate } from "../types";
import { monstersApi } from "../services/api";
import { ArrowLeft, Sword, Shield, Zap, Skull, Heart, Sparkles, Coins } from "lucide-react";
import toast from "react-hot-toast";

export function CombatPage() {
  const { monsterId } = useParams<{ monsterId: string }>();
  const navigate = useNavigate();
  const { selectedCharacter } = useGameStore();
  const { user } = useAuthStore();
  const [combat, setCombat] = useState<CombatUpdate | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [monsterInfo, setMonsterInfo] = useState<{ name: string; level: number } | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  const socket = getSocket();

  const maxHp = combat?.maxHp ?? 100;
  const maxMana = combat?.maxMana ?? 50;
  const monsterMaxHp = combat?.monsterMaxHp ?? 100;

  const characterHpPercent = combat ? Math.min(100, (combat.characterHp / maxHp) * 100) : 100;
  const characterManaPercent = combat ? Math.min(100, ((combat.characterMana ?? 0) / maxMana) * 100) : 100;
  const monsterHpPercent = combat ? Math.min(100, (combat.monsterHp / monsterMaxHp) * 100) : 100;

  const skills = useMemo(() => (combat?.skills ?? []).filter((s) => s.type !== "passive"), [combat?.skills]);

  const skillLabel = (skill: { type: string; subType?: string }) => {
    if (skill.type === "ultimate") return "Ultimate";
    if (skill.type === "passive") return "Passiva";
    return skill.subType === "heal" ? "Cura" : "Ativo";
  };

  useEffect(() => {
    if (monsterId) {
      monstersApi.get(monsterId).then(({ data }) => setMonsterInfo({ name: data.name, level: data.level })).catch(() => {});
    }
  }, [monsterId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("combat:started", (data: any) => {
      setCombat(data);
      setCombatLog([`Combate contra ${data.monsterName || "o monstro"} iniciado!`]);
      setLoading(false);
    });

    socket.on("combat:skillUsed", (data: CombatUpdate) => {
      setCombat(data);
      if (data.state === "won") {
        toast.success("Vitória!");
      } else if (data.state === "lost") {
        toast.error("Derrota!");
      }
      if (data.skillId) {
        setCooldowns((prev) => ({ ...prev, [data.skillId as string]: Date.now() }));
      }
      const log: string[] = [];
      if (data.isCritical) log.push("Acerto crítico!");
      if (data.isDodged) log.push("O ataque foi esquivado!");
      if ((data.damage ?? 0) > 0) log.push(`Você causou ${data.damage} de dano`);
      if ((data.healed ?? 0) > 0) log.push(`Você curou ${data.healed} de vida`);
      if (data.appliedBuffs?.length) log.push(`Buff aplicado: ${data.appliedBuffs.join(", ")}`);
      setCombatLog(prev => [...prev.slice(-19), ...log]);
    });

    socket.on("combat:tick", (data: CombatUpdate) => {
      setCombat((prev) => {
        if (!prev) return data as any;
        return { ...prev, ...data };
      });
      if ((data.damage ?? 0) > 0) {
        setCombatLog(prev => [...prev.slice(-19), `${data.monsterName || "Monstro"} causou ${data.damage} de dano em você`]);
      }
    });

    socket.on("combat:error", (data: any) => {
      setCombatLog(prev => [...prev, `Erro: ${data.message}`]);
      toast.error(data.message || "Erro no combate");
      setLoading(false);
    });

    return () => {
      socket.off("combat:started");
      socket.off("combat:skillUsed");
      socket.off("combat:tick");
      socket.off("combat:error");
    };
  }, [socket]);

  const startCombat = () => {
    if (!socket || !monsterId) return;
    setLoading(true);
    setCombatLog([]);
    socket.emit("combat:start", { monsterId });
  };

  const useSkill = (skillId: string) => {
    if (!socket || !combat) return;
    socket.emit("combat:useSkill", { combatId: combat.combatId, skillId });
  };

  const isOnCooldown = (skillId: string, cooldown: number) => {
    const last = cooldowns[skillId];
    if (!last) return false;
    return Date.now() - last < cooldown;
  };

  const monsterName = combat?.monsterName || monsterInfo?.name || "Monstro";
  const monsterLevel = combat?.monsterLevel || monsterInfo?.level || 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/map" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200">
        <ArrowLeft size={16} /> Voltar ao mapa
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Player Side */}
        <div className="panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold">{combat?.characterName || selectedCharacter?.name || user?.displayName || "Player"}</h2>
              <p className="text-xs text-gray-400">Level {combat?.characterLevel || selectedCharacter?.level || user?.level || 1}</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-400">HP</span>
                <span className="font-mono">{Math.max(0, combat?.characterHp ?? 100)} / {maxHp}</span>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill bg-gradient-to-r from-red-500 to-red-600" style={{ width: `${characterHpPercent}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400">Mana</span>
                <span className="font-mono">{Math.max(0, combat?.characterMana ?? 50)} / {maxMana}</span>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: `${characterManaPercent}%` }} />
              </div>
            </div>
          </div>

          {combat && combat.state === "active" && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Skills</p>
              {skills.length === 0 && (
                <p className="text-sm text-gray-500">Nenhuma skill ativa. Use o ataque básico.</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {skills.map((skill) => {
                  const cd = isOnCooldown(skill.id, skill.cooldown);
                  return (
                    <button
                      key={skill.id}
                      onClick={() => useSkill(skill.id)}
                      disabled={cd || (combat.characterMana ?? 0) < skill.manaCost}
                      className={`card-hover py-3 text-center ${cd ? "opacity-40 cursor-not-allowed" : ""}`}
                      title={skill.description}
                    >
                      {skill.type === "ultimate" ? (
                        <Zap size={18} className="mx-auto mb-1 text-yellow-400" />
                      ) : skill.healingBase > 0 ? (
                        <Heart size={18} className="mx-auto mb-1 text-green-400" />
                      ) : (
                        <Sword size={18} className="mx-auto mb-1 text-purple-400" />
                      )}
                      <span className="text-xs">{skill.name}</span>
                      <span className="text-[10px] text-gray-500 block">
                        {skill.manaCost > 0 ? `${skill.manaCost} mana · ` : ""}{cd ? "CD" : `${(skill.cooldown / 1000)}s CD`}
                      </span>
                    </button>
                  );
                })}
              </div>
              {skills.some(s => s.manaCost > 0) && (combat.characterMana ?? 0) < Math.min(...skills.filter(s => s.manaCost > 0).map(s => s.manaCost)) && (
                <p className="text-xs text-yellow-500 mt-2">Mana insuficiente para usar skills.</p>
              )}
            </div>
          )}

          {!combat && (
            <button onClick={startCombat} disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Engajando..." : "Iniciar combate"}
            </button>
          )}

          {combat && combat.state === "won" && (
            <div className="text-center py-4 space-y-3">
              <p className="text-green-400 font-bold text-lg">Vitória!</p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1"><Coins size={14} className="text-yellow-400" /> Recompensas concedidas</span>
              </div>
              <button onClick={() => navigate("/map")} className="btn-primary">Voltar ao mapa</button>
            </div>
          )}

          {combat && combat.state === "lost" && (
            <div className="text-center py-4">
              <p className="text-red-400 font-bold text-lg">Derrota</p>
              <button onClick={startCombat} className="btn-primary mt-3">Tentar novamente</button>
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
              <h2 className="font-display font-bold capitalize">{monsterName}</h2>
              <p className="text-xs text-gray-400">Level {monsterLevel} · Monstro</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-red-400">HP</span>
              <span className="font-mono">{Math.max(0, combat?.monsterHp ?? 100)} / {monsterMaxHp}</span>
            </div>
            <div className="stat-bar">
              <div className="stat-bar-fill bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${monsterHpPercent}%` }} />
            </div>
          </div>

          {combat && combat.state === "active" && (
            <div className="flex items-center gap-2 justify-center py-4">
              <Sparkles size={16} className="text-red-400 animate-pulse" />
              <span className="text-sm text-gray-400">Em combate</span>
            </div>
          )}

          {combat && combat.state === "won" && (
            <div className="flex items-center gap-2 justify-center py-4">
              <Skull size={16} className="text-gray-500" />
              <span className="text-sm text-gray-500">Derrotado</span>
            </div>
          )}
        </div>
      </div>

      {/* Combat Log */}
      {combatLog.length > 0 && (
        <div className="panel p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Log de Combate</p>
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
