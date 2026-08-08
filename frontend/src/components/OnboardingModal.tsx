import { useEffect, useState } from "react";
import { User, Swords, Backpack, Map, ScrollText, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STEPS = [
  {
    icon: User,
    title: "Bem-vindo, aventureiro!",
    body: "Crie seu personagem e escolha entre 5 classes únicas. Cada classe tem sua própria árvore de habilidades, passivas e estilo de jogo.",
    to: "/classes",
    cta: "Escolher classe",
  },
  {
    icon: Swords,
    title: "Enfrente monstros",
    body: "Abra o Mapa e comece um combate. Use suas habilidades, beba poções e colete drops raros! Seu progresso é salvo automaticamente — pode sair e voltar.",
    to: "/map",
    cta: "Ir para o mapa",
  },
  {
    icon: Backpack,
    title: "Gerencie seu inventário",
    body: "Equipe itens melhores, venda drops indesejados no mercado e desbloqueie novas classes conforme seu nível sobe.",
    to: "/inventory",
    cta: "Abrir inventário",
  },
  {
    icon: ScrollText,
    title: "Complete missões",
    body: "Aceite quests com NPCs, complete objetivos e reivindique recompensas. Questes encadeadas liberam chefes como o Goblin Bruxo!",
    to: "/quests",
    cta: "Ver quests",
  },
];

export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("rpg_onboarding_done")) {
      setOpen(true);
    }
  }, []);

  const finish = () => {
    localStorage.setItem("rpg_onboarding_done", "1");
    setOpen(false);
  };

  const current = STEPS[step];

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const goTo = () => {
    navigate(current.to);
    finish();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="panel p-6 max-w-md w-full relative">
        <button onClick={finish} className="absolute top-4 right-4 text-gray-500 hover:text-gray-300">
          <X size={18} />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-4">
          <current.icon size={32} className="text-white" />
        </div>

        <h2 className="text-xl font-display font-bold mb-2">{current.title}</h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">{current.body}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-purple-500" : "w-3 bg-dark-600"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={finish} className="text-xs text-gray-500 hover:text-gray-300 px-2">
              Pular
            </button>
            {step === STEPS.length - 1 ? (
              <button onClick={goTo} className="btn-primary text-sm">
                Começar aventura
              </button>
            ) : (
              <>
                <button onClick={goTo} className="btn-secondary text-sm">
                  {current.cta}
                </button>
                <button onClick={next} className="btn-primary text-sm">
                  Próximo
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
