"use client";

import { useState, type ReactNode } from "react";

export type Pestana = {
  id: string;
  label: string;
  contenido: ReactNode;
  // Clases extra para el panel (por ejemplo, su propio layout).
  className?: string;
};

type Props = {
  pestanas: Pestana[];
  ariaLabel: string;
};

// Pestanas de un proyecto. Los paneles quedan montados (ocultos con `hidden`)
// para no perder el estado al cambiar de pestana. Solo la primera se monta de
// entrada; las demas, recien la primera vez que se abren: asi sus JSON o
// datos pesados solo se descargan si alguien las usa.
export default function Tabs({ pestanas, ariaLabel }: Props) {
  const [activa, setActiva] = useState(pestanas[0].id);
  const [montadas, setMontadas] = useState([pestanas[0].id]);

  const abrir = (id: string) => {
    setActiva(id);
    if (!montadas.includes(id)) setMontadas([...montadas, id]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex flex-wrap gap-2 border-b border-zinc-800 px-4"
      >
        {pestanas.map((t) => {
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

      {pestanas.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          hidden={activa !== t.id}
          className={t.className}
        >
          {montadas.includes(t.id) && t.contenido}
        </div>
      ))}
    </div>
  );
}
