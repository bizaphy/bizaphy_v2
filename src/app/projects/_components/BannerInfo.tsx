import { projectsMeta } from "@/content/projects";

// Leyenda de los tipos de tarjeta. Los colores replican los de ProjectCard.
const TIPOS = [
  {
    nombre: "Destacado",
    detalle: "Proyectos principales, con la paleta de All About Kanjis.",
    muestra:
      "border-white/70 bg-pink-300/20 shadow-[0_0_12px_rgba(255,255,255,0.35)]",
    texto: "text-pink-200",
  },
  {
    nombre: "Normal",
    detalle: "Proyectos de práctica dentro del sitio.",
    muestra: "border-violet-300/60 bg-violet-400/20",
    texto: "text-violet-200",
  },
  {
    nombre: "Externo",
    detalle: "Redirigen a otros repositorios.",
    muestra:
      "border-cyan-300 bg-cyan-400/30 shadow-[0_0_12px_rgba(34,211,238,0.6)]",
    texto: "text-cyan-300",
  },
];

export default function BannerInfo() {
  return (
    // Sin caja ni esquinas redondeadas: solo una franja lateral, para que se
    // lea como leyenda y no como otra tarjeta de la grilla.
    <div className="border-l-2 border-fuchsia-500/70 bg-fuchsia-500/10 py-3 pr-4 pl-5">
      {/* header: titulo + contador global */}
      <div className="mb-3 flex items-baseline gap-4 font-mono text-xs">
        <span className="tracking-[0.3em] text-fuchsia-400 uppercase">
          &gt; info
        </span>
        <span className="text-[10px] text-zinc-500">
          {"// "}
          {projectsMeta.length} proyectos desplegados
        </span>
      </div>

      {/* Tipos en fila, separados por una linea vertical, sin recuadros */}
      <ul className="flex flex-col gap-3 sm:flex-row sm:gap-0 sm:divide-x sm:divide-zinc-800">
        {TIPOS.map((t) => (
          <li
            key={t.nombre}
            className="flex items-start gap-3 sm:flex-1 sm:px-4 sm:first:pl-0"
          >
            <span
              className={`mt-1 h-3 w-3 shrink-0 rounded-sm border ${t.muestra}`}
            />
            <div className="flex flex-col gap-0.5">
              <span
                className={`font-mono text-xs tracking-widest uppercase ${t.texto}`}
              >
                {t.nombre}
              </span>
              <span className="text-xs text-zinc-400">{t.detalle}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
