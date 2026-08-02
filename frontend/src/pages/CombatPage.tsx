import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getSocket } from "../services/socket";
import { useGameStore } from "../store/gameStore";
import { useAuthStore } from "../store/authStore";
import { CombatUpdate } from "../types";
import { charactersApi, monstersApi } from "../services/api";
import { ArrowLeft, Sword, Shield, Zap, Skull, Heart, Sparkles, Coins, Lock, Star } from "lucide-react";
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
  const [classRank, setClassRank] = useState(1);

  const socket = getSocket();

  const maxHp = combat?.maxHp ?? selectedCharacter?.class?.baseHp ?? 100;
  const maxMana = combat?.maxMana ?? selectedCharacter?.class?.baseMana ?? 50;
  const monsterMaxHp = combat?.monsterMaxHp ?? 100;

  const characterHpPercent = Math.min(100, ((combat?.characterHp ?? maxHp) / maxHp) * 100);
  const characterManaPercent = Math.min(100, ((combat?.characterMana ?? maxMana) / maxMana) * 100);
  const monsterHpPercent = Math.min(100, ((combat?.monsterHp ?? monsterMaxHp) / monsterMaxHp) * 100);

  const skills = useMemo(() => (combat?.skills ?? []).filter((s) => s.type !== "passive"), [combat?.skills]);
  const autoSkill = skills.find((s) => s.type === "auto");
  const usableSkills = skills.filter((s) => s.type !== "auto");

  useEffect(() => {
    charactersApi.my().then(({ data }) => {
      const rank = data?.classProgress?.[0]?.rank;
      if (rank) setClassRank(rank);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (monsterId) {
      monstersApi.get(monsterId).then(({ data }) => setMonsterInfo({ name: data.name, level: data.level })).catch(() => {});
    }
  }, [monsterId]);

  useEffect(() => {
    if (!monsterId) return;
    let started = false;
    const start = (s: any) => {
      if (started || !s?.connected) return;
      started = true;
      s.emit("combat:start", { monsterId });
    };
    const interval = setInterval(() => {
      const s = getSocket();
      if (!s) return;
      if (s.connected) {
        clearInterval(interval);
        start(s);
        return;
      }
      s.once("connect", () => {
        clearInterval(interval);
        start(s);
      });
    }, 300);
    return () => clearInterval(interval);
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
      if (data.state === "won" && data.rewards) {
        log.push(`Recompensas: +${data.rewards.xpGain ?? 0} XP, +${data.rewards.goldGain ?? 0} gold${data.rewards.levelUps ? `, LEVEL UP x${data.rewards.levelUps}!` : ""}`);
      }
      setCombatLog(prev => [...prev.slice(-19), ...log]);
    });

    socket.on("combat:tick", (data: CombatUpdate) => {
      setCombat((prev) => {
        if (!prev) return data as any;
        return { ...prev, ...data };
      });
      const log: string[] = [];
      if ((data.playerDamage ?? 0) > 0) {
        log.push(`Seu ${data.playerSkillName || "ataque automático"} causou ${data.playerDamage} de dano`);
      }
      if ((data.damage ?? 0) > 0) {
        log.push(`${data.monsterName || "Monstro"} causou ${data.damage} de dano em você`);
      }
      if (data.state === "won" && data.rewards) {
        log.push(`Vitória! +${data.rewards.xpGain ?? 0} XP, +${data.rewards.goldGain ?? 0} gold${data.rewards.levelUps ? `, LEVEL UP x${data.rewards.levelUps}!` : ""}`);
      }
      if (log.length) setCombatLog(prev => [...prev.slice(-19), ...log]);
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
    const s = getSocket();
    if (!s || !monsterId) return;
    setLoading(true);
    setCombatLog([]);
    s.emit("combat:start", { monsterId });
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
    <div className="min-h-full flex flex-col pb-40 animate-fade-in">
      <Link to="/map" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 mb-4">
        <ArrowLeft size={16} /> Voltar ao mapa
      </Link>

      {/* ===== TOPO: vida e mana ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Player */}
        <div className="panel p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold">{combat?.characterName || selectedCharacter?.name || user?.displayName || "Player"}</h2>
              <p className="text-xs text-gray-400">
                Level {combat?.characterLevel || selectedCharacter?.level || user?.level || 1}
                {selectedCharacter?.class?.name && <> • {selectedCharacter.class.name}</>}
                {selectedCharacter?.race?.name && <> • {selectedCharacter.race.name}</>}
                {selectedCharacter?.trait?.name && <> • {selectedCharacter.trait.name}</>}
              </p>
            </div>
            <span className="ml-auto flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <Star size={12} /> Rank {classRank}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-400">HP</span>
                <span className="font-mono">{Math.max(0, combat?.characterHp ?? maxHp)} / {maxHp}</span>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill bg-gradient-to-r from-red-500 to-red-600" style={{ width: `${characterHpPercent}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400">Mana</span>
                <span className="font-mono">{Math.max(0, combat?.characterMana ?? maxMana)} / {maxMana}</span>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: `${characterManaPercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Monster */}
        <div className="panel p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center">
              <Skull size={24} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold capitalize">{monsterName}</h2>
              <p className="text-xs text-gray-400">Level {monsterLevel} • Monstro</p>
            </div>
            {combat && combat.state === "active" && (
              <span className="ml-auto flex items-center gap-2 text-sm text-red-400">
                <Sparkles size={14} className="animate-pulse" /> Em combate
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-400">HP</span>
                <span className="font-mono">{Math.max(0, combat?.monsterHp ?? monsterMaxHp)} / {monsterMaxHp}</span>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${monsterHpPercent}%` }} />
              </div>
            </div>
          </div>

          {combat && combat.state === "won" && (
            <div className="mt-4 text-center py-3 space-y-2">
              <p className="text-green-400 font-bold text-lg">Vitória!</p>
              {combat.rewards && (
                <p className="text-sm text-gray-300 flex items-center justify-center gap-3">
                  <span className="flex items-center gap-1"><Sparkles size={14} className="text-purple-400" /> +{combat.rewards.xpGain ?? 0} XP</span>
                  <span className="flex items-center gap-1"><Coins size={14} className="text-yellow-400" /> +{combat.rewards.goldGain ?? 0} gold</span>
                </p>
              )}
              <button onClick={() => navigate("/map")} className="btn-primary mt-1">Voltar ao mapa</button>
            </div>
          )}

          {combat && combat.state === "lost" && (
            <div className="mt-4 text-center py-3">
              <p className="text-red-400 font-bold text-lg">Derrota</p>
              <button onClick={startCombat} className="btn-primary mt-2">Tentar novamente</button>
            </div>
          )}

          {!combat && (
            <button onClick={startCombat} disabled={loading} className="btn-primary w-full mt-4 py-3">
              {loading ? "Engajando..." : "Iniciar combate"}
            </button>
          )}
        </div>
      </div>

      {/* ===== MEIO: log ===== */}
      <div className="panel p-4 mt-6">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Log de Combate</p>
        <div className="space-y-1 max-h-48 overflow-y-auto min-h-[4rem]">
          {combatLog.length === 0 && (
            <p className="text-sm text-gray-600">O combate ainda não começou. Seu ataque automático acontece sozinho a cada 2s.</p>
          )}
          {combatLog.map((log, i) => (
            <p key={i} className="text-sm text-gray-300 font-mono">{log}</p>
          ))}
        </div>
      </div>

      {/* ===== BAIXO: barra de skills (fixa) ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-dark-900/95 backdrop-blur-md border-t border-dark-700 px-4 py-3">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-2 text-center">
            Skill Bar {combat ? "" : "· inicie o combate para usar"}
          </p>
          {!combat ? (
            <p className="text-center text-sm text-gray-500">Clique em "Iniciar combate" para liberar suas habilidades.</p>
          ) : (
            <div className="flex items-stretch justify-center gap-2 flex-wrap">
              {/* Auto attack */}
              <div className="w-20 card-hover py-3 text-center opacity-80" title={autoSkill?.description ?? "Ataque automático"}>
                <Sword size={18} className="mx-auto mb-1 text-purple-400" />
                <span className="text-[11px] block">{autoSkill?.name || "Auto"}</span>
                <span className="text-[9px] text-gray-500 block">Automático</span>
              </div>

              {usableSkills.map((skill) => {
                const locked = (skill.rankRequired ?? 1) > classRank;
                const cd = isOnCooldown(skill.id, skill.cooldown);
                const noMana = (combat.characterMana ?? 0) < skill.manaCost;
                const disabled = locked || cd || noMana || combat.state !== "active";
                return (
                  <button
                    key={skill.id}
                    onClick={() => useSkill(skill.id)}
                    disabled={disabled}
                    className={`w-20 card-hover py-3 text-center ${
                      disabled ? "opacity-40 cursor-not-allowed" : ""
                    } ${skill.type === "ultimate" ? "border-yellow-500/40" : ""}`}
                    title={locked ? `Requer Rank ${skill.rankRequired}` : skill.description}
                  >
                    {locked ? (
                      <Lock size={16} className="mx-auto mb-1 text-gray-500" />
                    ) : skill.type === "ultimate" ? (
                      <Zap size={18} className="mx-auto mb-1 text-yellow-400" />
                    ) : skill.healingBase > 0 ? (
                      <Heart size={18} className="mx-auto mb-1 text-green-400" />
                    ) : (
                      <Sword size={18} className="mx-auto mb-1 text-purple-400" />
                    )}
                    <span className="text-[11px] block">{skill.name}</span>
                    <span className="text-[9px] text-gray-500 block">
                      {locked
                        ? `Rank ${skill.rankRequired}+`
                        : `${skill.manaCost} mana${cd ? " · CD" : ""}`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
