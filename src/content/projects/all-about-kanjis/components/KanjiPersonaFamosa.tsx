"use client";

import { useState } from "react";
import Image from "next/image";

export type Persona = {
  nombre: string;
  furigana?: string | null;
  descripcion?: string | null;
  urlImagen?: string | null;
};

type Props = {
  personas?: Persona[];
};

// Muestra una persona a la vez: imagen centrada y la info debajo. Si el
// kanji tiene 2+ personas aparecen flechas a los costados de la imagen
// para alternar (circular: desde la ultima vuelve a la primera).
// El consumidor debe pasar un `key` que cambie con el kanji para que el
// indice vuelva a 0 al cambiar de seleccion.
export default function KanjiPersonaFamosa({ personas = [] }: Props) {
  const [indice, setIndice] = useState(0);
  const total = personas.length;
  const persona = personas[indice];
  const conFlechas = total > 1;

  const mover = (paso: number) => setIndice((i) => (i + paso + total) % total);

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-fuchsia-500/40 bg-zinc-900/60 shadow-[0_0_10px_rgba(217,70,239,0.25)]">
      <div className="flex items-center justify-between border-b border-zinc-700 px-3 py-2 font-mono text-xs tracking-widest text-fuchsia-300">
        PERSONA FAMOSA
        {conFlechas && (
          <span className="text-zinc-500">
            {indice + 1}/{total}
          </span>
        )}
      </div>

      {persona ? (
        <div className="flex flex-col items-center gap-3 p-3">
          <div className="flex items-center gap-3">
            {conFlechas && (
              <BotonFlecha
                direccion="izq"
                onClick={() => mover(-1)}
                label="Persona anterior"
              />
            )}
            <div className="relative size-24 shrink-0 overflow-hidden rounded border border-dashed border-zinc-700 bg-zinc-900/40 lg:size-28">
              {persona.urlImagen ? (
                <Image
                  src={persona.urlImagen}
                  alt={persona.nombre}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="flex h-full items-center justify-center font-mono text-[9px] tracking-wider text-zinc-600">
                  sin img
                </span>
              )}
            </div>
            {conFlechas && (
              <BotonFlecha
                direccion="der"
                onClick={() => mover(1)}
                label="Persona siguiente"
              />
            )}
          </div>

          <div className="flex min-w-0 flex-col items-center gap-1 text-center">
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(persona.nombre)}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`Buscar ${persona.nombre} en Google`}
              className="w-fit font-mono text-sm text-fuchsia-200 underline decoration-fuchsia-500/40 underline-offset-4 transition hover:text-white hover:decoration-fuchsia-300 lg:text-base"
            >
              {persona.nombre}
            </a>
            {persona.furigana && (
              <span className="font-mono text-xs text-fuchsia-300/80">
                {persona.furigana}
              </span>
            )}
            {persona.descripcion && (
              <span className="line-clamp-3 text-xs leading-snug text-zinc-400">
                {persona.descripcion}
              </span>
            )}
          </div>
        </div>
      ) : (
        <span className="p-3 font-mono text-[10px] tracking-wider text-zinc-600">
          sin datos
        </span>
      )}
    </div>
  );
}

function BotonFlecha({
  direccion,
  onClick,
  label,
}: {
  direccion: "izq" | "der";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-full border border-fuchsia-500/40 text-fuchsia-300 transition hover:bg-fuchsia-500 hover:text-black"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={direccion === "izq" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
      </svg>
    </button>
  );
}
