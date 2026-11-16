// Contrato de datos de All About Kanjis entre servidor y cliente.
// El schema (server/db/schema/kanji.ts) arma sus enums con estas listas y
// services/kanjis.ts devuelve KanjiEnListado: si la consulta cambia y ya no
// calza con este tipo, TypeScript avisa en el service.
// Este archivo no importa nada de src/server: los componentes cliente lo usan.

// ── NIVEL JLPT ──
export const NIVELES_JLPT = ["n5", "n4", "n3", "n2", "n1"] as const;
export type NivelJlpt = (typeof NIVELES_JLPT)[number];

// ── TIPO DE NOMBRE: qué es cada nombre famoso ──
// Define de dónde se trae la imagen (anime/manga/personaje -> AniList,
// el resto -> Wikipedia) y evita buscar una persona como si fuera serie.
export const TIPOS_NOMBRE = [
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
] as const;
export type TipoNombre = (typeof TIPOS_NOMBRE)[number];

// ── KANJI EN LISTADO: lo que trae listarKanjisPorNivel ──
export type KanjiEnListado = {
  id: number;
  caracter: string;
  nivel: NivelJlpt; // define la subcarpeta del SVG de orden de trazos
  significado: string | null;
  onyomi: string | null;
  kunyomi: string | null;
  numeroTrazos: number;
  anioEscolarJapon: number | null;
  urlImagenMnemotecnica: string | null;
  fraseMnemotecnica: string | null;
  oracionEjemplo: string | null;
  traduccionOracion: string | null;
  destacado: boolean;
  palabras: { palabra: string; furigana: string; traduccion: string }[];
  nombres: {
    nombre: string;
    furigana: string | null;
    descripcion: string | null;
    tipo: TipoNombre;
  }[];
  kanjiTrapsDesde: {
    destino: { caracter: string; significado: string | null };
  }[];
  kanjiRadicales: {
    radical: {
      caracter: string;
      significado: string | null;
      furigana: string | null;
      numeroTrazos: number;
    };
  }[];
};
