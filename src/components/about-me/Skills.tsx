//tres niveles posibles, se usa como discriminante para el estilo del chip
type Level = "solido" | "competente" | "aprendiendo";
type Skill = { name: string; level: Level };
type Group = { title: string; items: Skill[] };

//grupos ordenados. Se edita a mano cuando se agrega/quita un skill.
const GROUPS: Group[] = [
  {
    title: "Lenguajes",
    items: [
      { name: "TypeScript", level: "solido" },
      { name: "JavaScript", level: "solido" },
      { name: "HTML/CSS", level: "solido" },
      { name: "SQL", level: "competente" },
      { name: "Python", level: "competente" },
    ],
  },
  {
    title: "Frameworks",
    items: [
      { name: "React", level: "solido" },
      { name: "Tailwind", level: "solido" },
      { name: "Next.js", level: "competente" },
      { name: "Node.js", level: "competente" },
      { name: "FastAPI", level: "competente" },
    ],
  },
  {
    title: "Herramientas",
    items: [
      { name: "VS Code", level: "solido" },
      { name: "Git", level: "competente" },
      { name: "Playwright", level: "aprendiendo" },
    ],
  },
];

//estilo del chip segun nivel: solido con fondo + glow, competente outlined, aprendiendo punteado zinc
const CHIP_STYLES: Record<Level, string> = {
  solido:
    "border-fuchsia-500 bg-fuchsia-500/15 text-fuchsia-200 shadow-[0_0_10px_rgba(217,70,239,0.35)]",
  competente: "border-fuchsia-500/60 text-fuchsia-400",
  aprendiendo: "border-dashed border-zinc-600 text-zinc-500",
};

//iconos para el chip y la leyenda del header
const LEVEL_ICON: Record<Level, string> = {
  solido: "●",
  competente: "◐",
  aprendiendo: "○",
};

//labels en español para la leyenda del header (los keys tipo se mantienen en ingles simple)
const LEVEL_LABEL: Record<Level, string> = {
  solido: "sólido",
  competente: "competente",
  aprendiendo: "aprendiendo",
};

export default function Skills() {
  return (
    <div className="rounded-xl border border-fuchsia-500/50 bg-zinc-950/60 p-5">
      {/* header: titulo + leyenda de los 3 niveles */}
      <div className="mb-4 flex items-baseline justify-between font-mono text-xs">
        <span className="uppercase tracking-[0.3em] text-fuchsia-400">
          &gt; stack
        </span>
        {/* leyenda: pequeñitos icono + label por cada nivel */}
        <div className="flex gap-3 text-[10px] text-zinc-500">
          {(Object.keys(LEVEL_LABEL) as Level[]).map((lvl) => (
            <span key={lvl} className="flex items-center gap-1">
              <span
                className={
                  lvl === "solido"
                    ? "text-fuchsia-300"
                    : lvl === "competente"
                      ? "text-fuchsia-500"
                      : "text-zinc-600"
                }
              >
                {LEVEL_ICON[lvl]}
              </span>
              {LEVEL_LABEL[lvl]}
            </span>
          ))}
        </div>
      </div>

      {/* grupos apilados; cada grupo tiene su titulo y sus chips */}
      <div className="flex flex-col gap-5">
        {GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-2">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              [ {group.title} ]
            </h3>
            {/* flex-wrap para que se acomoden segun el ancho disponible */}
            <ul className="flex flex-wrap gap-2">
              {group.items.map((skill) => (
                <li
                  key={skill.name}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs transition ${CHIP_STYLES[skill.level]}`}
                >
                  <span aria-hidden="true">{LEVEL_ICON[skill.level]}</span>
                  {skill.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
