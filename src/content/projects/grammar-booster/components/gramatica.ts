// Tipos y utilidades compartidas por GrammarV1 y GrammarV2.

export type Nivel = "n5" | "n4" | "n3";
export type Filtro = "todos" | Nivel;

export type Ejemplo = {
  ja: string;
  lectura: string;
  es: string;
  // Parte de `ja` que corresponde a la estructura, si aparece una sola vez.
  resaltado: string | null;
};

export type Estructura = {
  id: string;
  nivel: Nivel;
  patron: string;
  romaji: string;
  significado: string;
  conexion: string[];
  ejemplos: Ejemplo[];
};

export const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "n5", label: "N5" },
  { id: "n4", label: "N4" },
  { id: "n3", label: "N3" },
];

// Los tres JSON (~350 KB en total) se piden al montar la pestana, no al
// cargar la pagina.
export async function cargarEstructuras(): Promise<Map<string, Estructura>> {
  const archivos = await Promise.all([
    import("../data/ejemplos-gramatica/n5.json"),
    import("../data/ejemplos-gramatica/n4.json"),
    import("../data/ejemplos-gramatica/n3.json"),
  ]);
  const todas = archivos.flatMap(
    (m) => (m.default as unknown as { estructuras: Estructura[] }).estructuras,
  );
  return new Map(todas.map((e) => [e.id, e]));
}

// Fisher-Yates sobre una copia.
export function barajar<T>(xs: T[]): T[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const botonBase =
  "rounded-md border px-4 py-2 font-mono text-xs tracking-widest uppercase transition";

export const chipFiltro = (activo: boolean) =>
  `rounded-full border px-3 py-1 font-mono text-xs transition ${
    activo
      ? "border-fuchsia-400 bg-fuchsia-500/25 text-fuchsia-100 shadow-[0_0_10px_rgba(217,70,239,0.6)]"
      : "border-violet-300/40 bg-zinc-900 text-violet-300 hover:border-violet-300"
  }`;

export const estiloOpcion = (estado: "normal" | "fallada" | "correcta") =>
  ({
    normal:
      "border-violet-300/50 bg-zinc-900/80 text-zinc-100 hover:border-violet-300 hover:shadow-[0_0_10px_rgba(196,181,253,0.4)]",
    fallada: "border-rose-500/60 bg-rose-500/10 text-rose-300 line-through",
    correcta:
      "border-emerald-400 bg-emerald-500/15 text-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.4)]",
  })[estado];
