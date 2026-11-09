export const LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
export type Level = (typeof LEVELS)[number];

// N2 y N1 todavia no tienen contenido cargado en la BDD, se muestran deshabilitados.
export const DISABLED_LEVELS: readonly Level[] = ["N2", "N1"];

export type LevelInfo = {
  kanjisAcumulados: string;
  cobertura: string;
  capacidad: string;
};

export const LEVEL_INFO: Record<Level, LevelInfo> = {
  N5: {
    kanjisAcumulados: "~100",
    cobertura: "~35% – 45%",
    capacidad:
      "Solo reconocerás caracteres sueltos (números, días, direcciones). El texto será incomprensible.",
  },
  N4: {
    kanjisAcumulados: "~300",
    cobertura: "~70% – 75%",
    capacidad:
      "Distingues palabras comunes de verbos y adjetivos, pero no logras seguir el hilo de las noticias.",
  },
  N3: {
    kanjisAcumulados: "~650",
    cobertura: "~85%",
    capacidad:
      "Puedes entender titulares sencillos y noticias muy locales o adaptadas (como NHK Easy News).",
  },
  N2: {
    kanjisAcumulados: "~1.000",
    cobertura: "~93% – 95%",
    capacidad:
      "Umbral funcional. Puedes navegar y leer artículos de opinión o noticias generales apoyándote en un diccionario.",
  },
  N1: {
    kanjisAcumulados: "~2.000+",
    cobertura: "~99%",
    capacidad:
      "Alfabetización completa. Cubre prácticamente la lista oficial de uso diario (Jōyō Kanji). Lees la prensa con fluidez.",
  },
};
