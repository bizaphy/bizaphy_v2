import Image from "next/image";

type Persona = {
  nombre: string;
  furigana?: string | null;
  descripcion?: string | null;
  urlImagen?: string | null;
};

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
      {/* Persona famosa */}
      <div className="flex flex-col overflow-hidden rounded-md border border-fuchsia-500/40 bg-zinc-900/60 shadow-[0_0_10px_rgba(217,70,239,0.25)]">
        <div className="border-b border-zinc-700 px-3 py-2 font-mono text-xs tracking-widest text-fuchsia-300">
          PERSONA FAMOSA
        </div>
        <div className="flex flex-col gap-3 p-3">
          {personas && personas.length > 0 ? (
            personas.map((p) => (
              <div key={p.nombre} className="flex gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded border border-dashed border-zinc-700 bg-zinc-900/40 lg:size-20">
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
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(p.nombre)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Buscar ${p.nombre} en Google`}
                    className="w-fit font-mono text-sm text-fuchsia-200 underline decoration-fuchsia-500/40 underline-offset-4 transition hover:text-white hover:decoration-fuchsia-300 lg:text-base"
                  >
                    {p.nombre}
                  </a>
                  {p.furigana && (
                    <span className="font-mono text-xs text-fuchsia-300/80">
                      {p.furigana}
                    </span>
                  )}
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
