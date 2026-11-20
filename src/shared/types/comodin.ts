// Palabra comodin: una palabra que me costo, guardada junto a la frase
// donde aparecio para no perder el contexto. La anotan reading y karaoke,
// y la repasa el reading-vocab test.

// Valores del enum de la base (src/server/db/schema/reading.ts)
export const ORIGENES_COMODIN = ["reading", "karaoke"] as const;
export type OrigenComodin = (typeof ORIGENES_COMODIN)[number];

export type Comodin = {
  id: string;
  // Tal cual aparece en la frase, sin furigana: "会議"
  palabra: string;
  // En kana, sacada de la furigana de la frase. Vacia si no se pudo.
  lectura: string;
  // Opcional: lo que significa
  significado: string;
  // La fila completa, con furigana "[漢字|かな]"
  frase: string;
  origen: OrigenComodin;
  // Titulo del texto o cancion de donde salio
  titulo: string;
  // Fecha ISO de cuando se agrego
  creado: string;
  // Resultados en el test
  aciertos: number;
  fallos: number;
};
