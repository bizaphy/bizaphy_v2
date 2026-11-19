// Tipos del karaoke. Mismo esquema que reading (texto -> filas con
// traduccion), mas el momento en que sale cada fila en el video.

// Tiempo de salida de una fila, en segundos. Guarda tambien el texto de la
// fila para poder re-alinear los tiempos si despues editas la letra.
export type TiempoFila = {
  ja: string;
  t: number | null;
};

export type Cancion = {
  id: string;
  titulo: string;
  // Artista, URL o referencia
  fuente: string;
  // Letra con furigana "[漢字|かな]". Una linea = una fila.
  texto: string;
  // Mis traducciones, por texto de fila (el coro se traduce una vez)
  traducciones: Record<string, string>;
  // Traduccion correcta importada, por texto de fila
  real: Record<string, string>;
  // Un elemento por fila, en el mismo orden que las filas
  tiempos: TiempoFila[];
  // Nombre del ultimo archivo de video usado (solo como recordatorio: el
  // video en si no se guarda)
  video: string;
};
