type Props = {
  caracter: string;
  significado: string | null;
  isSelected?: boolean;
  onClick?: () => void;
};

export default function KanjiCard({
  caracter,
  significado,
  isSelected,
  onClick,
}: Props) {
  const base =
    "group relative flex aspect-square items-center justify-center rounded-md border font-mono text-[1.8rem] shadow-[0_0_6px_rgba(217,70,239,0.25)] transition-colors duration-150 ease-out select-none hover:z-10";
  const idle =
    "border-fuchsia-500/40 bg-zinc-900/60 text-fuchsia-100 hover:border-fuchsia-400 hover:text-white hover:shadow-[0_0_12px_rgba(217,70,239,0.6)]";
  const selected =
    "border-fuchsia-300 bg-fuchsia-500/25 text-white shadow-[0_0_14px_rgba(217,70,239,0.75)]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`${base} ${isSelected ? selected : idle} cursor-pointer`}
    >
      {caracter}
      {/* Tooltip: preview con el kanji grande + significado.
          pointer-events-none para no romper el hover del boton. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-1/2 mb-3 flex w-36 -translate-x-1/2 scale-90 flex-col items-center gap-1.5 rounded-lg border border-fuchsia-400 bg-zinc-950/95 px-3 py-3 text-center opacity-0 shadow-[0_0_18px_rgba(217,70,239,0.65)] transition-all duration-150 ease-out group-hover:scale-100 group-hover:opacity-100"
      >
        <span className="font-mono text-5xl leading-none text-fuchsia-100">
          {caracter}
        </span>
        <span className="text-xs leading-tight text-zinc-200">
          {significado ?? <span className="text-zinc-500">sin significado</span>}
        </span>
        {/* flechita apuntando a la card */}
        <span
          aria-hidden="true"
          className="absolute top-full left-1/2 -mt-px h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-fuchsia-400 bg-zinc-950"
        />
      </span>
    </button>
  );
}
