import { parsearFurigana, quitarFurigana } from "@/lib/furigana";

const estiloResaltado = "rounded-sm bg-fuchsia-500/25 text-fuchsia-100";

// Marca, letra por letra del texto sin furigana, las que caen dentro de
// alguna de las palabras (todas sus apariciones).
function marcarLetras(limpio: string, palabras: string[]): boolean[] {
  const marcadas = new Array<boolean>(limpio.length).fill(false);
  for (const palabra of palabras) {
    if (!palabra) continue;
    let desde = limpio.indexOf(palabra);
    while (desde !== -1) {
      marcadas.fill(true, desde, desde + palabra.length);
      desde = limpio.indexOf(palabra, desde + palabra.length);
    }
  }
  return marcadas;
}

// Corta un texto sin furigana en tramos resaltados y no resaltados
function tramos(texto: string, marcadas: boolean[]) {
  const resultado: { texto: string; resaltado: boolean }[] = [];
  texto.split("").forEach((letra, i) => {
    const ultimo = resultado.at(-1);
    if (ultimo && ultimo.resaltado === marcadas[i]) ultimo.texto += letra;
    else resultado.push({ texto: letra, resaltado: marcadas[i] });
  });
  return resultado;
}

// ─── Fila en japones con furigana opcional ───
// leading amplio: el <rt> ocupa espacio sobre la linea (igual que en
// KanjiExampleSentence). Sin furigana el <rt> se oculta pero el alto de
// linea se mantiene, asi la vista no salta al usar el interruptor.
// `className` y `claseFurigana` cambian tamaño y color (el karaoke lo usa
// mas grande). `resaltar` marca palabras comodin dentro de la frase; si
// una palabra toca un bloque con furigana, se resalta el bloque entero.
export default function TextoJapones({
  ja,
  furigana,
  className = "text-[26px] text-zinc-100 lg:text-[31px]",
  claseFurigana = "text-base",
  resaltar = [],
}: {
  ja: string;
  furigana: boolean;
  className?: string;
  claseFurigana?: string;
  resaltar?: string[];
}) {
  const marcadas = marcarLetras(quitarFurigana(ja), resaltar);
  let posicion = 0;

  return (
    <p className={`font-mono leading-[2.2] ${className}`}>
      {parsearFurigana(ja).map((segmento, indice) => {
        const desde = posicion;
        posicion += segmento.texto.length;
        const propias = marcadas.slice(desde, posicion);

        if (segmento.lectura) {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: los segmentos no tienen id propio
            <ruby key={indice} className={propias.some(Boolean) ? estiloResaltado : ""}>
              {segmento.texto}
              <rt
                className={`${claseFurigana} text-violet-300/80 ${furigana ? "" : "invisible"}`}
              >
                {segmento.lectura}
              </rt>
            </ruby>
          );
        }
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: los segmentos no tienen id propio
          <span key={indice}>
            {tramos(segmento.texto, propias).map((tramo, i) =>
              tramo.resaltado ? (
                // biome-ignore lint/suspicious/noArrayIndexKey: los tramos no tienen id propio
                <span key={i} className={estiloResaltado}>
                  {tramo.texto}
                </span>
              ) : (
                tramo.texto
              ),
            )}
          </span>
        );
      })}
    </p>
  );
}
