export type Project = {
  slug: string;
  title: string;
  description: string;
};

export const projects: Project[] = [
  {
    slug: "habit-tracker",
    title: "Sistema de habitos",
    description: "Webapp para practicar sistema de habitos, con puntajes.",
  },
  {
    slug: "market-dashboard",
    title: "Stock y cryptos",
    description:
      "Dashboard de mercados financieros: BTC, S&P 500 y NASDAQ en tiempo real.",
  },
  {
    slug: "tic-tac-toe",
    title: "Tic Tac Toe",
    description: "Juego clasico de Tic Tac Toe.",
  },

  {
    slug: "translation-checker",
    title: "Translation-checker",
    description: "Webapp para practicar trad. ES/EN a JP con valid. exacta.",
  },
  {
    slug: "weather-dashboard",
    title: "Clima mundial",
    description: "Reloj mundial en tiempo real con algunas ciudades del mundo.",
  },
];
