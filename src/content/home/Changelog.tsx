type Entry = {
  date: string;
  description: string;
};

const entries: Entry[] = [
  { date: "2026-09-09", description: "Corrección: prop sizes en imagen de perfil" },
  { date: "2026-09-07", description: "Pokedex: se agrega al registro de proyectos" },
  { date: "2026-09-07", description: "Hangman: refactorización a lógica real" },
  { date: "2026-09-06", description: "Nuevo proyecto: Pokedex" },
  { date: "2026-09-05", description: "Ajuste visual: tonos grises en About me" },
  { date: "2026-09-04", description: "Script de capturas automáticas de proyectos" },
  { date: "2026-09-03", description: "Nuevo proyecto: Hangman" },
  { date: "2026-09-01", description: "Ajustes en patrón de registro unificado" },
  { date: "2026-08-28", description: "Primer commit — bizaphy v2" },
];

export default function Changelog() {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-4 flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Changelog
      </h2>
      <ul className="flex flex-col gap-2">
        {entries.map((entry) => (
          <li key={entry.date + entry.description} className="flex gap-4 text-sm">
            <span className="shrink-0 font-mono text-zinc-500">{entry.date}</span>
            <span className="text-zinc-300">{entry.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
