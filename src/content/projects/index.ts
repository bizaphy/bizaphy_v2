import type { ComponentType } from "react";

import AllAboutKanjis, { meta as AllAboutKanjisMeta } from "./all-about-kanjis";
import HabitTracker, { meta as habitTrackerMeta } from "./habit-tracker";
import Apothecary, { meta as apothecaryMeta } from "./apothecary";
import TicTacToe, { meta as ticTacToeMeta } from "./tic-tac-toe";
import TranslationChecker, {
  meta as translationCheckerMeta,
} from "./translation-checker";
import WeatherDashboard, {
  meta as weatherDashboardMeta,
} from "./weather-dashboard";
import Hangman, { meta as hangmanMeta } from "./hangman";
import Pokedex, { meta as pokedexMeta } from "./pokedex";

type ProjectEntry = {
  slug: string;
  title: string;
  description: string;
  image?: string;
  Component: ComponentType;
};

export const projectsRegistry: ProjectEntry[] = [
  { ...habitTrackerMeta, Component: HabitTracker },
  { ...apothecaryMeta, Component: Apothecary },
  { ...ticTacToeMeta, Component: TicTacToe },
  { ...translationCheckerMeta, Component: TranslationChecker },
  { ...weatherDashboardMeta, Component: WeatherDashboard },
  { ...AllAboutKanjisMeta, Component: AllAboutKanjis },
  { ...hangmanMeta, Component: Hangman },
  { ...pokedexMeta, Component: Pokedex },
];

export type ProjectSlug = ProjectEntry["slug"];
