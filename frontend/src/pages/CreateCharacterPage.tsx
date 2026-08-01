import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { charactersApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { useGameStore } from "../store/gameStore";
import type { CharacterIndex, Race, Trait } from "../types";
import { Dices, Shield, Sparkles, Swords, UserPlus, Wand2 } from "lucide-react";
import toast from "react-hot-toast";

const ROLL_LIMIT = 3;

export function CreateCharacterPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const setCharacter = useGameStore((s) => s.setCharacter);

  const [index, setIndex] = useState<CharacterIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [classId, setClassId] = useState<string | null>(null);
  const [raceOptions, setRaceOptions] = useState<Race[]>([]);
  const [traitOptions, setTraitOptions] = useState<Trait[]>([]);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [selectedTrait, setSelectedTrait] = useState<Trait | null>(null);
  const [tickets, setTickets] = useState({ raceRerolls: ROLL_LIMIT, traitRerolls: ROLL_LIMIT });
  const [rolling, setRolling] = useState<"race" | "trait" | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([charactersApi.index(), charactersApi.tickets()])
      .then(([idx, t]) => {
        setIndex(idx.data);
        setTickets({ raceRerolls: t.data.raceRerolls, traitRerolls: t.data.traitRerolls });
      })
      .catch(() => toast.error("Failed to load character options"))
      .finally(() => setLoading(false));
  }, []);

  const handleRoll = async (type: "race" | "trait") => {
    setRolling(type);
    try {
      const { data } = await charactersApi.roll(type);
      if (type === "race") {
        setRaceOptions(data.options);
        setSelectedRace(null);
      } else {
        setTraitOptions(data.options);
        setSelectedTrait(null);
      }
      setTickets((prev) => ({ ...prev, [type === "race" ? "raceRerolls" : "traitRerolls"]: data.ticketsLeft }));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Roll failed");
    } finally {
      setRolling(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !classId || !selectedRace || !selectedTrait) return;
    setCreating(true);
    try {
      const { data } = await charactersApi.create({
        name: name.trim(),
        classId,
        raceId: selectedRace.id,
        traitId: selectedTrait.id,
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
  const allRaces = index?.races || [];
  const allTraits = index?.traits || [];
  const canRollRace = tickets.raceRerolls > 0;
  const canRollTrait = tickets.traitRerolls > 0;

  return (
    <div className="min-h-screen bg-dark-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold glow-text flex items-center justify-center gap-3">
            <Sparkles size={28} /> Create Your Character
          </h1>
          <p className="text-gray-400 mt-2">
            Escolha sua classe, role sua raça e trait (limite de {ROLL_LIMIT} tickets para cada) e comece sua jornada.
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          {/* Class */}
          <section className="panel p-4">
            <h2 className="text-lg font-display font-semibold mb-3 flex items-center gap-2">
              <Swords size={18} className="text-purple-400" /> 1. Class
            </h2>
            {classCards.length === 0 && (
              <p className="text-sm text-gray-500">No starter classes available yet.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {classCards.map((cls) => (
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

          {/* Race */}
          <section className="panel p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                <Dices size={18} className="text-cyan-400" /> 2. Race
              </h2>
              <button
                type="button"
                onClick={() => handleRoll("race")}
                disabled={!canRollRace || !!rolling}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Dices size={16} />
                Roll Race ({tickets.raceRerolls}/{ROLL_LIMIT})
              </button>
            </div>
            {raceOptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {raceOptions.map((race) => (
                  <button
                    key={race.id}
                    type="button"
                    onClick={() => setSelectedRace(race)}
                    className={`card text-left p-4 transition-all ${
                      selectedRace?.id === race.id ? "border-cyan-500/60 bg-cyan-500/10 ring-1 ring-cyan-500/40" : "hover:border-cyan-500/30"
                    }`}
                  >
                    <span className="font-display font-bold">{race.name}</span>
                    <p className="text-xs text-gray-400 mt-1">{race.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(race.traits || {}).map(([k, v]) => (
                        <span key={k} className="text-[11px] px-1.5 py-0.5 rounded bg-dark-800 border border-dark-600 text-gray-300">
                          +{v} {k}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Role para ver 3 raças aleatórias. {canRollRace ? "Você ainda tem tickets." : "Sem tickets restantes."}
              </p>
            )}
            {allRaces.length > 0 && (
              <details className="mt-3 text-sm text-gray-400">
                <summary className="cursor-pointer hover:text-gray-200">Ver catálogo completo de raças</summary>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  {allRaces.map((race) => (
                    <div key={race.id} className="border border-dark-600 rounded-lg p-3">
                      <p className="font-medium text-gray-200">{race.name}</p>
                      <p className="text-xs text-gray-500">{race.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(race.traits || {}).map(([k, v]) => (
                          <span key={k} className="text-[11px] px-1.5 py-0.5 rounded bg-dark-800 text-gray-400">+{v} {k}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </section>

          {/* Trait */}
          <section className="panel p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                <Wand2 size={18} className="text-green-400" /> 3. Trait
              </h2>
              <button
                type="button"
                onClick={() => handleRoll("trait")}
                disabled={!canRollTrait || !!rolling}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Dices size={16} />
                Roll Trait ({tickets.traitRerolls}/{ROLL_LIMIT})
              </button>
            </div>
            {traitOptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {traitOptions.map((trait) => (
                  <button
                    key={trait.id}
                    type="button"
                    onClick={() => setSelectedTrait(trait)}
                    className={`card text-left p-4 transition-all ${
                      selectedTrait?.id === trait.id ? "border-green-500/60 bg-green-500/10 ring-1 ring-green-500/40" : "hover:border-green-500/30"
                    }`}
                  >
                    <span className="font-display font-bold">{trait.name}</span>
                    <p className="text-xs text-gray-400 mt-1">{trait.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(trait.modifiers || {}).map(([k, v]) => (
                        <span key={k} className="text-[11px] px-1.5 py-0.5 rounded bg-dark-800 border border-dark-600 text-gray-300">
                          {v > 0 ? "+" : ""}{v} {k}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Role para ver 3 traits aleatórias. {canRollTrait ? "Você ainda tem tickets." : "Sem tickets restantes."}
              </p>
            )}
            {allTraits.length > 0 && (
              <details className="mt-3 text-sm text-gray-400">
                <summary className="cursor-pointer hover:text-gray-200">Ver catálogo completo de traits</summary>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  {allTraits.map((trait) => (
                    <div key={trait.id} className="border border-dark-600 rounded-lg p-3">
                      <p className="font-medium text-gray-200">{trait.name}</p>
                      <p className="text-xs text-gray-500">{trait.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(trait.modifiers || {}).map(([k, v]) => (
                          <span key={k} className="text-[11px] px-1.5 py-0.5 rounded bg-dark-800 text-gray-400">{v > 0 ? "+" : ""}{v} {k}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
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
              disabled={!name.trim() || !classId || !selectedRace || !selectedTrait || creating}
              className="btn-primary flex items-center gap-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus size={18} />
              {creating ? "Creating..." : "Create Character"}
            </button>
          </section>

          {(classId && (!selectedRace || !selectedTrait)) && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Shield size={12} /> Complete as etapas 2 e 3 rolando e escolhendo raça e trait.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
