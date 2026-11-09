//Fisher-Yates sobre una copia: no modifica el array original. Lo comparten
//KanjiTrainer (all-about-kanjis) y Grammar V1/V2 (grammar-booster).
export function barajar<Elemento>(elementos: Elemento[]): Elemento[] {
  const out = [...elementos];
  for (let posicion = out.length - 1; posicion > 0; posicion--) {
    const aleatoria = Math.floor(Math.random() * (posicion + 1));
    [out[posicion], out[aleatoria]] = [out[aleatoria], out[posicion]];
  }
  return out;
}
