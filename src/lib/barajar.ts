//Fisher-Yates sobre una copia: no modifica el array original. Lo comparten
//KanjiTrainer (all-about-kanjis) y Grammar V1/V2 (grammar-booster).
export function barajar<Elemento>(elementos: Elemento[]): Elemento[] {
  const copia = [...elementos];
  for (let posicion = copia.length - 1; posicion > 0; posicion--) {
    const aleatoria = Math.floor(Math.random() * (posicion + 1));
    [copia[posicion], copia[aleatoria]] = [copia[aleatoria], copia[posicion]];
  }
  return copia;
}
