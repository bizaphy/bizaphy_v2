import { memo } from "react";
import KanjiEstadoVacio from "./KanjiEstadoVacio";
import type { KanjiEnListado } from "../db/queries";

type Props = {
  // Para el estado vacio: el kanji grande y tenue sobre el mensaje.
  caracter: string;
  // Filas de kanji_radical ya ordenadas, cada una con su radical anidado.
  // Se recibe el array tal cual viene de la query (sin .map en el padre)
  // para que la referencia sea estable y memo siga sirviendo.
  radicales: KanjiEnListado["kanjiRadicales"];
};

// Radicales del kanji como una "suma" de tarjetas: ⺅ + 木.
// memo: mismo motivo que KanjiStrokeOrder, evita repintar el bloque cuando
// las props no cambian.
function KanjiRadicals({ caracter, radicales }: Props) {
  return (
    // Mismo formato que el resto de los bloques: caja zinc y etiqueta violeta
    // arriba a la izquierda.
    <div className="flex flex-1 flex-col overflow-hidden rounded-md border border-zinc-700 bg-zinc-900/60">
      <div className="border-b border-zinc-700 px-3 py-2 font-mono text-xs tracking-widest text-violet-300">
        RADICALES
      </div>
      <div className="p-3">
        {/* Parten arriba a la izquierda (content-start + justify-start),
            como se lee la "suma"; el estado vacio va centrado (igual que
            en KanjiTrap). Alto fijo, ancho minimo igual al del orden de
            trazos: si los radicales no caben, el bloque crece hacia la
            derecha (max-w-full evita que se salga; en ese caso las tarjetas
            bajan de fila). Sin caja interna: el marco es el borde del bloque,
            y el contenido queda alineado con la etiqueta. */}
        <div className="flex h-72 min-w-72 max-w-full flex-wrap content-start items-stretch justify-start gap-3 overflow-hidden lg:h-80 lg:min-w-80">
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
                {/* Radical arriba, significado al medio, furigana y trazos
                    abajo: el bloque ahora llena el ancho, asi que hay espacio
                    para mostrarlos en vez de esconderlos en un title.
                    Furigana y trazos en lineas separadas a proposito: juntas
                    no caben en w-28 y el corte dependia del largo de la
                    furigana. */}
                <div className="flex w-28 flex-col items-center gap-1 rounded border border-zinc-700 bg-zinc-950 px-2 py-3">
                  <span className="font-mono text-3xl text-zinc-200 lg:text-4xl">
                    {r.caracter}
                  </span>
                  <span className="text-center text-xs leading-tight text-zinc-400">
                    {r.significado ?? "—"}
                  </span>
                  <span className="flex flex-col items-center text-center font-mono text-[11px] leading-tight text-zinc-500">
                    {r.furigana && <span>{r.furigana}</span>}
                    <span>{r.numeroTrazos} trazos</span>
                  </span>
                </div>
              </div>
            ))
          ) : (
            // Mismo estado vacio que KanjiTrap. "No se descompone" y no
            // "no tiene": cubre tambien los kanji que son un radical en si
            // mismos (日, 木).
            <KanjiEstadoVacio caracter={caracter}>
              Este kanji es del grupo que no se descompone en{" "}
              <span className="text-zinc-200">radicales</span>
            </KanjiEstadoVacio>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(KanjiRadicals);
