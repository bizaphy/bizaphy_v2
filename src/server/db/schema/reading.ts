import {
  pgTable,
  pgEnum,
  integer,
  varchar,
  text,
  uuid,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
// Ruta relativa (no "@/"): drizzle-kit carga este archivo fuera de Next
import { ORIGENES_COMODIN } from "../../../shared/types/comodin";
import type { TiempoFila } from "../../../shared/types/karaoke";

// ── READING: el texto que esta abierto en el editor ──
// Una sola fila (id = 1): el editor trabaja un texto a la vez.
export const readingBorrador = pgTable("reading_borrador", {
  id: integer("id").primaryKey().default(1),
  titulo: varchar("titulo", { length: 160 }).notNull().default(""),
  fuente: text("fuente").notNull().default(""),
  texto: text("texto").notNull().default(""),
  actualizadoEn: timestamp("actualizado_en", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ── READING: mis traducciones, una por linea de texto ──
// La clave es la linea en japones (no el texto al que pertenece): asi una
// fila que se repite o un texto que vuelves a abrir recupera su traduccion.
export const readingTraduccion = pgTable("reading_traduccion", {
  ja: text("ja").primaryKey(),
  es: text("es").notNull(),
});

// ── CANCION: una cancion del karaoke ──
// El id lo genera el navegador (uuid) para poder crearla sin esperar a la
// base. Traducciones y tiempos van en jsonb: siempre se leen y guardan
// junto con la cancion entera.
export const cancion = pgTable("cancion", {
  id: uuid("id").primaryKey(),
  titulo: varchar("titulo", { length: 160 }).notNull().default(""),
  fuente: text("fuente").notNull().default(""),
  texto: text("texto").notNull().default(""),
  traducciones: jsonb("traducciones")
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  real: jsonb("real").$type<Record<string, string>>().notNull().default({}),
  tiempos: jsonb("tiempos").$type<TiempoFila[]>().notNull().default([]),
  // Nombre del ultimo archivo de video usado (el video no se guarda)
  video: text("video").notNull().default(""),
  creadoEn: timestamp("creado_en", { withTimezone: true })
    .notNull()
    .defaultNow(),
  actualizadoEn: timestamp("actualizado_en", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ── COMODIN: palabra que me costo, con la frase donde aparecio ──
export const origenComodin = pgEnum("origen_comodin", ORIGENES_COMODIN);

export const comodin = pgTable("comodin", {
  id: uuid("id").primaryKey(),
  palabra: text("palabra").notNull(),
  lectura: text("lectura").notNull().default(""),
  significado: text("significado").notNull().default(""),
  // Fila completa con furigana "[漢字|かな]"
  frase: text("frase").notNull().default(""),
  origen: origenComodin("origen").notNull(),
  // Texto o cancion de donde salio
  titulo: text("titulo").notNull().default(""),
  creadoEn: timestamp("creado_en", { withTimezone: true })
    .notNull()
    .defaultNow(),
  aciertos: integer("aciertos").notNull().default(0),
  fallos: integer("fallos").notNull().default(0),
});
