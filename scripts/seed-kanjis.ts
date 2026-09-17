//script que rellena la bdd con información inicial --> O de prueba.
//para ejecutar, ejemplo: npm run seed-kanji

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
  console.log(`Iniciando upsert de ${dataset.length} kanjis...`);

  // 1. Upsert de cada kanji: inserta o actualiza los campos mutables
  //    cuando ya existe uno con el mismo caracter.
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
      .onConflictDoUpdate({
        target: kanji.caracter,
        set: {
          onyomi: k.onyomi,
          kunyomi: k.kunyomi,
          numeroTrazos: k.numeroTrazos,
          nivel: k.nivel,
          urlOrdenTrazos: k.urlOrdenTrazos,
          fraseMnemotecnica: k.fraseMnemotecnica,
          urlImagenMnemotecnica: k.urlImagenMnemotecnica,
        },
      })
      .returning({ id: kanji.id, caracter: kanji.caracter });

    if (row) {
      idsPorCaracter.set(row.caracter, row.id);
    }
  }

  console.log(`✓ Kanjis upserteados: ${idsPorCaracter.size}`);

  // 2. Palabras y personas: se borran las existentes de cada kanji y se
  //    reinsertan las del JSON. Como no hay unique constraint natural,
  //    esta es la forma más simple de mantener el seed idempotente.
  for (const k of dataset) {
    const kanjiId = idsPorCaracter.get(k.caracter);
    if (!kanjiId) continue;

    await db.delete(palabrasFamosas).where(eq(palabrasFamosas.kanjiId, kanjiId));
    if (k.palabras && k.palabras.length > 0) {
      await db
        .insert(palabrasFamosas)
        .values(k.palabras.map((p) => ({ kanjiId, ...p })));
    }

    await db.delete(personasFamosas).where(eq(personasFamosas.kanjiId, kanjiId));
    if (k.personas && k.personas.length > 0) {
      await db
        .insert(personasFamosas)
        .values(k.personas.map((p) => ({ kanjiId, ...p })));
    }
  }

  console.log("✓ Palabras y personas resincronizadas");

  // 3. Relaciones (ambas direcciones). La tabla tiene primary key compuesto
  //    en (kanjiId, relacionadoId), asi que onConflictDoNothing es idempotente.
  const paresRelacion = new Set<string>();

  for (const k of dataset) {
    const origenId = idsPorCaracter.get(k.caracter);
    if (!origenId) continue;

    for (const relCaracter of k.relacionadosCon || []) {
      const destinoId = idsPorCaracter.get(relCaracter);

      if (!destinoId) {
        // Si el relacionado no esta en el dataset actual, buscarlo en la BDD
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
