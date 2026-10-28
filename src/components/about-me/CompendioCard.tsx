import Link from "next/link";
import { CATEGORIAS, TOTAL_APPS } from "@/components/compendio/apps";

//Acceso a /compendio desde about-me: misma estetica de terminal que Setup
export default function CompendioCard() {
  return (
    <Link
      href="/compendio"
      className="group block rounded-xl border border-violet-300/40 bg-zinc-950/60 p-5 transition duration-300 hover:border-violet-300 hover:shadow-[0_0_24px_rgba(196,181,253,0.3)]"
    >
      <div className="mb-4 flex items-baseline gap-2 font-mono text-xs">
        <span className="text-fuchsia-400">$</span>
        <span className="tracking-[0.3em] text-fuchsia-400 uppercase">
          ls ~/compendio
        </span>
        <span className="ml-auto text-[10px] text-zinc-600">
          {TOTAL_APPS} apps
        </span>
      </div>

      <h2 className="text-lg font-bold tracking-wide text-white transition group-hover:text-violet-200">
        Compendio de apps
      </h2>
      <p className="mt-1 text-sm text-zinc-400">
        Los programas que uso a diario, para qué sirven y dónde conseguirlos.
      </p>

      {/* Vista previa de los grupos */}
      <ul className="mt-4 flex flex-wrap gap-2">
        {CATEGORIAS.map((c) => (
          <li
            key={c.id}
            className="rounded border border-zinc-800 px-2 py-1 font-mono text-[10px] tracking-widest text-zinc-500 uppercase"
          >
            {c.titulo}
          </li>
        ))}
      </ul>

      <span className="mt-4 inline-block font-mono text-xs tracking-widest text-fuchsia-500 transition group-hover:translate-x-1 group-hover:text-fuchsia-300">
        abrir compendio →
      </span>
    </Link>
  );
}
