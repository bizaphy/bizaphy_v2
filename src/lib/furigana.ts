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

// Lectura de una palabra a partir de la furigana de su frase:
// lecturaDe("[会議|かいぎ]に[出|で]る", "会議に") -> "かいぎに".
// "" si la palabra no esta en la frase o corta un bloque de furigana a la
// mitad ("[会議|かいぎ]" con palabra "会"): ahi no se sabe que parte se lee.
export function lecturaDe(oracion: string, palabra: string): string {
  const inicio = quitarFurigana(oracion).indexOf(palabra);
  if (!palabra || inicio === -1) return "";
  const fin = inicio + palabra.length;

  let lectura = "";
  let posicion = 0;
  for (const segmento of parsearFurigana(oracion)) {
    const desde = posicion;
    const hasta = posicion + segmento.texto.length;
    posicion = hasta;
    if (hasta <= inicio || desde >= fin) continue;
    if (!segmento.lectura) {
      lectura += segmento.texto.slice(
        Math.max(inicio - desde, 0),
        Math.min(fin, hasta) - desde,
      );
    } else if (desde >= inicio && hasta <= fin) {
      lectura += segmento.lectura;
    } else {
      return "";
    }
  }
  return lectura;
}

// "[今日|きょう]は" -> "今日(きょう)は" (legible en texto plano, para exportar)
export function furiganaEntreParentesis(oracion: string): string {
  return oracion.replace(PATRON, "$1($2)");
}
