import type { ReactNode } from "react";

type Props = {
  caracter: string;
  children: ReactNode;
};

// Estado vacio de un bloque (Radicales, Kanji Trap): el kanji grande y tenue
// con el mensaje centrado debajo, para que la caja vacia se vea intencional
// y no como un error de carga. Mismo recurso que el Marcador de
// KanjiNombreFamoso cuando no hay imagen.
export default function KanjiEstadoVacio({ caracter, children }: Props) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
      <span
        aria-hidden="true"
        className="font-mono text-7xl leading-none text-zinc-700 lg:text-8xl"
      >
        {caracter}
      </span>
      <p className="text-sm leading-snug text-zinc-400">{children}</p>
    </div>
  );
}
