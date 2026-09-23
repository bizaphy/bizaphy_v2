import KanjiPersonaFamosa, { type Persona } from "./KanjiPersonaFamosa";

type Palabra = {
  palabra: string;
  furigana: string;
  traduccion: string;
};

type Props = {
  personas?: Persona[];
  palabras?: Palabra[];
};

export default function KanjiExtras({ personas, palabras }: Props) {
  return (
    <>
      {/* key: resetea el indice del carrusel al cambiar de kanji */}
      <KanjiPersonaFamosa
        key={personas?.map((p) => p.nombre).join("|")}
        personas={personas}
      />

      {/* Palabras famosas */}
      <div className="flex flex-col overflow-hidden rounded-md border border-fuchsia-500/40 bg-zinc-900/60 shadow-[0_0_10px_rgba(217,70,239,0.25)]">
        <div className="border-b border-zinc-700 px-3 py-2 font-mono text-xs tracking-widest text-fuchsia-300">
          PALABRAS FAMOSAS
        </div>
        <div className="flex flex-col divide-y divide-zinc-800">
          {palabras && palabras.length > 0 ? (
            palabras.map((w) => (
              <div key={w.palabra} className="flex flex-col gap-1 px-3 py-3">
                <span className="font-mono text-lg leading-none text-fuchsia-100 lg:text-xl">
                  {w.palabra}
                </span>
                <span className="font-mono text-xs text-fuchsia-300/80">
                  {w.furigana}
                </span>
                <span className="text-xs text-zinc-400">
                  <span className="mr-1 text-fuchsia-500/70">›</span>
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
