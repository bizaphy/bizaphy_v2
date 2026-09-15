type Props = {
  caracter: string;
  significado: string;
  onyomi: string | null;
  kunyomi: string | null;
};

export default function KanjiDisplay({
  caracter,
  significado,
  onyomi,
  kunyomi,
}: Props) {
  return (
    <section className="flex items-stretch gap-6 p-4">
      {/* Contenedor izquierdo: ancho fijo (w-40) con dos zonas apiladas.*/}
      <div className="flex w-40 shrink-0 flex-col overflow-hidden rounded-md border border-fuchsia-500/40 bg-zinc-900/60 shadow-[0_0_10px_rgba(217,70,239,0.25)]">
        <div className="flex aspect-square items-center justify-center">
          <span className="font-mono text-6xl leading-none text-fuchsia-100">
            {caracter}
          </span>
        </div>
        <div className="flex min-h-14 items-center justify-center border-t border-zinc-700 px-2 py-2 text-center text-xs leading-tight text-zinc-300">
          <span className="line-clamp-2">{significado}</span>
        </div>
      </div>

      {/* Lecturas: fuera del cuadrado -> sin borde. Etiquetas en japones + romaji. */}
      <div className="flex flex-1 flex-col justify-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[11px] tracking-wide text-zinc-500">
            音読み <span className="text-zinc-600">(onyomi)</span>
          </div>
          <div className="font-mono text-lg text-fuchsia-200">
            {onyomi ?? <span className="text-zinc-600">—</span>}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="font-mono text-[11px] tracking-wide text-zinc-500">
            訓読み <span className="text-zinc-600">(kunyomi)</span>
          </div>
          <div className="font-mono text-lg text-fuchsia-200">
            {kunyomi ?? <span className="text-zinc-600">—</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
