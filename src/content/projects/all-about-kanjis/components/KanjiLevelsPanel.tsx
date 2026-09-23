"use client";

const LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
type Level = (typeof LEVELS)[number];

// N2 y N1 todavia no tienen contenido cargado en la BDD, se muestran deshabilitados.
const DISABLED_LEVELS: readonly Level[] = ["N2", "N1"];

type LevelInfo = {
  kanjisAcumulados: string;
  cobertura: string;
  capacidad: string;
};

const LEVEL_INFO: Record<Level, LevelInfo> = {
  N5: {
    kanjisAcumulados: "~100",
    cobertura: "~35% – 45%",
    capacidad:
      "Solo reconocerás caracteres sueltos (números, días, direcciones). El texto será incomprensible.",
  },
  N4: {
    kanjisAcumulados: "~300",
    cobertura: "~70% – 75%",
    capacidad:
      "Distingues palabras comunes de verbos y adjetivos, pero no logras seguir el hilo de las noticias.",
  },
  N3: {
    kanjisAcumulados: "~650",
    cobertura: "~85%",
    capacidad:
      "Puedes entender titulares sencillos y noticias muy locales o adaptadas (como NHK Easy News).",
  },
  N2: {
    kanjisAcumulados: "~1.000",
    cobertura: "~93% – 95%",
    capacidad:
      "Umbral funcional. Puedes navegar y leer artículos de opinión o noticias generales apoyándote en un diccionario.",
  },
  N1: {
    kanjisAcumulados: "~2.000+",
    cobertura: "~99%",
    capacidad:
      "Alfabetización completa. Cubre prácticamente la lista oficial de uso diario (Jōyō Kanji). Lees la prensa con fluidez.",
  },
};

type Props<T extends Level = Level> = {
  selected: T;
  onSelect: (level: T) => void;
};

export default function KanjiLevelsPanel<T extends Level>({
  selected,
  onSelect,
}: Props<T>) {
  const info = LEVEL_INFO[selected];

  return (
    <div className="flex flex-wrap items-stretch gap-4 p-4">
      {/* division izquierda: cuadrado con el nivel actualmente seleccionado */}
      <div className="flex w-24 shrink-0 items-center justify-center rounded-md bg-fuchsia-500 font-mono text-3xl font-bold text-white shadow-[0_0_12px_rgba(217,70,239,0.55)]">
        {selected}
      </div>

      {/* linea divisoria sutil entre el nivel actual y los selectores */}
      <div className="w-px bg-zinc-700/70" aria-hidden />

      {/* division central: 5 circulos, de N5 a N1. Nunca se parten en dos filas;
          si el bloque completo baja de linea, ml-auto lo alinea a la derecha. */}
      <div className="ml-auto flex shrink-0 flex-nowrap items-center gap-3">
        {LEVELS.map((level) => {
          const isDisabled = DISABLED_LEVELS.includes(level);
          const isSelected = selected === level;

          return (
            <button
              key={level}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(level as T)}
              aria-pressed={isSelected}
              aria-label={`Nivel ${level}${isDisabled ? " (proximamente)" : ""}`}
              className={`flex h-15 w-15 shrink-0 items-center justify-center rounded-full font-mono text-base font-semibold transition ${
                isDisabled
                  ? "cursor-not-allowed border border-zinc-600 bg-zinc-800 text-zinc-500"
                  : isSelected
                    ? "border-2 border-fuchsia-400 bg-fuchsia-500/25 text-fuchsia-200 shadow-[0_0_12px_rgba(217,70,239,0.7)]"
                    : "border border-fuchsia-500/70 bg-zinc-900 text-fuchsia-300 shadow-[0_0_6px_rgba(217,70,239,0.35)] hover:border-fuchsia-400 hover:shadow-[0_0_10px_rgba(217,70,239,0.6)]"
              }`}
            >
              {level}
            </button>
          );
        })}
      </div>

      {/* division derecha: informativo del nivel seleccionado */}
      <aside
        aria-live="polite"
        className="relative min-w-[16rem] flex-1 rounded-md border border-fuchsia-500/40 bg-zinc-900/60 py-3 pr-10 pl-4 shadow-[0_0_10px_rgba(217,70,239,0.15)]"
      >
        <svg
          aria-hidden
          className="absolute top-2.5 right-2.5 h-5 w-5 fill-yellow-300/80 text-yellow-200 drop-shadow-[0_0_8px_rgba(253,224,71,0.76)]"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </svg>
        <div className="flex flex-col gap-1 font-mono text-[13px] whitespace-nowrap">
          <div>
            <span className="text-zinc-500">Kanjis acumulados:</span>{" "}
            <span className="text-fuchsia-200">{info.kanjisAcumulados}</span>
          </div>
          <div>
            <span className="text-zinc-500">Aparición en periódicos:</span>{" "}
            <span className="text-fuchsia-200">{info.cobertura}</span>
          </div>
        </div>
        <p className="mt-2 border-t border-zinc-800 pt-2 text-sm leading-snug text-zinc-300">
          {info.capacidad}
        </p>
      </aside>
    </div>
  );
}
