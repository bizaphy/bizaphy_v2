import type { ComponentType } from "react";
import Image from "next/image";
import { projectsMeta, type ProjectSlug } from "@/content/projects";
import ProjectTitle from "@/components/ui/ProjectTitle";

// Mapa de loaders: cada componente se carga solo cuando se resuelve su slug.
// Se encuentra aca (server component) para no arrastrar codigo server-only al cliente.
const componentLoaders: Record<
  ProjectSlug,
  () => Promise<{ default: ComponentType }>
> = {
  "habit-tracker": () =>
    import("@/content/projects/habit-tracker/HabitTracker"),
  apothecary: () => import("@/content/projects/apothecary/Apothecary"),
  "tic-tac-toe": () => import("@/content/projects/tic-tac-toe/TicTacToe"),
  "translation-checker": () =>
    import("@/content/projects/translation-checker/TranslationChecker"),
  "weather-dashboard": () =>
    import("@/content/projects/weather-dashboard/WeatherDashboard"),
  "all-about-kanjis": () =>
    import("@/content/projects/all-about-kanjis/AllAboutKanjis"),
  hangman: () => import("@/content/projects/hangman/Hangman"),
  pokedex: () => import("@/content/projects/pokedex/Pokedex"),
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectSlugPage(props: PageProps) {
  const { slug } = await props.params;
  const entry = projectsMeta.find((p) => p.slug === slug);
  const loader = entry
    ? componentLoaders[entry.slug as ProjectSlug]
    : undefined;

  if (!entry || !loader) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <Image
          src="/images/misc/dorothy-crying-gif.gif"
          alt="Proyecto no encontrado"
          width={200}
          height={200}
          unoptimized
        />
        <h1 className="text-xl font-bold text-zinc-100">
          Proyecto no encontrado
        </h1>
        <p className="text-sm text-zinc-400">
          No existe un proyecto con el slug &quot;{slug}&quot;.
        </p>
      </div>
    );
  }

  const { default: Component } = await loader();

  // Titulo unico para todos los proyectos: los componentes no renderizan
  // su propio <h1>. La descripcion queda solo para la tarjeta del listado.
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <ProjectTitle title={entry.title} />
      <Component />
    </div>
  );
}
