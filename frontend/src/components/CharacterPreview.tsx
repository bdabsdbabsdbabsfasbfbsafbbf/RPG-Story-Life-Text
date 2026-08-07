import { useState, type CSSProperties } from "react";
import { Shield } from "lucide-react";

interface PreviewItem {
  item: { name: string; icon?: string | null; rarity?: string };
}

interface CharacterPreviewProps<T extends PreviewItem> {
  equipped: Record<string, T>;
  onItemClick?: (inv: T) => void;
  onClassClick?: () => void;
  className?: string;
  gender?: "male" | "female";
}

const SPRITE_DIMS: Record<string, { w: number; h: number }> = {
  male: { w: 71, h: 160 },
  female: { w: 63, h: 160 },
};

// Quadrados de equipamento posicionados SOBRE o personagem (a arma fica fora do doll)
const SLOT_POS: Record<
  string,
  { top: string; left: string; width: string; height: string; centerX?: boolean; z?: number }
> = {
  helm: { top: "1%", left: "50%", width: "54%", height: "20%", centerX: true, z: 30 },
  necklace: { top: "18%", left: "50%", width: "36%", height: "13%", centerX: true, z: 30 },
  armor: { top: "25%", left: "50%", width: "62%", height: "36%", centerX: true, z: 30 },
  ring: { top: "43%", left: "1%", width: "26%", height: "26%", z: 30 },
  cape: { top: "62%", left: "1%", width: "26%", height: "26%", z: 30 },
  class: { top: "74%", left: "50%", width: "46%", height: "22%", centerX: true, z: 30 },
};

const SLOT_LETTERS: Record<string, string> = {
  helm: "E",
  necklace: "C",
  armor: "A",
  ring: "R",
  cape: "P",
  class: "C",
};

export default function CharacterPreview<T extends PreviewItem>({
  equipped,
  onItemClick,
  onClassClick,
  className,
  gender: genderProp,
}: CharacterPreviewProps<T>) {
  const [gender, setGender] = useState<"male" | "female">(
    () => genderProp || (localStorage.getItem("rpg_preview_gender") as "male" | "female") || "male"
  );

  const setG = (g: "male" | "female") => {
    setGender(g);
    localStorage.setItem("rpg_preview_gender", g);
  };

  const dims = SPRITE_DIMS[gender];
  const slotKeys = Object.keys(SLOT_POS);
  const equippedClass = equipped["class"];

  return (
    <div className={`shrink-0 flex flex-col items-center ${className || ""}`}>
      <div className="flex items-center gap-1 mb-2">
        <button
          onClick={() => setG("male")}
          className={`px-2 py-0.5 text-[11px] rounded-md font-medium transition-colors ${
            gender === "male" ? "bg-purple-600 text-white" : "bg-dark-700 text-gray-400 hover:text-gray-200"
          }`}
        >
          M
        </button>
        <button
          onClick={() => setG("female")}
          className={`px-2 py-0.5 text-[11px] rounded-md font-medium transition-colors ${
            gender === "female" ? "bg-purple-600 text-white" : "bg-dark-700 text-gray-400 hover:text-gray-200"
          }`}
        >
          F
        </button>
      </div>

      <div
        className="relative rounded-xl border border-dark-600 bg-dark-900/60 overflow-hidden"
        style={{ aspectRatio: `${dims.w} / ${dims.h}`, height: 280 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(168,85,247,0.15),transparent_60%)]" />

        <img
          src={`/sprites/${gender}.png`}
          alt="Personagem"
          className="absolute inset-0 w-full h-full object-contain"
          style={{ imageRendering: "pixelated", zIndex: 10 }}
          draggable={false}
        />

        {slotKeys.map((key) => {
          const pos = SLOT_POS[key];
          const inv = equipped[key];
          const style: CSSProperties = {
            position: "absolute",
            top: pos.top,
            left: pos.left,
            width: pos.width,
            height: pos.height,
            zIndex: pos.z ?? 20,
          };
          if (pos.centerX) {
            style.transform = "translateX(-50%)";
          }
          const cls = key === "class" ? equippedClass?.item : inv?.item;
          return (
            <button
              key={key}
              style={style}
              onClick={() => (key === "class" ? onClassClick?.() : onItemClick?.(inv))}
              title={key === "class" ? (cls ? `Classe: ${cls.name}` : "Classe") : inv?.item?.name || undefined}
              className={`group rounded-lg border transition-all flex flex-col items-center justify-center gap-0.5 p-0.5 ${
                cls
                  ? "border-purple-500/50 bg-purple-600/25 hover:bg-purple-600/40"
                  : "border-dashed border-dark-600/80 bg-dark-800/35 hover:bg-dark-800/60"
              }`}
            >
              {cls?.icon ? (
                <img
                  src={cls.icon}
                  alt={cls.name}
                  className="max-w-[80%] max-h-[70%] object-contain drop-shadow-[0_0_3px_rgba(0,0,0,0.6)] transition-transform group-hover:scale-110"
                  style={{ imageRendering: "pixelated" }}
                />
              ) : (
                <span className="text-[10px] text-gray-500 font-bold">{SLOT_LETTERS[key]}</span>
              )}
              {cls && (
                <span className="text-[8px] text-purple-200/90 leading-none truncate max-w-full px-0.5">
                  {cls.name}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-500">
        <Shield size={10} className="text-yellow-500" />
        Clique num slot para ver detalhes
      </div>
    </div>
  );
}
