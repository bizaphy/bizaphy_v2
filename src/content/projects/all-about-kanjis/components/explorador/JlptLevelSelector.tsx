"use client";

import {
  DISABLED_LEVELS,
  LEVEL_INFO,
  LEVELS,
  type Level,
} from "../../data/niveles-jlpt-info";

type Props<NivelSeleccionable extends Level = Level> = {
  selected: NivelSeleccionable;
  onSelect: (level: NivelSeleccionable) => void;
};

export default function JlptLevelSelector<NivelSeleccionable extends Level>({
  selected,
  onSelect,
}: Props<NivelSeleccionable>) {
  const info = LEVEL_INFO[selected];

  return (
    <div className="flex flex-wrap items-stretch gap-4 p-4">
      {/* division izquierda: cuadrado con el nivel actualmente seleccionado */}
      <div className="flex w-24 shrink-0 items-center justify-center rounded-md border border-fuchsia-400/60 bg-fuchsia-500/15 font-mono text-3xl font-bold text-fuchsia-100 shadow-[0_0_12px_rgba(217,70,239,0.3)]">
        {selected}
      </div>

      {/* linea divisoria sutil entre el nivel actual y los selectores */}
      <div className="w-px bg-zinc-700/70" aria-hidden />

      {/* division central: 5 circulos, de N5 a N1. Nunca se parten en dos filas;
          si el bloque completo baja de linea, ml-auto lo alinea a la derecha. */}
      <div className="ml-auto flex shrink-0 flex-nowrap items-center gap-2 sm:gap-3">
        {LEVELS.map((level) => {
          const isDisabled = DISABLED_LEVELS.includes(level);
          const isSelected = selected === level;

          return (
            <button
              key={level}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(level as NivelSeleccionable)}
              aria-pressed={isSelected}
              aria-label={`Nivel ${level}${isDisabled ? " (proximamente)" : ""}`}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold sm:h-15 sm:w-15 sm:text-base transition ${
                isDisabled
                  ? "cursor-not-allowed border border-zinc-600 bg-zinc-800 text-zinc-500"
                  : isSelected
                    ? "border-2 border-fuchsia-400 bg-fuchsia-500/25 text-fuchsia-200 shadow-[0_0_12px_rgba(217,70,239,0.7)]"
                    : "border border-violet-300/40 bg-zinc-900 text-violet-300 hover:border-violet-300 hover:shadow-[0_0_10px_rgba(196,181,253,0.4)]"
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
        className="relative min-w-[16rem] flex-1 rounded-md border border-zinc-700 bg-zinc-900/60 py-3 pr-10 pl-4"
      >
        <svg
          aria-hidden
          className="absolute top-2.5 right-2.5 h-5 w-5 fill-yellow-300/80 text-yellow-200"
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
            <span className="text-violet-200">{info.kanjisAcumulados}</span>
          </div>
          <div>
            <span className="text-zinc-500">Aparición en periódicos:</span>{" "}
            <span className="text-violet-200">{info.cobertura}</span>
          </div>
        </div>
        <p className="mt-2 border-t border-zinc-800 pt-2 text-sm leading-snug text-zinc-300">
          {info.capacidad}
        </p>
      </aside>
    </div>
  );
}
