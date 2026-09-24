"use client";

import { useEffect, useState } from "react";
import KanjiEstadoVacio from "./KanjiEstadoVacio";

type KanjiTrapItem = {
  caracter: string;
  significado?: string | null;
};

type Props = {
  // Para el estado vacio: el kanji grande y tenue sobre el mensaje.
  caracter: string;
  kanjiTraps?: KanjiTrapItem[];
};

// Tablero fijo de 3x3: ningun kanji tiene mas de 9 traps.
const CELDAS = 9;

export default function KanjiTrap({ caracter, kanjiTraps }: Props) {
  const [zoom, setZoom] = useState<KanjiTrapItem | null>(null);
  const traps = (kanjiTraps ?? []).slice(0, CELDAS);

  useEffect(() => {
    if (!zoom) return;
    const cerrarConEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(null);
    };
    window.addEventListener("keydown", cerrarConEscape);
    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, [zoom]);

  return (
    // sin marco amarillo ni glow: mismo borde zinc que las tarjetas vecinas;
    // el amarillo queda en el titulo, los significados y el modal
    <div className="flex flex-col overflow-hidden rounded-md border border-zinc-700 bg-zinc-900/60">
      <div className="flex items-center gap-1.5 border-b border-zinc-700 px-3 py-2 font-mono text-xs tracking-widest text-yellow-300">
        {/* triangulo de advertencia con "!": el kanji se confunde facil */}
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
        KANJI TRAP
      </div>

      {traps.length > 0 ? (
        <div className="p-3">
          {/* Tablero estilo tic tac toe: solo lineas interiores (#), sin marco. */}
          <div className="grid grid-cols-3">
            {Array.from({ length: CELDAS }, (_, i) => {
              const trap = traps[i];
              const bordes = `${i % 3 !== 2 ? "border-r-2" : ""} ${i < 6 ? "border-b-2" : ""}`;

              return trap ? (
                <button
                  key={trap.caracter}
                  type="button"
                  onClick={() => setZoom(trap)}
                  aria-label={`Ampliar ${trap.caracter}${trap.significado ? `: ${trap.significado}` : ""}`}
                  className={`group flex aspect-square min-w-0 cursor-zoom-in flex-col items-center justify-center gap-1 border-zinc-700 px-1 transition hover:bg-yellow-400/10 ${bordes}`}
                >
                  <span className="font-mono text-[2rem] leading-none text-zinc-100 transition group-hover:scale-110 lg:text-[2.5rem]">
                    {trap.caracter}
                  </span>
                  {trap.significado && (
                    <span className="line-clamp-2 max-w-full text-center text-[10px] leading-tight text-yellow-300">
                      {trap.significado}
                    </span>
                  )}
                </button>
              ) : (
                <div
                  key={`vacia-${i}`}
                  aria-hidden
                  className={`aspect-square border-zinc-700 ${bordes}`}
                />
              );
            })}
          </div>
        </div>
      ) : (
        // flex-1: ocupa el alto que le da la fila de la grilla (lo marca
        // Celebridad / Serie), asi el estado vacio queda centrado.
        <div className="flex-1 p-3">
          <KanjiEstadoVacio caracter={caracter}>
            Este kanji es del grupo que no tiene un kanji{" "}
            <span className="text-yellow-300">trampa</span>
          </KanjiEstadoVacio>
        </div>
      )}

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Kanji ${zoom.caracter} ampliado`}
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div className="flex min-w-64 flex-col items-center gap-4 rounded-lg border-2 border-yellow-400/80 bg-zinc-950 px-10 py-8 shadow-[0_0_30px_rgba(250,204,21,0.35)]">
            <span className="font-mono text-[9rem] leading-none text-zinc-100">
              {zoom.caracter}
            </span>
            {zoom.significado && (
              <span className="text-center text-lg text-yellow-300">
                {zoom.significado}
              </span>
            )}
            <span className="font-mono text-[10px] tracking-widest text-zinc-500">
              CLIC O ESC PARA CERRAR
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
