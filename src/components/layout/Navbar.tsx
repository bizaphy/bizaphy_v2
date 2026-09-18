import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="neon-nav flex items-center border-b border-fuchsia-500 px-6 py-4">
      <Link
        href="/"
        className="neon-link flex items-center gap-2 font-bold tracking-widest"
      >
        <span className="neon-led inline-block h-2 w-2 rounded-full bg-fuchsia-500" />
        bizaphy
      </Link>
      <div className="ml-auto flex gap-5">
        <Link href="/about-me" className="neon-link">
          <span className="text-fuchsia-500">&gt;</span>
          About me
        </Link>

        <Link href="/blog" className="neon-link">
          <span className="text-fuchsia-500">&gt;</span>
          Blog
        </Link>

        <Link href="/projects" className="neon-link">
          <span className="text-fuchsia-500">&gt;</span>
          Projects
        </Link>

        {/* Placeholder de cuenta al estilo buddy icon de MSN.
            Sin ruta todavia; queda listo para conectar auth mas adelante. */}
        <button
          type="button"
          aria-label="Cuenta"
          title="Cuenta"
          className="relative flex items-center text-fuchsia-300 transition hover:text-fuchsia-100 hover:drop-shadow-[0_0_6px_rgba(217,70,239,0.75)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7z" />
          </svg>
          {/* Estado tipo MSN: gris = offline mientras no haya sesion. */}
          <span
            aria-hidden
            className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border border-zinc-900 bg-zinc-500"
          />
        </button>
      </div>
    </nav>
  );
}
