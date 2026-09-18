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

// ── NIVEL JLPT: enum a nivel de base de datos, evita strings sueltos ──
export const nivelJlpt = pgEnum("nivel_jlpt", ["n5", "n4", "n3", "n2", "n1"]);

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

// ── PERSONAS FAMOSAS: uno a muchos con kanji ──
export const personasFamosas = pgTable("personas_famosas", {
  id: serial("id").primaryKey(),
  kanjiId: integer("kanji_id")
    .notNull()
    .references(() => kanji.id),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
});

// ── KANJI RELACIONADOS: auto-relación muchos a muchos, direccional ──
// una sola tabla con columna "nivel" permite relacionar kanji de niveles
export const kanjiRelacionados = pgTable(
  "kanji_relacionados",
  {
    kanjiId: integer("kanji_id")
      .notNull()
      .references(() => kanji.id),
    relacionadoId: integer("relacionado_id")
      .notNull()
      .references(() => kanji.id),
  },
  (table) => [primaryKey({ columns: [table.kanjiId, table.relacionadoId] })],
);

////////////////////////////////////////////////////////////////
// ── RELACIONES: mapa para queries anidadas con `.with`
// No crean nada en la BD; solo enseñan a Drizzle cómo navegar los FK ya definidos
////////////////////////////////////////////////////////////////

// Desde un kanji puedo saltar a: sus palabras, personas y kanjis relacionados
// Los relationName distinguen los dos lados de la auto-relación con kanjiRelacionados
export const kanjiRelations = relations(kanji, ({ many }) => ({
  palabras: many(palabrasFamosas),
  personas: many(personasFamosas),
  relacionadosDesde: many(kanjiRelacionados, { relationName: "origen" }),
  relacionadosHacia: many(kanjiRelacionados, { relationName: "destino" }),
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

// Cada persona famosa pertenece a un solo kanji (lado "muchos → 1")
export const personasFamosasRelations = relations(
  personasFamosas,
  ({ one }) => ({
    kanji: one(kanji, {
      fields: [personasFamosas.kanjiId],
      references: [kanji.id],
    }),
  }),
);

// Cada fila conecta dos kanjis: uno "origen" y otro "destino"
// Los relationName hacen match con los declarados arriba en kanjiRelations
export const kanjiRelacionadosRelations = relations(
  kanjiRelacionados,
  ({ one }) => ({
    origen: one(kanji, {
      fields: [kanjiRelacionados.kanjiId],
      references: [kanji.id],
      relationName: "origen",
    }),
    destino: one(kanji, {
      fields: [kanjiRelacionados.relacionadoId],
      references: [kanji.id],
      relationName: "destino",
    }),
  }),
);
