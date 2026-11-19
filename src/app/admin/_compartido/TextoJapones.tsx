import { parsearFurigana } from "@/lib/furigana";

// ─── Fila en japones con furigana opcional ───
// leading amplio: el <rt> ocupa espacio sobre la linea (igual que en
// KanjiExampleSentence). Sin furigana el <rt> se oculta pero el alto de
// linea se mantiene, asi la vista no salta al usar el interruptor.
// `className` y `claseFurigana` cambian tamaño y color (el karaoke lo usa
// mas grande).
export default function TextoJapones({
  ja,
  furigana,
  className = "text-[26px] text-zinc-100 lg:text-[31px]",
  claseFurigana = "text-base",
}: {
  ja: string;
  furigana: boolean;
  className?: string;
  claseFurigana?: string;
}) {
  return (
    <p className={`font-mono leading-[2.2] ${className}`}>
      {parsearFurigana(ja).map((segmento, indice) =>
        segmento.lectura ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: los segmentos no tienen id propio
          <ruby key={indice}>
            {segmento.texto}
            <rt
              className={`${claseFurigana} text-violet-300/80 ${furigana ? "" : "invisible"}`}
            >
              {segmento.lectura}
            </rt>
          </ruby>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: los segmentos no tienen id propio
          <span key={indice}>{segmento.texto}</span>
        ),
      )}
    </p>
  );
}
