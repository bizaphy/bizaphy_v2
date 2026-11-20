import type { Comodin } from "./comodin";
import type { Cancion } from "./karaoke";

// Tipos del sistema de reading. Viven en src/shared porque los usa el editor
// (client) y, cuando exista la tabla, tambien el service del servidor.

// Una fila = una linea del texto japones + lo que significa.
// `ja` guarda la furigana con el mismo formato de All About Kanjis:
// "[今日|きょう]は[雨|あめ]です。"
export type FilaReading = {
  ja: string;
  es: string;
};

export type Reading = {
  titulo: string;
  fuente: string;
  // Palabras que no conocia al leer el texto, para dejarlas registradas
  comodines: string[];
  filas: FilaReading[];
};

// Lo que el editor de reading guarda en la base, aparte de las traducciones
export type BorradorReading = {
  titulo: string;
  fuente: string;
  texto: string;
};

// Cambios que manda el autoguardado: id -> valor nuevo, o null si se borro
export type Cambios<Valor> = Record<string, Valor | null>;

// Lo que habia guardado en el localStorage del navegador antes de que
// existieran las tablas. Se sube una sola vez.
export type DatosDelNavegador = {
  borrador: BorradorReading | null;
  traducciones: Record<string, string>;
  canciones: Cancion[];
  comodines: Comodin[];
};
