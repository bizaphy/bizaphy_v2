import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  integer,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
// Ruta relativa (no "@/"): drizzle-kit y los scripts de seed cargan este
// archivo fuera de Next y no siempre resuelven el alias.
import { NIVELES_JLPT, TIPOS_NOMBRE } from "../../../shared/types/kanji";

// ── NIVEL JLPT: enum a nivel de base de datos, evita strings sueltos ──
// Los valores viven en shared/types/kanji.ts para que el cliente los use sin importar src/server.
export const nivelJlpt = pgEnum("nivel_jlpt", NIVELES_JLPT);

// ── KANJI: tabla principal, un kanji por fila ──
export const kanji = pgTable("kanji", {
  id: serial("id").primaryKey(),
  caracter: varchar("caracter", { length: 1 }).notNull().unique(),
  significado: text("significado"),
  onyomi: text("onyomi"),
  kunyomi: text("kunyomi"),
  numeroTrazos: integer("numero_trazos").notNull(),
  anioEscolarJapon: integer("anio_escolar_japon"),
  urlOrdenTrazos: text("url_orden_trazos"),
  fraseMnemotecnica: text("frase_mnemotecnica"),
  urlImagenMnemotecnica: text("url_imagen_mnemotecnica"),
  // Oracion con la lectura mas comun del kanji. Furigana en formato
  // [漢字|かんじ]: lo que esta fuera de corchetes se muestra sin furigana.
  oracionEjemplo: text("oracion_ejemplo"),
  traduccionOracion: text("traduccion_oracion"),
  // Los radicales no son columna: van en kanji_radical (ver mas abajo)
  nivel: nivelJlpt("nivel").notNull(),
  destacado: boolean("destacado").notNull().default(false),
});

// ── PALABRAS FAMOSAS: uno a muchos con kanji ──
export const palabrasFamosas = pgTable("palabras_famosas", {
  id: serial("id").primaryKey(),
  kanjiId: integer("kanji_id")
    .notNull()
    .references(() => kanji.id),
  palabra: varchar("palabra", { length: 20 }).notNull(),
  furigana: varchar("furigana", { length: 30 }).notNull(), // lectura de la palabra completa, no siempre deducible de onyomi/kunyomi
  traduccion: text("traduccion").notNull(),
});

// ── TIPO DE NOMBRE: que es cada nombre famoso ──
// Los valores (y por qué existe cada uno) están en shared/types/kanji.ts.
export const tipoNombre = pgEnum("tipo_nombre", TIPOS_NOMBRE);

// ── NOMBRES FAMOSOS: uno a muchos con kanji ──
// Nombres propios que contienen el kanji: personas, series, peliculas,
// canciones, marcas, etc.
export const nombresFamosos = pgTable("nombres_famosos", {
  id: serial("id").primaryKey(),
  kanjiId: integer("kanji_id")
    .notNull()
    .references(() => kanji.id),
  nombre: text("nombre").notNull(),
  // Nullable: si la lectura del nombre no es segura, la UI muestra solo el nombre.
  furigana: text("furigana"),
  descripcion: text("descripcion"),
  // default "otro": las filas existentes quedan validas al agregar la columna
  tipo: tipoNombre("tipo").notNull().default("otro"),
});

// ── KANJI TRAP: auto-relación muchos a muchos, direccional ──
// vincula un kanji con otros que suelen confundirse visualmente (trampas de lectura)
export const kanjiTrap = pgTable(
  "kanji_trap",
  {
    kanjiId: integer("kanji_id")
      .notNull()
      .references(() => kanji.id),
    kanjiTrapId: integer("kanji_trap_id")
      .notNull()
      .references(() => kanji.id),
  },
  (table) => [primaryKey({ columns: [table.kanjiId, table.kanjiTrapId] })],
);

// ── RADICAL: catalogo de grafemas (fuente: public/radicales.pdf) ──
// Un radical se guarda una sola vez; los kanjis lo referencian via kanjiRadical.
export const radical = pgTable("radical", {
  id: serial("id").primaryKey(),
  // varchar cuenta caracteres, no bytes: 𠆢 (fuera del BMP) cabe en length 1
  caracter: varchar("caracter", { length: 1 }).notNull().unique(),
  numeroTrazos: integer("numero_trazos").notNull(),
  nombre: text("nombre"), // nombre japones en romaji: "ninben"
  furigana: text("furigana"), // mismo nombre en kana: "にんべん"
  significado: text("significado"),
  kanjiOrigen: varchar("kanji_origen", { length: 1 }), // forma completa: ⺅ -> 人
});

// ── KANJI RADICAL: muchos a muchos entre kanji y radical ──
// orden: las filas no tienen orden garantizado; asi 校 se muestra 木、亠、八、乂
export const kanjiRadical = pgTable(
  "kanji_radical",
  {
    kanjiId: integer("kanji_id")
      .notNull()
      .references(() => kanji.id),
    radicalId: integer("radical_id")
      .notNull()
      .references(() => radical.id),
    orden: integer("orden").notNull(),
  },
  (table) => [primaryKey({ columns: [table.kanjiId, table.radicalId] })],
);

////////////////////////////////////////////////////////////////
// ── RELACIONES: mapa para queries anidadas con `.with`
// No crean nada en la BD; solo enseñan a Drizzle cómo navegar los FK ya definidos
////////////////////////////////////////////////////////////////

// Desde un kanji puedo saltar a: sus palabras, nombres famosos, trampas (kanjis parecidos) y radicales
// Los relationName distinguen los dos lados de la auto-relación con kanjiTrap
export const kanjiRelations = relations(kanji, ({ many }) => ({
  palabras: many(palabrasFamosas),
  nombres: many(nombresFamosos),
  kanjiTrapsDesde: many(kanjiTrap, { relationName: "origen" }),
  kanjiTrapsHacia: many(kanjiTrap, { relationName: "destino" }),
  kanjiRadicales: many(kanjiRadical),
}));

// Desde un radical puedo saltar a todos los kanjis que lo contienen
export const radicalRelations = relations(radical, ({ many }) => ({
  kanjis: many(kanjiRadical),
}));

// Cada fila conecta un kanji con uno de sus radicales
export const kanjiRadicalRelations = relations(kanjiRadical, ({ one }) => ({
  kanji: one(kanji, {
    fields: [kanjiRadical.kanjiId],
    references: [kanji.id],
  }),
  radical: one(radical, {
    fields: [kanjiRadical.radicalId],
    references: [radical.id],
  }),
}));

// Cada palabra pertenece a un solo kanji (lado "muchos → 1")
export const palabrasFamosasRelations = relations(
  palabrasFamosas,
  ({ one }) => ({
    kanji: one(kanji, {
      fields: [palabrasFamosas.kanjiId],
      references: [kanji.id],
    }),
  }),
);

// Cada nombre famoso pertenece a un solo kanji (lado "muchos → 1")
export const nombresFamososRelations = relations(
  nombresFamosos,
  ({ one }) => ({
    kanji: one(kanji, {
      fields: [nombresFamosos.kanjiId],
      references: [kanji.id],
    }),
  }),
);

// Cada fila conecta dos kanjis: uno "origen" y otro "destino"
// Los relationName hacen match con los declarados arriba en kanjiRelations
export const kanjiTrapRelations = relations(kanjiTrap, ({ one }) => ({
  origen: one(kanji, {
    fields: [kanjiTrap.kanjiId],
    references: [kanji.id],
    relationName: "origen",
  }),
  destino: one(kanji, {
    fields: [kanjiTrap.kanjiTrapId],
    references: [kanji.id],
    relationName: "destino",
  }),
}));
