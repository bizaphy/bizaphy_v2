import Image from "next/image";

type Persona = {
  nombre: string;
  descripcion?: string | null;
  urlImagen?: string | null;
};

type Palabra = {
  palabra: string;
  furigana: string;
  traduccion: string;
};

type KanjiTrap = {
  caracter: string;
  significado?: string | null;
};

type Props = {
  personas?: Persona[];
  palabras?: Palabra[];
  kanjiTraps?: KanjiTrap[];
};

export default function KanjiExtras({
  personas,
  palabras,
  kanjiTraps,
}: Props) {
  return (
    <section className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3">
      {/* Persona famosa */}
      <div className="flex flex-col overflow-hidden rounded-md border border-fuchsia-500/40 bg-zinc-900/60 shadow-[0_0_10px_rgba(217,70,239,0.25)]">
        <div className="border-b border-zinc-700 px-3 py-2 font-mono text-xs tracking-widest text-fuchsia-300">
          PERSONA FAMOSA
        </div>
        <div className="flex flex-col gap-3 p-3">
          {personas && personas.length > 0 ? (
            personas.map((p) => (
              <div key={p.nombre} className="flex gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded border border-dashed border-zinc-700 bg-zinc-900/40">
                  {p.urlImagen ? (
                    <Image
                      src={p.urlImagen}
                      alt={p.nombre}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center font-mono text-[9px] tracking-wider text-zinc-600">
                      sin img
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="font-mono text-sm text-fuchsia-200">
                    {p.nombre}
                  </span>
                  {p.descripcion && (
                    <span className="line-clamp-3 text-xs leading-snug text-zinc-400">
                      {p.descripcion}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <span className="font-mono text-[10px] tracking-wider text-zinc-600">
              sin datos
            </span>
          )}
        </div>
      </div>

      {/* Palabras famosas */}
      <div className="flex flex-col overflow-hidden rounded-md border border-fuchsia-500/40 bg-zinc-900/60 shadow-[0_0_10px_rgba(217,70,239,0.25)]">
        <div className="border-b border-zinc-700 px-3 py-2 font-mono text-xs tracking-widest text-fuchsia-300">
          PALABRAS FAMOSAS
        </div>
        <div className="flex flex-col divide-y divide-zinc-800">
          {palabras && palabras.length > 0 ? (
            palabras.map((w) => (
              <div key={w.palabra} className="flex flex-col gap-1 px-3 py-3">
                <span className="font-mono text-lg leading-none text-fuchsia-100">
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

      {/* Kanji trap */}
      <div className="flex flex-col overflow-hidden rounded-md border border-fuchsia-500/40 bg-zinc-900/60 shadow-[0_0_10px_rgba(217,70,239,0.25)]">
        <div className="border-b border-zinc-700 px-3 py-2 font-mono text-xs tracking-widest text-fuchsia-300">
          KANJI TRAP
        </div>
        <div className="flex flex-wrap gap-2 p-3">
          {kanjiTraps && kanjiTraps.length > 0 ? (
            kanjiTraps.map((k) => (
              <div
                key={k.caracter}
                className="flex flex-col items-center gap-1 rounded border border-zinc-700 bg-black/40 px-2 py-1.5"
              >
                <span className="font-mono text-2xl leading-none text-fuchsia-100">
                  {k.caracter}
                </span>
                {k.significado && (
                  <span className="text-[10px] text-zinc-500">
                    {k.significado}
                  </span>
                )}
              </div>
            ))
          ) : (
            <span className="font-mono text-[10px] tracking-wider text-zinc-600">
              sin datos
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
