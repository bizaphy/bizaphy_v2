// Compartido por seed-kanjis.ts y export-kanjis.ts: conexion, formato del JSON y utilidades.
// No usa src/db: trae "server-only" y lee DATABASE_URL antes de que cargue dotenv.

import { config } from "dotenv";
import path from "path";
import { Pool } from "@neondatabase/serverless";
import { getTableColumns } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../src/content/projects/all-about-kanjis/db/schema";

export { schema };

const { kanji, nivelJlpt } = schema;

// Sale del pgEnum del schema.
export const NIVELES = nivelJlpt.enumValues;
export type Nivel = (typeof NIVELES)[number];

export const SEEDS_DIR = path.join(__dirname, "seeds");

// ── FORMATO DEL JSON (scripts/seeds/<nivel>.json), derivado del schema ──

// Fuera del JSON: id (cambia entre BDDs) y urlOrdenTrazos (obsoleta).
export const COLUMNAS_FUERA_DEL_JSON = ["id", "urlOrdenTrazos"] as const;

// Solo se escriben al crear el kanji: son estado de la UI y el seed no las pisa.
export const COLUMNAS_SOLO_AL_CREAR = ["destacado"] as const;

export type ColumnasKanji = Omit<
  typeof kanji.$inferSelect,
  (typeof COLUMNAS_FUERA_DEL_JSON)[number]
>;

// Palabras y nombres van anidados en su kanji: sin id ni kanjiId.
type SinIds<T> = Omit<T, "id" | "kanjiId">;

export type SeedKanji = ColumnasKanji & {
  palabras: SinIds<typeof schema.palabrasFamosas.$inferSelect>[];
  nombres: SinIds<typeof schema.nombresFamosos.$inferSelect>[];
  // Kanjis con los que se confunde (en ambas direcciones).
  relacionadosCon: string[];
};

// Columnas del JSON en tiempo de ejecucion, con su Column de Drizzle.
export const columnasDelJson = Object.entries(getTableColumns(kanji))
  .filter(
    ([nombre]) =>
      !(COLUMNAS_FUERA_DEL_JSON as readonly string[]).includes(nombre),
  )
  .map(([nombre, columna]) => ({
    nombre: nombre as keyof ColumnasKanji,
    columna,
  }));

// Pool (no neon-http) porque el seed usa transacciones.
// Otra BDD: DATABASE_URL=... npm run db:seed-kanjis -- n5
export function conectar() {
  config({ path: ".env.local", quiet: true });
  config({ quiet: true });

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no está definida");

  console.log(`BDD: ${new URL(url).host}`);

  const pool = new Pool({ connectionString: url });
  return { db: drizzle({ client: pool, schema }), pool };
}

export type Db = ReturnType<typeof conectar>["db"];

export function esNivel(v: string): v is Nivel {
  return (NIVELES as readonly string[]).includes(v);
}

export function rutaJson(nivel: Nivel) {
  return path.join(SEEDS_DIR, `${nivel}.json`);
}

// ── CATALOGO DE RADICALES (scripts/seeds/radicales.json) ──

export const RUTA_RADICALES = path.join(SEEDS_DIR, "radicales.json");

export type SeedRadical = Omit<typeof schema.radical.$inferSelect, "id">;

// En el JSON de cada nivel los radicales van como texto: "⺅、木".
export const SEPARADOR_RADICALES = "、";

export function separarRadicales(radicales: string | null): string[] {
  return (
    radicales
      ?.split(SEPARADOR_RADICALES)
      .map((r) => r.trim())
      .filter(Boolean) ?? []
  );
}
