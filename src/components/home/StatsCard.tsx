import Link from "next/link";
import { Share_Tech_Mono } from "next/font/google";
import { projectsRegistry } from "@/content/projects";

//tipografia estilo readout digital — se carga solo para este componente
const clockFont = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
});

export default function StatsCard({ className = "" }: { className?: string }) {
  const count = projectsRegistry.length;
  //dos digitos minimo. Si algun dia hay >99 se puede subir a 3.
  const digits = String(count).padStart(2, "0");
  //ghost: mismo largo que los digitos, todo 8s para simular segmentos apagados
  const ghost = "8".repeat(digits.length);

  return (
    <Link
      href="/projects"
      className={`group block rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-4 transition duration-300 hover:border-fuchsia-500 hover:shadow-[0_0_20px_rgba(217,70,239,0.35)] ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-zinc-400 transition group-hover:text-fuchsia-300 group-hover:drop-shadow-[0_0_6px_rgba(217,70,239,0.6)]">
          Proyectos
        </span>
        {/* pantalla estilo LCD: fondo negro, borde y glow fuchsia por dentro */}
        <div className="relative overflow-hidden rounded-md border border-fuchsia-500/40 bg-black px-3 py-1 shadow-[inset_0_0_10px_rgba(217,70,239,0.25)] transition group-hover:border-fuchsia-400 group-hover:shadow-[inset_0_0_14px_rgba(217,70,239,0.45)]">
          {/* ghost "88": segmentos apagados de fondo, truco clasico de displays 7-segmentos */}
          <span
            aria-hidden="true"
            className={`${clockFont.className} absolute inset-0 flex items-center justify-center text-lg tracking-[0.15em] text-fuchsia-500/15`}
          >
            {ghost}
          </span>
          {/* digitos reales, con glow para simular el LED encendido */}
          <span
            className={`${clockFont.className} relative text-lg tracking-[0.15em] text-fuchsia-300 drop-shadow-[0_0_6px_rgba(217,70,239,0.9)]`}
          >
            {digits}
          </span>
          {/* scanlines sutiles encima para amarrar la estetica CRT */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.18)_1px,transparent_1px)] bg-[length:100%_2px] mix-blend-overlay"
          />
        </div>
      </div>
    </Link>
  );
}
