import { useEffect, useMemo, useState } from "react";

interface Manifest {
  [category: string]: string[];
}

const CAT_LABELS: Record<string, string> = {
  Aneis: "Anéis",
  Armaduras: "Armaduras",
  Armas: "Armas",
  Capas: "Capas",
  Colares: "Colares",
  Elmo: "Elmos",
  "Elmos Magicos": "Elmos Mágicos",
  Potion: "Poções",
  Robes: "Robes",
  Raridade: "Raridade",
  Skills: "Skills",
  Classes: "Classes",
  "Drop Boss": "Drops",
  Encantamento: "Encantamento",
};

const ICON_BASE = "/icons/64x64";

function pickIconUrl(item: string | null | undefined): string | null {
  if (!item) return null;
  if (item.startsWith("/") || item.startsWith("http")) return item;
  return null;
}

const inputClass =
  "w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none";

interface IconPickerProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function IconPicker({ value, onChange, placeholder }: IconPickerProps) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [loadErr, setLoadErr] = useState(false);
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<string>("");

  useEffect(() => {
    fetch("/icons/manifest.json")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Manifest) => {
        setManifest(data);
        setCat(Object.keys(data)[0] ?? "");
      })
      .catch(() => setLoadErr(true));
  }, []);

  const cats = useMemo(() => (manifest ? Object.keys(manifest) : []), [manifest]);
  const files = useMemo(() => (manifest && cat ? manifest[cat] || [] : []), [manifest, cat]);

  const currentUrl = pickIconUrl(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center overflow-hidden shrink-0">
          {currentUrl ? (
            <img src={currentUrl} alt="" className="w-full h-full object-contain" />
          ) : (
            <span className="text-gray-600 text-[10px]">sem</span>
          )}
        </div>
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          placeholder={placeholder || "/icons/64x64/..."}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-3 py-2 bg-dark-700 hover:bg-dark-600 text-sm text-white rounded-lg shrink-0"
        >
          Escolher
        </button>
        {currentUrl && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="px-2 py-2 text-gray-400 hover:text-red-400 text-xs shrink-0"
            title="Limpar"
          >
            ✕
          </button>
        )}
      </div>
      {loadErr && (
        <p className="text-xs text-yellow-500">
          Não foi possível carregar a lista de ícones — digite o caminho manualmente (ex: /icons/64x64/Armas/fc1445.png).
        </p>
      )}

      {open && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-dark-800 border border-dark-600 rounded-xl p-4 w-full max-w-3xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">Escolher ícone</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white text-lg">✕</button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                    cat === c ? "bg-accent-600 text-white" : "bg-dark-700 text-gray-400 hover:text-white"
                  }`}
                >
                  {CAT_LABELS[c] || c} ({manifest?.[c].length})
                </button>
              ))}
              <span
                className={`px-2.5 py-1 rounded-full text-xs bg-purple-500/15 text-purple-300 ${
                  cat === "" ? "outline outline-1 outline-purple-400" : ""
                }`}
                onClick={() => setCat("")}
                style={{ cursor: "pointer" }}
              >
                Todos
              </span>
            </div>
            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 overflow-y-auto flex-1 max-h-[52vh] pr-1">
              {(cat === "" ? cats.flatMap((c) => manifest![c].map((f) => `${c}/${f}`)) : files.map((f) => `${cat}/${f}`)).map(
                (rel) => {
                  const url = `${ICON_BASE}/${rel}`;
                  const selected = url === value;
                  return (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => {
                        onChange(url);
                        setOpen(false);
                      }}
                      className={`p-1 rounded-lg border transition-colors ${
                        selected
                          ? "border-accent-500 bg-accent-500/15"
                          : "border-dark-600 hover:border-gray-500 bg-dark-700/50"
                      }`}
                      title={rel}
                    >
                      <img src={url} alt={rel} className="w-full aspect-square object-contain rounded" loading="lazy" />
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}