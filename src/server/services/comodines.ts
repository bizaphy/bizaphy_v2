import "server-only";
import { asc, inArray, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { comodin } from "@/server/db/schema";
import {
  type Comodin,
  ORIGENES_COMODIN,
  type OrigenComodin,
} from "@/shared/types/comodin";
import * as validar from "./validar";

// ── LECTURAS ──

// Todos los comodines, del mas viejo al mas nuevo
export async function obtenerComodines(): Promise<Comodin[]> {
  const filas = await db
    .select()
    .from(comodin)
    .orderBy(asc(comodin.creadoEn));
  return filas.map(({ creadoEn, ...resto }) => ({
    ...resto,
    creado: creadoEn.toISOString(),
  }));
}

// ── LÓGICA DE NEGOCIO ──

export function validarComodin(valor: unknown): Omit<Comodin, "id"> {
  const datos = validar.objeto(valor, "comodin");
  if (!ORIGENES_COMODIN.includes(datos.origen as OrigenComodin)) {
    throw new Error("Campo inválido: origen");
  }
  const creado = new Date(validar.texto(datos.creado, "creado", 40));
  if (Number.isNaN(creado.getTime())) {
    throw new Error("Campo inválido: creado");
  }
  return {
    palabra: validar.texto(datos.palabra, "palabra", 200),
    lectura: validar.texto(datos.lectura, "lectura", 200),
    significado: validar.texto(datos.significado, "significado", 2000),
    frase: validar.texto(datos.frase, "frase", 5000),
    origen: datos.origen as OrigenComodin,
    titulo: validar.texto(datos.titulo, "titulo", 160),
    creado: creado.toISOString(),
    aciertos: validar.entero(datos.aciertos, "aciertos"),
    fallos: validar.entero(datos.fallos, "fallos"),
  };
}

export function validarCambiosComodines(valor: unknown) {
  return validar.cambios(valor, validar.uuid, validarComodin);
}

// ── ESCRITURAS ──

export async function aplicarCambiosComodines({
  guardar,
  borrar,
}: ReturnType<typeof validarCambiosComodines>) {
  if (guardar.length > 0) {
    await db
      .insert(comodin)
      .values(
        guardar.map(([id, { creado, ...datos }]) => ({
          id,
          ...datos,
          creadoEn: new Date(creado),
        })),
      )
      .onConflictDoUpdate({
        target: comodin.id,
        set: {
          palabra: sql`excluded.palabra`,
          lectura: sql`excluded.lectura`,
          significado: sql`excluded.significado`,
          frase: sql`excluded.frase`,
          origen: sql`excluded.origen`,
          titulo: sql`excluded.titulo`,
          aciertos: sql`excluded.aciertos`,
          fallos: sql`excluded.fallos`,
        },
      });
  }
  if (borrar.length > 0) {
    await db.delete(comodin).where(inArray(comodin.id, borrar));
  }
}

// Subida unica desde el navegador: se saltan los que ya estan en la base
// (misma palabra en la misma frase, o mismo id)
export async function insertarComodinesNuevos(comodines: Comodin[]) {
  const existentes = await db
    .select({ palabra: comodin.palabra, frase: comodin.frase })
    .from(comodin);
  const clave = (c: { palabra: string; frase: string }) =>
    JSON.stringify([c.palabra, c.frase]);
  const yaEsta = new Set(existentes.map(clave));
  const nuevos = comodines.filter((c) => !yaEsta.has(clave(c)));
  if (nuevos.length === 0) return;
  await db
    .insert(comodin)
    .values(
      nuevos.map(({ creado, ...datos }) => ({
        ...datos,
        creadoEn: new Date(creado),
      })),
    )
    .onConflictDoNothing();
}
