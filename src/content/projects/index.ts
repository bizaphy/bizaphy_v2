import { meta as apothecaryMeta } from "./apothecary";
import { meta as weatherDashboardMeta } from "./weather-dashboard";
import { meta as AllAboutKanjisMeta } from "./all-about-kanjis";
import { meta as hangmanMeta } from "./hangman";
import { meta as pocketQfMeta } from "./pocket-qf";

export type ProjectMeta = {
  slug: string;
  title: string;
  description: string;
  image?: string;
  variant?: "default" | "destacado" | "externo";
  url?: string; //solo para "externo": link al repositorio
};

// Solo metadatos, se puede importar en Client Components.
// La resolucion de componentes vive en app/projects/[slug]/page.tsx
// para que el bundle del cliente nunca alcance codigo server-only.
export const projectsMeta = [
  apothecaryMeta,
  weatherDashboardMeta,
  AllAboutKanjisMeta,
  hangmanMeta,
  pocketQfMeta,
] as const satisfies readonly ProjectMeta[];

type AnyProject = (typeof projectsMeta)[number];

//los externos no tienen componente: su tarjeta abre el repositorio
export type ExternalProject = Extract<AnyProject, { variant: "externo" }>;
export type InternalProject = Exclude<AnyProject, ExternalProject>;
export type ProjectSlug = InternalProject["slug"];

export const internalProjects = projectsMeta.filter(
  (p): p is InternalProject => p.variant !== "externo",
);
