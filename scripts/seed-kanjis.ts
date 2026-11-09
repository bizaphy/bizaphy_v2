// Carga scripts/seeds/<nivel>.json en la BDD: kanjis (upsert), palabras,
// nombres famosos, kanji traps y radicales (kanji_radical). Antes de los
// niveles aplica el catalogo scripts/seeds/radicales.json (upsert).
//
//   npm run db:seed-kanjis -- n5            -> aplica n5.json
//   npm run db:seed-kanjis -- n5 n4 n3      -> varios niveles
//   npm run db:seed-kanjis -- n5 --dry-run  -> valida sin escribir nada
//
// El JSON es la fuente de verdad: palabras, nombres y radicales de cada
// kanji se borran y se reinsertan desde el archivo. Si editaste datos
// directo en la BDD, primero corre `npm run db:export-kanjis` para traerlos
// al JSON.
//
// Protecciones: antes de escribir se compara el JSON con la BDD y el seed
// aborta (sin tocar nada) si se perderia algo:
//   - una palabra, nombre o radical que esta en la BDD y no en el JSON
//   - un valor (significado, furigana, etc.) que en la BDD tiene dato y en
//     el JSON viene null
//   - un kanji que en la BDD pertenece a otro nivel
// Todo el nivel se escribe en una sola transaccion.
//
// Lo que el seed NO hace: borrar kanjis, kanji traps ni radicales del
// catalogo (solo agrega), ni pisar `destacado` de kanjis existentes (es
// estado de la UI).

import fs from "fs";
import { getTableColumns, inArray, sql, type Column } from "drizzle-orm";
import {
  columnasDelJson,
  COLUMNAS_SOLO_AL_CREAR,
  conectar,
  esNivel,
  RUTA_RADICALES,
  rutaJson,
  schema,
  type ColumnasKanji,
  type Db,
  type Nivel,
  type SeedKanji,
  type SeedRadical,
} from "./kanji-seed-lib";

const {
  kanji,
  palabrasFamosas,
  nombresFamosos,
  kanjiTrap,
  radical,
  kanjiRadical,
} = schema;

// ── COLUMNAS: todas derivadas del schema, no hay listas a mano ──

// Nullable en la BDD -> el JSON no puede vaciarlas si la BDD tiene dato.
// Las notNull no hace falta protegerlas: Postgres ya rechaza el null.
const COLUMNAS_PROTEGIDAS = columnasDelJson.filter((campo) => !campo.columna.notNull);

// Las que el upsert actualiza cuando el kanji ya existe. Fuera: caracter
// (es la clave del conflicto) y las que solo se escriben al crear.
const COLUMNAS_ACTUALIZABLES = columnasDelJson.filter(
  (campo) =>
    campo.nombre !== "caracter" &&
    !(COLUMNAS_SOLO_AL_CREAR as readonly string[]).includes(campo.nombre),
);

// En un upsert, "excluded" es la fila que se intento insertar.
const excluido = (columna: Column) => sql.raw(`excluded."${columna.name}"`);

// ── RADICALES: catalogo, se aplica una vez antes de los niveles ──

// Todas las columnas del radical menos id; mismo criterio que en kanji.
const COLUMNAS_RADICAL = Object.entries(getTableColumns(radical))
  .filter(([nombre]) => nombre !== "id")
  .map(([nombre, columna]) => ({
    nombre: nombre as keyof SeedRadical,
    columna,
  }));

function leerRadicales(): SeedRadical[] {
  const dataset: SeedRadical[] = JSON.parse(
    fs.readFileSync(RUTA_RADICALES, "utf-8"),
  );
  const errores: string[] = [];
  const vistos = new Set<string>();

  for (const radicalJson of dataset) {
    if ([...radicalJson.caracter].length !== 1) {
      errores.push(`"${radicalJson.caracter}" no es un solo caracter`);
    }
    if (vistos.has(radicalJson.caracter)) errores.push(`${radicalJson.caracter} está repetido`);
    vistos.add(radicalJson.caracter);

    const faltantes = COLUMNAS_RADICAL.filter(({ nombre }) => !(nombre in radicalJson));
    if (faltantes.length > 0) {
      errores.push(
        `${radicalJson.caracter} no tiene: ${faltantes.map((campo) => campo.nombre).join(", ")}`,
      );
    }
  }

  if (errores.length > 0) {
    throw new Error(`radicales.json inválido:\n  - ${errores.join("\n  - ")}`);
  }
  return dataset;
}

// Devuelve los caracteres del catalogo, para validar los radicales de cada nivel.
async function sembrarRadicales(db: Db, dryRun: boolean) {
  console.log("\n── radicales ──");
  const dataset = leerRadicales();

  // Misma proteccion que en kanji: el JSON no puede vaciar un dato de la BDD.
  const enBdd = await db.select().from(radical);
  const porCaracter = new Map(dataset.map((radicalJson) => [radicalJson.caracter, radicalJson]));
  const perdidas: string[] = [];
  for (const actual of enBdd) {
    const nuevo = porCaracter.get(actual.caracter);
    if (!nuevo) {
      console.warn(
        `⚠ ${actual.caracter} está en la BDD pero no en radicales.json (no se modifica)`,
      );
      continue;
    }
    for (const { nombre, columna } of COLUMNAS_RADICAL) {
      if (!columna.notNull && actual[nombre] !== null && nuevo[nombre] === null) {
        perdidas.push(
          `${actual.caracter}: ${nombre} "${actual[nombre]}" quedaría vacío`,
        );
      }
    }
  }
  if (perdidas.length > 0) {
    throw new Error(
      `Seed de radicales abortado, se perderían datos de la BDD:\n  - ${perdidas.join("\n  - ")}`,
    );
  }

  const existentes = new Set(enBdd.map((fila) => fila.caracter));
  const nuevos = dataset.filter((radicalJson) => !existentes.has(radicalJson.caracter)).length;
  console.log(`${dataset.length} radicales (${nuevos} nuevos)`);

  if (!dryRun) {
    // Un solo INSERT ... ON CONFLICT: es atomico sin necesitar transaccion.
    await db
      .insert(radical)
      .values(dataset)
      .onConflictDoUpdate({
        target: radical.caracter,
        set: Object.fromEntries(
          COLUMNAS_RADICAL.filter((campo) => campo.nombre !== "caracter").map((campo) => [
            campo.nombre,
            excluido(campo.columna),
          ]),
        ),
      });
    console.log("✓ radicales aplicados");
  }

  return new Set(dataset.map((radicalJson) => radicalJson.caracter));
}

// Se queda solo con las columnas del kanji: saca palabras, nombres y
// relacionadosCon, y descarta claves que no sean columnas (ej: un
// urlOrdenTrazos viejo en el JSON).
function soloColumnas(kanjiJson: SeedKanji): ColumnasKanji {
  return Object.fromEntries(
    columnasDelJson.map(({ nombre }) => [nombre, kanjiJson[nombre]]),
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

  for (const kanjiJson of dataset) {
    if ([...kanjiJson.caracter].length !== 1) {
      errores.push(`"${kanjiJson.caracter}" no es un solo caracter`);
    }
    if (kanjiJson.nivel !== nivel) {
      errores.push(
        `${kanjiJson.caracter} tiene nivel ${kanjiJson.nivel} dentro de ${nivel}.json`,
      );
    }
    if (vistos.has(kanjiJson.caracter)) errores.push(`${kanjiJson.caracter} está repetido`);

    // Columna nueva en el schema que el JSON todavia no tiene: sin este
    // chequeo llegaria como undefined y el upsert pisaria el dato de la BDD.
    const faltantes = columnasDelJson.filter(({ nombre }) => !(nombre in kanjiJson));
    if (faltantes.length > 0) {
      errores.push(
        `${kanjiJson.caracter} no tiene: ${faltantes.map((campo) => campo.nombre).join(", ")}`,
      );
    }
    vistos.add(kanjiJson.caracter);

    const palabras = kanjiJson.palabras.map((palabra) => palabra.palabra);
    const nombres = kanjiJson.nombres.map((famoso) => famoso.nombre);
    if (new Set(palabras).size !== palabras.length) {
      errores.push(`${kanjiJson.caracter} tiene palabras repetidas`);
    }
    if (new Set(nombres).size !== nombres.length) {
      errores.push(`${kanjiJson.caracter} tiene nombres repetidos`);
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
  const caracteres = dataset.map((kanjiJson) => kanjiJson.caracter);
  const enBdd = await db.query.kanji.findMany({
    where: (tablaKanji, { eq, or, inArray }) =>
      or(eq(tablaKanji.nivel, nivel), inArray(tablaKanji.caracter, caracteres)),
    with: {
      palabras: true,
      nombres: true,
      kanjiRadicales: {
        columns: {},
        with: { radical: { columns: { caracter: true } } },
      },
    },
  });

  const porCaracter = new Map(dataset.map((kanjiJson) => [kanjiJson.caracter, kanjiJson]));
  const perdidas: string[] = [];
  const avisos: string[] = [];

  for (const actual of enBdd) {
    const nuevo = porCaracter.get(actual.caracter);

    if (!nuevo) {
      // Kanji del nivel que no esta en el JSON: el seed no lo toca.
      avisos.push(
        `${actual.caracter} está en la BDD pero no en el JSON (no se modifica)`,
      );
      continue;
    }

    if (actual.nivel !== nivel) {
      perdidas.push(
        `${actual.caracter}: en la BDD es ${actual.nivel}, el JSON lo pasaría a ${nivel}`,
      );
    }

    for (const { nombre } of COLUMNAS_PROTEGIDAS) {
      if (actual[nombre] !== null && nuevo[nombre] === null) {
        perdidas.push(
          `${actual.caracter}: ${nombre} "${actual[nombre]}" quedaría vacío`,
        );
      }
    }

    const palabrasJson = new Set(nuevo.palabras.map((palabra) => palabra.palabra));
    for (const palabraBdd of actual.palabras) {
      if (!palabrasJson.has(palabraBdd.palabra)) {
        perdidas.push(
          `${actual.caracter}: se borraría la palabra ${palabraBdd.palabra}`,
        );
      }
    }

    const nombresJson = new Map(nuevo.nombres.map((famoso) => [famoso.nombre, famoso]));
    for (const nombreBdd of actual.nombres) {
      const enJson = nombresJson.get(nombreBdd.nombre);
      if (!enJson) {
        perdidas.push(`${actual.caracter}: se borraría el nombre ${nombreBdd.nombre}`);
      } else if (nombreBdd.furigana !== null && enJson.furigana === null) {
        perdidas.push(
          `${actual.caracter}: se borraría el furigana de ${nombreBdd.nombre} (${nombreBdd.furigana})`,
        );
      }
    }

    const radicalesJson = new Set(nuevo.radicales);
    for (const { radical: radicalBdd } of actual.kanjiRadicales) {
      if (!radicalesJson.has(radicalBdd.caracter)) {
        perdidas.push(`${actual.caracter}: se borraría el radical ${radicalBdd.caracter}`);
      }
    }
  }

  return {
    perdidas,
    avisos,
    existentes: new Set(enBdd.map((fila) => fila.caracter)),
  };
}

// Cada radical de la lista ["⺅", "木"] tiene que existir en el catalogo y no
// repetirse en el mismo kanji (la PK de kanji_radical es kanjiId + radicalId).
function validarRadicales(
  nivel: Nivel,
  dataset: SeedKanji[],
  catalogo: Set<string>,
) {
  const errores: string[] = [];
  for (const kanjiJson of dataset) {
    // Formato viejo ("⺅、木" o null): mejor avisar que fallar mas adelante
    if (!Array.isArray(kanjiJson.radicales)) {
      errores.push(
        `${kanjiJson.caracter}: radicales tiene que ser una lista, ej: ["⺅", "木"]`,
      );
      continue;
    }
    const lista = kanjiJson.radicales;
    for (const caracterRadical of lista) {
      if (!catalogo.has(caracterRadical)) {
        errores.push(`${kanjiJson.caracter}: el radical ${caracterRadical} no está en radicales.json`);
      }
    }
    if (new Set(lista).size !== lista.length) {
      errores.push(`${kanjiJson.caracter} tiene radicales repetidos`);
    }
  }
  if (errores.length > 0) {
    throw new Error(
      `${nivel}.json inválido:\n  - ${errores.join("\n  - ")}`,
    );
  }
}

async function sembrarNivel(
  db: Db,
  nivel: Nivel,
  dryRun: boolean,
  catalogo: Set<string>,
) {
  console.log(`\n── ${nivel} ──`);
  const dataset = leerJson(nivel);
  validarRadicales(nivel, dataset, catalogo);
  const { perdidas, avisos, existentes } = await buscarPerdidas(
    db,
    nivel,
    dataset,
  );

  avisos.forEach((aviso) => console.warn(`⚠ ${aviso}`));
  if (perdidas.length > 0) {
    throw new Error(
      `Seed de ${nivel} abortado, se perderían datos de la BDD:\n  - ${perdidas.join("\n  - ")}\n` +
        `Si están bien en la BDD: npm run db:export-kanjis -- ${nivel}. ` +
        `Si quieres borrarlos a propósito, bórralos a mano en la BDD.`,
    );
  }

  const nuevos = dataset.filter((kanjiJson) => !existentes.has(kanjiJson.caracter)).length;
  const totalPalabras = dataset.reduce((total, kanjiJson) => total + kanjiJson.palabras.length, 0);
  const totalNombres = dataset.reduce((total, kanjiJson) => total + kanjiJson.nombres.length, 0);
  const totalRadicales = dataset.reduce(
    (total, kanjiJson) => total + kanjiJson.radicales.length,
    0,
  );
  console.log(
    `${dataset.length} kanjis (${nuevos} nuevos), ${totalPalabras} palabras, ${totalNombres} nombres, ${totalRadicales} radicales`,
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
          COLUMNAS_ACTUALIZABLES.map((campo) => [campo.nombre, excluido(campo.columna)]),
        ),
      })
      .returning({ id: kanji.id, caracter: kanji.caracter });

    const idPorCaracter = new Map(filas.map((fila) => [fila.caracter, fila.id]));
    const idsNivel = [...idPorCaracter.values()];

    // 2. Palabras y nombres: no hay unique natural, asi que se reemplazan.
    //    buscarPerdidas ya garantizo que no se pierde nada.
    await tx
      .delete(palabrasFamosas)
      .where(inArray(palabrasFamosas.kanjiId, idsNivel));
    const palabras = dataset.flatMap((kanjiJson) =>
      kanjiJson.palabras.map((palabra) => ({ kanjiId: idPorCaracter.get(kanjiJson.caracter)!, ...palabra })),
    );
    if (palabras.length > 0) await tx.insert(palabrasFamosas).values(palabras);

    await tx
      .delete(nombresFamosos)
      .where(inArray(nombresFamosos.kanjiId, idsNivel));
    const nombres = dataset.flatMap((kanjiJson) =>
      kanjiJson.nombres.map((famoso) => ({ kanjiId: idPorCaracter.get(kanjiJson.caracter)!, ...famoso })),
    );
    if (nombres.length > 0) await tx.insert(nombresFamosos).values(nombres);

    // 3. Kanji traps en ambas direcciones. PK compuesta + onConflictDoNothing
    //    lo hace idempotente. El destino puede ser de otro nivel.
    const relacionados = [
      ...new Set(dataset.flatMap((kanjiJson) => kanjiJson.relacionadosCon)),
    ];
    const faltantes = relacionados.filter((caracter) => !idPorCaracter.has(caracter));
    if (faltantes.length > 0) {
      const otros = await tx
        .select({ id: kanji.id, caracter: kanji.caracter })
        .from(kanji)
        .where(inArray(kanji.caracter, faltantes));
      otros.forEach((otro) => idPorCaracter.set(otro.caracter, otro.id));
    }

    const pares = new Map<string, { kanjiId: number; kanjiTrapId: number }>();
    for (const kanjiJson of dataset) {
      const origen = idPorCaracter.get(kanjiJson.caracter)!;
      for (const caracterRelacionado of kanjiJson.relacionadosCon) {
        const destino = idPorCaracter.get(caracterRelacionado);
        if (!destino) {
          console.warn(
            `⚠ ${kanjiJson.caracter} referencia a ${caracterRelacionado}, que no existe en la BDD`,
          );
          continue;
        }
        pares.set(`${origen}→${destino}`, {
          kanjiId: origen,
          kanjiTrapId: destino,
        });
        pares.set(`${destino}→${origen}`, {
          kanjiId: destino,
          kanjiTrapId: origen,
        });
      }
    }
    if (pares.size > 0) {
      await tx
        .insert(kanjiTrap)
        .values([...pares.values()])
        .onConflictDoNothing();
    }

    // 4. Radicales: se reemplazan igual que las palabras (buscarPerdidas ya
    //    garantizo que no se pierde ninguno).
    //    orden = posicion en la lista, para mostrarlos en el mismo orden.
    await tx
      .delete(kanjiRadical)
      .where(inArray(kanjiRadical.kanjiId, idsNivel));
    const usados = [...new Set(dataset.flatMap((kanjiJson) => kanjiJson.radicales))];
    if (usados.length > 0) {
      const idRadicalPorCaracter = new Map(
        (
          await tx
            .select({ id: radical.id, caracter: radical.caracter })
            .from(radical)
            .where(inArray(radical.caracter, usados))
        ).map((fila) => [fila.caracter, fila.id]),
      );
      const filasRadical = dataset.flatMap((kanjiJson) =>
        kanjiJson.radicales.map((caracterRadical, orden) => ({
          kanjiId: idPorCaracter.get(kanjiJson.caracter)!,
          radicalId: idRadicalPorCaracter.get(caracterRadical)!,
          orden,
        })),
      );
      await tx.insert(kanjiRadical).values(filasRadical);
    }

    console.log(
      `✓ ${nivel} aplicado (${pares.size} relaciones trap verificadas)`,
    );
  });
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const niveles = args.filter((arg) => arg !== "--dry-run");

  if (niveles.length === 0) {
    throw new Error(
      "Indica al menos un nivel, ej: npm run db:seed-kanjis -- n5",
    );
  }
  const invalidos = niveles.filter((nivel) => !esNivel(nivel));
  if (invalidos.length > 0) {
    throw new Error(`Niveles inválidos: ${invalidos.join(", ")}`);
  }

  const { db, pool } = conectar();
  try {
    // El catalogo va primero: los niveles referencian sus radicales.
    const catalogo = await sembrarRadicales(db, dryRun);
    for (const nivel of niveles as Nivel[]) {
      await sembrarNivel(db, nivel, dryRun, catalogo);
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
