import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
config({ path: ".env.local" });

// Igual que drizzle.config.ts pero contra la base de PRODUCCION.
// Uso: npm run db:push:prod
if (!process.env.DATABASE_URL_PROD) {
  throw new Error("Falta DATABASE_URL_PROD en .env.local");
}

export default defineConfig({
  schema: "./src/server/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_PROD,
  },
  strict: true,
  verbose: true,
});
