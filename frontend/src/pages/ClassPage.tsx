import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { classesApi } from "../services/api";
import { GameClass, Skill } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Sword, Zap, Star, BookOpen, ChevronRight, Clock, Droplets, Swords,
  Eye, Activity, ShieldCheck, Siren, Gauge, Crosshair, Wind, Flame, Skull,
  Sparkles, Target, Heart, Brain, Footprints, ShieldHalf, Dice3, Coins,
  Gem, Users, BadgeCheck, List, HeartPulse, ArmchairIcon as Mana,
  ArrowUpDown, Scan, Ban, Percent, ChevronLeft, Info
} from "lucide-react";

const elementColors: Record<string, string> = {
  fire: "from-red-500 to-orange-500",
  water: "from-blue-500 to-cyan-500",
  earth: "from-green-500 to-emerald-500",
  wind: "from-teal-500 to-cyan-500",
  light: "from-yellow-400 to-white",
  dark: "from-purple-600 to-indigo-800",
  neutral: "from-gray-400 to-gray-500",
};

const rarityColors: Record<string, string> = {
  common: "text-gray-400",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-orange-400",
  mythic: "text-red-400",
};

const statModelLabels: Record<string, string> = {
  tank: "Tank", hybrid: "Hybrid", luckHybrid: "Luck Hybrid",
  powerCaster: "Power Caster", physicalDPS: "Physical DPS", magicDPS: "Magic DPS",
  support: "Support", assassin: "Assassin", bruiser: "Bruiser", battleMage: "Battle Mage",
};

const rankNames: Record<number, string> = {
  1: "Initiate", 2: "Apprentice", 3: "Adept", 4: "Expert",
  5: "Master", 6: "Grand Master", 7: "Elite", 8: "Legend",
  9: "Mythic", 10: "Transcendent",
};

function parseScaling(scalingJson: string | null): { attack?: number; magic?: number; defense?: number; magicDefense?: number; speed?: number; hp?: number; mana?: number } | null {
  if (!scalingJson) return null;
  try { return JSON.parse(scalingJson); } catch { return null; }
}

function parseBuffs(buffsJson: string | null): { buffId: string; duration: number; stacks: number }[] | null {
  if (!buffsJson) return null;
  try { return JSON.parse(buffsJson); } catch { return null; }
}

function parseStacks(stacksJson: string | null): any | null {
  if (!stacksJson) return null;
  try { return JSON.parse(stacksJson); } catch { return null; }
}

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

export function ClassPage() {
  const { slug } = useParams<{ slug: string }>();
  const [gameClass, setGameClass] = useState<GameClass | null>(null);
  const [classList, setClassList] = useState<GameClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedRank, setSelectedRank] = useState<number | "auto">("auto");
  const [statPanel, setStatPanel] = useState<"core" | "modifiers" | "combat">("core");

  useEffect(() => {
    if (!slug) {
      setLoading(true);
      classesApi.list()
        .then(({ data }) => setClassList(data))
        .catch(() => {})
        .finally(() => setLoading(false));
      return;
    }
    setLoading(true);
    classesApi.get(slug)
      .then(({ data }) => setGameClass(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (!slug) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Swords size={22} className="text-purple-400" /> Classes
          </h1>
          <p className="text-sm text-gray-400 mt-1">Escolha uma classe para ver os atributos, skills e passivas.</p>
        </div>
        {classList.length === 0 && <p className="text-gray-500 text-sm">Nenhuma classe disponível.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classList.map((cls) => (
            <Link
              key={cls.id}
              to={`/class/${cls.slug}`}
              className="card-hover block p-5"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-display font-bold text-lg">{cls.name}</span>
                <span className={`text-xs font-bold uppercase px-2 py-1 rounded bg-gradient-to-r ${rarityColors[cls.rarity] || "text-gray-400"} bg-opacity-10`}>
                  {cls.rarity}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded bg-gradient-to-r ${elementColors[cls.element] || "from-gray-500 to-gray-600"} bg-opacity-10`}>{cls.element}</span>
                <span className="text-xs px-2 py-0.5 bg-dark-700 rounded-md capitalize">{cls.role}</span>
                <span className="text-xs px-2 py-0.5 bg-dark-700 rounded-md capitalize">{statModelLabels[cls.statModel] || cls.statModel}</span>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2 mb-3">{cls.description}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-300">
                <span className="flex items-center gap-1"><Shield size={12} className="text-red-400" /> HP {cls.baseHp}</span>
                <span className="flex items-center gap-1"><Mana size={12} className="text-blue-400" /> Mana {cls.baseMana}</span>
                <span className="flex items-center gap-1"><Sword size={12} className="text-orange-400" /> ATK {cls.baseAttack}</span>
                <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-green-400" /> DEF {cls.baseDefense}</span>
                <span className="flex items-center gap-1"><Sparkles size={12} className="text-purple-400" /> MAG {cls.baseMagic}</span>
                <span className="flex items-center gap-1"><Shield size={12} className="text-cyan-400" /> MDEF {cls.baseMagicDefense}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (!gameClass) return <div className="text-center py-12 text-gray-400">Class not found</div>;

  const skills = gameClass.skills || [];
  const passives = gameClass.classPassives || [];
  const upgrades = gameClass.classUpgrades || [];

  // Filter skills by selected rank
  const filteredSkills = selectedRank === "auto"
    ? skills
    : skills.filter(s => s.rankRequired <= selectedRank);

  const activeSkills = filteredSkills.filter(s => s.type === "active" || s.type === "ultimate");
  const passiveSkills = filteredSkills.filter(s => s.type === "passive");
  const currentRankUpgrade = upgrades.find(u => u.rankRequired === (selectedRank === "auto" ? 1 : selectedRank));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ===== Class Header ===== */}
      <div className="panel p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10" />
        <div className="relative flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={`text-xs font-bold uppercase px-2 py-1 rounded bg-gradient-to-r ${rarityColors[gameClass.rarity]} bg-opacity-10`}>
                {gameClass.rarity}
              </span>
              <span className={`text-xs px-2 py-1 rounded bg-gradient-to-r ${elementColors[gameClass.element] || "from-gray-500 to-gray-600"} bg-opacity-10`}>
                {gameClass.element}
              </span>
              <span className="text-xs px-2 py-1 bg-dark-700 rounded-md capitalize">{gameClass.role}</span>
              <span className="text-xs px-2 py-1 bg-dark-700 rounded-md capitalize">{gameClass.difficulty}</span>
              <span className="text-xs px-2 py-1 bg-purple-900/30 rounded-md capitalize">
                {statModelLabels[gameClass.statModel] || gameClass.statModel}
              </span>
            </div>
            <h1 className="text-3xl font-display font-bold glow-text mb-2">{gameClass.name}</h1>
            <p className="text-gray-400 text-sm leading-relaxed">{gameClass.description}</p>
            {gameClass.lore && (
              <div className="mt-3 p-3 bg-dark-800/50 rounded-lg border border-dark-600">
                <p className="text-xs text-gray-500 italic">{gameClass.lore}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-dark-800/50 rounded-xl border border-dark-600 min-w-[160px]">
            <span className="text-4xl font-display font-bold text-purple-400">10</span>
            <span className="text-xs text-gray-400">Max Rank</span>
            <div className="flex gap-1 mt-2">
              {[1,2,3,4,5,6,7,8,9,10].map(r => (
                <div key={r} className={`w-2 h-4 rounded-sm ${r <= 1 ? "bg-purple-500" : "bg-dark-600"}`} />
              ))}
            </div>
            <span className="text-xs text-gray-500 mt-2">Mana Regen: {gameClass.manaRecovery}/tick</span>
          </div>
        </div>
      </div>

      {/* ===== Rank Navigation Tabs ===== */}
      <div className="panel p-2">
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setSelectedRank("auto")}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedRank === "auto" ? "bg-purple-500/20 text-purple-400" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Zap size={14} className="inline mr-1" />Auto
          </button>
          {[1,2,3,4,5,6,7,8,9,10].map(r => (
            <button
              key={r}
              onClick={() => setSelectedRank(r)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedRank === r ? "bg-purple-500/20 text-purple-400" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Rank {r}
              <span className="text-[10px] text-gray-600 ml-1">{rankNames[r]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== Three Stat Panels ===== */}
        <div className="space-y-3">
          {/* Stat Panel Selector */}
          <div className="panel p-1 flex gap-1">
            {(["core", "modifiers", "combat"] as const).map(panel => (
              <button
                key={panel}
                onClick={() => setStatPanel(panel)}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors capitalize ${
                  statPanel === panel ? "bg-purple-500/20 text-purple-400" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {panel}
              </button>
            ))}
          </div>

          {/* Core Stats Panel */}
          {statPanel === "core" && (
            <div className="panel p-4">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                <Shield size={14} className="text-orange-400" /> Core Stats
              </h3>
              <div className="space-y-1">
                <div className="py-1.5 px-2 rounded-lg bg-dark-800/30">
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
                  { label: "Mana Recovery", value: gameClass.manaRecovery.toFixed(1), icon: Mana, color: "text-blue-400" },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-dark-800/50">
                    <div className="flex items-center gap-2">
                      <stat.icon size={14} className={stat.color} />
                      <span className="text-sm text-gray-300">{stat.label}</span>
                    </div>
                    <span className="font-mono text-sm">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modifier Stats Panel */}
          {statPanel === "modifiers" && (
            <div className="panel p-4">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                <Percent size={14} className="text-green-400" /> Modifier Stats
              </h3>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-2 mb-1">Damage & Resistance</p>
                {[
                  { label: "DMG Boost", key: "damageBoost", icon: Flame, color: "text-red-400" },
                  { label: "DMG Resist", key: "damageResistance", icon: Shield, color: "text-green-400" },
                  { label: "Physical Boost", key: "physicalBoost", icon: Swords, color: "text-orange-400" },
                  { label: "Magical Boost", key: "magicalBoost", icon: Sparkles, color: "text-purple-400" },
                  { label: "Physical Resist", key: "physicalResist", icon: ShieldCheck, color: "text-yellow-400" },
                  { label: "Magical Resist", key: "magicalResist", icon: ShieldHalf, color: "text-cyan-400" },
                  { label: "Healing Boost", key: "healingBoost", icon: HeartPulse, color: "text-green-400" },
                  { label: "Healing Received", key: "healingReceived", icon: Heart, color: "text-red-300" },
                  { label: "DoT Boost", key: "dotBoost", icon: Skull, color: "text-purple-300" },
                  { label: "DoT Resist", key: "dotResistance", icon: Ban, color: "text-green-300" },
                ].map(stat => (
                  <div key={stat.key} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-dark-800/50">
                    <div className="flex items-center gap-2">
                      <stat.icon size={13} className={stat.color} />
                      <span className="text-xs text-gray-300">{stat.label}</span>
                    </div>
                    <span className="font-mono text-xs">0%</span>
                  </div>
                ))}
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-2 mb-1">Penetration</p>
                {[
                  { label: "Armor Pen", key: "armorPenetration", icon: Crosshair, color: "text-orange-400" },
                  { label: "Magic Pen", key: "magicPenetration", icon: Crosshair, color: "text-purple-400" },
                  { label: "True Damage", key: "trueDamage", icon: Skull, color: "text-red-400" },
                ].map(stat => (
                  <div key={stat.key} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-dark-800/50">
                    <div className="flex items-center gap-2">
                      <stat.icon size={13} className={stat.color} />
                      <span className="text-xs text-gray-300">{stat.label}</span>
                    </div>
                    <span className="font-mono text-xs">0</span>
                  </div>
                ))}
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-2 mb-1">Utility</p>
                {[
                  { label: "Life Steal", key: "lifeSteal", icon: Heart, color: "text-red-400" },
                  { label: "Mana Steal", key: "manaSteal", icon: Droplets, color: "text-blue-400" },
                  { label: "CD Reduction", key: "cooldownReduction", icon: Clock, color: "text-yellow-400" },
                  { label: "Haste", key: "haste", icon: Wind, color: "text-green-400" },
                  { label: "Mana Cost -", key: "manaCostReduction", icon: Mana, color: "text-blue-300" },
                ].map(stat => (
                  <div key={stat.key} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-dark-800/50">
                    <div className="flex items-center gap-2">
                      <stat.icon size={13} className={stat.color} />
                      <span className="text-xs text-gray-300">{stat.label}</span>
                    </div>
                    <span className="font-mono text-xs">0%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Combat Stats Panel */}
          {statPanel === "combat" && (
            <div className="panel p-4">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                <Gauge size={14} className="text-yellow-400" /> Combat Stats
              </h3>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1 mb-1">Offense</p>
                {[
                  { label: "Attack Power", value: Math.floor(gameClass.baseAttack * gameClass.attackScaling), icon: Swords, color: "text-orange-400" },
                  { label: "Spell Power", value: Math.floor(gameClass.baseMagic * gameClass.magicScaling), icon: Star, color: "text-purple-400" },
                  { label: "Crit Chance", value: `${(gameClass.baseSpeed * gameClass.critScaling).toFixed(1)}%`, icon: Target, color: "text-yellow-400" },
                  { label: "Crit Multiplier", value: `${gameClass.critDamageBase}%`, icon: Crosshair, color: "text-red-400" },
                  { label: "Hit Chance", value: "95%", icon: Scan, color: "text-green-400" },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-dark-800/50">
                    <div className="flex items-center gap-2">
                      <stat.icon size={14} className={stat.color} />
                      <span className="text-sm text-gray-300">{stat.label}</span>
                    </div>
                    <span className="font-mono text-sm font-bold">{stat.value}</span>
                  </div>
                ))}
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-2 mb-1">Defense</p>
                {[
                  { label: "Dodge", value: `${(gameClass.baseSpeed * gameClass.dodgeScaling).toFixed(1)}%`, icon: Wind, color: "text-green-400" },
                  { label: "Max HP", value: gameClass.baseHp, icon: Heart, color: "text-red-400" },
                  { label: "Max Mana", value: gameClass.baseMana, icon: Droplets, color: "text-blue-400" },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-dark-800/50">
                    <div className="flex items-center gap-2">
                      <stat.icon size={14} className={stat.color} />
                      <span className="text-sm text-gray-300">{stat.label}</span>
                    </div>
                    <span className="font-mono text-sm font-bold">{stat.value}</span>
                  </div>
                ))}
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-2 mb-1">Special</p>
                {[
                  { label: "Attack Speed", value: "1000ms", icon: Gauge, color: "text-yellow-400" },
                  { label: "CDR Total", value: `${(gameClass.cooldownScaling * gameClass.baseSpeed).toFixed(0)}%`, icon: Clock, color: "text-yellow-400" },
                  { label: "Mana Regen", value: `${gameClass.manaRecovery}/tick`, icon: Mana, color: "text-blue-400" },
                  { label: "Threat", value: "100%", icon: Siren, color: "text-red-400" },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-dark-800/50">
                    <div className="flex items-center gap-2">
                      <stat.icon size={14} className={stat.color} />
                      <span className="text-sm text-gray-300">{stat.label}</span>
                    </div>
                    <span className="font-mono text-sm">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===== Skills Area ===== */}
        <div className="lg:col-span-2 space-y-4">
          {/* Current Rank Upgrade Preview */}
          {currentRankUpgrade && (
            <div className="panel p-3 bg-gradient-to-r from-purple-900/10 to-blue-900/10 border-purple-500/20">
              <div className="flex items-center gap-2">
                <Star size={14} className="text-yellow-400" />
                <p className="text-xs text-gray-300">{currentRankUpgrade.description}</p>
              </div>
            </div>
          )}

          <div className="panel">
            <div className="p-4">
              {/* Active / Ultimate Skills */}
              {activeSkills.length > 0 && (
                <>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                    <Zap size={12} /> Active Skills
                    <span className="text-gray-600 font-normal">({activeSkills.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeSkills.map(skill => {
                      const isUltimate = skill.type === "ultimate";
                      return (
                        <button
                          key={skill.id}
                          onClick={() => setSelectedSkill(skill)}
                          className={`card-hover text-left ${isUltimate ? "col-span-full bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border-yellow-500/20" : ""} ${
                            selectedSkill?.id === skill.id ? "border-purple-500/50 bg-purple-500/5" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                              isUltimate
                                ? "bg-gradient-to-br from-yellow-500 to-orange-500"
                                : "bg-gradient-to-br from-purple-600 to-blue-600"
                            }`}>
                              {isUltimate ? <Zap size={22} className="text-white" /> : <Sword size={22} className="text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{skill.name}</p>
                                {skill.subType && (
                                  <span className="text-[10px] text-gray-500 bg-dark-700 px-1.5 py-0.5 rounded">{skill.subType}</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2">{skill.description}</p>
                              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock size={11} /> {formatMs(skill.cooldown)}
                                </span>
                                {skill.manaCost > 0 && (
                                  <span className="text-xs text-blue-400">{skill.manaCost} MP</span>
                                )}
                                {skill.castTime > 0 && (
                                  <span className="text-xs text-yellow-500">{formatMs(skill.castTime)} cast</span>
                                )}
                                {skill.range > 0 && (
                                  <span className="text-xs text-gray-500">{skill.range}m</span>
                                )}
                                {skill.rankRequired > 1 && (
                                  <span className="text-xs text-yellow-400">R{skill.rankRequired}</span>
                                )}
                                {isUltimate && (
                                  <span className="text-[10px] text-yellow-300 font-bold">ULTIMATE</span>
                                )}
                              </div>
                              {skill.damageScaling && (
                                <p className="text-[10px] text-gray-600 mt-1">
                                  Scales: {Object.entries(parseScaling(skill.damageScaling) || {}).map(([k, v]) => `${k} ×${v}`).join(", ")}
                                </p>
                              )}
                            </div>
                            <ChevronRight size={16} className="text-gray-600 shrink-0 mt-1" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Passive Skills */}
              {passiveSkills.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                    <Activity size={12} /> Passives
                    <span className="text-gray-600 font-normal">({passiveSkills.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {passiveSkills.map(skill => (
                      <button
                        key={skill.id}
                        onClick={() => setSelectedSkill(skill)}
                        className={`card-hover text-left ${
                          selectedSkill?.id === skill.id ? "border-purple-500/50 bg-purple-500/5" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shrink-0">
                            <Activity size={18} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{skill.name}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{skill.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">Passive</span>
                              {skill.rankRequired > 1 && (
                                <span className="text-xs text-yellow-400">R{skill.rankRequired}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredSkills.length === 0 && (
                <p className="text-center text-gray-500 py-8 text-sm">No skills available for this rank</p>
              )}
            </div>
          </div>

          {/* Rank Upgrades Table */}
          <div className="panel p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
              <ArrowUpDown size={12} /> Rank Progression
            </h4>
            <div className="space-y-1">
              {[1,2,3,4,5,6,7,8,9,10].map(rank => {
                const upgrade = upgrades.find(u => u.rankRequired === rank);
                const rankSkills = skills.filter(s => s.rankRequired === rank);
                return (
                  <div
                    key={rank}
                    className={`flex items-center gap-3 py-2 px-3 rounded-lg ${
                      selectedRank === rank ? "bg-purple-500/10 border border-purple-500/20" : "hover:bg-dark-800/50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      upgrade ? "bg-purple-500/20" : "bg-dark-700"
                    }`}>
                      <Star size={14} className={upgrade ? "text-purple-400" : "text-gray-600"} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Rank {rank}</span>
                        <span className="text-[10px] text-gray-600">{rankNames[rank]}</span>
                      </div>
                      {upgrade ? (
                        <p className="text-xs text-gray-500">{upgrade.description}</p>
                      ) : (
                        <p className="text-xs text-gray-600">No upgrade</p>
                      )}
                    </div>
                    {rankSkills.length > 0 && (
                      <div className="text-[10px] text-gray-500 bg-dark-700 px-2 py-1 rounded">
                        +{rankSkills.length} skill{rankSkills.length > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Skill Detail Panel ===== */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="panel p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  selectedSkill.type === "ultimate"
                    ? "bg-gradient-to-br from-yellow-500 to-orange-500"
                    : selectedSkill.type === "passive"
                    ? "bg-gradient-to-br from-green-600 to-emerald-600"
                    : "bg-gradient-to-br from-purple-600 to-blue-600"
                }`}>
                  {selectedSkill.type === "ultimate" ? <Zap size={28} className="text-white" />
                    : selectedSkill.type === "passive" ? <Activity size={28} className="text-white" />
                    : <Sword size={28} className="text-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-display font-bold">{selectedSkill.name}</h3>
                    {selectedSkill.subType && (
                      <span className="text-[10px] text-gray-500 bg-dark-700 px-2 py-0.5 rounded uppercase">{selectedSkill.subType}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{selectedSkill.description}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSkill(null)} className="text-gray-500 hover:text-gray-300 text-lg">✕</button>
            </div>

            {/* Skill Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <DetailBox label="Type" value={selectedSkill.type} />
              <DetailBox label="Cool Down" value={formatMs(selectedSkill.cooldown)} />
              {selectedSkill.manaCost > 0 && <DetailBox label="Mana Cost" value={`${selectedSkill.manaCost}`} color="text-blue-400" />}
              <DetailBox label="Cast Time" value={formatMs(selectedSkill.castTime)} />
              <DetailBox label="Range" value={`${selectedSkill.range}m`} />
              <DetailBox label="Target" value={selectedSkill.targetType} />
              {selectedSkill.baseDamage > 0 && <DetailBox label="Base Damage" value={`${selectedSkill.baseDamage}`} color="text-red-400" />}
              {selectedSkill.healingBase > 0 && <DetailBox label="Base Heal" value={`${selectedSkill.healingBase}`} color="text-green-400" />}
              <DetailBox label="Damage Type" value={selectedSkill.damageType} />
              {selectedSkill.hitsMultiple && <DetailBox label="Max Targets" value={`${selectedSkill.maxTargets}`} />}
            </div>

            {/* Damage Scaling */}
            {selectedSkill.damageScaling && (() => {
              const scaling = parseScaling(selectedSkill.damageScaling);
              return scaling ? (
                <div className="mt-3 bg-dark-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-2">Damage Scaling</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(scaling).map(([stat, value]) => (
                      <span key={stat} className="text-xs bg-dark-700 px-2 py-1 rounded text-purple-300">
                        {stat} × {value}
                      </span>
                    ))}
                  </div>
                  {selectedSkill.damageStat && (
                    <p className="text-[10px] text-gray-600 mt-1">Stat Used: {selectedSkill.damageStat}</p>
                  )}
                </div>
              ) : null;
            })()}

            {/* Buffs Applied */}
            {selectedSkill.buffsApplied && (() => {
              const buffs = parseBuffs(selectedSkill.buffsApplied);
              return buffs && buffs.length > 0 ? (
                <div className="mt-3 bg-dark-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Sparkles size={12} /> Buffs Applied</p>
                  <div className="flex flex-wrap gap-2">
                    {buffs.map((b, i) => (
                      <span key={i} className="text-xs bg-green-900/30 px-2 py-1 rounded text-green-300">
                        {b.buffId} ({b.duration}ms, {b.stacks}x)
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Debuffs Applied */}
            {selectedSkill.debuffsApplied && (() => {
              const debuffs = parseBuffs(selectedSkill.debuffsApplied);
              return debuffs && debuffs.length > 0 ? (
                <div className="mt-3 bg-dark-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Skull size={12} /> Debuffs Applied</p>
                  <div className="flex flex-wrap gap-2">
                    {debuffs.map((b, i) => (
                      <span key={i} className="text-xs bg-red-900/30 px-2 py-1 rounded text-red-300">
                        {b.buffId} ({b.duration}ms, {b.stacks}x)
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Stack Interaction */}
            {(selectedSkill.stacksApplied || selectedSkill.stacksRequired) && (
              <div className="mt-3 bg-dark-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Dice3 size={12} /> Stack Interaction</p>
                {selectedSkill.stacksApplied && (
                  <p className="text-xs text-blue-300">Generates: {JSON.stringify(parseStacks(selectedSkill.stacksApplied))}</p>
                )}
                {selectedSkill.stacksRequired && (
                  <p className="text-xs text-yellow-300">Requires: {JSON.stringify(parseStacks(selectedSkill.stacksRequired))}</p>
                )}
              </div>
            )}

            {/* Rank Requirement */}
            <div className="mt-3 flex items-center gap-3 text-xs flex-wrap">
              {selectedSkill.rankRequired > 1 && (
                <span className="text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded">Requires Rank {selectedSkill.rankRequired}</span>
              )}
              {selectedSkill.animationName && (
                <span className="text-gray-500">Animation: {selectedSkill.animationName}</span>
              )}
              {selectedSkill.soundEffect && (
                <span className="text-gray-500">SFX: {selectedSkill.soundEffect}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailBox({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-dark-800/50 rounded-lg p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`font-mono font-bold ${color || ""}`}>{value}</p>
    </div>
  );
}
