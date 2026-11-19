// Logica de frases que comparten reading y karaoke: un texto en japones se
// separa en filas (una por linea) y cada fila lleva su traduccion.

import { furiganaEntreParentesis, quitarFurigana } from "@/lib/furigana";
import type { FilaReading, Reading } from "@/shared/types/reading";

// Cada linea no vacia del texto es una fila. La traduccion se busca por el
// texto de la linea (no por indice): asi, si vuelves al paso 1 y agregas o
// cortas filas, las traducciones de las demas no se desordenan. En una
// cancion, ademas, el coro repetido se traduce una sola vez.
export function armarFilas(
  texto: string,
  traducciones: Record<string, string>,
): FilaReading[] {
  return texto
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean)
    .map((ja) => ({ ja, es: traducciones[ja] ?? "" }));
}

// Salto de linea despues de 。！？. No corta dentro de una cita
// (「行く？」と聞いた queda junta), si ya hay salto o al final del texto.
export function cortarEnPuntos(texto: string): string {
  return texto.replace(/([。！？!?])(?![」』）)\n]|$)/g, "$1\n");
}

// "会議, 効果的、途切れ" -> ["会議", "効果的", "途切れ"]. Acepta la coma
// normal y las japonesas (、，) para no tener que cambiar de teclado.
export function separarComodines(texto: string): string[] {
  return texto
    .split(/[,、，]/)
    .map((palabra) => palabra.trim())
    .filter(Boolean);
}

// Texto para pegarle a una IA y que revise la traduccion fila por fila.
// `que` nombra lo traducido en las instrucciones ("esta canción japonesa").
export function armarExportacion(
  reading: Reading,
  opciones: { instrucciones: boolean; lectura: boolean; que?: string },
): string {
  const lineas: string[] = [];

  if (opciones.instrucciones) {
    lineas.push(
      `Revisa mi traducción de ${opciones.que ?? "este texto japonés"} al español.`,
      "Para cada fila, dime si la traducción es correcta. Si no lo es, explica el error",
      "(vocabulario, gramática, matiz u orden) y propone una versión corregida.",
      "Al final, evalúa la traducción completa como texto continuo.",
      "",
    );
  }

  lineas.push(`# ${reading.titulo || "Sin título"}`);
  if (reading.fuente) lineas.push(`Fuente: ${reading.fuente}`);
  if (reading.comodines.length > 0) {
    lineas.push(`Comodín (palabras que no sé): ${reading.comodines.join("、")}`);
  }
  lineas.push("");

  reading.filas.forEach((fila, indice) => {
    lineas.push(`## Fila ${indice + 1}`);
    lineas.push(`JA: ${quitarFurigana(fila.ja)}`);
    if (opciones.lectura && fila.ja !== quitarFurigana(fila.ja)) {
      lineas.push(`Lectura: ${furiganaEntreParentesis(fila.ja)}`);
    }
    lineas.push(`ES: ${fila.es.trim() || "(sin traducir)"}`, "");
  });

  lineas.push(
    "## Texto completo (original)",
    reading.filas.map((fila) => quitarFurigana(fila.ja)).join("\n"),
    "",
    "## Texto completo (mi traducción)",
    reading.filas.map((fila) => fila.es.trim() || "(sin traducir)").join("\n"),
  );

  return lineas.join("\n");
}

// ─── Estilos compartidos ───
export const estiloCampo =
  "rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 outline-none transition focus:border-fuchsia-500";
export const estiloBotonChico =
  "rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 transition hover:border-fuchsia-500 hover:text-white";
export const estiloBotonPrincipal =
  "rounded-md bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-fuchsia-500";
