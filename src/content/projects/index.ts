import { meta as apothecaryMeta } from "./apothecary";
import { meta as weatherDashboardMeta } from "./weather-dashboard";
import { meta as AllAboutKanjisMeta } from "./all-about-kanjis";
import { meta as hangmanMeta } from "./hangman";

export type ProjectMeta = {
  slug: string;
  title: string;
  description: string;
  image?: string;
  variant?: "default" | "destacado";
};

// Solo metadatos, se puede importar en Client Components.
// La resolucion de componentes vive en app/projects/[slug]/page.tsx
// para que el bundle del cliente nunca alcance codigo server-only.
export const projectsMeta = [
  apothecaryMeta,
  weatherDashboardMeta,
  AllAboutKanjisMeta,
  hangmanMeta,
] as const satisfies readonly ProjectMeta[];

export type ProjectSlug = (typeof projectsMeta)[number]["slug"];
