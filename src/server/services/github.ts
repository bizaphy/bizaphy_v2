import "server-only";

// Lectura de commits del repo desde la API de GitHub (para ActivityHeatmap).
const REPO = "bizaphy/bizaphy_v2";

export type Commit = {
  html_url: string;
  commit: { message: string; author: { date: string } };
};

// Commits desde `desde` ("YYYY-MM-DD"), más recientes primero.
// null si GitHub no responde en la primera página.
export async function obtenerCommits(desde: string): Promise<Commit[] | null> {
  const headers: HeadersInit = { Accept: "application/vnd.github+json" };
  // Opcional: con token sube el limite de la API y sirve si el repo es privado.
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const commits: Commit[] = [];
  // Maximo 100 por pagina; el tope de 10 paginas es solo un seguro.
  for (let pagina = 1; pagina <= 10; pagina++) {
    // `desde` es una fecha sin hora, asi la URL (y su cache) es la misma
    // durante todo el dia.
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/commits?since=${desde}T00:00:00Z&per_page=100&page=${pagina}`,
      { headers, next: { revalidate: 3600 } },
    );
    if (!res.ok) return pagina === 1 ? null : commits;
    const lote = (await res.json()) as Commit[];
    commits.push(...lote);
    if (lote.length < 100) break;
  }
  return commits;
}
