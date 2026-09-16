//script que rellena la bdd con información inicial --> O de prueba.
//para ejecutar, ejemplo: npm run db:seed-kanjis ./src/db/seeds/n3kanjis.json

import "dotenv/config";
import { config } from "dotenv";
import fs from "fs";
import path from "path";

config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { db } from "../src/db";
import {
  kanji,
  palabrasFamosas,
  personasFamosas,
  kanjiRelacionados,
} from "../src/db/schema";

type SeedKanji = {
  caracter: string;
  onyomi: string | null;
  kunyomi: string | null;
  numeroTrazos: number;
  nivel: "n5" | "n4" | "n3" | "n2" | "n1";
  urlOrdenTrazos?: string;
  fraseMnemotecnica?: string;
  urlImagenMnemotecnica?: string;
  palabras: { palabra: string; furigana: string; traduccion: string }[];
  personas: { nombre: string; descripcion?: string }[];
  relacionadosCon: string[];
};

// ── LEER EL JSON DINÁMICAMENTE ─────────────────────────────────
const jsonPath = path.join(__dirname, "seeds/n3.json");
const dataset: SeedKanji[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

async function seed() {
  console.log(`Iniciando inserción de ${dataset.length} kanjis...`);

  // 1. Insertar todos los kanjis primero y guardar sus IDs por caracter.
  const idsPorCaracter = new Map<string, number>();

  for (const k of dataset) {
    const [row] = await db
      .insert(kanji)
      .values({
        caracter: k.caracter,
        onyomi: k.onyomi,
        kunyomi: k.kunyomi,
        numeroTrazos: k.numeroTrazos,
        nivel: k.nivel,
        urlOrdenTrazos: k.urlOrdenTrazos,
        fraseMnemotecnica: k.fraseMnemotecnica,
        urlImagenMnemotecnica: k.urlImagenMnemotecnica,
      })
      .onConflictDoNothing({ target: kanji.caracter })
      .returning({ id: kanji.id, caracter: kanji.caracter });

    if (row) {
      idsPorCaracter.set(row.caracter, row.id);
    } else {
      // Si ya existía en la BDD (ej: de N4/N5), obtenemos su ID existente
      const [existente] = await db
        .select({ id: kanji.id })
        .from(kanji)
        .where(eq(kanji.caracter, k.caracter));

      if (existente) {
        idsPorCaracter.set(k.caracter, existente.id);
      }
    }
  }

  console.log(`✓ IDs procesados: ${idsPorCaracter.size}`);

  // 2. Insertar palabras y personas vinculadas
  for (const k of dataset) {
    const kanjiId = idsPorCaracter.get(k.caracter);
    if (!kanjiId) continue;

    if (k.palabras && k.palabras.length > 0) {
      await db
        .insert(palabrasFamosas)
        .values(k.palabras.map((p) => ({ kanjiId, ...p })))
        .onConflictDoNothing();
    }

    if (k.personas && k.personas.length > 0) {
      await db
        .insert(personasFamosas)
        .values(k.personas.map((p) => ({ kanjiId, ...p })))
        .onConflictDoNothing();
    }
  }

  console.log("✓ Palabras y personas procesadas");

  // 3. Insertar relaciones
  const paresRelacion = new Set<string>();

  for (const k of dataset) {
    const origenId = idsPorCaracter.get(k.caracter);
    if (!origenId) continue;

    for (const relCaracter of k.relacionadosCon || []) {
      const destinoId = idsPorCaracter.get(relCaracter);

      // Si el kanji relacionado no está en este N3, intentamos buscarlo en la BDD
      if (!destinoId) {
        const [existenteBDD] = await db
          .select({ id: kanji.id })
          .from(kanji)
          .where(eq(kanji.caracter, relCaracter));

        if (existenteBDD) {
          paresRelacion.add(`${origenId}→${existenteBDD.id}`);
          paresRelacion.add(`${existenteBDD.id}→${origenId}`);
        } else {
          console.warn(
            `⚠ Kanji ${k.caracter} referencia a ${relCaracter}, que aún no existe en la BDD.`,
          );
        }
        continue;
      }

      paresRelacion.add(`${origenId}→${destinoId}`);
      paresRelacion.add(`${destinoId}→${origenId}`);
    }
  }

  const rowsRelaciones = Array.from(paresRelacion).map((par) => {
    const [a, b] = par.split("→").map(Number);
    return { kanjiId: a, relacionadoId: b };
  });

  if (rowsRelaciones.length > 0) {
    await db
      .insert(kanjiRelacionados)
      .values(rowsRelaciones)
      .onConflictDoNothing();
  }

  console.log(`✓ ${rowsRelaciones.length} relaciones creadas.`);
  console.log("Seed completado exitosamente.");
}

seed().catch((err) => {
  console.error("Error en el seed:", err);
  process.exit(1);
});
