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
      </div>
    </nav>
  );
}
