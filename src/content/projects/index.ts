// registry de proyectos
import GlobalTimeReport from "./global-time-report";
import HabitTracker from "./habit-tracker";
import MarketDashboard from "./market-dashboard";
import TranslationChecker from "./translation-checker";
import TicTacToe from "./tic-tac-toe";
import WeatherDashboard from "./weather-dashboard";

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
