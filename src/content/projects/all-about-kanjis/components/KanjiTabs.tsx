"use client";

import { useState, type ReactNode } from "react";

type Tab = "explorador" | "trainer";

const TABS: { id: Tab; label: string }[] = [
  { id: "explorador", label: "Explorador" },
  { id: "trainer", label: "KanjiTrainer" },
];

type Props = {
  explorador: ReactNode;
  trainer: ReactNode;
};

// Pestanas de la pagina. Ambos paneles quedan montados (ocultos con `hidden`)
// para no perder el kanji elegido ni la palabra actual al cambiar de pestana.
// El trainer se monta recien la primera vez que se abre: asi el JSON de
// vocabulario solo se descarga si alguien lo usa.
export default function KanjiTabs({ explorador, trainer }: Props) {
  const [activa, setActiva] = useState<Tab>("explorador");
  const [trainerMontado, setTrainerMontado] = useState(false);

  const abrir = (tab: Tab) => {
    setActiva(tab);
    if (tab === "trainer") setTrainerMontado(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Secciones de All About Kanjis"
        className="flex gap-2 border-b border-zinc-800 px-4"
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

      <div
        role="tabpanel"
        id="panel-explorador"
        aria-labelledby="tab-explorador"
        hidden={activa !== "explorador"}
        className="flex flex-col gap-6"
      >
        {explorador}
      </div>
      <div
        role="tabpanel"
        id="panel-trainer"
        aria-labelledby="tab-trainer"
        hidden={activa !== "trainer"}
      >
        {trainerMontado && trainer}
      </div>
    </div>
  );
}
