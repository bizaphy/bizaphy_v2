import { requireAdminPage } from "@/server/auth/guards";
import Link from "next/link";
import type { ReactNode } from "react";

// ─── Estilos compartidos ───
// Mitad de arriba: icono y titulo pegados al centro. Mitad de abajo: el
// texto desde el centro. Asi todos los titulos quedan a la misma altura
// aunque las descripciones tengan distinto largo.
const estiloTarjeta =
  "group grid aspect-square grid-rows-2 gap-2 border border-zinc-800 bg-zinc-900 p-5 transition hover:border-fuchsia-500";

// ─── Iconos (trazo, 24x24) ───
function Icono({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-9"
    >
      {children}
    </svg>
  );
}

const ampolleta = (
  <Icono>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </Icono>
);

const lapiz = (
  <Icono>
    <path d="M21.17 6.81a1 1 0 0 0-3.98-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z" />
    <path d="m15 5 4 4" />
  </Icono>
);

const libro = (
  <Icono>
    <path d="M12 7v14" />
    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
  </Icono>
);

const notaMusical = (
  <Icono>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </Icono>
);

const lentes = (
  <Icono>
    <circle cx="6" cy="15" r="4" />
    <circle cx="18" cy="15" r="4" />
    <path d="M14 15a2 2 0 0 0-4 0" />
    <path d="M2.5 13 5 7c.7-1.3 1.4-2 3-2" />
    <path d="M21.5 13 19 7c-.7-1.3-1.5-2-3-2" />
  </Icono>
);

// ─── Accesos a cada seccion ───
const SECCIONES: {
  href: string;
  titulo: string;
  texto: string;
  iconos: ReactNode[];
}[] = [
  {
    href: "/admin/planes",
    titulo: "Planes futuros",
    texto: "Ideas y tareas pendientes",
    iconos: [ampolleta],
  },
  {
    href: "/admin/blog",
    titulo: "Blog",
    texto: "Crear y editar posts",
    iconos: [lapiz],
  },
  {
    href: "/admin/reading",
    titulo: "Reading",
    texto: "Formatear, traducir y exportar textos",
    iconos: [libro],
  },
  {
    href: "/admin/karaoke",
    titulo: "Karaoke",
    texto: "Letras con video, tiempos y traducción",
    iconos: [notaMusical],
  },
  {
    href: "/admin/reading-vocab",
    titulo: "Reading-vocab test",
    texto: "Repasar las palabras comodín con su frase",
    iconos: [libro, lentes],
  },
];

export default async function AdminPage() {
  const session = await requireAdminPage();

  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-4 py-10">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Hola, {session.user.name}</h1>
        <p className="text-zinc-400">Panel de administración.</p>
      </div>

      <nav className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {SECCIONES.map((seccion) => (
          <Link key={seccion.href} href={seccion.href} className={estiloTarjeta}>
            <span className="flex flex-col items-center justify-end gap-3">
              <span className="flex gap-2 text-violet-300 transition group-hover:text-fuchsia-300">
                {seccion.iconos.map((icono, indice) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: lista fija
                  <span key={indice}>{icono}</span>
                ))}
              </span>
              <span className="text-center font-semibold">{seccion.titulo}</span>
            </span>
            <span className="text-center text-sm text-zinc-400">
              {seccion.texto}
            </span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
