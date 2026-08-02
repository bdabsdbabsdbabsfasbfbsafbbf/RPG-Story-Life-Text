import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { charactersApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { useGameStore } from "../store/gameStore";
import type { CharacterIndex, GameClass, Race, Trait } from "../types";
import { BookOpen, Dices, Shield, Swords, UserPlus, Wand2 } from "lucide-react";
import toast from "react-hot-toast";

const RARITY_COLORS: Record<string, string> = {
  comum: "text-gray-300 border-gray-600 bg-gray-600/10",
  incomum: "text-green-300 border-green-500/60 bg-green-500/10",
  rara: "text-blue-300 border-blue-500/60 bg-blue-500/10",
  epica: "text-purple-300 border-purple-500/60 bg-purple-500/10",
  lendaria: "text-amber-300 border-amber-400/60 bg-amber-400/10",
};

function RarityBadge({ rarity }: { rarity?: string }) {
  const r = rarity || "comum";
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${RARITY_COLORS[r] ?? RARITY_COLORS.comum}`}
    >
      {r}
    </span>
  );
}

export function CreateCharacterPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const setCharacter = useGameStore((s) => s.setCharacter);

  const [index, setIndex] = useState<CharacterIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [classId, setClassId] = useState<string | null>(null);
  const [rolledRace, setRolledRace] = useState<Race | null>(null);
  const [rolledTrait, setRolledTrait] = useState<Trait | null>(null);
  const [raceTickets, setRaceTickets] = useState(3);
  const [traitTickets, setTraitTickets] = useState(3);
  const [rolling, setRolling] = useState<"race" | "trait" | null>(null);
  const [creating, setCreating] = useState(false);
  const [showIndex, setShowIndex] = useState(false);

  useEffect(() => {
    Promise.all([charactersApi.index(), charactersApi.tickets()])
      .then(([idx, t]) => {
        setIndex(idx.data);
        setRaceTickets(t.data.raceRerolls ?? 3);
        setTraitTickets(t.data.traitRerolls ?? 3);
      })
      .catch(() => toast.error("Failed to load character options"))
      .finally(() => setLoading(false));
  }, []);

  const handleRoll = async (type: "race" | "trait") => {
    setRolling(type);
    try {
      const { data } = await charactersApi.roll(type);
      if (type === "race") {
        setRolledRace(data.result);
        setRaceTickets(data.ticketsLeft);
      } else {
        setRolledTrait(data.result);
        setTraitTickets(data.ticketsLeft);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Roll failed");
    } finally {
      setRolling(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !classId || !rolledRace || !rolledTrait) return;
    setCreating(true);
    try {
      const { data } = await charactersApi.create({
        name: name.trim(),
        classId,
        raceId: rolledRace.id,
        traitId: rolledTrait.id,
      });
      const updatedUser = { ...user!, characters: [...(user?.characters || []), data] };
      setUser(updatedUser);
      setCharacter(data);
      toast.success(`Character ${data.name} created!`);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create character");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const classCards = index?.classes || [];

  return (
    <div className="min-h-screen bg-dark-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold glow-text flex items-center justify-center gap-3">
            <Dices size={28} /> Create Your Character
          </h1>
          <p className="text-gray-400 mt-2">
            Escolha sua classe, role a raça e o trait separadamente e compare no catálogo
            (index) qual é melhor — tudo por raridade.
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          {/* Class (por escolha) */}
          <section className="panel p-4">
            <h2 className="text-lg font-display font-semibold mb-3 flex items-center gap-2">
              <Swords size={18} className="text-purple-400" /> 1. Class
            </h2>
            {classCards.length === 0 && (
              <p className="text-sm text-gray-500">No starter classes available yet.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {classCards.map((cls: GameClass) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setClassId(cls.id)}
                  className={`card text-left p-4 transition-all ${
                    classId === cls.id ? "border-purple-500/60 bg-purple-500/10 ring-1 ring-purple-500/40" : "hover:border-purple-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-bold">{cls.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-300 capitalize">{cls.role}</span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{cls.description}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    HP {cls.baseHp} • Mana {cls.baseMana} • ATK {cls.baseAttack} • DEF {cls.baseDefense}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Rolagem separada: raça e trait */}
          <section className="panel p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                <Dices size={18} className="text-cyan-400" /> 2. Rolls (separados)
              </h2>
              <button
                type="button"
                onClick={() => setShowIndex((v) => !v)}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <BookOpen size={16} /> {showIndex ? "Fechar catálogo" : "Ver catálogo (index)"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Race roll */}
              <div className="card p-4 border-cyan-500/40">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display font-bold text-cyan-300 flex items-center gap-2">
                    <Dices size={16} /> Race
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleRoll("race")}
                    disabled={rolling !== null || raceTickets <= 0}
                    className="btn-secondary flex items-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Dices size={13} />
                    {rolling === "race" ? "Rolling..." : `Roll (${raceTickets})`}
                  </button>
                </div>
                {rolledRace ? (
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      <p className="font-display font-bold text-lg">{rolledRace.name}</p>
                      <RarityBadge rarity={rolledRace.rarity} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{rolledRace.description}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {Object.entries(rolledRace.traits || {}).map(([k, v]) => (
                        <span key={k} className="text-[11px] px-1.5 py-0.5 rounded bg-dark-800 border border-dark-600 text-gray-300">
                          {v > 0 ? "+" : ""}{v} {k}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Role para sortear sua raça (por raridade).</p>
                )}
              </div>

              {/* Trait roll */}
              <div className="card p-4 border-green-500/40">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display font-bold text-green-300 flex items-center gap-2">
                    <Wand2 size={16} /> Trait
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleRoll("trait")}
                    disabled={rolling !== null || traitTickets <= 0}
                    className="btn-secondary flex items-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Dices size={13} />
                    {rolling === "trait" ? "Rolling..." : `Roll (${traitTickets})`}
                  </button>
                </div>
                {rolledTrait ? (
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      <p className="font-display font-bold text-lg">{rolledTrait.name}</p>
                      <RarityBadge rarity={rolledTrait.rarity} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{rolledTrait.description}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {Object.entries(rolledTrait.modifiers || {}).map(([k, v]) => (
                        <span key={k} className="text-[11px] px-1.5 py-0.5 rounded bg-dark-800 border border-dark-600 text-gray-300">
                          {v > 0 ? "+" : ""}{v} {k}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Role para sortear seu trait (por raridade).</p>
                )}
              </div>
            </div>

            {/* Index: catálogo separado por raridade */}
            {showIndex && index && (
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="font-display font-semibold text-cyan-300 mb-2">Races por raridade</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {index.races.map((r) => (
                      <div key={r.id} className="card p-3 border-dark-600">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold">{r.name}</span>
                          <RarityBadge rarity={r.rarity} />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">{r.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(r.traits || {}).map(([k, v]) => (
                            <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-dark-800 border border-dark-600 text-gray-300">
                              {v > 0 ? "+" : ""}{v} {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-green-300 mb-2">Traits por raridade</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {index.traits.map((t) => (
                      <div key={t.id} className="card p-3 border-dark-600">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold">{t.name}</span>
                          <RarityBadge rarity={t.rarity} />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">{t.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(t.modifiers || {}).map(([k, v]) => (
                            <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-dark-800 border border-dark-600 text-gray-300">
                              {v > 0 ? "+" : ""}{v} {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Name + submit */}
          <section className="panel p-4 flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="text-sm text-gray-400 block mb-1">Character name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-rpg w-full"
                placeholder="Ex: Darkin"
                maxLength={50}
                required
              />
            </div>
            <button
              type="submit"
              disabled={!name.trim() || !classId || !rolledRace || !rolledTrait || creating}
              className="btn-primary flex items-center gap-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus size={18} />
              {creating ? "Creating..." : "Create Character"}
            </button>
          </section>

          {classId && (!rolledRace || !rolledTrait) && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Shield size={12} /> Role no passo 2 para sortear sua raça e trait.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
