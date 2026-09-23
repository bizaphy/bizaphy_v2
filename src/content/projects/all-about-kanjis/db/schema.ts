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
  // Radicales identificados dentro del kanji. Se guardan como texto plano
  // separado por "、" (misma convencion que onyomi/kunyomi). Nullable: si
  // esta vacio la UI muestra N/A.
  radicales: text("radicales"),
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
// Define de donde se trae la imagen (anime/manga/personaje -> AniList,
// el resto -> Wikipedia) y evita buscar una persona como si fuera serie.
export const tipoNombre = pgEnum("tipo_nombre", [
  "persona", // persona real: actor, escritor, figura historica
  "personaje", // ficticio: Yamcha, Sugishita Ukyo
  "anime",
  "manga",
  "pelicula",
  "dorama",
  "libro", // novela, antologia, cuentos
  "juego",
  "otro", // periodico, tienda, lugar, concepto, etc.
  "musica", // canciones y obras musicales (al final: Postgres agrega valores de enum al final)
]);

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

////////////////////////////////////////////////////////////////
// ── RELACIONES: mapa para queries anidadas con `.with`
// No crean nada en la BD; solo enseñan a Drizzle cómo navegar los FK ya definidos
////////////////////////////////////////////////////////////////

// Desde un kanji puedo saltar a: sus palabras, nombres famosos y trampas (kanjis parecidos)
// Los relationName distinguen los dos lados de la auto-relación con kanjiTrap
export const kanjiRelations = relations(kanji, ({ many }) => ({
  palabras: many(palabrasFamosas),
  nombres: many(nombresFamosos),
  kanjiTrapsDesde: many(kanjiTrap, { relationName: "origen" }),
  kanjiTrapsHacia: many(kanjiTrap, { relationName: "destino" }),
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
