"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Hobby = {
  name: string;
  icon: React.ReactNode;
  image?: string; //imagen/gif que se despliega al seleccionar (opcional mientras no haya asset)
  note: string; //texto chico abajo cuando el hobby esta seleccionado
};

//iconos inline (stroke-only, hereda color) para no depender de assets externos
const PcIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <rect x="3" y="4" width="18" height="12" rx="1.5" />
    <line x1="8" y1="20" x2="16" y2="20" />
    <line x1="12" y1="16" x2="12" y2="20" />
  </svg>
);

const PencilIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M4 20h4l10-10-4-4L4 16v4z" />
    <line x1="14" y1="6" x2="18" y2="10" />
  </svg>
);

const BookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M4 5a2 2 0 0 1 2-2h5v18H6a2 2 0 0 1-2-2V5z" />
    <path d="M20 5a2 2 0 0 0-2-2h-5v18h5a2 2 0 0 0 2-2V5z" />
  </svg>
);

const ControllerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M6 9h12a3 3 0 0 1 3 3v3a3 3 0 0 1-5.4 1.8L15 15H9l-.6 1.8A3 3 0 0 1 3 15v-3a3 3 0 0 1 3-3z" />
    <line x1="8" y1="12" x2="10" y2="12" />
    <line x1="9" y1="11" x2="9" y2="13" />
    <circle cx="15" cy="12" r="0.6" fill="currentColor" />
    <circle cx="17" cy="13" r="0.6" fill="currentColor" />
  </svg>
);

const HOBBIES: Hobby[] = [
  {
    name: "Hardware y PCs",
    icon: <PcIcon />,
    image: "/hobbies/henry-cavill.gif",
    note: "PCs armados hasta la fecha: aprox 20",
  },
  {
    name: "Dibujo",
    icon: <PencilIcon />,
    image: "/hobbies/dibujo.gif",
    note: "próximamente: enlace a Instagram",
  },
  {
    name: "Manga y anime",
    icon: <BookIcon />,
    image: "/hobbies/manga.gif",
    note: "próximamente: enlace a MAL",
  },
  {
    name: "Juegos de Steam",
    icon: <ControllerIcon />,
    image: "/hobbies/steam.gif",
    note: "próximamente: enlace a Steam",
  },
];

export default function Hobbies() {
  const [selected, setSelected] = useState<number | null>(null);
  const haySeleccion = selected !== null;
  const selectedHobby = selected !== null ? HOBBIES[selected] : null;
  const hobbiesRowRef = useRef<HTMLDivElement>(null);

  //cierra la seleccion al clickear fuera de la fila
  useEffect(() => {
    if (!haySeleccion) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (
        hobbiesRowRef.current &&
        target &&
        !hobbiesRowRef.current.contains(target)
      ) {
        setSelected(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [haySeleccion]);

  return (
    <div className="rounded-xl border border-fuchsia-500/50 bg-zinc-950/60 p-5">
      <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-fuchsia-400">
        &gt; hobbies
      </h2>

      {/* Contenedor de preview + fila. El ref envuelve a ambos para que un clic dentro del preview no cierre la seleccion */}
      <div ref={hobbiesRowRef} className="flex flex-col gap-3">
        {/* Preview arriba: aparece solo cuando hay un hobby seleccionado. Imagen (80% del alto) + info (20%) */}
        {haySeleccion && selectedHobby && (
          <div className="flex h-64 flex-col overflow-hidden rounded-lg border border-fuchsia-500/60 bg-zinc-900/60 shadow-[0_0_12px_rgba(217,70,239,0.25)]">
            <div className="relative flex flex-[4] w-full items-center justify-center overflow-hidden bg-zinc-900/60">
              {selectedHobby.image ? (
                <Image
                  src={selectedHobby.image}
                  alt={selectedHobby.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="scale-[4] text-fuchsia-400">
                  {selectedHobby.icon}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-0.5 px-3 py-2">
              <span className="font-mono text-sm text-fuchsia-200">
                {selectedHobby.name}
              </span>
              <span className="font-mono text-[10px] leading-snug text-zinc-500 italic">
                — {selectedHobby.note}
              </span>
            </div>
          </div>
        )}

        {/* Cuatro cards en fila. Al hacer clic en una, esa se ensancha (flex-[2]) y las demas se comprimen (flex-1). */}
        <div className="flex items-stretch gap-2">
          {HOBBIES.map((hobby, i) => {
            const isSelected = selected === i;
            const isDimmed = haySeleccion && !isSelected;

            return (
              <button
                key={hobby.name}
                type="button"
                onClick={() => setSelected(isSelected ? null : i)}
                aria-pressed={isSelected}
                aria-label={hobby.name}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border p-3 text-center transition-all duration-300 ${
                  isSelected
                    ? "flex-[2] border-fuchsia-500 bg-fuchsia-500/10 shadow-[0_0_12px_rgba(217,70,239,0.4)]"
                    : isDimmed
                      ? "flex-1 border-zinc-800 bg-zinc-900/50 opacity-60"
                      : "flex-1 border-fuchsia-500/30 bg-zinc-900 hover:border-fuchsia-500/60 hover:bg-fuchsia-500/5"
                }`}
              >
                <span
                  className={`text-fuchsia-400 transition-transform duration-300 ${isSelected ? "scale-150" : ""}`}
                >
                  {hobby.icon}
                </span>

                {/* Nombre: crece cuando esta seleccionado; se oculta suave cuando esta atenuado (para que el card comprimido no se llene) */}
                <span
                  className={`font-mono leading-tight transition-all duration-300 ${
                    isSelected
                      ? "mt-1 text-sm text-fuchsia-200"
                      : isDimmed
                        ? "h-0 opacity-0"
                        : "text-[10px] text-zinc-300"
                  }`}
                >
                  {hobby.name}
                </span>

                {/* Nota (planeado): solo cuando el card esta seleccionado */}
                {isSelected && (
                  <span className="font-mono text-[10px] leading-snug text-zinc-500 italic">
                    — {hobby.note}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
