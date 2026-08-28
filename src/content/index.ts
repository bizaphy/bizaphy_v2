// registry de proyectos
import GlobalTimeReport from "./projects/global-time-report";
import HabitTracker from "./projects/habit-tracker";
import MarketDashboard from "./projects/market-dashboard";
import TranslationChecker from "./projects/translation-checker";
import TicTacToe from "./projects/tic-tac-toe";
import WeatherDashboard from "./projects/weather-dashboard";

export const projectsMap = {
  "global-time-report": GlobalTimeReport,
  "habit-tracker": HabitTracker,
  "market-dashboard": MarketDashboard,
  "translation-checker": TranslationChecker,
  "tic-tac-toe": TicTacToe,
  "weather-dashboard": WeatherDashboard,
};

export type ProjectSlug = keyof typeof projectsMap;

// Las claves del objeto deben coincidir exactamente con los `slug` de `projects.ts`
