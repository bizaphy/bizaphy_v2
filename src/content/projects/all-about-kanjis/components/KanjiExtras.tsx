import KanjiNombreFamoso, { type NombreFamoso } from "./KanjiNombreFamoso";

type Palabra = {
  palabra: string;
  furigana: string;
  traduccion: string;
};

type Props = {
  nombres?: NombreFamoso[];
  palabras?: Palabra[];
};

export default function KanjiExtras({ nombres, palabras }: Props) {
  return (
    <>
      {/* key: resetea el indice del carrusel al cambiar de kanji */}
      <KanjiNombreFamoso
        key={nombres?.map((n) => n.nombre).join("|")}
        nombres={nombres}
      />

      {/* Palabras famosas: borde zinc sin glow y acento violeta, para
          distinguirla de Celebridad / Serie (fucsia) sin sobresaturar */}
      <div className="flex flex-col overflow-hidden rounded-md border border-zinc-700 bg-zinc-900/60">
        <div className="border-b border-zinc-700 px-3 py-2 font-mono text-xs tracking-widest text-violet-300">
          PALABRAS FAMOSAS
        </div>
        <div className="flex flex-col divide-y divide-zinc-800">
          {palabras && palabras.length > 0 ? (
            palabras.map((w) => (
              <div key={w.palabra} className="flex flex-col gap-1 px-3 py-3">
                <span className="font-mono text-lg leading-none text-zinc-100 lg:text-xl">
                  {w.palabra}
                </span>
                <span className="font-mono text-xs text-violet-300/80">
                  {w.furigana}
                </span>
                <span className="text-xs text-zinc-400">
                  <span className="mr-1 text-violet-500/70">›</span>
                  {w.traduccion}
                </span>
              </div>
            ))
          ) : (
            <span className="px-3 py-2 font-mono text-[10px] tracking-wider text-zinc-600">
              sin datos
            </span>
          )}
        </div>
      </div>
    </>
  );
}
