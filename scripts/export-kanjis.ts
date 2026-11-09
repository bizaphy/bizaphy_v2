// Exporta los kanjis de la BDD a scripts/seeds/<nivel>.json, con todas sus
// columnas, palabras, nombres famosos, kanji traps y radicales. Usalo despues de editar datos
// directo en la BDD, para que el JSON (fuente del seed) no quede atrasado.
//
//   npm run db:export-kanjis            -> todos los niveles con kanjis
//   npm run db:export-kanjis -- n5 n4   -> solo esos niveles

import fs from "fs";
import {
  conectar,
  esNivel,
  rutaJson,
  SEEDS_DIR,
  type Nivel,
  type SeedKanji,
} from "./kanji-seed-lib";

async function exportar() {
  // ── CASOS DEFENSIVOS: validar niveles antes de abrir la conexion ──
  const args = process.argv.slice(2); // [0] es node, [1] el script; lo demas son los niveles
  const invalidos = args.filter((arg) => !esNivel(arg));
  if (invalidos.length > 0) {
    throw new Error(`Niveles inválidos: ${invalidos.join(", ")}`); // ej: "n6" o "N5" (mayuscula)
  }

  const { db, pool } = conectar();

  try {
    // 1. Una sola query trae todo: kanji + sus palabras, nombres famosos y traps.
    //    `with` funciona gracias a las relations del schema (Drizzle arma los JOIN).
    //    Se traen todos los niveles y se filtra despues: son ~650 kanjis, es barato.
    const kanjis = await db.query.kanji.findMany({
      orderBy: (tablaKanji, { asc }) => [asc(tablaKanji.numeroTrazos), asc(tablaKanji.caracter)], // mismo orden que la UI
      with: {
        palabras: { orderBy: (tablaPalabras, { asc }) => [asc(tablaPalabras.id)] }, // orden de insercion
        nombres: { orderBy: (tablaNombres, { asc }) => [asc(tablaNombres.nombre)] }, // mismo orden que el carrusel
        kanjiTrapsDesde: {
          columns: {}, // de kanji_trap no interesa ninguna columna (solo son ids)...
          with: { destino: { columns: { caracter: true } } }, // ...sino el caracter del otro kanji
        },
        kanjiRadicales: {
          columns: {},
          orderBy: (tablaKanjiRadical, { asc }) => [asc(tablaKanjiRadical.orden)], // el orden es parte del dato
          with: { radical: { columns: { caracter: true } } },
        },
      },
    });

    // 2. Convertir cada fila de la BDD al formato del JSON (SeedKanji),
    //    agrupando por nivel: Map<"n5", [kanjis de n5]>
    const porNivel = new Map<Nivel, SeedKanji[]>();
    for (const kanji of kanjis) {
      if (args.length > 0 && !args.includes(kanji.nivel)) continue; // sin args = todos los niveles

      // Campos uno por uno (sin ...spread) para dejar fuera id y
      // url_orden_trazos: el id cambia entre BDDs y la url quedo obsoleta.
      // SeedKanji se deriva del schema: si agregas una columna a la tabla
      // kanji, TypeScript marca error en este objeto hasta que la asignes.
      const item: SeedKanji = {
        caracter: kanji.caracter,
        nivel: kanji.nivel,
        significado: kanji.significado,
        onyomi: kanji.onyomi,
        kunyomi: kanji.kunyomi,
        numeroTrazos: kanji.numeroTrazos,
        anioEscolarJapon: kanji.anioEscolarJapon,
        // [{ radical: { caracter: "⺅" } }, ...] -> ["⺅", ...], sin sort: respeta `orden`
        radicales: kanji.kanjiRadicales.map((relacion) => relacion.radical.caracter),
        fraseMnemotecnica: kanji.fraseMnemotecnica,
        urlImagenMnemotecnica: kanji.urlImagenMnemotecnica,
        oracionEjemplo: kanji.oracionEjemplo,
        traduccionOracion: kanji.traduccionOracion,
        destacado: kanji.destacado,
        // map + destructuring: se queda solo con esos campos (descarta id y kanjiId)
        palabras: kanji.palabras.map(({ palabra, furigana, traduccion }) => ({
          palabra,
          furigana,
          traduccion,
        })),
        nombres: kanji.nombres.map(({ nombre, furigana, descripcion, tipo }) => ({
          nombre,
          furigana,
          descripcion,
          tipo,
        })),
        // [{ destino: { caracter: "具" } }, ...] -> ["具", ...]
        relacionadosCon: kanji.kanjiTrapsDesde
          .map((trap) => trap.destino.caracter)
          .sort(), // orden fijo: si la BDD no cambio, el JSON sale identico
      };

      const lista = porNivel.get(kanji.nivel) ?? []; // primera vez que aparece el nivel -> lista vacia
      lista.push(item);
      porNivel.set(kanji.nivel, lista);
    }

    // 3. Escribir un archivo por nivel
    fs.mkdirSync(SEEDS_DIR, { recursive: true }); // crea scripts/seeds si no existe (recursive: no falla si ya esta)
    for (const [nivel, lista] of porNivel) {
      // null, 2 -> indentado de 2 espacios; "\n" final para que git no marque "no newline"
      fs.writeFileSync(rutaJson(nivel), JSON.stringify(lista, null, 2) + "\n");
      console.log(`✓ ${nivel}: ${lista.length} kanjis -> ${rutaJson(nivel)}`);
    }
  } finally {
    // finally: cierra el Pool aunque algo falle; para evitar que node quede colgado
    // esperando la conexion websocket abierta
    await pool.end();
  }
}

exportar().catch((err) => {
  console.error(
    "Error en el export:",
    err instanceof Error ? err.message : err,
  );
  process.exit(1); // codigo != 0 para que npm (y quien lo llame) sepa que fallo
});
