import type { TiempoFila } from "@/shared/types/karaoke";

// 83.44 -> "1:23.4"
export function formatearTiempo(segundos: number): string {
  const decimas = Math.round(segundos * 10);
  const minutos = Math.floor(decimas / 600);
  const resto = (decimas % 600) / 10;
  return `${minutos}:${resto.toFixed(1).padStart(4, "0")}`;
}

// "1:23.4" -> 83.4, "83.4" -> 83.4, "" -> null. Si no se entiende, undefined
// (para distinguir "borrar el tiempo" de "escribiste mal").
export function parsearTiempo(texto: string): number | null | undefined {
  const limpio = texto.trim().replace(",", ".");
  if (!limpio) return null;
  const partes = limpio.split(":");
  if (partes.length > 2) return undefined;
  const segundos = Number(partes.at(-1));
  const minutos = partes.length === 2 ? Number(partes[0]) : 0;
  if (!Number.isFinite(segundos) || !Number.isFinite(minutos)) return undefined;
  const total = minutos * 60 + segundos;
  return total < 0 ? undefined : Math.round(total * 10) / 10;
}

// La fila que esta sonando: la de tiempo mas alto que ya paso. Las filas sin
// tiempo se saltan. -1 si todavia no sale ninguna.
export function filaActiva(tiempos: (number | null)[], ahora: number): number {
  let activa = -1;
  tiempos.forEach((t, indice) => {
    if (t === null || t > ahora) return;
    if (activa === -1 || t >= (tiempos[activa] ?? 0)) activa = indice;
  });
  return activa;
}

// Hasta cuando suena la fila: el siguiente tiempo mayor al suyo.
export function finDeFila(
  tiempos: (number | null)[],
  indice: number,
): number | null {
  const inicio = tiempos[indice];
  if (inicio === null || inicio === undefined) return null;
  let fin: number | null = null;
  for (const t of tiempos) {
    if (t !== null && t > inicio && (fin === null || t < fin)) fin = t;
  }
  return fin;
}

// Cuando editas la letra, los tiempos ya marcados siguen a su fila:
// 1. Las filas que no cambiaron se emparejan (subsecuencia comun mas larga),
//    asi agregar o borrar una fila no corre los tiempos de las demas.
// 2. Entre dos filas emparejadas, si quedaron tantas filas viejas como
//    nuevas, se asume que se editaron y heredan el tiempo en orden (por
//    ejemplo, al corregir la furigana de una linea).
export function realinear(
  viejos: TiempoFila[],
  nuevas: string[],
): TiempoFila[] {
  const n = viejos.length;
  const m = nuevas.length;
  // largo[i][j] = subsecuencia comun mas larga de viejos[i..] y nuevas[j..]
  const largo = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      largo[i][j] =
        viejos[i].ja === nuevas[j]
          ? largo[i + 1][j + 1] + 1
          : Math.max(largo[i + 1][j], largo[i][j + 1]);
    }
  }

  const resultado: TiempoFila[] = nuevas.map((ja) => ({ ja, t: null }));
  const pares: [number, number][] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (viejos[i].ja === nuevas[j]) {
      pares.push([i, j]);
      i++;
      j++;
    } else if (largo[i + 1][j] >= largo[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }

  let viejoAnterior = -1;
  let nuevaAnterior = -1;
  for (const [vi, nj] of [...pares, [n, m] as [number, number]]) {
    const hueco = vi - viejoAnterior - 1;
    if (hueco > 0 && hueco === nj - nuevaAnterior - 1) {
      for (let k = 1; k <= hueco; k++) {
        resultado[nuevaAnterior + k].t = viejos[viejoAnterior + k].t;
      }
    }
    if (vi < n) resultado[nj].t = viejos[vi].t;
    viejoAnterior = vi;
    nuevaAnterior = nj;
  }
  return resultado;
}
