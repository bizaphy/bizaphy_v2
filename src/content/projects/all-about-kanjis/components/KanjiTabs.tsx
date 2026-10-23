"use client";

import { useState, type ReactNode } from "react";

type Tab = "explorador" | "trainer" | "grammar" | "grammarV2";

const TABS: { id: Tab; label: string }[] = [
  { id: "explorador", label: "Explorador" },
  { id: "trainer", label: "KanjiTrainer" },
  { id: "grammar", label: "Grammar" },
  { id: "grammarV2", label: "Grammar V2" },
];

type Props = Record<Tab, ReactNode>;

// Pestanas de la pagina. Los paneles quedan montados (ocultos con `hidden`)
// para no perder el estado al cambiar de pestana. Todos menos el explorador
// se montan recien la primera vez que se abren: asi sus JSON (vocabulario,
// ejercicios, ejemplos de gramatica) solo se descargan si alguien los usa.
export default function KanjiTabs(props: Props) {
  const [activa, setActiva] = useState<Tab>("explorador");
  const [montadas, setMontadas] = useState<Tab[]>(["explorador"]);

  const abrir = (tab: Tab) => {
    setActiva(tab);
    if (!montadas.includes(tab)) setMontadas([...montadas, tab]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Secciones de All About Kanjis"
        className="flex flex-wrap gap-2 border-b border-zinc-800 px-4"
      >
        {TABS.map((t) => {
          const seleccionada = activa === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={seleccionada}
              aria-controls={`panel-${t.id}`}
              onClick={() => abrir(t.id)}
              className={`-mb-px border-b-2 px-4 py-2 font-mono text-sm tracking-widest uppercase transition ${
                seleccionada
                  ? "border-fuchsia-400 text-fuchsia-200 drop-shadow-[0_0_8px_rgba(217,70,239,0.6)]"
                  : "border-transparent text-zinc-500 hover:text-violet-300"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {TABS.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          hidden={activa !== t.id}
          className={t.id === "explorador" ? "flex flex-col gap-6" : undefined}
        >
          {montadas.includes(t.id) && props[t.id]}
        </div>
      ))}
    </div>
  );
}
