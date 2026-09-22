"use client";

import { useEffect, useState } from "react";
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
  const [page, setPage] = useState(0);

  // Al cambiar la lista (por cambio de nivel), volver a la primera pagina.
  useEffect(() => {
    setPage(0);
  }, [kanjis]);

  const total = kanjis.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const visibles = kanjis.slice(start, start + PAGE_SIZE);
  const rangoDesde = total === 0 ? 0 : start + 1;
  const rangoHasta = start + visibles.length;

  const hayAnterior = page > 0;
  const haySiguiente = page < totalPages - 1;

  return (
    <section className="flex flex-col gap-3 p-4">
      {/* barra superior: contador + controles de pagina */}
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-zinc-400">
          <span className="text-fuchsia-300">{rangoDesde}</span>
          <span className="mx-0.5 text-zinc-600">–</span>
          <span className="text-fuchsia-300">{rangoHasta}</span>
          <span className="mx-1 text-zinc-500">de</span>
          <span className="text-zinc-300">{total}</span>
          <span className="ml-2 text-zinc-500">kanjis</span>
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={!hayAnterior}
            aria-label="Pagina anterior"
            className="flex h-7 w-7 items-center justify-center rounded border border-fuchsia-500/50 bg-zinc-900 text-fuchsia-300 shadow-[0_0_6px_rgba(217,70,239,0.35)] transition hover:border-fuchsia-400 hover:text-white hover:shadow-[0_0_10px_rgba(217,70,239,0.6)] disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none"
          >
            ‹
          </button>
          <span className="tabular-nums text-zinc-400">
            <span className="text-fuchsia-200">{page + 1}</span>
            <span className="mx-0.5 text-zinc-600">/</span>
            <span className="text-zinc-300">{totalPages}</span>
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={!haySiguiente}
            aria-label="Pagina siguiente"
            className="flex h-7 w-7 items-center justify-center rounded border border-fuchsia-500/50 bg-zinc-900 text-fuchsia-300 shadow-[0_0_6px_rgba(217,70,239,0.35)] transition hover:border-fuchsia-400 hover:text-white hover:shadow-[0_0_10px_rgba(217,70,239,0.6)] disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none"
          >
            ›
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
