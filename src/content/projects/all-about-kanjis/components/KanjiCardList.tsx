"use client";

import { useState } from "react";
import KanjiCard from "./KanjiCard";
import type { KanjiEnListado } from "../db/queries";

const PAGE_SIZE = 80;

type Props = {
  kanjis: KanjiEnListado[];
  selectedId: number | null;
  onSelect: (kanji: KanjiEnListado) => void;
};

export default function KanjiCardList({
  kanjis,
  selectedId,
  onSelect,
}: Props) {
  // El padre remonta este componente (via key) al cambiar nivel o filtros,
  // asi que la pagina vuelve a 0 sin necesidad de un efecto.
  const [pageState, setPage] = useState(0);

  const total = kanjis.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // Si la lista se achica (p. ej. quitar un destacado con el filtro activo),
  // la pagina guardada puede quedar fuera de rango.
  const page = Math.min(pageState, totalPages - 1);
  const start = page * PAGE_SIZE;
  const visibles = kanjis.slice(start, start + PAGE_SIZE);
  const rangoDesde = total === 0 ? 0 : start + 1;
  const rangoHasta = start + visibles.length;

  const hayAnterior = page > 0;
  const haySiguiente = page < totalPages - 1;

  // Flechas de pagina: solo el chevron en fucsia, sin borde ni fondo (mismo
  // formato que las flechas de Celebridad / Serie). SVG y no el glifo ‹ ›:
  // el glifo queda a la altura que le da la fuente y no se centra con los
  // numeros. p-1 mantiene un area de click comoda aunque no se vea el boton.
  const FLECHA =
    "flex items-center p-1 text-fuchsia-400 transition hover:scale-110 hover:text-fuchsia-200 disabled:cursor-not-allowed disabled:text-zinc-700 disabled:hover:scale-100";

  return (
    <section className="flex flex-col gap-3 p-4">
      {/* barra superior: contador + controles de pagina */}
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-zinc-400">
          <span className="text-violet-300">{rangoDesde}</span>
          <span className="mx-0.5 text-zinc-600">–</span>
          <span className="text-violet-300">{rangoHasta}</span>
          <span className="mx-1 text-zinc-500">de</span>
          <span className="text-zinc-300">{total}</span>
          <span className="ml-2 text-zinc-500">kanjis</span>
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={!hayAnterior}
            aria-label="Pagina anterior"
            className={FLECHA}
          >
            <Chevron d="M15 18l-6-6 6-6" />
          </button>
          <span className="tabular-nums text-zinc-400">
            <span className="text-violet-200">{page + 1}</span>
            <span className="mx-0.5 text-zinc-600">/</span>
            <span className="text-zinc-300">{totalPages}</span>
          </span>
          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={!haySiguiente}
            aria-label="Pagina siguiente"
            className={FLECHA}
          >
            <Chevron d="M9 18l6-6-6-6" />
          </button>
        </div>
      </div>

      {/* grid tipo tabla periodica: 8 columnas fijas.
          En mobile hay scroll horizontal cuando el min-w no cabe. En desktop
          se permite overflow visible para que el tooltip del hover pueda
          salirse de la caja hacia arriba sin ser recortado. */}
      <div className="overflow-x-auto md:overflow-visible">
        <div className="grid min-w-105 grid-cols-8 gap-1.5">
          {visibles.map((k) => (
            <KanjiCard
              key={k.id}
              caracter={k.caracter}
              significado={k.significado}
              isSelected={k.id === selectedId}
              onClick={() => onSelect(k)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Chevron({ d }: { d: string }) {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}
