import { Fragment } from "react";

type Props = {
  caracter: string;
  oracion: string | null;
  traduccion: string | null;
};

type Segmento = { texto: string; lectura?: string };

// "[一|いち]から[十|じゅう]" -> [{ texto: "一", lectura: "いち" },
// { texto: "から" }, { texto: "十", lectura: "じゅう" }]
function parsearFurigana(oracion: string): Segmento[] {
  const segmentos: Segmento[] = [];
  let ultimo = 0;
  for (const coincidencia of oracion.matchAll(/\[([^|\]]+)\|([^\]]+)\]/g)) {
    if (coincidencia.index > ultimo) {
      segmentos.push({ texto: oracion.slice(ultimo, coincidencia.index) });
    }
    segmentos.push({ texto: coincidencia[1], lectura: coincidencia[2] });
    ultimo = coincidencia.index + coincidencia[0].length;
  }
  if (ultimo < oracion.length) segmentos.push({ texto: oracion.slice(ultimo) });
  return segmentos;
}

// Pinta cada aparicion del kanji dentro de un texto. split + intercalar en
// vez de recorrer caracter por caracter: el resto del texto queda en un
// solo nodo.
function resaltar(texto: string, caracter: string) {
  return texto.split(caracter).map((parte, indice) => (
    <Fragment key={indice}>
      {indice > 0 && <span className="text-fuchsia-300">{caracter}</span>}
      {parte}
    </Fragment>
  ));
}

// Oracion de ejemplo con la lectura mas comun del kanji, con furigana
// (<ruby>) y el kanji resaltado. Mismo formato de bloque que KanjiRadicalSum:
// caja zinc y etiqueta arriba a la izquierda, en fucsia claro como la ayuda
// memoria (grupo "como se recuerda").
export default function KanjiExampleSentence({
  caracter,
  oracion,
  traduccion,
}: Props) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-md border border-zinc-700 bg-zinc-900/60">
      <div className="border-b border-zinc-700 px-3 py-2 font-mono text-xs tracking-widest text-fuchsia-300">
        ORACIÓN DE EJEMPLO
      </div>
      <div className="flex flex-1 flex-col justify-center gap-3 p-6">
        {oracion ? (
          <>
            {/* leading amplio: el <rt> ocupa espacio sobre la linea y sin
                esto se pisa con la linea de arriba si la oracion hace wrap. */}
            <p className="font-mono text-2xl leading-[2.2] text-zinc-200 lg:text-3xl">
              {parsearFurigana(oracion).map((segmento, indice) => {
                if (!segmento.lectura) {
                  return (
                    <Fragment key={indice}>{resaltar(segmento.texto, caracter)}</Fragment>
                  );
                }
                // La furigana tambien se resalta si su palabra contiene el kanji
                const contieneKanji = segmento.texto.includes(caracter);
                return (
                  <ruby key={indice}>
                    {resaltar(segmento.texto, caracter)}
                    <rt
                      className={`text-xs ${
                        contieneKanji
                          ? "text-fuchsia-300"
                          : "text-violet-300/80"
                      }`}
                    >
                      {segmento.lectura}
                    </rt>
                  </ruby>
                );
              })}
            </p>
            {traduccion && (
              <p className="text-sm text-zinc-400 lg:text-base">
                <span className="mr-1 text-violet-500/70">›</span>
                {traduccion}
              </p>
            )}
          </>
        ) : (
          <span className="self-center font-mono text-[10px] tracking-wider text-zinc-600">
            sin oración
          </span>
        )}
      </div>
    </div>
  );
}
