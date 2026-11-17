"use server";
// KanjiExplorer (client) importa esta acción directamente: por eso aquí no va
// "server-only" (rompería el build). "use server" ya mantiene el código en el
// servidor; el navegador solo recibe una referencia para llamarla por POST.

import { assertAdmin } from "@/server/auth/guards";
import { invertirDestacado } from "@/server/services/kanjis";

type ResultadoDestacado =
  | { ok: true; destacado: boolean }
  | { ok: false; error: string };

// Alterna el flag "destacado" del kanji indicado y devuelve el nuevo valor
// para que el cliente sincronice su estado sin recargar.
export async function alternarDestacado(
  id: number,
): Promise<ResultadoDestacado> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "No autorizado" };
  }

  const destacado = await invertirDestacado(id);

  return { ok: true, destacado };
}
