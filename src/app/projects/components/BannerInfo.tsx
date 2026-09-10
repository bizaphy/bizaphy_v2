"use client";
import { useState } from "react";
import { projectsRegistry } from "@/content/projects";

//plan = proximo paso planificado para el proyecto identificado por slug.
type Plan = { slug: string; nextStep: string };

//ordenado igual que el registry para que se sienta consistente al ir cliqueando.
const PLANS: Plan[] = [
  {
    slug: "habit-tracker",
    nextStep:
      "Agregar vista de calendario. Unir con estudios de habitos (asociar con el tiempo para generar un nuevo habito)",
  },
  {
    slug: "apothecary",
    nextStep:
      "Cargar las plantas medicinales endemicas de Chile. Ubicacion con mapa interactivo, usos y precauciones.",
  },
  {
    slug: "tic-tac-toe",
    nextStep: "Sin ideas aun.",
  },
  {
    slug: "translation-checker",
    nextStep: "Cambiar a sistema de gramatica, son seleccion mediante quizzes",
  },
  {
    slug: "weather-dashboard",
    nextStep:
      "Herramienta para saber en cuanto tiempo te daria hipotermia o te deshidratarias si estuvieras sin ropa en ese lugar. Agregar lugares bizarros. Agregar el estado de la materia de algunos materiales",
  },
  {
    slug: "all-about-kanjis",
    nextStep: "Agregar maquetado. Partir creando el componente: Maqueta.tsx",
  },
  {
    slug: "hangman",
    nextStep:
      "Categorias tematicas alternativas: fenomenos naturales, autores, plantas, etc.",
  },
  {
    slug: "pokedex",
    nextStep:
      "Armar un equipo y determinar las debilidades mas probables segun la region jugada (gimnasios, rival, alto mando, campeon, etc).",
  },
];

//lookup slug -> titulo, usando el registry como fuente de verdad
const TITLES: Record<string, string> = Object.fromEntries(
  projectsRegistry.map((p) => [p.slug, p.title]),
);

export default function BannerInfo() {
  //index del plan actualmente visible. Empieza en 0.
  const [index, setIndex] = useState(0);
  const total = PLANS.length;
  const plan = PLANS[index];
  const title = TITLES[plan.slug] ?? plan.slug;

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-950/60 p-5">
      {/* header: titulo + contador global */}
      <div className="mb-3 flex items-baseline justify-between font-mono text-xs">
        <span className="uppercase tracking-[0.3em] text-fuchsia-400">
          &gt; info
        </span>
        <span className="text-[10px] text-zinc-500">
          {projectsRegistry.length} proyectos desplegados
        </span>
      </div>

      <p className="text-sm text-zinc-400">
        Cada proyecto tiene un proximo paso planificado. Usa el botón para ir
        viendo el siguiente.
      </p>

      {/* card interna con el plan actual */}
      <div className="mt-4 flex flex-col gap-2 rounded-lg border border-zinc-700 bg-black/40 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-sm text-fuchsia-300">{title}</span>
          <span className="font-mono text-[10px] text-zinc-500">
            {index + 1}/{total}
          </span>
        </div>
        <p className="text-sm italic leading-relaxed text-zinc-300">
          &ldquo;{plan.nextStep}&rdquo;
        </p>
      </div>

      {/* boton avanzar. Cicla con modulo para volver al 0 despues del ultimo. */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setIndex((i) => (i + 1) % total)}
          className="rounded border border-fuchsia-500/60 bg-black px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-fuchsia-300 transition hover:border-fuchsia-400 hover:bg-fuchsia-500/10 hover:text-fuchsia-200"
        >
          siguiente →
        </button>
      </div>
    </div>
  );
}
