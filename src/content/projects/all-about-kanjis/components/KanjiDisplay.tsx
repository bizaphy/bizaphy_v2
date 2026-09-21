type Props = {
  caracter: string;
  significado: string;
  onyomi: string | null;
  kunyomi: string | null;
  numeroTrazos: number;
  anioEscolarJapon: number | null;
  destacado: boolean;
  onToggleDestacado: () => void;
  toggleDeshabilitado?: boolean;
};

export default function KanjiDisplay({
  caracter,
  significado,
  onyomi,
  kunyomi,
  numeroTrazos,
  anioEscolarJapon,
  destacado,
  onToggleDestacado,
  toggleDeshabilitado,
}: Props) {
  return (
    <section className="flex items-stretch gap-6 p-4">
      {/* Contenedor izquierdo: ancho fijo (w-40) con dos zonas apiladas.*/}
      <div className="relative flex w-40 shrink-0 flex-col overflow-hidden rounded-md border border-fuchsia-500/40 bg-zinc-900/60 shadow-[0_0_10px_rgba(217,70,239,0.25)] lg:w-52">
        {/* Estrella toggle: marca el kanji como "destacado" (dificil).
            Se posiciona absoluta arriba a la derecha del carrilito del kanji. */}
        <button
          type="button"
          onClick={onToggleDestacado}
          disabled={toggleDeshabilitado}
          aria-pressed={destacado}
          aria-label={
            destacado ? "Quitar de destacados" : "Marcar como destacado"
          }
          title={destacado ? "Quitar de destacados" : "Marcar como destacado"}
          className={`absolute top-1 left-1 z-10 flex h-7 w-7 items-center justify-center rounded-full text-lg leading-none transition disabled:cursor-not-allowed disabled:opacity-50 ${
            destacado
              ? "text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.75)] hover:text-amber-200"
              : "text-zinc-500 hover:text-amber-300"
          }`}
        >
          {destacado ? "★" : "☆"}
        </button>

        <div className="flex aspect-square items-center justify-center">
          <span className="font-mono text-6xl leading-none text-fuchsia-100 lg:text-7xl">
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
          <div className="font-mono text-lg text-fuchsia-200 lg:text-xl">
            {onyomi ?? <span className="text-zinc-600">—</span>}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="font-mono text-[11px] tracking-wide text-zinc-500">
            訓読み <span className="text-zinc-600">(kunyomi)</span>
          </div>
          <div className="font-mono text-lg text-fuchsia-200 lg:text-xl">
            {kunyomi ?? <span className="text-zinc-600">—</span>}
          </div>
        </div>

        <div className="font-mono text-xs text-zinc-400">
          <span className="text-zinc-500">N° Trazos:</span>{" "}
          <span className="text-fuchsia-200">{numeroTrazos}</span>
        </div>

        <div className="font-mono text-xs text-zinc-400">
          <span className="text-zinc-500">Año escolar (Japón):</span>{" "}
          <span className="text-fuchsia-200">
            {anioEscolarJapon ?? <span className="text-zinc-600">—</span>}
          </span>
        </div>
      </div>
    </section>
  );
}
