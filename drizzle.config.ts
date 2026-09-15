import { defineConfig } from "drizzle-kit";
import "dotenv/config"; // carga .env

import { config } from "dotenv";
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts", // el agregador
  out: "./drizzle", // carpeta donde caen las migraciones
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true, //muestra el SQL que se va a ejecutar antes de aplicarlo.
});
