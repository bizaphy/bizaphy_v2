//linea del "output" tipo key: value
type Line = { key: string; value: string };
//seccion agrupa un titulo con varias lineas
type Section = { title: string; lines: Line[] };

//lo que se muestra. Editar aca cuando cambie hardware o apps.
const SECTIONS: Section[] = [
  {
    title: "Hardware",
    lines: [
      { key: "cpu", value: "AMD Ryzen 7 7800X3D" },
      { key: "gpu", value: "NVIDIA RTX 4070Ti Super" },
      { key: "ram", value: "32 GB DDR5 6000MT/s" },
      { key: "os", value: "Windows 11 Pro" },
      { key: "laptop", value: "Macbook M4 Pro" },
    ],
  },
  {
    title: "Editor & Shell",
    lines: [
      { key: "editor", value: "VS Code" },
      { key: "shell", value: "PowerShell 7" },
      { key: "fonts", value: "Oxanium / JetBrains Mono" },
      { key: "theme", value: "Custom dark neon" },
    ],
  },
  {
    title: "Apps",
    lines: [
      { key: "browser", value: "Brave/Firefox" },
      { key: "drawing-app", value: "Clip Manga Studio" },
      { key: "design", value: "Affinity Suite" },
      { key: "music", value: "Tidal" },
    ],
  },
];

export default function Setup() {
  return (
    <div className="rounded-xl border border-fuchsia-500/50 bg-zinc-950/60 p-5">
      {/* header estilo terminal: $ cat ~/.setup + contador de entries a la derecha */}
      <div className="mb-4 flex items-baseline gap-2 font-mono text-xs">
        <span className="text-fuchsia-400">$</span>
        <span className="uppercase tracking-[0.3em] text-fuchsia-400">
          cat ~/.setup
        </span>
        {/* suma total de lineas de todas las secciones */}
        <span className="ml-auto text-[10px] text-zinc-600">
          {SECTIONS.reduce((sum, s) => sum + s.lines.length, 0)} entries
        </span>
      </div>
      {/* grid de 3 columnas en desktop, apilado en mobile */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-2">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              [ {section.title} ]
            </h3>
            {/* lista de key: value en monospace */}
            <ul className="flex flex-col gap-1 font-mono text-xs">
              {section.lines.map((line) => (
                <li key={line.key} className="flex gap-2">
                  {/* min-w para que las keys queden alineadas entre si */}
                  <span className="min-w-[54px] text-zinc-600">
                    {line.key}:
                  </span>
                  <span className="text-zinc-300">{line.value}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
