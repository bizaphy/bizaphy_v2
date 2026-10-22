"use client";

//tele CRT que muestra la captura de un proyecto. Los botones CH cambian de
//canal (de proyecto) con un golpe de estatica; la pantalla lleva al proyecto.

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { internalProjects } from "@/content/projects";

//cuanto dura la estatica entre canales
const STATIC_MS = 350;

export default function ProjectTV() {
  //arranca en el canal 0 (no al azar) para que el HTML del servidor y del
  //cliente coincidan
  const [canal, setCanal] = useState(0);
  const [estatica, setEstatica] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  //solo los proyectos del sitio: los externos no tienen captura ni pagina propia
  const total = internalProjects.length;
  const proyecto = internalProjects[canal];

  const cambiar = (paso: 1 | -1) => {
    //el canal cambia de inmediato, pero queda tapado por la estatica
    setCanal((c) => (c + paso + total) % total);
    setEstatica(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setEstatica(false), STATIC_MS);
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-700 bg-zinc-900 p-3">
      <div className="flex flex-1 gap-3">
        {/* ---------- pantalla ---------- */}
        <div className="relative flex-1 overflow-hidden rounded-[1.25rem] border-4 border-zinc-950 bg-black shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]">
          <Link
            href={`/projects/${proyecto.slug}`}
            //en movil la pantalla mantiene 16:10; en la grilla toma el alto
            //de la fila (lo marca el panel BIOS de al lado)
            className="group relative block aspect-[16/10] w-full sm:aspect-auto sm:h-full sm:min-h-40"
            aria-label={`Ver proyecto ${proyecto.title}`}
          >
            <Image
              src={proyecto.image}
              alt=""
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover object-top opacity-90 saturate-[0.85] transition duration-300 group-hover:opacity-100"
            />
            {/* scanlines, igual que en Hero y StatsCard */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.3)_1px,transparent_1px)] bg-size-[100%_3px]"
            />
            {/* vineta: bordes oscuros de tubo CRT */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.75)_100%)]"
            />
            {estatica && (
              <div
                aria-hidden="true"
                className="tv-static pointer-events-none absolute inset-0 opacity-90"
              />
            )}
            {/* OSD verde de tele vieja */}
            <span className="absolute top-2 right-3 font-mono text-sm font-bold text-green-400 drop-shadow-[0_0_4px_rgba(74,222,128,0.9)]">
              CH {String(canal + 1).padStart(2, "0")}
            </span>
            <span
              className={`absolute right-0 bottom-0 left-0 truncate bg-black/70 px-3 py-1 font-mono text-xs text-zinc-200 transition group-hover:text-fuchsia-300 ${estatica ? "invisible" : ""}`}
            >
              {proyecto.title}
            </span>
          </Link>
        </div>

        {/* ---------- panel lateral: parlante + botones ---------- */}
        <div className="flex w-10 shrink-0 flex-col items-center justify-between py-1">
          {/* rejilla del parlante */}
          <div aria-hidden="true" className="flex flex-col gap-1">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className="h-0.5 w-6 rounded-full bg-zinc-950" />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => cambiar(1)}
              aria-label="Canal siguiente"
              className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-1 font-mono text-[9px] leading-none text-zinc-400 transition hover:border-fuchsia-500 hover:text-fuchsia-300 active:translate-y-px"
            >
              CH▲
            </button>
            <button
              type="button"
              onClick={() => cambiar(-1)}
              aria-label="Canal anterior"
              className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-1 font-mono text-[9px] leading-none text-zinc-400 transition hover:border-fuchsia-500 hover:text-fuchsia-300 active:translate-y-px"
            >
              CH▼
            </button>
          </div>
          {/* LED de encendido */}
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]"
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between px-1">
        <span className="font-mono text-[9px] tracking-[0.35em] text-zinc-500 uppercase">
          proyectos tv
        </span>
        <span className="font-mono text-[9px] tracking-widest text-zinc-600">
          {canal + 1}/{total}
        </span>
      </div>
    </div>
  );
}
