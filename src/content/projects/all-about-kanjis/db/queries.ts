// src/content/projects/all-about-kanjis/db/queries.ts
import { db } from "@/db";
import { kanji, nivelJlpt } from "./schema";

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
    where: (k, { eq }) => eq(k.caracter, caracter),
    with: {
      palabras: {
        orderBy: (p, { asc }) => [asc(p.palabra)],
      },
      nombres: {
        orderBy: (p, { asc }) => [asc(p.nombre)],
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
      significado: true,
      onyomi: true,
      kunyomi: true,
      numeroTrazos: true,
      anioEscolarJapon: true,
      urlImagenMnemotecnica: true,
      fraseMnemotecnica: true,
      destacado: true,
    },
    where: (k, { eq }) => eq(k.nivel, nivel),
    orderBy: (k, { asc }) => [asc(k.numeroTrazos), asc(k.caracter)],
    with: {
      palabras: {
        columns: { palabra: true, furigana: true, traduccion: true },
        orderBy: (p, { asc }) => [asc(p.palabra)],
      },
      nombres: {
        columns: { nombre: true, furigana: true, descripcion: true, tipo: true },
        orderBy: (p, { asc }) => [asc(p.nombre)],
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
        orderBy: (kr, { asc }) => [asc(kr.orden)],
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

  return rows.map((r) => r.nivel);
}
