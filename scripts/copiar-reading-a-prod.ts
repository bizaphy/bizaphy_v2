// Copia reading, karaoke y comodines de la BDD de desarrollo (DATABASE_URL)
// a la de produccion (DATABASE_URL_PROD).
//
//   npm run db:copiar-reading-a-prod                -> solo muestra cuanto copiaria
//   npm run db:copiar-reading-a-prod -- --confirmar -> copia de verdad
//
// Nunca pisa lo que ya esta en produccion: solo agrega las filas que faltan
// (mismo criterio que la subida desde el localStorage). Se puede correr
// dos veces sin duplicar nada.
// No usa src/server/db: trae "server-only" y lee DATABASE_URL antes de que
// cargue dotenv.

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/server/db/schema/reading";

config({ path: ".env.local", quiet: true });

const urlDev = process.env.DATABASE_URL;
const urlProd = process.env.DATABASE_URL_PROD;
if (!urlDev || !urlProd) {
  throw new Error("Faltan DATABASE_URL o DATABASE_URL_PROD en .env.local");
}
if (urlDev === urlProd) {
  throw new Error("DATABASE_URL y DATABASE_URL_PROD son la misma base");
}

const confirmar = process.argv.includes("--confirmar");
const dev = drizzle(neon(urlDev));
const prod = drizzle(neon(urlProd));

const { readingBorrador, readingTraduccion, cancion, comodin } = schema;

async function main() {
  console.log(`Desde: ${new URL(urlDev!).host}`);
  console.log(`Hacia: ${new URL(urlProd!).host}\n`);

  const [borradores, traducciones, canciones, comodines] = await Promise.all([
    dev.select().from(readingBorrador),
    dev.select().from(readingTraduccion),
    dev.select().from(cancion),
    dev.select().from(comodin),
  ]);

  console.log(`reading_borrador:   ${borradores.length}`);
  console.log(`reading_traduccion: ${traducciones.length}`);
  console.log(`cancion:            ${canciones.length}`);
  console.log(`comodin:            ${comodines.length}`);

  if (!confirmar) {
    console.log("\nNo se escribio nada. Agrega --confirmar para copiar.");
    return;
  }

  if (borradores.length > 0) {
    await prod.insert(readingBorrador).values(borradores).onConflictDoNothing();
  }
  if (traducciones.length > 0) {
    await prod
      .insert(readingTraduccion)
      .values(traducciones)
      .onConflictDoNothing();
  }
  if (canciones.length > 0) {
    await prod.insert(cancion).values(canciones).onConflictDoNothing();
  }
  if (comodines.length > 0) {
    await prod.insert(comodin).values(comodines).onConflictDoNothing();
  }

  console.log("\nListo: copiado a produccion (lo que ya estaba no se toco).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
