// Piezas compartidas entre seed-kanjis.ts y export-kanjis.ts: conexion a
// la BDD, formato del JSON y utilidades de linea de comandos.
//
// No se importa src/db porque ese modulo trae "server-only" (revienta fuera
// de Next) y lee DATABASE_URL al importarse, antes de que dotenv la cargue.

import { config } from "dotenv";
import path from "path";
import { Pool } from "@neondatabase/serverless";
import { getTableColumns } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../src/content/projects/all-about-kanjis/db/schema";

export { schema };

const { kanji, nivelJlpt } = schema;

// Sale del pgEnum del schema: un nivel nuevo ahi aparece aca solo.
export const NIVELES = nivelJlpt.enumValues;
export type Nivel = (typeof NIVELES)[number];

export const SEEDS_DIR = path.join(__dirname, "seeds");

// ── FORMATO DEL JSON (scripts/seeds/<nivel>.json) ──────────────
// Derivado del schema: una columna nueva en la tabla kanji aparece sola en
// SeedKanji, y TypeScript marca export-kanjis.ts hasta que se asigne.
// $inferSelect = tipo de una fila tal como la devuelve un SELECT.

// Columnas de kanji que NO viajan en el JSON:
//   id             -> cambia entre BDDs, el JSON identifica por caracter
//   urlOrdenTrazos -> obsoleta: el orden de trazos sale de /public/svg/kanji
export const COLUMNAS_FUERA_DEL_JSON = ["id", "urlOrdenTrazos"] as const;

// Columnas que el seed solo escribe al CREAR el kanji, nunca al actualizar.
//   destacado -> estado de la UI (boton destacar), el seed no lo pisa
// Si agregas otra columna de este tipo (estado que se cambia desde la app),
// sumala aca.
export const COLUMNAS_SOLO_AL_CREAR = ["destacado"] as const;

export type ColumnasKanji = Omit<
  typeof kanji.$inferSelect,
  (typeof COLUMNAS_FUERA_DEL_JSON)[number]
>;

// Palabras y nombres: todas sus columnas menos id y kanjiId (en el JSON ya
// van anidadas dentro de su kanji). Tambien derivadas: una columna nueva
// en esas tablas aparece aca y TypeScript marca export-kanjis.ts.
type SinIds<T> = Omit<T, "id" | "kanjiId">;

export type SeedKanji = ColumnasKanji & {
  palabras: SinIds<typeof schema.palabrasFamosas.$inferSelect>[];
  nombres: SinIds<typeof schema.nombresFamosos.$inferSelect>[];
  // Kanjis con los que se confunde. Se guardan en ambas direcciones.
  relacionadosCon: string[];
};

// Lista en tiempo de ejecucion de las columnas que viajan en el JSON, con
// su Column de Drizzle (nombre real en la BDD, si es nullable, etc.).
// getTableColumns lee el pgTable, asi que tambien se actualiza solo.
export const columnasDelJson = Object.entries(getTableColumns(kanji))
  .filter(
    ([nombre]) =>
      !(COLUMNAS_FUERA_DEL_JSON as readonly string[]).includes(nombre),
  )
  .map(([nombre, columna]) => ({
    nombre: nombre as keyof ColumnasKanji,
    columna,
  }));

// Carga .env.local (y .env como respaldo) y abre un Pool websocket. Se usa
// Pool y no neon-http porque el seed necesita transacciones reales.
// dotenv no pisa variables ya definidas, asi que se puede apuntar a otra
// BDD con: DATABASE_URL=... npm run db:seed-kanjis -- n5
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
