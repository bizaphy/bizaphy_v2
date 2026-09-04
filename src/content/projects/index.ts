import type { ComponentType } from "react";

import GlobalTimeReport, {
  meta as globalTimeReportMeta,
} from "./global-time-report";
import HabitTracker, { meta as habitTrackerMeta } from "./habit-tracker";
import MarketDashboard, {
  meta as marketDashboardMeta,
} from "./market-dashboard";
import TicTacToe, { meta as ticTacToeMeta } from "./tic-tac-toe";
import TranslationChecker, {
  meta as translationCheckerMeta,
} from "./translation-checker";
import WeatherDashboard, {
  meta as weatherDashboardMeta,
} from "./weather-dashboard";
import Hangman, { meta as hangmanMeta } from "./hangman";

type ProjectEntry = {
  slug: string;
  title: string;
  description: string;
  image?: string;
  Component: ComponentType;
};

export const projectsRegistry: ProjectEntry[] = [
  { ...habitTrackerMeta, Component: HabitTracker },
  { ...marketDashboardMeta, Component: MarketDashboard },
  { ...ticTacToeMeta, Component: TicTacToe },
  { ...translationCheckerMeta, Component: TranslationChecker },
  { ...weatherDashboardMeta, Component: WeatherDashboard },
  { ...globalTimeReportMeta, Component: GlobalTimeReport },
  { ...hangmanMeta, Component: Hangman },
];

export type ProjectSlug = ProjectEntry["slug"];
