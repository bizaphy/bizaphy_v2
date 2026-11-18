//Formato de furigana del proyecto: "[漢字|かんじ]". Lo comparten
//KanjiExampleSentence (all-about-kanjis) y el editor de reading (admin).

export type Segmento = { texto: string; lectura?: string };

const PATRON = /\[([^|\]]+)\|([^\]]+)\]/g;

// "[一|いち]から[十|じゅう]" -> [{ texto: "一", lectura: "いち" },
// { texto: "から" }, { texto: "十", lectura: "じゅう" }]
export function parsearFurigana(oracion: string): Segmento[] {
  const segmentos: Segmento[] = [];
  let ultimo = 0;
  for (const coincidencia of oracion.matchAll(PATRON)) {
    if (coincidencia.index > ultimo) {
      segmentos.push({ texto: oracion.slice(ultimo, coincidencia.index) });
    }
    segmentos.push({ texto: coincidencia[1], lectura: coincidencia[2] });
    ultimo = coincidencia.index + coincidencia[0].length;
  }
  if (ultimo < oracion.length) segmentos.push({ texto: oracion.slice(ultimo) });
  return segmentos;
}

// "[今日|きょう]は" -> "今日は" (texto limpio, sin marcas)
export function quitarFurigana(oracion: string): string {
  return oracion.replace(PATRON, "$1");
}

// "[今日|きょう]は" -> "今日(きょう)は" (legible en texto plano, para exportar)
export function furiganaEntreParentesis(oracion: string): string {
  return oracion.replace(PATRON, "$1($2)");
}
