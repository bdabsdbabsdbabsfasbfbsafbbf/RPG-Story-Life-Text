import { useState, type CSSProperties } from "react";
import { Shield } from "lucide-react";

interface PreviewItem {
  item: { name: string; icon?: string | null; rarity?: string };
}

interface CharacterPreviewProps<T extends PreviewItem> {
  equipped: Record<string, T>;
  onItemClick?: (inv: T) => void;
  className?: string;
  gender?: "male" | "female";
}

const SPRITE_DIMS: Record<string, { w: number; h: number }> = {
  male: { w: 71, h: 160 },
  female: { w: 63, h: 160 },
};

const SPRITE_POS: Record<
  string,
  { top: string; left: string; width: string; height: string; rotate?: number; z?: number }
> = {
  helm: { top: "2%", left: "16%", width: "68%", height: "24%", z: 30 },
  necklace: { top: "24%", left: "34%", width: "32%", height: "15%", z: 30 },
  armor: { top: "27%", left: "8%", width: "84%", height: "36%", z: 30 },
  cape: { top: "4%", left: "-10%", width: "120%", height: "52%", z: 0 },
  weapon: { top: "32%", left: "54%", width: "42%", height: "40%", rotate: 12, z: 30 },
  ring: { top: "58%", left: "2%", width: "22%", height: "22%", z: 30 },
};

const SLOT_LABELS: Record<string, string> = {
  helm: "E",
  necklace: "C",
  armor: "A",
  cape: "P",
  weapon: "W",
  ring: "R",
};

export default function CharacterPreview<T extends PreviewItem>({
  equipped,
  onItemClick,
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
  const slotKeys = ["cape", "helm", "necklace", "armor", "weapon", "ring"];

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
        style={{ aspectRatio: `${dims.w} / ${dims.h}`, height: 240 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(168,85,247,0.15),transparent_60%)]" />

        {slotKeys.map((key) => {
          const pos = SPRITE_POS[key];
          const inv = equipped[key];
          const style: CSSProperties = {
            position: "absolute",
            top: pos.top,
            left: pos.left,
            width: pos.width,
            height: pos.height,
            zIndex: pos.z ?? 20,
            transform: pos.rotate ? `rotate(${pos.rotate}deg)` : undefined,
          };
          if (inv?.item?.icon) {
            return (
              <button
                key={key}
                style={style}
                onClick={() => onItemClick?.(inv)}
                title={inv.item.name}
                className="group"
              >
                <img
                  src={inv.item.icon}
                  alt={inv.item.name}
                  className="w-full h-full object-contain drop-shadow-[0_0_4px_rgba(0,0,0,0.6)] transition-transform group-hover:scale-110"
                  style={{ imageRendering: "pixelated" }}
                />
              </button>
            );
          }
          return (
            <div
              key={key}
              style={style}
              className="flex items-center justify-center rounded-md border border-dashed border-dark-600/80 bg-dark-800/30"
            >
              <span className="text-[9px] text-gray-600 font-bold">{SLOT_LABELS[key]}</span>
            </div>
          );
        })}

        <img
          src={`/sprites/${gender}.png`}
          alt="Personagem"
          className="absolute inset-0 w-full h-full object-contain"
          style={{ imageRendering: "pixelated", zIndex: 10 }}
          draggable={false}
        />
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-500">
        <Shield size={10} className="text-yellow-500" />
        Clique num item para ver detalhes
      </div>
    </div>
  );
}
