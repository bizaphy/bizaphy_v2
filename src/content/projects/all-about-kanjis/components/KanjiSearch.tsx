export default function KanjiSearch() {
  return (
    <div className="px-4">
      <div className="group relative flex items-center rounded-md border border-fuchsia-500/40 bg-zinc-900/60 shadow-[0_0_10px_rgba(217,70,239,0.15)] transition focus-within:border-fuchsia-400 focus-within:shadow-[0_0_14px_rgba(217,70,239,0.45)]">
        {/* icono lupa */}
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
          disabled
          placeholder="Buscar kanji, lectura o palabra..."
          className="w-full bg-transparent py-2 pr-3 font-mono text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
        />

        {/* atajo de teclado (placeholder visual, sin funcionalidad) */}
        <span className="mr-2 hidden shrink-0 rounded border border-zinc-700 bg-zinc-800/80 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 sm:inline">
          ⌘K
        </span>
      </div>
    </div>
  );
}
