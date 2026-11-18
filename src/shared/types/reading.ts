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
