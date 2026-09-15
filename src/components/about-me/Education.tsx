"use client";

import { useState } from "react";

type Status = "completado" | "en-curso";

type EducationItem = {
  degree: string;
  institution: string;
  status: Status;
  icon: React.ReactNode; //simbolo que aparece en el cuadro a la derecha cuando se selecciona este item
};

//iconos grandes para el panel derecho: usan el espacio completo del cuadro via w-full h-full
const ErlenmeyerFlask = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="h-full w-full"
    aria-hidden
  >
    {/* liquido (relleno con opacidad) */}
    <path
      d="M6.3 16 L17.7 16 L20 20 L4 20 Z"
      fill="currentColor"
      fillOpacity="0.25"
      stroke="none"
    />
    {/* silueta del matraz */}
    <path
      d="M9 3 L9 9 L4 20 L20 20 L15 9 L15 3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* boca del matraz */}
    <line
      x1="9"
      y1="3"
      x2="15"
      y2="3"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const HashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-full w-full"
    aria-hidden
  >
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

//Ingenieria en Informatica -> terminal con prompt ">_" (encaja con la estetica neon del sitio)
const TerminalIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-full w-full"
    aria-hidden
  >
    <rect x="3" y="4" width="18" height="16" rx="1.5" />
    <polyline points="7 10 10 13 7 16" />
    <line x1="13" y1="16" x2="17" y2="16" />
  </svg>
);

const EDUCATION: EducationItem[] = [
  {
    degree: "Químico Farmacéutico",
    institution: "Pontificia Universidad Católica de Chile",
    status: "completado",
    icon: <ErlenmeyerFlask />,
  },
  {
    degree: "Bachiller en Ingeniería",
    institution: "Universidad Andrés Bello",
    status: "completado",
    icon: <HashIcon />,
  },
  {
    degree: "Ingeniería en Informática",
    institution: "Universidad Andrés Bello",
    status: "en-curso",
    icon: <TerminalIcon />,
  },
];

export default function Education() {
  //arranca con "en curso" seleccionado para que el cuadro no aparezca vacio en el primer render.
  const [selected, setSelected] = useState<number>(2);
  const activo = EDUCATION[selected];

  return (
    <div className="rounded-xl border border-fuchsia-500/50 bg-zinc-950/60 p-5">
      <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-fuchsia-400">
        &gt; educación
      </h2>

      {/* Fila principal: lista clickeable a la izquierda + cuadro con icono a la derecha.
          En pantallas chicas se apila (flex-col), a partir de sm queda lado a lado. */}
      <div className="flex flex-col items-stretch gap-4 sm:flex-row">
        <ul className="flex flex-1 flex-col gap-3">
          {EDUCATION.map((item, i) => {
            const isSelected = selected === i;
            return (
              <li key={item.degree}>
                <button
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-pressed={isSelected}
                  className={`flex w-full cursor-pointer items-start gap-3 rounded-md border p-2 text-left transition ${
                    isSelected
                      ? "border-fuchsia-500 bg-fuchsia-500/10 shadow-[0_0_10px_rgba(217,70,239,0.35)]"
                      : "border-transparent hover:border-fuchsia-500/30 hover:bg-fuchsia-500/5"
                  }`}
                >
                  {/* punto indicador: relleno si completado, LED parpadeante si en curso */}
                  <span
                    aria-hidden
                    className={`mt-1.5 block h-2.5 w-2.5 shrink-0 rounded-full border ${
                      item.status === "completado"
                        ? "border-fuchsia-500 bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.9)]"
                        : "neon-led border-fuchsia-500 bg-black"
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className="font-mono text-sm text-zinc-200">
                      {item.degree}
                    </span>
                    <span className="font-mono text-xs text-zinc-500">
                      {item.institution}
                    </span>
                    {item.status === "en-curso" && (
                      <span className="mt-1 font-mono text-[10px] tracking-wider text-fuchsia-400 uppercase">
                        en curso
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Cuadro derecho: cuadrado exacto (aspect-square) con el icono del item seleccionado ocupando casi toda la altura.
            self-stretch hace que en sm+ la altura iguale a la lista de la izquierda; el ancho lo calcula aspect-square. */}
        <div className="flex aspect-square shrink-0 items-center justify-center self-stretch rounded-md border border-fuchsia-500/30 bg-zinc-900/60 p-3 shadow-[0_0_10px_rgba(217,70,239,0.15)]">
          <div className="h-full w-full max-h-40 max-w-40 text-fuchsia-300 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)] transition-all duration-300">
            {activo.icon}
          </div>
        </div>
      </div>
    </div>
  );
}
