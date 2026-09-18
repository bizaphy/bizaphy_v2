export type AnioFiltro =
  | "todos"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "sin-dato";

export type TrazosFiltro = "todos" | "1-5" | "6-10" | "11-15" | "16+";

type Props = {
  value: string;
  onChange: (value: string) => void;
  soloDestacados: boolean;
  onSoloDestacadosChange: (v: boolean) => void;
  anio: AnioFiltro;
  onAnioChange: (v: AnioFiltro) => void;
  trazos: TrazosFiltro;
  onTrazosChange: (v: TrazosFiltro) => void;
};

const selectBase =
  "cursor-pointer rounded border border-fuchsia-500/40 bg-zinc-900/80 px-2 py-1 font-mono text-xs text-zinc-200 shadow-[0_0_6px_rgba(217,70,239,0.2)] transition hover:border-fuchsia-400 focus:border-fuchsia-300 focus:outline-none focus:shadow-[0_0_10px_rgba(217,70,239,0.5)]";

export default function KanjiSearch({
  value,
  onChange,
  soloDestacados,
  onSoloDestacadosChange,
  anio,
  onAnioChange,
  trazos,
  onTrazosChange,
}: Props) {
  return (
    <div className="px-4">
      <div className="rounded-md border border-fuchsia-500/40 bg-zinc-900/60 shadow-[0_0_10px_rgba(217,70,239,0.15)] transition focus-within:border-fuchsia-400 focus-within:shadow-[0_0_14px_rgba(217,70,239,0.45)]">
        {/* Fila 1: buscador por significado */}
        <div className="group flex items-center border-b border-zinc-800/80">
          <span
            aria-hidden
            className="pointer-events-none flex h-10 w-10 shrink-0 items-center justify-center text-fuchsia-400/80"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>

          <input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Buscar por significado..."
            className="w-full bg-transparent py-2 pr-3 font-mono text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
          />

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Limpiar busqueda"
              className="mr-2 shrink-0 rounded border border-zinc-700 bg-zinc-800/80 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 transition hover:border-fuchsia-400 hover:text-fuchsia-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Fila 2: filtros. Chip destacados + selects de anio y trazos. */}
        <div className="flex flex-wrap items-center gap-2 px-2 py-2">
          <button
            type="button"
            onClick={() => onSoloDestacadosChange(!soloDestacados)}
            aria-pressed={soloDestacados}
            className={`flex items-center gap-1 rounded border px-2 py-1 font-mono text-xs transition ${
              soloDestacados
                ? "border-amber-300 bg-amber-500/15 text-amber-200 shadow-[0_0_10px_rgba(252,211,77,0.45)]"
                : "border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:border-amber-300/70 hover:text-amber-200"
            }`}
          >
            <span aria-hidden>{soloDestacados ? "★" : "☆"}</span>
            Solo destacados
          </button>

          <label className="flex items-center gap-1 font-mono text-[11px] text-zinc-500">
            Año:
            <select
              value={anio}
              onChange={(e) => onAnioChange(e.target.value as AnioFiltro)}
              className={selectBase}
            >
              <option value="todos">Todos</option>
              <option value="1">1°</option>
              <option value="2">2°</option>
              <option value="3">3°</option>
              <option value="4">4°</option>
              <option value="5">5°</option>
              <option value="6">6°</option>
              <option value="sin-dato">Sin dato</option>
            </select>
          </label>

          <label className="flex items-center gap-1 font-mono text-[11px] text-zinc-500">
            Trazos:
            <select
              value={trazos}
              onChange={(e) => onTrazosChange(e.target.value as TrazosFiltro)}
              className={selectBase}
            >
              <option value="todos">Todos</option>
              <option value="1-5">1 a 5</option>
              <option value="6-10">6 a 10</option>
              <option value="11-15">11 a 15</option>
              <option value="16+">16 o más</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
