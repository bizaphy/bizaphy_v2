import "server-only";
import { inArray, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { readingBorrador, readingTraduccion } from "@/server/db/schema";
import type { BorradorReading } from "@/shared/types/reading";
import * as validar from "./validar";

// ── LECTURAS ──

// El texto abierto en el editor ("" en todo si nunca se guardo)
export async function obtenerBorrador(): Promise<BorradorReading> {
  const [fila] = await db.select().from(readingBorrador).limit(1);
  return {
    titulo: fila?.titulo ?? "",
    fuente: fila?.fuente ?? "",
    texto: fila?.texto ?? "",
  };
}

// Todas mis traducciones: { linea en japones: traduccion }
export async function obtenerTraducciones(): Promise<Record<string, string>> {
  const filas = await db.select().from(readingTraduccion);
  return Object.fromEntries(filas.map((fila) => [fila.ja, fila.es]));
}

// ── LÓGICA DE NEGOCIO ──

export function validarBorrador(valor: unknown): BorradorReading {
  const datos = validar.objeto(valor, "borrador");
  return {
    titulo: validar.texto(datos.titulo, "titulo", 160),
    fuente: validar.texto(datos.fuente, "fuente", 2000),
    texto: validar.texto(datos.texto, "texto"),
  };
}

// La clave de una traduccion es la linea japonesa
export function validarCambiosTraducciones(valor: unknown) {
  return validar.cambios(
    valor,
    (ja) => validar.texto(ja, "linea", 5000),
    (es) => validar.texto(es, "traduccion", 5000),
  );
}

// ── ESCRITURAS ──

export async function guardarBorrador(datos: BorradorReading) {
  await db
    .insert(readingBorrador)
    .values({ id: 1, ...datos })
    .onConflictDoUpdate({ target: readingBorrador.id, set: datos });
}

// Subida unica desde el navegador: el borrador solo entra si en la base no
// hay ningun texto abierto, y las traducciones solo las lineas que la base
// no tiene. Asi nunca se pisa lo que ya estaba guardado.
export async function guardarBorradorSiVacio(datos: BorradorReading) {
  const actual = await obtenerBorrador();
  if (actual.texto.trim() === "") await guardarBorrador(datos);
}

export async function insertarTraduccionesNuevas(
  traducciones: Record<string, string>,
) {
  const filas = Object.entries(traducciones)
    .filter(([, es]) => es.trim() !== "")
    .map(([ja, es]) => ({ ja, es }));
  if (filas.length === 0) return;
  await db.insert(readingTraduccion).values(filas).onConflictDoNothing();
}

export async function aplicarCambiosTraducciones({
  guardar,
  borrar,
}: ReturnType<typeof validarCambiosTraducciones>) {
  if (guardar.length > 0) {
    await db
      .insert(readingTraduccion)
      .values(guardar.map(([ja, es]) => ({ ja, es })))
      .onConflictDoUpdate({
        target: readingTraduccion.ja,
        set: { es: sql`excluded.es` },
      });
  }
  if (borrar.length > 0) {
    await db
      .delete(readingTraduccion)
      .where(inArray(readingTraduccion.ja, borrar));
  }
}
