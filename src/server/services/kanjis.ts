// Lecturas y escrituras de All About Kanjis
import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { kanji, nivelJlpt } from "@/server/db/schema";

// ── DETALLE ────────────────────────────────────────────────────────

/**
 * Trae un kanji por su carácter con todas sus relaciones resueltas:
 * palabras famosas, nombres famosos y kanji trap (con el
 * kanji destino ya anidado, no solo el id).
 *
 * Devuelve undefined si no existe.
 */
export async function obtenerKanjiPorCaracter(caracter: string) {
  return db.query.kanji.findFirst({
    where: (tablaKanji, { eq }) => eq(tablaKanji.caracter, caracter),
    with: {
      palabras: {
        orderBy: (tablaPalabras, { asc }) => [asc(tablaPalabras.palabra)],
      },
      nombres: {
        orderBy: (tablaNombres, { asc }) => [asc(tablaNombres.nombre)],
      },
      kanjiTrapsDesde: {
        with: {
          destino: true,
        },
      },
    },
  });
}

export type KanjiDetalle = NonNullable<
  Awaited<ReturnType<typeof obtenerKanjiPorCaracter>>
>;

// ── LISTADOS ───────────────────────────────────────────────────────
//solo se necesita ver los kanjis, no mayor informacion.

type Nivel = (typeof nivelJlpt.enumValues)[number];

/**
 * Lista todos los kanjis de un nivel, ordenados por número de trazos
 * ascendente (los más simples primero). Trae los campos necesarios para
 * renderizar el listado y el panel de detalle sin volver a consultar,
 * incluyendo palabras famosas, nombres famosos, kanji traps y radicales.
 */
export async function listarKanjisPorNivel(nivel: Nivel) {
  return db.query.kanji.findMany({
    columns: {
      id: true,
      caracter: true,
      nivel: true, // define la subcarpeta del SVG de orden de trazos
      significado: true,
      onyomi: true,
      kunyomi: true,
      numeroTrazos: true,
      anioEscolarJapon: true,
      urlImagenMnemotecnica: true,
      fraseMnemotecnica: true,
      oracionEjemplo: true,
      traduccionOracion: true,
      destacado: true,
    },
    where: (tablaKanji, { eq }) => eq(tablaKanji.nivel, nivel),
    orderBy: (tablaKanji, { asc }) => [asc(tablaKanji.numeroTrazos), asc(tablaKanji.caracter)],
    with: {
      palabras: {
        columns: { palabra: true, furigana: true, traduccion: true },
        orderBy: (tablaPalabras, { asc }) => [asc(tablaPalabras.palabra)],
      },
      nombres: {
        columns: { nombre: true, furigana: true, descripcion: true, tipo: true },
        orderBy: (tablaNombres, { asc }) => [asc(tablaNombres.nombre)],
      },
      kanjiTrapsDesde: {
        columns: {},
        with: {
          destino: {
            columns: { caracter: true, significado: true },
          },
        },
      },
      // Radicales desde el catalogo (tabla radical), en el orden del JSON
      kanjiRadicales: {
        columns: {},
        orderBy: (tablaKanjiRadical, { asc }) => [asc(tablaKanjiRadical.orden)],
        with: {
          radical: {
            columns: {
              caracter: true,
              significado: true,
              furigana: true,
              numeroTrazos: true,
            },
          },
        },
      },
    },
  });
}

export type KanjiEnListado = Awaited<
  ReturnType<typeof listarKanjisPorNivel>
>[number];

/**
 * Devuelve los niveles JLPT que tienen al menos un kanji cargado.
 * Útil para renderizar el selector de niveles sin mostrar los que
 * están vacíos.
 */
export async function listarNivelesDisponibles(): Promise<Nivel[]> {
  const rows = await db.selectDistinct({ nivel: kanji.nivel }).from(kanji);

  return rows.map((fila) => fila.nivel);
}

// ── ESCRITURAS ─────────────────────────────────────────────────────

/**
 * Invierte el flag "destacado" del kanji y devuelve el nuevo valor.
 * Lee el valor actual y escribe su negación.
 */
export async function invertirDestacado(id: number) {
  const fila = await db
    .select({ destacado: kanji.destacado })
    .from(kanji)
    .where(eq(kanji.id, id))
    .limit(1);

  if (fila.length === 0) {
    throw new Error(`Kanji con id ${id} no encontrado`);
  }

  const nuevoValor = !fila[0].destacado;

  await db.update(kanji).set({ destacado: nuevoValor }).where(eq(kanji.id, id));

  return nuevoValor;
}
