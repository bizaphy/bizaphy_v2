//panel estilo BIOS / POST de PC viejo con datos reales del sitio: versiones
//del stack, commit del deploy y dias en linea. Server Component: todo se lee
//al renderizar, sin JS en el cliente.

import Link from "next/link";
import { version as reactVersion } from "react";
import nextPkg from "next/package.json";
import { projectsMeta } from "@/content/projects";

//fecha del primer commit del repo
const PRIMER_COMMIT = "2026-08-28";
const DIA_MS = 24 * 60 * 60 * 1000;

//pausa entre lineas al "bootear"
const PASO_MS = 140;

type Linea = { label: string; valor: string; ok?: boolean };

//fuera del componente: la regla react-hooks/purity no deja llamar Date.now()
//durante el render. Al ser Server Component, se calcula en cada render del
//servidor (la home se regenera cada hora por el fetch de ActivityHeatmap).
const diasEnLinea = () =>
  Math.floor(
    (Date.now() - new Date(`${PRIMER_COMMIT}T00:00:00Z`).getTime()) / DIA_MS,
  );

export default function SystemPanel() {
  //Vercel inyecta estas variables en cada deploy; en local no existen
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
  const rama = process.env.VERCEL_GIT_COMMIT_REF;
  const entorno = process.env.VERCEL_ENV ?? "local";

  const dias = diasEnLinea();

  const lineas: Linea[] = [
    { label: "Main Processor", valor: `Next.js ${nextPkg.version}` },
    { label: "Co-Processor", valor: `React ${reactVersion}` },
    { label: "Runtime", valor: `Node.js ${process.version}` },
    { label: "Memory Test", valor: `${projectsMeta.length} proyectos`, ok: true },
    { label: "Database", valor: "Neon PostgreSQL", ok: true },
    {
      label: "Build",
      valor: sha ? `${sha} (${rama ?? "?"}) · ${entorno}` : "dev local",
    },
    { label: "Uptime", valor: `${dias} días desde ${PRIMER_COMMIT}` },
  ];

  //cada linea aparece un poco despues de la anterior (ver .post-line)
  const delay = (i: number) => ({ animationDelay: `${(i + 1) * PASO_MS}ms` });

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-700 bg-black px-5 py-4 font-mono text-xs text-zinc-300">
      {/* encabezado tipo Award BIOS */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-fuchsia-400 drop-shadow-[0_0_6px_rgba(217,70,239,0.7)]">
            BZPHY Modular BIOS v2.0
          </span>
          <span className="text-zinc-600">Copyright (C) 2026, bizaphy</span>
        </div>
        {/* "logo" de energia, guino a los logos Energy Star del POST */}
        <span
          aria-hidden="true"
          className="shrink-0 rounded border border-fuchsia-500/50 px-1.5 py-0.5 text-[9px] tracking-widest text-fuchsia-500/80"
        >
          ⚡ NEON
        </span>
      </div>

      <ul className="mt-4 flex flex-col gap-1">
        {lineas.map((l, i) => (
          <li key={l.label} className="post-line flex gap-2" style={delay(i)}>
            <span className="w-28 shrink-0 text-zinc-500">{l.label}</span>
            <span className="text-zinc-600">:</span>
            <span className="min-w-0 truncate">{l.valor}</span>
            {l.ok && <span className="ml-auto shrink-0 text-green-400">[ OK ]</span>}
          </li>
        ))}
      </ul>

      <div
        className="post-line mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 text-zinc-500"
        style={delay(lineas.length)}
      >
        <span>
          Press{" "}
          <Link
            href="/about-me"
            className="text-zinc-200 underline decoration-fuchsia-500/60 underline-offset-2 transition hover:text-fuchsia-300"
          >
            DEL
          </Link>{" "}
          to enter SETUP
          <span className="cursor-consola ml-0.5 text-fuchsia-400">_</span>
        </span>
        <span className="text-[10px] text-zinc-700">
          {PRIMER_COMMIT}-BZPHY-V2
        </span>
      </div>

      {/* scanlines suaves, mismo truco que StatsCard */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[100%_3px]"
      />
    </div>
  );
}
