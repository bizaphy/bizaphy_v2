// Agregador de tablas: lo leen db/index.ts (para db.query.*) y drizzle-kit.
// Esta carpeta NO lleva "server-only": drizzle-kit y los scripts de seed
// cargan estos archivos con Node, fuera de Next, y ese paquete lanzaría error.
// Lo que protege la conexión es db/index.ts, que sí lo tiene.
export * from "./kanji";
export * from "./auth";
export * from "./plan";
export * from "./post";
export * from "./reading";
