type KanjiTrapItem = {
  caracter: string;
  significado?: string | null;
};

type Props = {
  kanjiTraps?: KanjiTrapItem[];
};

export default function KanjiTrap({ kanjiTraps }: Props) {
  return (
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
              <span className="font-mono text-2xl leading-none text-fuchsia-100 lg:text-3xl">
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
  );
}
