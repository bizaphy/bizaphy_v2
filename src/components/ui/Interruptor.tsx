// Interruptor de config de vista (no filtro). Lo usan KanjiTrainer
// ("Furigana", "Colores JLPT") y Grammar Booster ("Furigana").
export default function Interruptor({
  label,
  activo,
  onToggle,
}: {
  label: string;
  activo: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      onClick={onToggle}
      className="flex items-center gap-2 font-mono text-xs tracking-widest text-zinc-400 uppercase hover:text-zinc-200"
    >
      {label}
      <span
        className={`relative h-4 w-7 rounded-full border transition ${
          activo
            ? "border-violet-300 bg-violet-500/40"
            : "border-zinc-600 bg-zinc-800"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-2.5 w-2.5 rounded-full transition ${
            activo ? "translate-x-3 bg-violet-100" : "bg-zinc-500"
          }`}
        />
      </span>
    </button>
  );
}
