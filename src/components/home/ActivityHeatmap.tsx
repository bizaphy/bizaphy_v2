// Mapa de actividad estilo GitHub: commits por dia del ultimo ano, sacados
// de la API de GitHub. Reemplaza al changelog escrito a mano.

const REPO = "bizaphy/bizaphy_v2";
const SEMANAS = 52;
// Las fechas de GitHub vienen en UTC; se agrupan por dia en hora de Chile
// para que un commit de las 22:00 no caiga en el dia siguiente.
const ZONA = "America/Santiago";
const DIA_MS = 24 * 60 * 60 * 1000;

type Commit = {
  html_url: string;
  commit: { message: string; author: { date: string } };
};

// "YYYY-MM-DD" del instante dado, en hora de Chile (en-CA da ese formato).
const claveDia = (fecha: Date) =>
  fecha.toLocaleDateString("en-CA", { timeZone: ZONA });

// Las cuentas de calendario se hacen en UTC sobre la clave, asi el huso
// horario del servidor no mueve los dias.
const desdeClave = (clave: string) => new Date(`${clave}T00:00:00Z`);
const sumarDias = (fecha: Date, n: number) =>
  new Date(fecha.getTime() + n * DIA_MS);

async function getCommits(desde: string): Promise<Commit[] | null> {
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

// Intensidad del fucsia segun cantidad de commits del dia.
const colorCelda = (n: number) => {
  if (n === 0) return "bg-zinc-800/70";
  if (n === 1) return "bg-fuchsia-900";
  if (n <= 3) return "bg-fuchsia-700";
  if (n <= 6) return "bg-fuchsia-500";
  return "bg-fuchsia-300 shadow-[0_0_6px_rgba(217,70,239,0.8)]";
};

const LEYENDA = [0, 1, 2, 4, 7];
const DIAS_SEMANA = ["lun", "", "mié", "", "vie", "", ""];

export default async function ActivityHeatmap() {
  const hoy = desdeClave(claveDia(new Date()));
  // Lunes = 0. La grilla parte el lunes de hace 51 semanas y termina hoy.
  const diaSemanaHoy = (hoy.getUTCDay() + 6) % 7;
  const inicio = sumarDias(hoy, -diaSemanaHoy - (SEMANAS - 1) * 7);
  const inicioClave = inicio.toISOString().slice(0, 10);

  const commits = await getCommits(inicioClave);

  const porDia = new Map<string, number>();
  for (const c of commits ?? []) {
    const clave = claveDia(new Date(c.commit.author.date));
    porDia.set(clave, (porDia.get(clave) ?? 0) + 1);
  }
  const total = commits?.length ?? 0;
  const ultimo = commits?.[0];

  const semanas = Array.from({ length: SEMANAS }, (_, s) =>
    Array.from({ length: 7 }, (_, d) => {
      const fecha = sumarDias(inicio, s * 7 + d);
      const clave = fecha.toISOString().slice(0, 10);
      return { clave, futuro: fecha > hoy, n: porDia.get(clave) ?? 0 };
    }),
  );

  // Etiqueta de mes solo en la semana donde cambia el mes.
  const mesDe = (clave: string) =>
    desdeClave(clave)
      .toLocaleDateString("es-CL", { month: "short", timeZone: "UTC" })
      .replace(".", "");
  const meses = semanas.map((semana, s) =>
    s === 0 || semana[0].clave.slice(5, 7) !== semanas[s - 1][0].clave.slice(5, 7)
      ? mesDe(semana[0].clave)
      : "",
  );

  // Cuantas semanas caben (cada una ocupa 16px): movil, las ultimas 16; desde
  // sm, 26; desde lg, el año completo. Con mas, generaba scroll horizontal.
  const ocultaEnMovil = (s: number) =>
    s < SEMANAS - 26 ? "hidden lg:flex" : s < SEMANAS - 16 ? "hidden sm:flex" : "flex";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-fuchsia-500/50 bg-zinc-950/60 px-6 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
          Actividad
        </h2>
        {commits && (
          <span className="font-mono text-xs text-zinc-500">
            <span className="text-fuchsia-300">{total}</span> commits en el
            último año
          </span>
        )}
      </div>

      {commits ? (
        <>
          <div
            role="img"
            aria-label={`${total} commits en el último año`}
            className="flex justify-center gap-1"
          >
            {/* Nombres de los dias, alineados con las filas */}
            <div className="flex flex-col gap-1 pt-4 pr-1">
              {DIAS_SEMANA.map((d, i) => (
                <span
                  key={i}
                  className="h-3 font-mono text-[9px] leading-3 text-zinc-600"
                >
                  {d}
                </span>
              ))}
            </div>
            {semanas.map((semana, s) => (
              <div key={s} className={`${ocultaEnMovil(s)} flex-col gap-1`}>
                <span className="h-3 w-3 overflow-visible font-mono text-[9px] leading-3 whitespace-nowrap text-zinc-600">
                  {meses[s]}
                </span>
                {semana.map((dia) => (
                  <span
                    key={dia.clave}
                    title={
                      dia.futuro
                        ? undefined
                        : `${dia.n} commit${dia.n === 1 ? "" : "s"} · ${dia.clave}`
                    }
                    className={`h-3 w-3 rounded-[3px] ${
                      dia.futuro ? "invisible" : colorCelda(dia.n)
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-zinc-500">
            {ultimo ? (
              <a
                href={ultimo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 truncate transition hover:text-fuchsia-300"
              >
                <span className="text-zinc-600">último › </span>
                {ultimo.commit.message.split("\n")[0]}
              </a>
            ) : (
              <span />
            )}
            <span className="flex shrink-0 items-center gap-1">
              menos
              {LEYENDA.map((n) => (
                <span key={n} className={`h-3 w-3 rounded-[3px] ${colorCelda(n)}`} />
              ))}
              más
            </span>
          </div>
        </>
      ) : (
        <p className="font-mono text-sm text-zinc-500">
          No se pudo cargar la actividad desde GitHub.
        </p>
      )}
    </div>
  );
}
