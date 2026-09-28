import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const estadoPlan = pgEnum("estado_plan", [
  "idea",
  "siguiente",
  "en_progreso",
  "hecho",
]);

export const plan = pgTable("plan", {
  id: serial("id").primaryKey(),
  titulo: varchar("titulo", { length: 120 }).notNull(),
  detalle: text("detalle"),
  estado: estadoPlan("estado").notNull().default("idea"),
  // 1 = baja, 2 = media, 3 = alta
  prioridad: integer("prioridad").notNull().default(2),
  creadoEn: timestamp("creado_en", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
