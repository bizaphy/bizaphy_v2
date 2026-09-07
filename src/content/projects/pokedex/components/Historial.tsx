type HistorialProps = {
  historial: string[];
};

export function Historial({ historial }: HistorialProps) {
  if (historial.length === 0) return null;
  return (
    <div className="mt-4 text-left">
      <h3 className="mb-3 text-xs uppercase tracking-wider text-zinc-400">
        Historial
      </h3>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {historial.map((nombre) => (
          <li
            key={nombre}
            className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm capitalize text-zinc-400"
          >
            {nombre}
          </li>
        ))}
      </ul>
    </div>
  );
}
