import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// ── POST: una entrada del blog ──
export const post = pgTable("post", {
  id: serial("id").primaryKey(),
  titulo: varchar("titulo", { length: 160 }).notNull(),
  // Parte de la URL: /blog/mi-primer-post. unique: no puede haber dos iguales
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  resumen: text("resumen"),
  contenido: text("contenido").notNull(),
  // false = borrador: solo se ve en /admin/blog
  publicado: boolean("publicado").notNull().default(false),
  // null mientras nunca se haya publicado
  publicadoEn: timestamp("publicado_en", { withTimezone: true }),
  creadoEn: timestamp("creado_en", { withTimezone: true })
    .notNull()
    .defaultNow(),
  actualizadoEn: timestamp("actualizado_en", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
