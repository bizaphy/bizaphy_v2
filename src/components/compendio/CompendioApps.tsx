"use client";

import { useState } from "react";
import { CATEGORIAS, TOTAL_APPS, type Licencia } from "./apps";

//colores del badge segun licencia (todos dentro de la paleta fucsia/violeta/zinc)
const LICENCIA_CLASES: Record<Licencia, string> = {
  gratis: "border-violet-300/40 text-violet-300",
  "open source": "border-fuchsia-400/50 text-fuchsia-300",
  freemium: "border-zinc-600 text-zinc-400",
  pago: "border-zinc-700 text-zinc-500",
};

//"todas" muestra cada grupo con su titulo; un id filtra a ese grupo
const TODAS = "todas";

export default function CompendioApps() {
  const [activa, setActiva] = useState(TODAS);

  const filtros = [
    { id: TODAS, titulo: "Todas", cantidad: TOTAL_APPS },
    ...CATEGORIAS.map((c) => ({
      id: c.id,
      titulo: c.titulo,
      cantidad: c.apps.length,
    })),
  ];

  const visibles =
    activa === TODAS ? CATEGORIAS : CATEGORIAS.filter((c) => c.id === activa);

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Menu de categorias: fila con scroll en mobile, columna fija a la izquierda en desktop */}
      <nav
        aria-label="Categorias de apps"
        className="-mx-6 overflow-x-auto px-6 lg:sticky lg:top-24 lg:mx-0 lg:w-56 lg:shrink-0 lg:self-start lg:overflow-visible lg:px-0"
      >
        <ul className="flex gap-2 lg:flex-col lg:gap-1 lg:border-l lg:border-violet-300/20">
          {filtros.map((f) => {
            const seleccionada = activa === f.id;
            return (
              <li key={f.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setActiva(f.id)}
                  aria-pressed={seleccionada}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 font-mono text-xs tracking-widest whitespace-nowrap uppercase transition lg:-ml-px lg:rounded-none lg:border-0 lg:border-l-2 lg:px-4 ${
                    seleccionada
                      ? "border-fuchsia-400 bg-fuchsia-500/10 text-fuchsia-200 lg:drop-shadow-[0_0_8px_rgba(217,70,239,0.6)]"
                      : "border-zinc-800 text-zinc-500 hover:text-violet-300 lg:border-transparent"
                  }`}
                >
                  <span>{f.titulo}</span>
                  <span
                    className={`ml-auto text-[10px] ${seleccionada ? "text-fuchsia-400" : "text-zinc-600"}`}
                  >
                    {String(f.cantidad).padStart(2, "0")}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Grupos con sus apps */}
      <div className="flex min-w-0 flex-1 flex-col gap-10">
        {visibles.map((categoria) => (
          <section key={categoria.id} aria-labelledby={`cat-${categoria.id}`}>
            <h2
              id={`cat-${categoria.id}`}
              className="mb-4 font-mono text-xs tracking-[0.3em] text-fuchsia-400 uppercase"
            >
              &gt; {categoria.titulo}
            </h2>

            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {categoria.apps.map((app) => (
                <li key={app.nombre}>
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col gap-3 rounded-xl border border-violet-300/20 bg-zinc-950/60 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-[0_0_24px_rgba(196,181,253,0.3)]"
                  >
                    <div className="flex items-start gap-3">
                      {/* Monograma con la inicial en vez de logos de marca */}
                      <span
                        aria-hidden
                        className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-fuchsia-500/40 bg-zinc-900 font-mono text-lg font-bold text-fuchsia-300 transition group-hover:border-fuchsia-400 group-hover:drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]"
                      >
                        {app.nombre[0]}
                      </span>
                      <div className="flex min-w-0 flex-col gap-1">
                        <h3 className="font-bold tracking-wide text-white transition group-hover:text-violet-200">
                          {app.nombre}
                        </h3>
                        <span
                          className={`w-fit rounded border px-1.5 py-0.5 font-mono text-[10px] tracking-widest uppercase ${LICENCIA_CLASES[app.licencia]}`}
                        >
                          {app.licencia}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-zinc-400">
                      {app.uso}
                    </p>

                    <span className="mt-auto truncate font-mono text-xs tracking-widest text-fuchsia-500 transition group-hover:text-fuchsia-300">
                      {new URL(app.url).hostname.replace(/^www\./, "")} ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
