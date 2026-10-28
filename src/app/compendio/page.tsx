import type { Metadata } from "next";
import Link from "next/link";
import TextScramble from "@/components/effects/TextScramble";
import CompendioApps from "@/components/compendio/CompendioApps";
import { TOTAL_APPS } from "@/components/compendio/apps";

//Lista de programas que uso, agrupados por tipo. Se llega desde /about-me.

export const metadata: Metadata = {
  title: "Compendio de apps",
};

export default function CompendioPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* Encabezado tipo consola, igual que el blog */}
      <header className="mb-10 space-y-2">
        <Link
          href="/about-me"
          className="font-mono text-xs tracking-widest text-zinc-500 transition hover:text-violet-300"
        >
          ← about-me
        </Link>
        <h1 className="text-3xl font-bold">
          <TextScramble text="Compendio de apps" />
        </h1>
        <p className="font-mono text-sm text-zinc-400">
          <span className="text-fuchsia-500">~/compendio</span> $ ls{" "}
          <span className="text-zinc-600">({TOTAL_APPS} apps)</span>
          <span className="cursor-consola text-violet-300">_</span>
        </p>
      </header>

      <CompendioApps />
    </main>
  );
}
