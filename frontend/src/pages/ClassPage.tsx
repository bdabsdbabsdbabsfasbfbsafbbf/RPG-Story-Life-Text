import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { classesApi, charactersApi } from "../services/api";
import { useGameStore } from "../store/gameStore";
import { Character, Skill, ClassPassive } from "../types";
import {
  Shield, Sword, Zap, Star, Clock, Droplets, Heart, Swords,
  ShieldCheck, Sparkles, Lock, ArrowUp, ChevronRight, X, MapPin,
  UserPlus, Activity, Footprints, ShieldHalf, Flame, HeartPulse, Skull,
  Ban, Crosshair, Scan, Wind, Gauge, Siren, Target, Percent, Brain,
} from "lucide-react";
import toast from "react-hot-toast";

const rankNames: Record<number, string> = {
  1: "Initiate", 2: "Apprentice", 3: "Adept", 4: "Expert",
  5: "Master", 6: "Grand Master", 7: "Elite", 8: "Legend",
  9: "Mythic", 10: "Transcendent",
};

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

interface ClassProgress {
  id: string;
  rank: number;
  experience: number;
  isActive: boolean;
  gameClass: { id: string; name: string; slug: string };
}

export function ClassPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { selectedCharacter } = useGameStore();
  const [data, setData] = useState<Character | null>(null);
  const [unlocked, setUnlocked] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [rankingUp, setRankingUp] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [statPanel, setStatPanel] = useState<"core" | "modifiers" | "combat">("core");

  const equippedSlug = selectedCharacter?.class?.slug;

  useEffect(() => {
    if (!slug && selectedCharacter?.class?.slug) {
      navigate(`/class/${selectedCharacter.class.slug}`, { replace: true });
      return;
    }
    if (!selectedCharacter) {
      setLoading(false);
      return;
    }
    setLoading(true);
    classesApi.characterClass(selectedCharacter.id)
      .then(({ data }) => setData(data))
      .catch(() => toast.error("Falha ao carregar a classe"))
      .finally(() => setLoading(false));
  }, [slug, selectedCharacter?.id]);

  useEffect(() => {
    if (!selectedCharacter) return;
    classesApi.listClasses(selectedCharacter.id)
      .then(({ data }) => setUnlocked(Array.isArray(data) ? data : []))
      .catch(() => setUnlocked([]));
  }, [selectedCharacter?.id]);

  const handleSwitchClass = async (classId: string, classSlug: string) => {
    if (!selectedCharacter) return;
    setSwitching(true);
    try {
      await classesApi.switchClass(selectedCharacter.id, classId);
      toast.success("Classe equipada!");
      navigate(`/class/${classSlug}`, { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Falha ao equipar classe");
    } finally {
      setSwitching(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (!selectedCharacter) {
    return (
      <div className="panel p-8 text-center space-y-4">
        <MapPin size={32} className="mx-auto text-gray-500" />
        <p className="text-gray-400">Você ainda não tem um personagem.</p>
        <Link to="/character/create" className="btn-primary inline-flex items-center gap-2">
          <UserPlus size={16} /> Criar personagem
        </Link>
      </div>
    );
  }

  const character = data;
  if (!character || !character.class) {
    return <div className="text-center py-12 text-gray-400">Classe não encontrada</div>;
  }

  const gameClass: any = character.class;
  const progress: ClassProgress | undefined = (character.classProgress || []).find(
    (p: any) => p.gameClass?.slug === gameClass.slug
  ) ?? (character.classProgress || [])[0];

  const rank = progress?.rank ?? 1;
  const rankXp = progress?.experience ?? 0;
  const xpToNextRank = rank * 150;
  const canRankUp = rank < 10 && rankXp >= xpToNextRank;

  const skills: Skill[] = gameClass.skills || [];
  const passives: ClassPassive[] = gameClass.classPassives || [];
  const autoSkill = skills.find((s) => s.type === "auto");
  const actives = skills.filter((s) => s.type === "active");
  const ultimate = skills.find((s) => s.type === "ultimate");

  const handleRankUp = async () => {
    setRankingUp(true);
    try {
      const { data: res } = await charactersApi.rankUp();
      toast.success(`Rank up! Agora você é Rank ${res.rank}`);
      const updated = await classesApi.characterClass(selectedCharacter.id);
      setData(updated.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Falha no rank up");
    } finally {
      setRankingUp(false);
    }
  };

  const SkillCard = ({ skill }: { skill: Skill }) => {
    const locked = skill.rankRequired > rank;
    const isUlt = skill.type === "ultimate";
    const isAuto = skill.type === "auto";
    return (
      <button
        onClick={() => setSelectedSkill(skill)}
        className={`card-hover text-left p-3 ${isUlt ? "col-span-full bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border-yellow-500/20" : ""} ${
          locked ? "opacity-60" : ""
        } ${selectedSkill?.id === skill.id ? "border-purple-500/50 bg-purple-500/5" : ""}`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            isUlt ? "bg-gradient-to-br from-yellow-500 to-orange-500"
            : isAuto ? "bg-gradient-to-br from-gray-600 to-gray-700"
            : "bg-gradient-to-br from-purple-600 to-blue-600"
          }`}>
            {locked ? <Lock size={16} className="text-gray-300" />
              : isUlt ? <Zap size={18} className="text-white" />
              : isAuto ? <Swords size={16} className="text-white" />
              : skill.healingBase > 0 ? <Heart size={18} className="text-white" />
              : <Sword size={18} className="text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm">{skill.name}</p>
              {skill.subType && (
                <span className="text-[10px] text-gray-500 bg-dark-700 px-1.5 py-0.5 rounded">{skill.subType}</span>
              )}
              {isAuto && <span className="text-[10px] text-gray-400 bg-dark-700 px-1.5 py-0.5 rounded">Automática</span>}
              {isUlt && <span className="text-[10px] text-yellow-300 font-bold">ULTIMATE</span>}
            </div>
            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{skill.description}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs">
              <span className="text-gray-400 flex items-center gap-1"><Clock size={11} /> {formatMs(skill.cooldown)}</span>
              {skill.manaCost > 0 && <span className="text-blue-400">{skill.manaCost} MP</span>}
              {skill.baseDamage > 0 && <span className="text-red-400">DMG {skill.baseDamage}</span>}
              {skill.healingBase > 0 && <span className="text-green-400">CURA {skill.healingBase}</span>}
            </div>
          </div>
          <ChevronRight size={15} className="text-gray-600 shrink-0 mt-1" />
        </div>
        {locked && (
          <p className="text-[10px] text-yellow-500 mt-2 flex items-center gap-1">
            <Lock size={10} /> Libera no Rank {skill.rankRequired}
          </p>
        )}
      </button>
    );
  };

  const PassiveCard = ({ passive }: { passive: ClassPassive }) => {
    const locked = passive.rankRequired > rank;
    return (
      <div className={`card p-3 ${locked ? "opacity-60" : ""}`}>
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-green-400 shrink-0" />
          <p className="font-medium text-sm">{passive.name}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1">{passive.description}</p>
        <p className={`text-[10px] mt-1.5 flex items-center gap-1 ${locked ? "text-yellow-500" : "text-green-400"}`}>
          {locked ? <><Lock size={10} /> Libera no Rank {passive.rankRequired}</> : <>Ativa no Rank {passive.rankRequired}</>}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="panel p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10" />
        <div className="relative flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-xs px-2 py-1 bg-dark-700 rounded-md capitalize">{gameClass.role}</span>
              <span className="text-xs px-2 py-1 bg-dark-700 rounded-md capitalize">{gameClass.element}</span>
              <span className="text-xs px-2 py-1 bg-dark-700 rounded-md capitalize">{gameClass.difficulty}</span>
            </div>
            <h1 className="text-3xl font-display font-bold glow-text mb-2">{gameClass.name}</h1>
            <p className="text-gray-400 text-sm leading-relaxed">{gameClass.description}</p>
            {character.race?.name && (
              <p className="text-xs text-gray-500 mt-2">
                {character.name} • {character.race.name}
                {character.trait?.name ? ` • Trait: ${character.trait.name}` : ""}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-dark-800/50 rounded-xl border border-dark-600 min-w-[200px]">
            <span className="text-2xl font-display font-bold text-purple-400">Rank {rank}</span>
            <span className="text-xs text-gray-400">{rankNames[rank]}</span>
            <div className="flex gap-1 mt-3">
              {[1,2,3,4,5,6,7,8,9,10].map(r => (
                <div key={r} className={`w-2 h-4 rounded-sm ${r <= rank ? "bg-purple-500" : "bg-dark-600"}`} />
              ))}
            </div>
            <div className="w-full mt-3">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>XP da classe</span>
                <span>{rankXp} / {xpToNextRank}</span>
              </div>
              <div className="stat-bar h-1.5">
                <div className="stat-bar-fill bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${Math.min(100, (rankXp / xpToNextRank) * 100)}%` }} />
              </div>
            </div>
            <button
              onClick={handleRankUp}
              disabled={!canRankUp || rankingUp}
              className={`btn-primary text-xs px-4 py-2 mt-3 flex items-center gap-1.5 ${!canRankUp ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <ArrowUp size={13} />
              {rank >= 10 ? "Rank Máximo" : rankingUp ? "Subindo..." : `Subir de Rank (${xpToNextRank} XP)`}
            </button>
            {!canRankUp && rank < 10 && (
              <p className="text-[10px] text-gray-500 mt-1.5">Ganhe XP de classe em combates para subir.</p>
            )}
          </div>
        </div>
      </div>

      {/* Classes desbloqueadas */}
      {unlocked.filter((p) => !p.isActive).length > 0 && (
        <div className="panel p-4">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-blue-400" /> Classes desbloqueadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unlocked.filter((p) => !p.isActive).map((p) => (
              <div key={p.id} className="card-hover p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm">{p.gameClass?.name}</p>
                  <p className="text-[11px] text-gray-500 capitalize">
                    {p.gameClass?.role} • Rank {p.rank}
                  </p>
                </div>
                <button
                  onClick={() => handleSwitchClass(p.gameClass?.id, p.gameClass?.slug)}
                  disabled={switching}
                  className="btn-primary text-xs px-3 py-1.5 shrink-0 disabled:opacity-50"
                >
                  Equipar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "HP Base", value: gameClass.baseHp, icon: Heart, color: "text-red-400" },
          { label: "Mana Base", value: gameClass.baseMana, icon: Droplets, color: "text-blue-400" },
          { label: "Ataque", value: gameClass.baseAttack, icon: Swords, color: "text-orange-400" },
          { label: "Defesa", value: gameClass.baseDefense, icon: ShieldCheck, color: "text-yellow-400" },
          { label: "Magia", value: gameClass.baseMagic, icon: Sparkles, color: "text-purple-400" },
          { label: "Res. Mágica", value: gameClass.baseMagicDefense, icon: Shield, color: "text-cyan-400" },
          { label: "Velocidade", value: gameClass.baseSpeed, icon: Zap, color: "text-green-400" },
          { label: "Mana Regen", value: gameClass.manaRecovery?.toFixed(1), icon: Droplets, color: "text-blue-300" },
        ].map((stat) => (
          <div key={stat.label} className="panel p-3 flex items-center gap-3">
            <stat.icon size={16} className={stat.color} />
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className="font-mono font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Painéis detalhados: Core / Modifier / Combat Stats */}
      <div className="panel p-4">
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <Gauge size={16} className="text-yellow-400" /> Atributos detalhados
          </h3>
          <div className="flex gap-1">
            {(["core", "modifiers", "combat"] as const).map((panel) => (
              <button
                key={panel}
                onClick={() => setStatPanel(panel)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                  statPanel === panel ? "bg-purple-500/20 text-purple-300" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {panel === "core" ? "Core" : panel === "modifiers" ? "Modifiers" : "Combat"}
              </button>
            ))}
          </div>
        </div>

        {statPanel === "core" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="bg-dark-800/50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Weapon Damage</p>
              <p className="font-mono text-sm font-bold text-orange-400">{gameClass.baseAttack * 2} - {gameClass.baseAttack * 4}</p>
            </div>
            {[
              { label: "Base HP", value: gameClass.baseHp, icon: Heart, color: "text-red-400" },
              { label: "Base Mana", value: gameClass.baseMana, icon: Droplets, color: "text-blue-400" },
              { label: "Attack", value: gameClass.baseAttack, icon: Swords, color: "text-orange-400" },
              { label: "Defense", value: gameClass.baseDefense, icon: ShieldCheck, color: "text-yellow-400" },
              { label: "Magic", value: gameClass.baseMagic, icon: Star, color: "text-purple-400" },
              { label: "Magic Def", value: gameClass.baseMagicDefense, icon: ShieldHalf, color: "text-cyan-400" },
              { label: "Speed", value: gameClass.baseSpeed, icon: Footprints, color: "text-green-400" },
              { label: "Mana Recovery", value: gameClass.manaRecovery?.toFixed(1), icon: Droplets, color: "text-blue-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-dark-800/50 rounded-lg p-3 flex items-center gap-2">
                <stat.icon size={14} className={stat.color} />
                <div className="flex-1">
                  <p className="text-xs text-gray-300">{stat.label}</p>
                  <p className="font-mono text-sm font-bold">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {statPanel === "modifiers" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <p className="col-span-full text-[10px] text-gray-500 uppercase tracking-wider">Damage & Resistance</p>
            {[
              { label: "DMG Boost", icon: Flame, color: "text-red-400" },
              { label: "DMG Resist", icon: Shield, color: "text-green-400" },
              { label: "Physical Boost", icon: Swords, color: "text-orange-400" },
              { label: "Magical Boost", icon: Sparkles, color: "text-purple-400" },
              { label: "Physical Resist", icon: ShieldCheck, color: "text-yellow-400" },
              { label: "Magical Resist", icon: ShieldHalf, color: "text-cyan-400" },
              { label: "Healing Boost", icon: HeartPulse, color: "text-green-400" },
              { label: "Healing Received", icon: Heart, color: "text-red-300" },
              { label: "DoT Boost", icon: Skull, color: "text-purple-300" },
              { label: "DoT Resist", icon: Ban, color: "text-green-300" },
            ].map((stat) => (
              <div key={stat.label} className="bg-dark-800/50 rounded-lg p-3 flex items-center gap-2">
                <stat.icon size={13} className={stat.color} />
                <div className="flex-1">
                  <p className="text-xs text-gray-300">{stat.label}</p>
                  <p className="font-mono text-xs text-gray-400">0%</p>
                </div>
              </div>
            ))}
            <p className="col-span-full text-[10px] text-gray-500 uppercase tracking-wider mt-2">Penetration</p>
            {[
              { label: "Armor Pen", icon: Crosshair, color: "text-orange-400" },
              { label: "Magic Pen", icon: Crosshair, color: "text-purple-400" },
              { label: "True Damage", icon: Skull, color: "text-red-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-dark-800/50 rounded-lg p-3 flex items-center gap-2">
                <stat.icon size={13} className={stat.color} />
                <div className="flex-1">
                  <p className="text-xs text-gray-300">{stat.label}</p>
                  <p className="font-mono text-xs text-gray-400">0</p>
                </div>
              </div>
            ))}
            <p className="col-span-full text-[10px] text-gray-500 uppercase tracking-wider mt-2">Utility</p>
            {[
              { label: "Life Steal", icon: Heart, color: "text-red-400" },
              { label: "Mana Steal", icon: Droplets, color: "text-blue-400" },
              { label: "CD Reduction", icon: Clock, color: "text-yellow-400" },
              { label: "Haste", icon: Wind, color: "text-green-400" },
              { label: "Mana Cost -", icon: Droplets, color: "text-blue-300" },
            ].map((stat) => (
              <div key={stat.label} className="bg-dark-800/50 rounded-lg p-3 flex items-center gap-2">
                <stat.icon size={13} className={stat.color} />
                <div className="flex-1">
                  <p className="text-xs text-gray-300">{stat.label}</p>
                  <p className="font-mono text-xs text-gray-400">0%</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {statPanel === "combat" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <p className="col-span-full text-[10px] text-gray-500 uppercase tracking-wider">Offense</p>
            {[
              { label: "Attack Power", value: Math.floor(gameClass.baseAttack * (gameClass.attackScaling ?? 1)), icon: Swords, color: "text-orange-400" },
              { label: "Spell Power", value: Math.floor(gameClass.baseMagic * (gameClass.magicScaling ?? 1)), icon: Star, color: "text-purple-400" },
              { label: "Crit Chance", value: `${(gameClass.baseSpeed * (gameClass.critScaling ?? 0)).toFixed(1)}%`, icon: Target, color: "text-yellow-400" },
              { label: "Crit Multiplier", value: `${gameClass.critDamageBase ?? 150}%`, icon: Crosshair, color: "text-red-400" },
              { label: "Hit Chance", value: "95%", icon: Scan, color: "text-green-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-dark-800/50 rounded-lg p-3 flex items-center gap-2">
                <stat.icon size={13} className={stat.color} />
                <div className="flex-1">
                  <p className="text-xs text-gray-300">{stat.label}</p>
                  <p className="font-mono text-sm font-bold">{stat.value}</p>
                </div>
              </div>
            ))}
            <p className="col-span-full text-[10px] text-gray-500 uppercase tracking-wider mt-2">Defense</p>
            {[
              { label: "Dodge", value: `${(gameClass.baseSpeed * (gameClass.dodgeScaling ?? 0)).toFixed(1)}%`, icon: Wind, color: "text-green-400" },
              { label: "Max HP", value: gameClass.baseHp, icon: Heart, color: "text-red-400" },
              { label: "Max Mana", value: gameClass.baseMana, icon: Droplets, color: "text-blue-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-dark-800/50 rounded-lg p-3 flex items-center gap-2">
                <stat.icon size={13} className={stat.color} />
                <div className="flex-1">
                  <p className="text-xs text-gray-300">{stat.label}</p>
                  <p className="font-mono text-sm font-bold">{stat.value}</p>
                </div>
              </div>
            ))}
            <p className="col-span-full text-[10px] text-gray-500 uppercase tracking-wider mt-2">Special</p>
            {[
              { label: "Attack Speed", value: "1000ms", icon: Gauge, color: "text-yellow-400" },
              { label: "CDR Total", value: `${((gameClass.cooldownScaling ?? 0) * gameClass.baseSpeed).toFixed(0)}%`, icon: Clock, color: "text-yellow-400" },
              { label: "Mana Regen", value: `${gameClass.manaRecovery}/tick`, icon: Droplets, color: "text-blue-400" },
              { label: "Threat", value: "100%", icon: Siren, color: "text-red-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-dark-800/50 rounded-lg p-3 flex items-center gap-2">
                <stat.icon size={13} className={stat.color} />
                <div className="flex-1">
                  <p className="text-xs text-gray-300">{stat.label}</p>
                  <p className="font-mono text-sm">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="panel p-4">
        <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
          <Sword size={16} className="text-purple-400" /> Skills ({skills.length} de 5 · auto + ativas + ultimate)
        </h3>
        {autoSkill && (
          <>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Ataque Automático</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <SkillCard skill={autoSkill} />
            </div>
          </>
        )}
        {actives.length > 0 && (
          <>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 mt-4">Habilidades Ativas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {actives.map((s) => <SkillCard key={s.id} skill={s} />)}
            </div>
          </>
        )}
        {ultimate && (
          <>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 mt-4">Ultimate</h4>
            <div className="grid grid-cols-1 gap-3">
              <SkillCard skill={ultimate} />
            </div>
          </>
        )}
      </div>

      {/* Passivas */}
      <div className="panel p-4">
        <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-green-400" /> Passivas ({passives.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {passives.map((p) => <PassiveCard key={p.id} passive={p} />)}
        </div>
      </div>

      {/* Detalhe da skill */}
      {selectedSkill && (
        <div className="panel p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-display font-bold">{selectedSkill.name}</h3>
                {selectedSkill.subType && (
                  <span className="text-[10px] text-gray-500 bg-dark-700 px-2 py-0.5 rounded uppercase">{selectedSkill.subType}</span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">{selectedSkill.description}</p>
            </div>
            <button onClick={() => setSelectedSkill(null)} className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-dark-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Tipo</p>
              <p className="font-mono font-bold">{selectedSkill.type}</p>
            </div>
            <div className="bg-dark-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Cooldown</p>
              <p className="font-mono font-bold">{formatMs(selectedSkill.cooldown)}</p>
            </div>
            {selectedSkill.manaCost > 0 && (
              <div className="bg-dark-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Custo de Mana</p>
                <p className="font-mono font-bold text-blue-400">{selectedSkill.manaCost}</p>
              </div>
            )}
            {selectedSkill.baseDamage > 0 && (
              <div className="bg-dark-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Dano Base</p>
                <p className="font-mono font-bold text-red-400">{selectedSkill.baseDamage} ({selectedSkill.damageType})</p>
              </div>
            )}
            {selectedSkill.healingBase > 0 && (
              <div className="bg-dark-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Cura Base</p>
                <p className="font-mono font-bold text-green-400">{selectedSkill.healingBase}</p>
              </div>
            )}
            {selectedSkill.damageScaling && (
              <div className="bg-dark-800/50 rounded-lg p-3 col-span-2">
                <p className="text-xs text-gray-500 mb-1">Scaling</p>
                <p className="font-mono font-bold text-purple-300">{selectedSkill.damageScaling}</p>
              </div>
            )}
            <div className="bg-dark-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Rank necessário</p>
              <p className="font-mono font-bold text-yellow-400">{selectedSkill.rankRequired}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
