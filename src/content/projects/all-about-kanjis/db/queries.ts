// src/content/projects/all-about-kanjis/db/queries.ts
import { db } from "@/db";
import { kanji, nivelJlpt } from "./schema";
import { eq, asc } from "drizzle-orm";

// ── DETALLE ────────────────────────────────────────────────────────

/**
 * Trae un kanji por su carácter con todas sus relaciones resueltas:
 * palabras famosas, personas famosas y kanjis relacionados (con el
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
      personas: {
        orderBy: (p, { asc }) => [asc(p.nombre)],
      },
      relacionadosDesde: {
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
 * renderizar el listado y el panel de detalle sin volver a consultar.
 */
export async function listarKanjisPorNivel(nivel: Nivel) {
  return db
    .select({
      id: kanji.id,
      caracter: kanji.caracter,
      significado: kanji.significado,
      onyomi: kanji.onyomi,
      kunyomi: kanji.kunyomi,
      numeroTrazos: kanji.numeroTrazos,
      anioEscolarJapon: kanji.anioEscolarJapon,
      urlOrdenTrazos: kanji.urlOrdenTrazos,
      urlImagenMnemotecnica: kanji.urlImagenMnemotecnica,
      fraseMnemotecnica: kanji.fraseMnemotecnica,
    })
    .from(kanji)
    .where(eq(kanji.nivel, nivel))
    .orderBy(asc(kanji.numeroTrazos), asc(kanji.caracter));
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
