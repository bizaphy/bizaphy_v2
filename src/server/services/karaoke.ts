import "server-only";
import { asc, inArray, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { cancion } from "@/server/db/schema";
import type { Cancion, TiempoFila } from "@/shared/types/karaoke";
import * as validar from "./validar";

// ── LECTURAS ──

// Todas las canciones, en el orden en que se crearon
export async function obtenerCanciones(): Promise<Cancion[]> {
  const filas = await db
    .select()
    .from(cancion)
    .orderBy(asc(cancion.creadoEn));
  return filas.map((fila) => ({
    id: fila.id,
    titulo: fila.titulo,
    fuente: fila.fuente,
    texto: fila.texto,
    traducciones: fila.traducciones,
    real: fila.real,
    tiempos: fila.tiempos,
    video: fila.video,
  }));
}

// ── LÓGICA DE NEGOCIO ──

function validarTiempos(valor: unknown): TiempoFila[] {
  if (!Array.isArray(valor) || valor.length > 5000) {
    throw new Error("Campo inválido: tiempos");
  }
  return valor.map((item) => {
    const datos = validar.objeto(item, "tiempos");
    const t = datos.t;
    if (
      t !== null &&
      (typeof t !== "number" || !Number.isFinite(t) || t < 0)
    ) {
      throw new Error("Campo inválido: tiempos");
    }
    return { ja: validar.texto(datos.ja, "tiempos", 5000), t };
  });
}

export function validarCancion(valor: unknown): Omit<Cancion, "id"> {
  const datos = validar.objeto(valor, "cancion");
  return {
    titulo: validar.texto(datos.titulo, "titulo", 160),
    fuente: validar.texto(datos.fuente, "fuente", 2000),
    texto: validar.texto(datos.texto, "texto"),
    traducciones: validar.mapaDeTextos(datos.traducciones, "traducciones"),
    real: validar.mapaDeTextos(datos.real, "real"),
    tiempos: validarTiempos(datos.tiempos),
    video: validar.texto(datos.video, "video", 500),
  };
}

export function validarCambiosCanciones(valor: unknown) {
  return validar.cambios(valor, validar.uuid, validarCancion);
}

// ── ESCRITURAS ──

// Crea o actualiza (upsert) y borra canciones en una pasada
export async function aplicarCambiosCanciones({
  guardar,
  borrar,
}: ReturnType<typeof validarCambiosCanciones>) {
  if (guardar.length > 0) {
    await db
      .insert(cancion)
      .values(guardar.map(([id, datos]) => ({ id, ...datos })))
      .onConflictDoUpdate({
        target: cancion.id,
        set: {
          titulo: sql`excluded.titulo`,
          fuente: sql`excluded.fuente`,
          texto: sql`excluded.texto`,
          traducciones: sql`excluded.traducciones`,
          real: sql`excluded.real`,
          tiempos: sql`excluded.tiempos`,
          video: sql`excluded.video`,
          actualizadoEn: sql`now()`,
        },
      });
  }
  if (borrar.length > 0) {
    await db.delete(cancion).where(inArray(cancion.id, borrar));
  }
}

// Subida unica desde el navegador: solo agrega las que no existen (si una
// cancion ya esta en la base, gana la de la base)
export async function insertarCancionesNuevas(
  canciones: (Omit<Cancion, "id"> & { id: string })[],
) {
  if (canciones.length === 0) return;
  await db.insert(cancion).values(canciones).onConflictDoNothing();
}
