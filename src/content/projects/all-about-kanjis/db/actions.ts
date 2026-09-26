"use server";

import { db } from "@/db";
import { kanji } from "./schema";
import { eq } from "drizzle-orm";
import { assertAdmin } from "@/lib/auth-guards";

type ResultadoDestacado =
  | { ok: true; destacado: boolean }
  | { ok: false; error: string };

// Alterna el flag "destacado" del kanji indicado y devuelve el nuevo valor.
// Usa el mismo INSERT-then-flip que si fuera un checkbox: leemos el valor
// actual, escribimos su negacion, y retorna para que el cliente sincronice.
export async function alternarDestacado(
  id: number,
): Promise<ResultadoDestacado> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "No autorizado" };
  }

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

  return { ok: true, destacado: nuevoValor };
}
