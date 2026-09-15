"use client";

import { useState } from "react";
import KanjiCard from "./KanjiCard";

// Mock temporal: 108 kanjis para probar paginacion (100 en pagina 1, 8 en pagina 2).
// Se reemplaza en Fase 5 por la lectura real desde la BDD.
const KANJIS_MOCK = [
  ..."一二三四五六七八九十百千円日月火水木金土",
  ..."天気空雨花山川人男女子口目耳手足上下右左",
  ..."中学校大小白入出見立休名本車年先生古新友",
  ..."父母今分半午前後万毎週間時何語会社道電言",
  ..."行買食読話聞書国少多東西南北高魚外長店安",
  ..."駅飲未好楽音犬猫",
];

const PAGE_SIZE = 100;

export default function KanjiCardList() {
  const [page, setPage] = useState(0);

  const total = KANJIS_MOCK.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const visibles = KANJIS_MOCK.slice(start, start + PAGE_SIZE);

  const hayAnterior = page > 0;
  const haySiguiente = page < totalPages - 1;

  return (
    <section className="flex flex-col gap-3 p-4">
      {/* barra superior: contador + controles de pagina */}
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-zinc-400">
          <span className="text-fuchsia-300">{visibles.length}</span>
          <span className="mx-0.5 text-zinc-600">/</span>
          <span className="text-zinc-300">{total}</span>
          <span className="ml-2 text-zinc-500">kanjis en pantalla</span>
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

      {/* grid tipo tabla periodica: 10 columnas fijas, scroll horizontal si no cabe */}
      <div className="overflow-x-auto">
        <div className="grid min-w-[520px] grid-cols-10 gap-1.5">
          {visibles.map((k) => (
            <KanjiCard key={k} caracter={k} />
          ))}
        </div>
      </div>
    </section>
  );
}
