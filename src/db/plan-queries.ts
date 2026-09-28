import "server-only";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { plan } from "./plan-schema";

// Todos los planes, primero los de mayor prioridad y luego los más nuevos
export async function obtenerPlanes() {
  return db
    .select()
    .from(plan)
    .orderBy(desc(plan.prioridad), desc(plan.creadoEn));
}
