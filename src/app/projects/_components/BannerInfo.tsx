import { projectsMeta } from "@/content/projects";

// Leyenda de los tipos de tarjeta. Los colores replican los de ProjectCard.
const TIPOS = [
  {
    nombre: "Destacado",
    detalle: "Proyectos principales, con la paleta de All About Kanjis.",
    muestra: "border-white/70 bg-pink-300/20 shadow-[0_0_12px_rgba(255,255,255,0.35)]",
    borde: "border-white/40",
    texto: "text-pink-200",
  },
  {
    nombre: "Normal",
    detalle: "Proyectos de práctica dentro del sitio.",
    muestra: "border-violet-300/60 bg-violet-400/20",
    borde: "border-violet-300/30",
    texto: "text-violet-200",
  },
  {
    nombre: "Externo",
    detalle: "Redirigen a otros repositorios.",
    muestra: "border-cyan-300 bg-cyan-400/30 shadow-[0_0_12px_rgba(34,211,238,0.6)]",
    borde: "border-cyan-400/50",
    texto: "text-cyan-300",
  },
];

export default function BannerInfo() {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-950/60 p-5">
      {/* header: titulo + contador global */}
      <div className="mb-3 flex items-baseline justify-between font-mono text-xs">
        <span className="tracking-[0.3em] text-fuchsia-400 uppercase">
          &gt; info
        </span>
        <span className="text-[10px] text-zinc-500">
          {projectsMeta.length} proyectos desplegados
        </span>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TIPOS.map((t) => (
          <li
            key={t.nombre}
            className={`flex items-center gap-3 rounded-lg border bg-black/40 p-3 ${t.borde}`}
          >
            <span
              className={`h-6 w-6 shrink-0 rounded border ${t.muestra}`}
            />
            <div className="flex flex-col gap-0.5">
              <span className={`font-mono text-sm ${t.texto}`}>{t.nombre}</span>
              <span className="text-xs text-zinc-400">{t.detalle}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
