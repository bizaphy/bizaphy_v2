import { memo } from "react";
import type { KanjiEnListado } from "../db/queries";

type Props = {
  // Filas de kanji_radical ya ordenadas, cada una con su radical anidado.
  // Se recibe el array tal cual viene de la query (sin .map en el padre)
  // para que la referencia sea estable y memo siga sirviendo.
  radicales: KanjiEnListado["kanjiRadicales"];
};

// Radicales del kanji como una "suma" de tarjetas: ⺅ + 木.
// memo: mismo motivo que KanjiStrokeOrder, evita repintar el bloque cuando
// las props no cambian.
function KanjiRadicals({ radicales }: Props) {
  return (
    // RADICALES: label arriba (no lateral), sin borde, solo fondo gris.
    <div className="flex flex-col overflow-hidden rounded-md bg-zinc-900/60">
      <div className="flex items-center justify-center border-b border-zinc-700 py-2">
        <span className="font-mono text-xs tracking-widest text-zinc-400">
          RADICALES
        </span>
      </div>
      <div className="p-3">
        {/* Parten arriba a la izquierda (content-start + justify-start),
            como se lee la "suma"; el mensaje sin radicales tambien, igual
            que en KanjiTrap. Alto fijo, ancho minimo igual al del orden de
            trazos: si los radicales no caben, el bloque crece hacia la
            derecha (max-w-full evita que se salga; en ese caso las tarjetas
            bajan de fila). */}
        <div className="flex h-72 min-w-72 max-w-full flex-wrap content-start items-stretch justify-start gap-3 overflow-hidden rounded bg-zinc-900/40 p-4 lg:h-80 lg:min-w-80">
          {radicales.length > 0 ? (
            radicales.map(({ radical: r }, i) => (
              // "+" y tarjeta van juntos en un mismo bloque: si no caben en
              // una fila, el salto de linea nunca deja un "+" colgando al
              // final; la fila siguiente empieza con "+ radical".
              <div key={r.caracter} className="flex items-stretch gap-3">
                {/* "+" entre radicales: se lee como una suma (⺅ + 木 = 休).
                    self-center para que quede a media altura de la tarjeta. */}
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="self-center font-mono text-xl text-zinc-500"
                  >
                    +
                  </span>
                )}
                {/* Radical arriba, significado abajo. Furigana y trazos en el
                    title para no cargar la tarjeta. */}
                <div
                  title={`${r.furigana ?? ""} · ${r.numeroTrazos} trazos`}
                  className="flex w-20 flex-col items-center gap-1 rounded border border-zinc-700 bg-zinc-950 px-2 py-3"
                >
                  <span className="font-mono text-3xl text-zinc-200 lg:text-4xl">
                    {r.caracter}
                  </span>
                  <span className="text-center text-xs leading-tight text-zinc-400">
                    {r.significado ?? "—"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            // Mismo formato que el mensaje vacio de KanjiTrap. "No se
            // descompone" y no "no tiene": cubre tambien los kanji que son
            // un radical en si mismos (日, 木). max-w-64: que el texto haga
            // salto de linea en vez de ensanchar el bloque.
            <p className="max-w-64 text-sm leading-snug text-zinc-400">
              Este kanji es del grupo que no se descompone en{" "}
              <span className="text-zinc-200">radicales</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(KanjiRadicals);
