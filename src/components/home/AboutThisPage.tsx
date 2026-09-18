"use client";

//panel con estetica de stereo analogico: placa metalica + LEDs + medidor tipo VU + dial
//muestra el stack, la paleta de colores y la tipografia de la pagina

import { useState } from "react";

type Tech = { name: string; channel: string };
type Swatch = { label: string; value: string; level: number }; //level 0-100 para el "medidor" de la paleta

const TECHS: Tech[] = [
  { name: "Next.js", channel: "CH-01" },
  { name: "Tailwind CSS", channel: "CH-02" },
  { name: "PostgreSQL", channel: "CH-03" },
  { name: "Neon", channel: "CH-04" },
  { name: "Drizzle ORM", channel: "CH-05" },
];

//paleta expresada como niveles para dibujar barras estilo ecualizador
const PALETTE: Swatch[] = [
  { label: "fuchsia-500", value: "#d946ef", level: 92 },
  { label: "fuchsia-400", value: "#e879f9", level: 78 },
  { label: "zinc-950", value: "#09090b", level: 88 },
  { label: "zinc-500", value: "#71717a", level: 55 },
  { label: "zinc-300", value: "#d4d4d8", level: 40 },
  { label: "green-400", value: "#4ade80", level: 30 },
  { label: "yellow-400", value: "#facc15", level: 22 },
  { label: "red-500", value: "#ef4444", level: 18 },
];

//tornillo estilizado para los angulos de la placa
function Screw() {
  return (
    <div className="relative h-2.5 w-2.5 rounded-full border border-zinc-700 bg-zinc-800">
      <div className="absolute top-1/2 left-1/2 h-[1px] w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-zinc-950" />
    </div>
  );
}

export default function AboutThisPage() {
  //estado del "switch" de la perilla: true = Oxanium, false = fuente default del sistema
  const [useOxanium, setUseOxanium] = useState(true);
  //la perilla se rota ligeramente a izquierda/derecha segun el estado
  const knobRotation = useOxanium ? 30 : -30;

  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
      {/* placa superior tipo panel de amplificador */}
      <div className="flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 py-2">
        <div className="flex items-center gap-3">
          <Screw />
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-400">
            about this page
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-600">
            model bzphy-v2
          </span>
          <Screw />
        </div>
      </div>

      {/* cuerpo del stereo con las 3 secciones */}
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-[1fr_1.4fr_0.9fr]">
        {/* ---------- STACK: canales con LEDs verdes ---------- */}
        <section className="rounded border border-zinc-800 bg-zinc-950 p-3">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500">
              stack
            </span>
            <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-700">
              active
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {TECHS.map((t) => (
              <li
                key={t.name}
                className="flex items-center gap-2 border-b border-dashed border-zinc-800/70 pb-1.5 last:border-0 last:pb-0"
              >
                <span className="font-mono text-fuchsia-500">&gt;</span>
                <span className="font-mono text-xs text-zinc-200">
                  {t.name}
                </span>
                <span className="ml-auto font-mono text-[9px] text-zinc-600">
                  {t.channel}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- PALETA: barras tipo ecualizador ---------- */}
        <section className="rounded border border-zinc-800 bg-zinc-950 p-3">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500">
              palette · eq
            </span>
            <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-700">
              hex
            </span>
          </div>
          {/* riel del medidor: lineas horizontales de referencia */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between opacity-40">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-px w-full bg-zinc-700/50" />
              ))}
            </div>
            <div className="relative flex h-24 items-stretch justify-between gap-1">
              {PALETTE.map((c) => (
                <div
                  key={c.label}
                  title={`${c.label} · ${c.value}`}
                  className="flex flex-1 flex-col justify-end"
                >
                  <div
                    className="w-full rounded-sm"
                    style={{
                      height: `${c.level}%`,
                      backgroundColor: c.value,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* etiquetas hex debajo del medidor */}
          <div className="mt-2 flex justify-between gap-1">
            {PALETTE.map((c) => (
              <span
                key={c.label}
                className="flex-1 text-center font-mono text-[7px] tracking-wider text-zinc-600"
              >
                {c.value.replace("#", "").slice(0, 3)}
              </span>
            ))}
          </div>
        </section>

        {/* ---------- TIPOGRAFIA: dial estilo perilla ---------- */}
        <section className="flex flex-col rounded border border-zinc-800 bg-zinc-950 p-3">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500">
              font
            </span>
            <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-700">
              google
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            {/* base fija con muescas de posicion (min / max) */}
            <button
              type="button"
              onClick={() => setUseOxanium((v) => !v)}
              aria-label="Cambiar tipografia"
              aria-pressed={useOxanium}
              className="group relative h-16 w-16 cursor-pointer rounded-full border border-zinc-800 bg-zinc-950 shadow-[0_2px_6px_rgba(0,0,0,0.7)] active:shadow-[0_1px_3px_rgba(0,0,0,0.9)] active:translate-y-px transition-all"
            >
              {/* muescas de posicion (fijas, no rotan) */}
              {[-30, 30].map((deg) => (
                <span
                  key={deg}
                  className="absolute top-1/2 left-1/2 h-full w-0.5 -translate-x-1/2 -translate-y-1/2"
                  style={{ transform: `translate(-50%,-50%) rotate(${deg}deg)` }}
                >
                  <span className="mx-auto block h-1.5 w-0.5 bg-fuchsia-400/70" />
                </span>
              ))}

              {/* perilla giratoria con ridges tipo estriado */}
              <span
                className="absolute inset-1 rounded-full border border-zinc-950 shadow-[inset_0_2px_3px_rgba(255,255,255,0.18),inset_0_-2px_3px_rgba(0,0,0,0.7),0_1px_2px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-out"
                style={{
                  //conic-gradient: alterna tonos oscuros/claros para simular estrias radiales
                  background:
                    "repeating-conic-gradient(#18181b 0deg 4deg, #3f3f46 4deg 7deg, #52525b 7deg 9deg, #3f3f46 9deg 12deg)",
                  transform: `rotate(${knobRotation}deg)`,
                }}
              >
                {/* tapa central mas clara (parte plana de arriba de la perilla) */}
                <span className="absolute inset-2 rounded-full border border-zinc-700 bg-gradient-to-br from-zinc-400 via-zinc-600 to-zinc-800 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-1px_2px_rgba(0,0,0,0.5)]">
                  {/* linea indicadora sobre la tapa: del centro hacia el borde superior */}
                  <span className="absolute top-0.5 left-1/2 h-1/2 w-0.5 -translate-x-1/2 rounded-full bg-fuchsia-400 shadow-[0_0_4px_#e879f9]" />
                  {/* punto central */}
                  <span className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-950" />
                </span>
              </span>
            </button>

            {/* label MIN / MAX debajo, alineadas con las muescas */}
            <div className="flex w-16 justify-between px-0.5 font-mono text-[7px] uppercase tracking-widest text-zinc-600">
              <span className={!useOxanium ? "text-fuchsia-300" : ""}>sys</span>
              <span className={useOxanium ? "text-fuchsia-300" : ""}>oxa</span>
            </div>

            {/* nombre y preview con la fuente actual */}
            <span
              className="text-sm leading-none text-fuchsia-200"
              style={{
                fontFamily: useOxanium
                  ? undefined
                  : "system-ui, -apple-system, Segoe UI, sans-serif",
              }}
            >
              Aa Bb Cc
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-fuchsia-300">
              {useOxanium ? "Oxanium" : "System"}
            </span>
            <span className="font-mono text-[8px] tracking-wider text-zinc-600">
              {useOxanium ? "200 → 800" : "default"}
            </span>
          </div>
        </section>
      </div>

      {/* pie con tornillos + "modelo" */}
      <div className="flex items-center justify-between border-t border-zinc-700 bg-zinc-900 px-4 py-1.5">
        <Screw />
        <span className="font-mono text-[8px] uppercase tracking-[0.4em] text-zinc-700">
          neon · drizzle · next 15
        </span>
        <Screw />
      </div>
    </div>
  );
}
