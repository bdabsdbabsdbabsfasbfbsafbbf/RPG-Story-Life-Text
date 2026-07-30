import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { classesApi } from "../services/api";
import { GameClass, Skill, ClassPassive } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sword, Zap, Star, BookOpen, ChevronRight, Clock, Droplets, Swords, Eye, Activity, ShieldCheck } from "lucide-react";

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

export function ClassPage() {
  const { slug } = useParams<{ slug: string }>();
  const [gameClass, setGameClass] = useState<GameClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedTab, setSelectedTab] = useState<"skills" | "passives" | "upgrades">("skills");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    classesApi.get(slug)
      .then(({ data }) => setGameClass(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!gameClass) return <div className="text-center py-12 text-gray-400">Class not found</div>;

  const skills = gameClass.skills || [];
  const passives = gameClass.classPassives || [];
  const upgrades = gameClass.classUpgrades || [];
  const activeSkills = skills.filter(s => s.type === "active");
  const ultimateSkills = skills.filter(s => s.type === "ultimate");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Class Header */}
      <div className="panel p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10" />
        <div className="relative flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-bold uppercase px-2 py-1 rounded bg-gradient-to-r ${rarityColors[gameClass.rarity]} bg-opacity-10`}>
                {gameClass.rarity}
              </span>
              <span className={`text-xs px-2 py-1 rounded bg-gradient-to-r ${elementColors[gameClass.element] || "from-gray-500 to-gray-600"} bg-opacity-10`}>
                {gameClass.element}
              </span>
              <span className="text-xs px-2 py-1 bg-dark-700 rounded-md capitalize">{gameClass.role}</span>
              <span className="text-xs px-2 py-1 bg-dark-700 rounded-md capitalize">{gameClass.difficulty}</span>
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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Stats */}
        <div className="panel p-4">
          <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-400 mb-3">Core Stats</h3>
          <div className="space-y-2">
            {[
              { label: "HP", value: gameClass.baseHp, icon: Shield, color: "text-red-400" },
              { label: "Mana", value: gameClass.baseMana, icon: Droplets, color: "text-blue-400" },
              { label: "Stamina", value: gameClass.baseStamina, icon: Zap, color: "text-green-400" },
              { label: "Attack", value: gameClass.baseAttack, icon: Swords, color: "text-orange-400" },
              { label: "Defense", value: gameClass.baseDefense, icon: ShieldCheck, color: "text-yellow-400" },
              { label: "Magic", value: gameClass.baseMagic, icon: Star, color: "text-purple-400" },
              { label: "Magic Def", value: gameClass.baseMagicDefense, icon: Shield, color: "text-cyan-400" },
              { label: "Speed", value: gameClass.baseSpeed, icon: Activity, color: "text-green-400" },
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

        {/* Skills Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="panel">
            <div className="flex border-b border-dark-600">
              {["skills", "passives", "upgrades"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab as any)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    selectedTab === tab
                      ? "text-purple-400 border-b-2 border-purple-500"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-4">
              {selectedTab === "skills" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeSkills.map(skill => (
                    <button
                      key={skill.id}
                      onClick={() => setSelectedSkill(skill)}
                      className={`card-hover text-left ${
                        selectedSkill?.id === skill.id ? "border-purple-500/50 bg-purple-500/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0">
                          <Sword size={22} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{skill.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">{skill.description}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock size={11} /> {(skill.cooldown / 1000).toFixed(1)}s
                            </span>
                            <span className="text-xs text-blue-400">{skill.manaCost} MP</span>
                            <span className="text-xs text-green-400">{skill.staminaCost} SP</span>
                            {skill.rankRequired > 1 && (
                              <span className="text-xs text-yellow-400">Rank {skill.rankRequired}</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-600 shrink-0 mt-1" />
                      </div>
                    </button>
                  ))}

                  {ultimateSkills.map(skill => (
                    <button
                      key={skill.id}
                      onClick={() => setSelectedSkill(skill)}
                      className={`card-hover text-left col-span-full bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border-yellow-500/20 ${
                        selectedSkill?.id === skill.id ? "border-yellow-500/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shrink-0">
                          <Zap size={22} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-yellow-300">{skill.name}</p>
                          <p className="text-xs text-gray-400">ULTIMATE</p>
                          <p className="text-xs text-gray-500 line-clamp-2">{skill.description}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock size={11} /> {(skill.cooldown / 1000).toFixed(0)}s
                            </span>
                            <span className="text-xs text-yellow-400">Rank {skill.rankRequired}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedTab === "passives" && (
                <div className="space-y-2">
                  {passives.map(p => (
                    <div key={p.id} className="card flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shrink-0">
                        <Activity size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.description}</p>
                        <span className="text-xs text-yellow-400">Rank {p.rankRequired}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedTab === "upgrades" && (
                <div className="space-y-2">
                  {[1,2,3,4,5,6,7,8,9,10].map(rank => {
                    const upgrade = upgrades.find(u => u.rankRequired === rank);
                    return (
                      <div key={rank} className="card flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          upgrade ? "bg-purple-500/20" : "bg-dark-700"
                        }`}>
                          <Star size={16} className={upgrade ? "text-purple-400" : "text-gray-600"} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Rank {rank}</p>
                          {upgrade ? (
                            <p className="text-xs text-gray-500">{upgrade.description}</p>
                          ) : (
                            <p className="text-xs text-gray-600">Locked</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skill Detail Panel */}
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
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                  selectedSkill.type === "ultimate" ? "from-yellow-500 to-orange-500" : "from-purple-600 to-blue-600"
                } flex items-center justify-center`}>
                  {selectedSkill.type === "ultimate" ? <Zap size={28} className="text-white" /> : <Sword size={28} className="text-white" />}
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold">{selectedSkill.name}</h3>
                  <p className="text-sm text-gray-400">{selectedSkill.description}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSkill(null)} className="text-gray-500 hover:text-gray-300">✕</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-dark-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Cooldown</p>
                <p className="font-mono font-bold">{(selectedSkill.cooldown / 1000).toFixed(1)}s</p>
              </div>
              <div className="bg-dark-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Mana Cost</p>
                <p className="font-mono font-bold text-blue-400">{selectedSkill.manaCost}</p>
              </div>
              <div className="bg-dark-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Stamina Cost</p>
                <p className="font-mono font-bold text-green-400">{selectedSkill.staminaCost}</p>
              </div>
              <div className="bg-dark-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Type</p>
                <p className="font-mono font-bold capitalize">{selectedSkill.type}</p>
              </div>
              <div className="bg-dark-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Base Damage</p>
                <p className="font-mono font-bold text-red-400">{selectedSkill.baseDamage}</p>
              </div>
              <div className="bg-dark-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Damage Type</p>
                <p className="font-mono font-bold capitalize">{selectedSkill.damageType}</p>
              </div>
              <div className="bg-dark-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Range</p>
                <p className="font-mono font-bold">{selectedSkill.range}</p>
              </div>
              <div className="bg-dark-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Target</p>
                <p className="font-mono font-bold capitalize">{selectedSkill.targetType}</p>
              </div>
            </div>

            {selectedSkill.rankRequired > 1 && (
              <div className="mt-3 text-xs text-yellow-400">
                Requires Rank {selectedSkill.rankRequired}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
