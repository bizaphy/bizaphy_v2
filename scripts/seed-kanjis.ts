// Carga scripts/seeds/<nivel>.json en la BDD: kanjis (upsert), palabras,
// personas y kanji traps.
//
//   npm run db:seed-kanjis -- n5            -> aplica n5.json
//   npm run db:seed-kanjis -- n5 n4 n3      -> varios niveles
//   npm run db:seed-kanjis -- n5 --dry-run  -> valida sin escribir nada
//
// El JSON es la fuente de verdad: palabras y personas de cada kanji se
// borran y se reinsertan desde el archivo. Si editaste datos directo en la
// BDD, primero corre `npm run db:export-kanjis` para traerlos al JSON.
//
// Protecciones: antes de escribir se compara el JSON con la BDD y el seed
// aborta (sin tocar nada) si se perderia algo:
//   - una palabra o persona que esta en la BDD y no en el JSON
//   - un valor (significado, radicales, furigana, etc.) que en la BDD tiene
//     dato y en el JSON viene null
//   - un kanji que en la BDD pertenece a otro nivel
// Todo el nivel se escribe en una sola transaccion.
//
// Lo que el seed NO hace: borrar kanjis ni kanji traps (solo agrega), ni
// pisar `destacado` de kanjis existentes (es estado de la UI).

import fs from "fs";
import { inArray, sql, type Column } from "drizzle-orm";
import {
  columnasDelJson,
  COLUMNAS_SOLO_AL_CREAR,
  conectar,
  esNivel,
  rutaJson,
  schema,
  type ColumnasKanji,
  type Db,
  type Nivel,
  type SeedKanji,
} from "./kanji-seed-lib";

const { kanji, palabrasFamosas, personasFamosas, kanjiTrap } = schema;

// ── COLUMNAS: todas derivadas del schema, no hay listas a mano ──

// Nullable en la BDD -> el JSON no puede vaciarlas si la BDD tiene dato.
// Las notNull no hace falta protegerlas: Postgres ya rechaza el null.
const COLUMNAS_PROTEGIDAS = columnasDelJson.filter((c) => !c.columna.notNull);

// Las que el upsert actualiza cuando el kanji ya existe. Fuera: caracter
// (es la clave del conflicto) y las que solo se escriben al crear.
const COLUMNAS_ACTUALIZABLES = columnasDelJson.filter(
  (c) =>
    c.nombre !== "caracter" &&
    !(COLUMNAS_SOLO_AL_CREAR as readonly string[]).includes(c.nombre),
);

// En un upsert, "excluded" es la fila que se intento insertar.
const excluido = (c: Column) => sql.raw(`excluded."${c.name}"`);

// Se queda solo con las columnas del kanji: saca palabras, personas y
// relacionadosCon, y descarta claves que no sean columnas (ej: un
// urlOrdenTrazos viejo en el JSON).
function soloColumnas(k: SeedKanji): ColumnasKanji {
  return Object.fromEntries(
    columnasDelJson.map(({ nombre }) => [nombre, k[nombre]]),
  ) as ColumnasKanji;
}

function leerJson(nivel: Nivel): SeedKanji[] {
  const ruta = rutaJson(nivel);
  if (!fs.existsSync(ruta)) {
    throw new Error(
      `No existe ${ruta}. Genéralo con: npm run db:export-kanjis -- ${nivel}`,
    );
  }

  const dataset: SeedKanji[] = JSON.parse(fs.readFileSync(ruta, "utf-8"));
  const errores: string[] = [];
  const vistos = new Set<string>();

  for (const k of dataset) {
    if ([...k.caracter].length !== 1) {
      errores.push(`"${k.caracter}" no es un solo caracter`);
    }
    if (k.nivel !== nivel) {
      errores.push(`${k.caracter} tiene nivel ${k.nivel} dentro de ${nivel}.json`);
    }
    if (vistos.has(k.caracter)) errores.push(`${k.caracter} está repetido`);

    // Columna nueva en el schema que el JSON todavia no tiene: sin este
    // chequeo llegaria como undefined y el upsert pisaria el dato de la BDD.
    const faltantes = columnasDelJson.filter(({ nombre }) => !(nombre in k));
    if (faltantes.length > 0) {
      errores.push(
        `${k.caracter} no tiene: ${faltantes.map((c) => c.nombre).join(", ")}`,
      );
    }
    vistos.add(k.caracter);

    const palabras = k.palabras.map((p) => p.palabra);
    const personas = k.personas.map((p) => p.nombre);
    if (new Set(palabras).size !== palabras.length) {
      errores.push(`${k.caracter} tiene palabras repetidas`);
    }
    if (new Set(personas).size !== personas.length) {
      errores.push(`${k.caracter} tiene personas repetidas`);
    }
  }

  if (errores.length > 0) {
    throw new Error(
      `${nivel}.json inválido:\n  - ${errores.join("\n  - ")}\n` +
        `Si agregaste una columna al schema: npm run db:export-kanjis -- ${nivel}`,
    );
  }
  return dataset;
}

// Compara el JSON con la BDD y devuelve todo lo que el seed borraria.
async function buscarPerdidas(db: Db, nivel: Nivel, dataset: SeedKanji[]) {
  const caracteres = dataset.map((k) => k.caracter);
  const enBdd = await db.query.kanji.findMany({
    where: (k, { eq, or, inArray }) =>
      or(eq(k.nivel, nivel), inArray(k.caracter, caracteres)),
    with: { palabras: true, personas: true },
  });

  const porCaracter = new Map(dataset.map((k) => [k.caracter, k]));
  const perdidas: string[] = [];
  const avisos: string[] = [];

  for (const actual of enBdd) {
    const nuevo = porCaracter.get(actual.caracter);

    if (!nuevo) {
      // Kanji del nivel que no esta en el JSON: el seed no lo toca.
      avisos.push(`${actual.caracter} está en la BDD pero no en el JSON (no se modifica)`);
      continue;
    }

    if (actual.nivel !== nivel) {
      perdidas.push(`${actual.caracter}: en la BDD es ${actual.nivel}, el JSON lo pasaría a ${nivel}`);
    }

    for (const { nombre } of COLUMNAS_PROTEGIDAS) {
      if (actual[nombre] !== null && nuevo[nombre] === null) {
        perdidas.push(`${actual.caracter}: ${nombre} "${actual[nombre]}" quedaría vacío`);
      }
    }

    const palabrasJson = new Set(nuevo.palabras.map((p) => p.palabra));
    for (const p of actual.palabras) {
      if (!palabrasJson.has(p.palabra)) {
        perdidas.push(`${actual.caracter}: se borraría la palabra ${p.palabra}`);
      }
    }

    const personasJson = new Map(nuevo.personas.map((p) => [p.nombre, p]));
    for (const p of actual.personas) {
      const enJson = personasJson.get(p.nombre);
      if (!enJson) {
        perdidas.push(`${actual.caracter}: se borraría la persona ${p.nombre}`);
      } else if (p.furigana !== null && enJson.furigana === null) {
        perdidas.push(`${actual.caracter}: se borraría el furigana de ${p.nombre} (${p.furigana})`);
      }
    }
  }

  return { perdidas, avisos, existentes: new Set(enBdd.map((k) => k.caracter)) };
}

async function sembrarNivel(db: Db, nivel: Nivel, dryRun: boolean) {
  console.log(`\n── ${nivel} ──`);
  const dataset = leerJson(nivel);
  const { perdidas, avisos, existentes } = await buscarPerdidas(db, nivel, dataset);

  avisos.forEach((a) => console.warn(`⚠ ${a}`));
  if (perdidas.length > 0) {
    throw new Error(
      `Seed de ${nivel} abortado, se perderían datos de la BDD:\n  - ${perdidas.join("\n  - ")}\n` +
        `Si están bien en la BDD: npm run db:export-kanjis -- ${nivel}. ` +
        `Si quieres borrarlos a propósito, bórralos a mano en la BDD.`,
    );
  }

  const nuevos = dataset.filter((k) => !existentes.has(k.caracter)).length;
  const totalPalabras = dataset.reduce((n, k) => n + k.palabras.length, 0);
  const totalPersonas = dataset.reduce((n, k) => n + k.personas.length, 0);
  console.log(
    `${dataset.length} kanjis (${nuevos} nuevos), ${totalPalabras} palabras, ${totalPersonas} personas`,
  );

  if (dryRun) {
    console.log("✓ dry-run: validación OK, no se escribió nada");
    return;
  }

  await db.transaction(async (tx) => {
    // 1. Upsert de kanjis. Las columnas salen del schema: una nueva entra
    //    sola en el insert y en el set, sin tocar este archivo.
    //    COLUMNAS_SOLO_AL_CREAR (destacado) van en el insert pero no en el set.
    const filas = await tx
      .insert(kanji)
      .values(dataset.map(soloColumnas))
      .onConflictDoUpdate({
        target: kanji.caracter,
        // { nivel: excluded."nivel", significado: excluded."significado", ... }
        set: Object.fromEntries(
          COLUMNAS_ACTUALIZABLES.map((c) => [c.nombre, excluido(c.columna)]),
        ),
      })
      .returning({ id: kanji.id, caracter: kanji.caracter });

    const ids = new Map(filas.map((f) => [f.caracter, f.id]));
    const idsNivel = [...ids.values()];

    // 2. Palabras y personas: no hay unique natural, asi que se reemplazan.
    //    buscarPerdidas ya garantizo que no se pierde nada.
    await tx.delete(palabrasFamosas).where(inArray(palabrasFamosas.kanjiId, idsNivel));
    const palabras = dataset.flatMap((k) =>
      k.palabras.map((p) => ({ kanjiId: ids.get(k.caracter)!, ...p })),
    );
    if (palabras.length > 0) await tx.insert(palabrasFamosas).values(palabras);

    await tx.delete(personasFamosas).where(inArray(personasFamosas.kanjiId, idsNivel));
    const personas = dataset.flatMap((k) =>
      k.personas.map((p) => ({ kanjiId: ids.get(k.caracter)!, ...p })),
    );
    if (personas.length > 0) await tx.insert(personasFamosas).values(personas);

    // 3. Kanji traps en ambas direcciones. PK compuesta + onConflictDoNothing
    //    lo hace idempotente. El destino puede ser de otro nivel.
    const relacionados = [...new Set(dataset.flatMap((k) => k.relacionadosCon))];
    const faltantes = relacionados.filter((c) => !ids.has(c));
    if (faltantes.length > 0) {
      const otros = await tx
        .select({ id: kanji.id, caracter: kanji.caracter })
        .from(kanji)
        .where(inArray(kanji.caracter, faltantes));
      otros.forEach((o) => ids.set(o.caracter, o.id));
    }

    const pares = new Map<string, { kanjiId: number; kanjiTrapId: number }>();
    for (const k of dataset) {
      const origen = ids.get(k.caracter)!;
      for (const rel of k.relacionadosCon) {
        const destino = ids.get(rel);
        if (!destino) {
          console.warn(`⚠ ${k.caracter} referencia a ${rel}, que no existe en la BDD`);
          continue;
        }
        pares.set(`${origen}→${destino}`, { kanjiId: origen, kanjiTrapId: destino });
        pares.set(`${destino}→${origen}`, { kanjiId: destino, kanjiTrapId: origen });
      }
    }
    if (pares.size > 0) {
      await tx.insert(kanjiTrap).values([...pares.values()]).onConflictDoNothing();
    }

    console.log(`✓ ${nivel} aplicado (${pares.size} relaciones trap verificadas)`);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const niveles = args.filter((a) => a !== "--dry-run");

  if (niveles.length === 0) {
    throw new Error("Indica al menos un nivel, ej: npm run db:seed-kanjis -- n5");
  }
  const invalidos = niveles.filter((n) => !esNivel(n));
  if (invalidos.length > 0) {
    throw new Error(`Niveles inválidos: ${invalidos.join(", ")}`);
  }

  const { db, pool } = conectar();
  try {
    for (const nivel of niveles as Nivel[]) {
      await sembrarNivel(db, nivel, dryRun);
    }
    console.log("\nSeed completado.");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("\n✗", err instanceof Error ? err.message : err);
  process.exit(1);
});
