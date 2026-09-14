import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── NIVEL JLPT: enum a nivel de base de datos, evita strings sueltos ──
export const nivelJlpt = pgEnum("nivel_jlpt", ["n5", "n4", "n3", "n2", "n1"]);

// ── KANJI: tabla principal, un kanji por fila ──
export const kanji = pgTable("kanji", {
  id: serial("id").primaryKey(),
  caracter: varchar("caracter", { length: 1 }).notNull().unique(),
  onyomi: text("onyomi"),
  kunyomi: text("kunyomi"),
  numeroTrazos: integer("numero_trazos").notNull(),
  urlOrdenTrazos: text("url_orden_trazos"),
  fraseMnemotecnica: text("frase_mnemotecnica"),
  urlImagenMnemotecnica: text("url_imagen_mnemotecnica"),
  nivel: nivelJlpt("nivel").notNull(),
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
// distintos sin romper foreign keys (el problema que tendrían 5 tablas separadas)
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
  (t) => ({
    pk: primaryKey({ columns: [t.kanjiId, t.relacionadoId] }),
  }),
);

// ── RELACIONES: le dicen a Drizzle cómo anidar los resultados con `with` ──
export const kanjiRelations = relations(kanji, ({ many }) => ({
  palabras: many(palabrasFamosas),
  personas: many(personasFamosas),
  relacionadosDesde: many(kanjiRelacionados, { relationName: "origen" }),
  relacionadosHacia: many(kanjiRelacionados, { relationName: "destino" }),
}));

export const palabrasFamosasRelations = relations(
  palabrasFamosas,
  ({ one }) => ({
    kanji: one(kanji, {
      fields: [palabrasFamosas.kanjiId],
      references: [kanji.id],
    }),
  }),
);

export const personasFamosasRelations = relations(
  personasFamosas,
  ({ one }) => ({
    kanji: one(kanji, {
      fields: [personasFamosas.kanjiId],
      references: [kanji.id],
    }),
  }),
);

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
