type Props = {
  filled: number;
  partial?: boolean; // si true, el segmento en posicion `filled` se muestra atenuado (en proceso)
  max?: number;
  labels?: string[]; // opcional: al pasar el mouse por un segmento, muestra su label
};

export default function SegmentedBar({
  filled,
  partial = false,
  max = 10,
  labels,
}: Props) {
  return (
    <div
      className="flex gap-[3px]"
      aria-label={`nivel ${filled}${partial ? "+" : ""} de ${max}`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const isFilled = i < filled;
        const isPartial = partial && i === filled;
        const label = labels?.[i];
        return (
          <div key={i} className="group relative">
            <span
              className={`block h-2.5 w-2.5 rounded-[1px] transition ${
                isFilled
                  ? "bg-fuchsia-500 shadow-[0_0_5px_rgba(217,70,239,0.7)]"
                  : isPartial
                    ? "bg-fuchsia-500/35 shadow-[0_0_3px_rgba(217,70,239,0.25)]"
                    : "border border-zinc-800 bg-transparent"
              }`}
            />
            {label && (
              <span className="pointer-events-none absolute -top-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded border border-fuchsia-500/50 bg-black/90 px-1.5 py-0.5 font-mono text-[10px] text-fuchsia-300 opacity-0 transition group-hover:opacity-100">
                {label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
