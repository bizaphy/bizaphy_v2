# Fase 3 — El patrón Registry: sección Projects

En esta fase se introduce **el concepto arquitectónico más importante del proyecto**: el patrón Registry. Se construye la sección **Projects** de punta a punta —metadata, componentes, component map, layout, container/presentational, página lista y página dinámica— y se resuelve la ruta `/projects` que quedaba en 404 desde la [Fase 2](./02-transiciones-efectos.md). Además, como algunos proyectos consumen APIs externas, se introducen la máquina de estados `loading | error | data` y el **Route Handler** como proxy server-side para APIs con CORS restrictivo.

Este patrón se reutilizará en el dashboard de widgets (Fase 5), así que dedicar una fase entera a hacerlo bien vale el esfuerzo.

---

## Objetivo de la fase

Al terminar esta fase:

- Existe la ruta `/projects` con una lista de cards, una por cada proyecto definido en la metadata.
- Existe la ruta dinámica `/projects/[slug]` que renderiza el componente React correspondiente al slug.
- El layout usa `max-w-4xl` (896px) para proyectos con datos densos.
- Hay al menos 3 proyectos implementados: uno con datos estáticos (por ejemplo `tic-tac-toe`), uno que consume una API externa directa (`clima` contra Open-Meteo) y uno que usa un **Route Handler** (`mercados` contra Yahoo Finance a través de `/api/market`).
- El sistema es **mecánico**: añadir un proyecto nuevo es siempre los mismos 3 pasos (componente, metadata, entry en el map).
- La ruta `/projects/[slug]` aplica el template `page-glitch` en lugar de `page-scan` para distinguirse visualmente.
- El Route Handler `GET /api/market` cachea 60 segundos y devuelve BTC, S&P 500 y NASDAQ.

Lo que **no** vamos a tener todavía:

- No hay blog (`/blog` sigue en 404).
- No hay widgets en el home.
- Los proyectos con API no tienen skeleton avanzado ni retry con backoff — sólo estados `loading | error | data` mínimos.

---

## Estructura de carpetas al final de la fase

Aparecen `src/lib/projects.ts`, la carpeta `src/content/projects/`, `src/app/projects/` y `src/app/api/market/`.

```
src/
├── app/
│   ├── api/
│   │   └── market/
│   │       └── route.ts          ← nuevo (Route Handler)
│   ├── projects/                 ← nuevo
│   │   ├── components/
│   │   │   ├── ProjectList.tsx   ← Container: obtiene datos
│   │   │   └── ProjectCard.tsx   ← Presentational: recibe props
│   │   ├── [slug]/
│   │   │   ├── page.tsx          ← página dinámica
│   │   │   └── template.tsx      ← aplica page-glitch
│   │   ├── layout.tsx            ← ancho max-w-4xl
│   │   └── page.tsx              ← página lista
│   ├── components/               ← sin cambios
│   ├── layout.tsx                ← sin cambios
│   ├── template.tsx              ← sin cambios (page-scan global)
│   ├── page.tsx                  ← sin cambios
│   └── globals.css               ← sin cambios
├── lib/
│   └── projects.ts               ← metadata (types + array)
└── content/
    └── projects/                 ← implementaciones
        ├── tic-tac-toe/
        │   ├── TicTacToe.tsx
        │   └── index.ts
        ├── clima/
        │   ├── WeatherDashboard.tsx
        │   └── index.ts
        ├── mercados/
        │   ├── MarketDashboard.tsx
        │   └── index.ts
        └── index.ts              ← component map (slug → componente)
```

Las carpetas `blog/` y `content/widgets/` siguen sin contenido.

---

## El problema que resuelve el patrón Registry

Sin el patrón, la página lista y la página dinámica tendrían imports hardcodeados y cadenas de `if/else`:

```tsx
// MAL: no usa Registry
import TicTacToe from "@/content/projects/tic-tac-toe";
import WeatherDashboard from "@/content/projects/clima";
import MarketDashboard from "@/content/projects/mercados";

export default function ProjectsPage() {
  return (
    <div>
      <ProjectCard title="Tic Tac Toe" slug="tic-tac-toe" />
      <ProjectCard title="Clima" slug="clima" />
      <ProjectCard title="Mercados" slug="mercados" />
    </div>
  );
}

// Y en [slug]/page.tsx:
if (slug === "tic-tac-toe") return <TicTacToe />;
if (slug === "clima") return <WeatherDashboard />;
if (slug === "mercados") return <MarketDashboard />;
```

Cada proyecto nuevo obligaría a modificar **tres archivos** y añadir código en varios lugares. Es propenso a errores y no escala.

**La solución:** separar la información sobre qué proyectos existen (metadata) de los componentes que los implementan (map), y unirlos con una única página dinámica que funciona para cualquier slug.

---

## La solución: metadata + component map

### Parte 1 — Metadata (`src/lib/projects.ts`)

```ts
export type Project = {
  slug: string;
  title: string;
  description: string;
};

export const projects: Project[] = [
  { slug: "tic-tac-toe", title: "Tic Tac Toe", description: "Juego clásico con estilo Neon." },
  { slug: "clima", title: "Clima", description: "Dashboard de clima en tiempo real para Sapporo, Reikiavik y Santiago." },
  { slug: "mercados", title: "Mercados", description: "Dashboard de mercados financieros: BTC, S&P 500 y NASDAQ en tiempo real." },
];
```

Un array de datos puros. Sin React, sin JSX, sin imports pesados.

**Regla fundamental:** este archivo **nunca** importa React ni componentes. Son datos que podrían venir de una API, una base de datos o un CMS. Al mantenerlos separados de React, cambiar la fuente de datos requiere tocar sólo este archivo.

### Parte 2 — Component map (`src/content/projects/index.ts`)

```ts
import TicTacToe from "./tic-tac-toe";
import WeatherDashboard from "./clima";
import MarketDashboard from "./mercados";

export const projectsMap = {
  "tic-tac-toe": TicTacToe,
  "clima": WeatherDashboard,
  "mercados": MarketDashboard,
};

export type ProjectSlug = keyof typeof projectsMap;
```

Un objeto que conecta cada slug con su componente React.

---

## Análisis: `keyof typeof projectsMap`

```ts
export type ProjectSlug = keyof typeof projectsMap;
```

Este tipo se calcula automáticamente:

- **`typeof projectsMap`** — TypeScript infiere el tipo del objeto: `{ "tic-tac-toe": ..., "clima": ..., "mercados": ... }`.
- **`keyof T`** — devuelve la unión de las claves de `T`.
- **Resultado**: `ProjectSlug` es `"tic-tac-toe" | "clima" | "mercados"`.

Ventajas:

- Si mañana se añade `"hora-mundial"` al objeto, `ProjectSlug` se actualiza sola.
- Si alguien intenta acceder a `projectsMap["no-existe"]`, TypeScript rechaza el código en tiempo de edición.
- No hay que mantener un tipo `ProjectSlug` a mano en paralelo al objeto.

**Regla:** cuando una unión de literales de string refleja las claves de un objeto, siempre se define con `keyof typeof`.

---

## Por qué el slug es un string (y no un ID numérico)

El slug se usa directamente en la URL (`/projects/tic-tac-toe`). Un slug legible mejora el SEO y la experiencia del usuario, que puede entender la URL antes incluso de hacer click. Los IDs numéricos (`/projects/42`) son opacos y obligan a hacer un lookup mental cada vez.

---

## Los componentes: uno por carpeta

Cada proyecto vive en su propia carpeta con dos archivos:

```
content/projects/
├── tic-tac-toe/
│   ├── TicTacToe.tsx    ← el componente real
│   └── index.ts         ← re-export
```

**Por qué carpeta y no un archivo suelto.** Un proyecto puede crecer: puede necesitar subcomponentes, datos locales, hooks personalizados. Si empieza como un solo archivo y hay que dividirlo, todos los imports externos apuntando al archivo se rompen. Con una carpeta + `index.ts`, el import externo siempre es `from "./tic-tac-toe"` sin importar cuántos archivos internos tenga.

El `index.ts` es un simple re-export:

```ts
// src/content/projects/tic-tac-toe/index.ts
export { default } from "./TicTacToe";
```

---

## Client Component vs Server Component

Los proyectos cubren la dicotomía completa.

### `TicTacToe` — Client Component (juego con estado)

```tsx
// src/content/projects/tic-tac-toe/TicTacToe.tsx
"use client";

import { useState } from "react";

export default function TicTacToe() {
  const [board, setBoard] = useState<Array<"X" | "O" | null>>(Array(9).fill(null));
  /* ...lógica del juego... */
}
```

Necesita `"use client"` porque usa `useState` y `onClick`. Sin la directiva, Next.js intentaría ejecutarlo como Server Component y fallaría en build.

### Proyecto estático — Server Component

Un proyecto que sólo muestra datos calculados en el servidor (sin interacción) puede ser Server Component. No hay `"use client"` ni hooks. Se renderiza **en el servidor** durante el build o en cada request. El navegador recibe HTML puro, sin JavaScript.

**Diferencia práctica:**

| | Client Component | Server Component |
|---|---|---|
| Envía JS al navegador | Sí | No |
| Puede usar hooks | Sí | No |
| Puede usar `onClick` | Sí | No |
| Puede leer archivos, DB, secretos | No | Sí |
| Rendimiento inicial | Peor (más JS) | Mejor |

**Regla:** Server Component por defecto. `"use client"` sólo cuando el componente necesita hooks, eventos del navegador o APIs del cliente.

---

## Container / Presentational

Este es un patrón de diseño de React que separa la lógica de obtener datos de la lógica de mostrarlos.

### `ProjectCard` — Presentational

`src/app/projects/components/ProjectCard.tsx`:

```tsx
import Link from "next/link";
import TextScramble from "@/app/components/effects/TextScramble";

type ProjectCardProps = {
  slug: string;
  title: string;
  description: string;
};

export default function ProjectCard({ slug, title, description }: ProjectCardProps) {
  return (
    <article className="neon-card">
      <h2 className="neon-card-title text-lg font-semibold">
        <TextScramble text={title} />
      </h2>
      <p className="neon-card-text mt-2 text-sm text-zinc-600">{description}</p>
      <Link href={`/projects/${slug}`} className="neon-link">Ir al proyecto</Link>
    </article>
  );
}
```

**No sabe de dónde vienen los datos.** Recibe props y renderiza. Nada más.

### `ProjectList` — Container

`src/app/projects/components/ProjectList.tsx`:

```tsx
import { projects } from "@/lib/projects";
import ProjectCard from "./ProjectCard";

export default function ProjectList() {
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.slug}
          slug={project.slug}
          title={project.title}
          description={project.description}
        />
      ))}
    </div>
  );
}
```

**Sabe de dónde vienen los datos** (los importa desde `@/lib/projects`) y los pasa a las cards.

---

## Análisis: por qué separar Container y Presentational

Si un mismo componente hiciera las dos cosas:

- Cambiar el diseño de la card obligaría a entender también la lógica de datos.
- Cambiar de dónde vienen los datos (array → API) obligaría a modificar el componente que también sabe de estilos.
- Reutilizar la card en otro contexto (por ejemplo, en un buscador que trae los datos de otro lado) sería imposible sin desmontarlo todo.

Al separar:

- `ProjectCard` se puede reutilizar en cualquier contexto que le pase las mismas 3 props.
- `ProjectList` se puede cambiar internamente (por ejemplo, para filtrar, ordenar, o fetchear de una API) sin tocar el diseño de la card.
- Los tests son más simples: `ProjectCard` se testea con props fijas, sin mocks.

**Regla:** cualquier lista de datos = Container que trae + Presentational que muestra.

---

## Layout de la sección

`src/app/projects/layout.tsx`:

```tsx
import { ReactNode } from "react";

type ProjectsLayoutProps = { children: ReactNode };

export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
  return <main className="mx-auto max-w-4xl px-6 py-16">{children}</main>;
}
```

**Por qué un layout propio para Projects.** Cada sección puede tener su propio ancho: Projects usa `max-w-4xl` (896px) porque los dashboards con tablas/grids necesitan espacio; Blog podría usar `max-w-3xl` para lectura. Sin este layout, todas las rutas heredarían el ancho del layout raíz.

- **`mx-auto`** centra el contenedor horizontalmente.
- **`max-w-4xl`** pone un tope de 896px al ancho.

---

## Página lista

`src/app/projects/page.tsx`:

```tsx
import ProjectList from "./components/ProjectList";
import TextScramble from "@/app/components/effects/TextScramble";
import DigitalRain from "@/app/components/effects/DigitalRain";

export default function ProjectsPage() {
  return (
    <section className="relative space-y-8">
      <DigitalRain />
      <div className="relative z-10 space-y-8">
        <h1 className="text-3xl font-bold">
          <TextScramble text="Projects" />
        </h1>
        <ProjectList />
      </div>
    </section>
  );
}
```

- Se compone `ProjectList` (todo el trabajo de datos está en él) con un título animado.
- **`relative z-10`** en el contenido asegura que quede sobre el canvas de fondo (que tiene `z-0`).

---

## Página dinámica

`src/app/projects/[slug]/page.tsx`. Es el punto donde metadata y component map se encuentran:

```tsx
import { projects } from "@/lib/projects";
import { projectsMap, ProjectSlug } from "@/content/projects";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectSlugPage(props: PageProps) {
  const params = await props.params;
  const urlSlug = params.slug as ProjectSlug;

  const project = projects.find((p) => p.slug === urlSlug);
  const ProjectComponent = projectsMap[urlSlug];

  if (!project || !ProjectComponent) {
    return (
      <div>
        <h1>Proyecto no encontrado</h1>
        <p>No existe un proyecto con el slug &quot;{params.slug}&quot;.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <p className="text-zinc-600">{project.description}</p>
      </div>
      <ProjectComponent />
    </div>
  );
}
```

---

## Análisis: `params: Promise<{ slug: string }>`

En Next.js 16 los parámetros de ruta dinámica son **asíncronos**. Hay que hacer `await` sobre `props.params` antes de leer `slug`:

```tsx
const params = await props.params;
const urlSlug = params.slug as ProjectSlug;
```

Esto permite a Next.js optimizar la resolución de parámetros (por ejemplo, leyéndolos de un cache). En versiones anteriores era síncrono (`params.slug`); ahora ya no.

**Regla:** en Next.js 16 App Router, siempre `await props.params` antes de usar los parámetros.

---

## Análisis: doble check `if (!project || !ProjectComponent)`

```tsx
if (!project || !ProjectComponent) {
  return <NotFound />;
}
```

Podría bastar con **una** de las dos comprobaciones, pero se hacen las dos por seguridad:

- **`!project`** cubre el caso "existe en el component map pero no en la metadata" (típicamente por olvidar añadir la entrada en `projects.ts`).
- **`!ProjectComponent`** cubre el caso opuesto: "existe en metadata pero no hay componente registrado" (olvido en el map).

Y por supuesto cubre también "no existe en ninguno de los dos" (URL inventada).

Después del `if`, TypeScript **estrecha** los tipos: `project` es `Project` (no `Project | undefined`), `ProjectComponent` es un componente válido.

---

## Análisis: el `as ProjectSlug`

```tsx
const urlSlug = params.slug as ProjectSlug;
```

`params.slug` viene de la URL y TypeScript lo considera `string`. Pero `projectsMap[key]` espera un `ProjectSlug`. El `as` le dice a TypeScript: "confío en que este string es uno de los slugs válidos".

**Es una promesa que TypeScript no puede verificar.** Si el slug no está entre las claves de `projectsMap`, `projectsMap[urlSlug]` devuelve `undefined` en runtime, y el `if (!ProjectComponent)` lo detecta.

**Regla:** un `as` sin una verificación de runtime aguas abajo es un bug. Aquí el `if (!ProjectComponent)` es la verificación que respalda el `as`.

---

## `template.tsx` para la ruta dinámica

`src/app/projects/[slug]/template.tsx`:

```tsx
"use client";

export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-glitch">{children}</div>;
}
```

Los proyectos individuales usan `page-glitch` (definido en la Fase 2) en lugar de `page-scan`. Esto le da una identidad visual distinta a las páginas de detalle: cuando se entra a un proyecto, el contenido aparece con distorsión cromática en lugar de la línea de escaneo.

**Cómo funciona la prioridad de templates.** Next.js aplica el template más cercano a la ruta:

- Para `/projects/clima`:
  1. El template raíz (`src/app/template.tsx` — `page-scan`) se aplica al layout general.
  2. El template de `[slug]` (`src/app/projects/[slug]/template.tsx` — `page-glitch`) se aplica al contenido de la página.

Ambos se ejecutan; el del `[slug]` envuelve directamente el contenido, así que es el efecto más visible.

---

## Proyectos con API real: la máquina de estados

Un proyecto que consume una API tiene tres estados posibles bien diferenciados: **cargando**, **error** y **datos disponibles**. Modelar los tres como estados nombrados evita mezclarlos y produce UIs previsibles.

### Patrón general

```tsx
"use client";

import { useEffect, useState } from "react";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "data"; data: WeatherEntry[] };

export default function WeatherDashboard() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function fetchCities() {
      try {
        const results = await Promise.all(
          CITIES.map(async (city) => {
            const res = await fetch(buildUrl(city));
            const json = await res.json();
            return { city: city.name, temperature: json.current.temperature_2m, /* ... */ };
          }),
        );
        if (!cancelled) setState({ status: "data", data: results });
      } catch (err) {
        if (!cancelled) setState({ status: "error", message: (err as Error).message });
      }
    }

    fetchCities();
    return () => { cancelled = true; };
  }, []);

  if (state.status === "loading") return <Skeleton />;
  if (state.status === "error") return <ErrorPanel message={state.message} />;
  return <CityGrid data={state.data} />;
}
```

---

## Análisis: la máquina de estados como discriminated union

```ts
type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "data"; data: WeatherEntry[] };
```

Este tipo es una **unión discriminada**: cada variante tiene un campo `status` con un literal distinto. Ventajas:

- El campo `message` sólo existe cuando `status === "error"`. Si intentamos leer `state.message` sin comprobar antes que el status es `"error"`, TypeScript da error.
- Lo mismo para `data`: sólo existe cuando `status === "data"`.
- Las tres ramas del render son exhaustivas: si mañana se añade una variante nueva (por ejemplo `"stale"`), TypeScript avisa de que falta manejarla.

**Antipatrón a evitar:**

```ts
// MAL
type State = {
  loading: boolean;
  error: string | null;
  data: WeatherEntry[] | null;
};
```

Con este tipo, el compilador permite estados imposibles como `{ loading: true, error: "...", data: [...] }` a la vez. La UI se llena de comprobaciones defensivas y aparecen bugs de "por qué muestra el spinner encima de los datos".

**Regla:** cuando un componente tiene múltiples estados excluyentes, se modelan como discriminated union, no como flags booleanos independientes.

---

## Análisis: el flag `cancelled`

```tsx
useEffect(() => {
  let cancelled = false;

  async function fetchCities() {
    /* ... */
    if (!cancelled) setState({ status: "data", data: results });
  }

  fetchCities();
  return () => { cancelled = true; };
}, []);
```

**El problema.** Si el usuario navega a otra ruta antes de que la petición termine, el `fetch` sigue en vuelo. Cuando termina, intenta hacer `setState` sobre un componente que ya fue desmontado. React avisa con un warning y, más importante, se produce un memory leak.

**La solución.** Una variable `cancelled` capturada en el closure del efecto. La función de cleanup la pone a `true` cuando el componente se desmonta. Cuando el `fetch` termina, chequea antes de hacer `setState`.

**Regla:** todo `useEffect` con una operación asíncrona que termina con `setState` necesita un flag `cancelled` o un `AbortController`.

---

## Route Handler: por qué `/api/market`

El widget y el proyecto de mercados consumen datos de Yahoo Finance. Pero Yahoo Finance **bloquea con CORS** las peticiones que salen desde el navegador. Un `fetch("https://query1.finance.yahoo.com/...")` directamente desde el cliente falla con "CORS policy: No 'Access-Control-Allow-Origin' header".

**La solución** es un **Route Handler** de Next.js: un endpoint del propio servidor que hace el fetch server-side (sin CORS) y devuelve los datos al cliente. El navegador llama a `/api/market` (mismo dominio, sin CORS) y el servidor llama a Yahoo Finance (sin restricciones).

```
Navegador  ──►  /api/market (Route Handler, mismo origen, sin CORS)
                       │
                       ▼
                Yahoo Finance (server-side, sin restricciones de origen)
```

### Código del Route Handler

`src/app/api/market/route.ts`:

```ts
import { NextResponse } from "next/server";

export async function GET() {
  const symbols = ["BTC-USD", "%5EGSPC", "%5EIXIC"]; // BTC, S&P 500, NASDAQ

  const data = await Promise.all(
    symbols.map(async (symbol) => {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
        {
          headers: { "User-Agent": "Mozilla/5.0" },
          next: { revalidate: 60 },
        },
      );
      const json = await res.json();
      const meta = json.chart.result[0].meta;
      return {
        symbol,
        price: meta.regularMarketPrice,
        changePercent:
          ((meta.regularMarketPrice - meta.chartPreviousClose) /
            meta.chartPreviousClose) *
          100,
      };
    }),
  );

  return NextResponse.json({ data });
}
```

---

## Análisis: `next: { revalidate: 60 }`

```ts
fetch(url, { next: { revalidate: 60 } });
```

Es una extensión de Next.js sobre el `fetch` estándar. Le dice: "cachea la respuesta durante 60 segundos". La siguiente llamada dentro de esos 60 segundos devuelve la respuesta cacheada sin ir a Yahoo Finance de nuevo.

**Por qué importa.**

- **Rendimiento**: si 10 usuarios entran al home en 30 segundos, sólo hay 1 request a Yahoo Finance.
- **Cortesía**: Yahoo Finance no está diseñado para consumo público a alta frecuencia. El cache reduce la presión sobre el endpoint.
- **Precisión**: los precios de acciones cambian cada segundo, pero para un dashboard general 60s de latencia es aceptable.

**Regla:** todo `fetch` server-side a una API externa debería tener un `revalidate` que refleje la frecuencia mínima aceptable de refresco.

---

## Análisis: por qué el `User-Agent` en el header

```ts
headers: { "User-Agent": "Mozilla/5.0" }
```

Yahoo Finance devuelve `403 Forbidden` cuando la petición viene sin `User-Agent` (o con `User-Agent: node-fetch/x.y.z`, que es el default). Mandar un `User-Agent` que suene a navegador evita el bloqueo.

**Este es un workaround frágil.** Yahoo puede cambiar su detección en cualquier momento. En producción se debería usar una API con un SLA (por ejemplo, Alpha Vantage con API key).

---

## El proyecto `MarketDashboard` (consumidor del Route Handler)

`src/content/projects/mercados/MarketDashboard.tsx` (esquema):

```tsx
"use client";

import { useEffect, useState } from "react";

type Quote = { symbol: string; label: string; price: number; changePercent: number };

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "data"; data: Quote[] };

const LABELS: Record<string, string> = {
  "BTC-USD": "BTC",
  "%5EGSPC": "S&P 500",
  "%5EIXIC": "NASDAQ",
};

export default function MarketDashboard() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function fetchMarket() {
      try {
        const res = await fetch("/api/market");
        const json = await res.json();
        const quotes: Quote[] = json.data.map((q: Quote) => ({
          ...q,
          label: LABELS[q.symbol] ?? q.symbol,
        }));
        if (!cancelled) setState({ status: "data", data: quotes });
      } catch (err) {
        if (!cancelled) setState({ status: "error", message: (err as Error).message });
      }
    }

    fetchMarket();
    return () => { cancelled = true; };
  }, []);

  if (state.status === "loading") return <p className="text-zinc-400">Cargando mercados...</p>;
  if (state.status === "error") return <p className="text-red-400">Error: {state.message}</p>;

  return (
    <div className="flex flex-col gap-3">
      {state.data.map((quote) => (
        <div key={quote.symbol} className="flex items-center justify-between">
          <span className="text-sm text-zinc-300">{quote.label}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-white">
              {quote.price.toFixed(quote.label === "BTC" ? 0 : 2)}
            </span>
            <span
              className={
                quote.changePercent >= 0 ? "text-green-400" : "text-red-400"
              }
            >
              {quote.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

Nótese los nombres explícitos: `quote` en lugar de `q`, `changePercent` en lugar de `chg`, `LABELS` como constante externa.

---

## Cómo probar la fase

```bash
npm run dev
```

Verificaciones:

1. Ir a `http://localhost:3000/projects`. Aparece el título "Projects" (con scramble) y una lista de cards, una por cada proyecto de la metadata.
2. Cada card muestra el título (con scramble), la descripción y un link "Ir al proyecto".
3. Al pasar el cursor sobre una card, se pinta rosa con un glow (efecto `.neon-card:hover`).
4. Click en la card de "Tic Tac Toe". La URL pasa a `/projects/tic-tac-toe`. El contenido entra con **efecto glitch** (colores distorsionados, temblor). Aparece el tablero funcional.
5. Volver a `/projects` y hacer click en "Clima". Aparece un skeleton por un instante y luego se muestran las temperaturas de las ciudades configuradas.
6. Click en "Mercados". Se ve el precio de BTC, S&P 500 y NASDAQ con el cambio porcentual (verde o rojo).
7. Abrir las DevTools en la pestaña Network mientras se carga `/projects/mercados`. Ver que se dispara una petición a `/api/market` (mismo origen).
8. Recargar `/projects/mercados` dos veces rápidamente. La segunda vez debería ser instantánea porque el Route Handler responde desde el cache de 60s.
9. Ir a `/projects/no-existe`. Se muestra el mensaje "Proyecto no encontrado".
10. Con las DevTools ofline, cargar `/projects/mercados`. Se ve el mensaje de error "Error: Failed to fetch" (o similar). Es esperado.

Si todos los pasos funcionan, la fase está terminada.

---

## Checklist para replicar esta fase

- [ ] `src/lib/projects.ts` declara y exporta el tipo `Project` y el array `projects`. No importa React ni JSX.
- [ ] `src/content/projects/` contiene una carpeta por proyecto con `Componente.tsx` + `index.ts`.
- [ ] Al menos un proyecto Client Component (`"use client"` + `useState`) y uno Server Component (sin `"use client"`).
- [ ] `src/content/projects/index.ts` exporta el objeto `projectsMap` y el tipo `ProjectSlug = keyof typeof projectsMap`.
- [ ] Las claves de `projectsMap` coinciden **exactamente** con los `slug` de la metadata.
- [ ] `src/app/projects/layout.tsx` aplica `max-w-4xl` al `<main>`.
- [ ] `src/app/projects/components/ProjectCard.tsx` es Presentational: sólo recibe props.
- [ ] `src/app/projects/components/ProjectList.tsx` es Container: importa `projects` y renderiza `ProjectCard`.
- [ ] `src/app/projects/page.tsx` compone `ProjectList` con el hero y `DigitalRain`.
- [ ] `src/app/projects/[slug]/page.tsx` es `async`, hace `await props.params`, usa `find` para la metadata y `projectsMap[slug]` para el componente, y muestra fallback si no existe.
- [ ] `src/app/projects/[slug]/template.tsx` aplica `page-glitch`.
- [ ] Proyectos con API usan discriminated union `{ status: "loading" | "error" | "data", ... }`.
- [ ] Todos los `useEffect` con fetch tienen un flag `cancelled` en el cleanup.
- [ ] `src/app/api/market/route.ts` existe, exporta `GET`, usa `next: { revalidate: 60 }` y un `User-Agent`.
- [ ] El consumidor `MarketDashboard` llama a `/api/market`, no directamente a Yahoo Finance.
- [ ] Añadir un proyecto nuevo son exactamente 3 pasos: crear carpeta con componente, añadir entrada a `projects`, añadir entrada a `projectsMap`.

---

## Limitaciones y qué viene después

| No funciona | Motivo |
|---|---|
| `/blog` | La sección sigue vacía. Se construye en Fase 4. |
| Widgets del home | El grid del home todavía no existe. Se construye en Fase 5. |
| Fallback amigable ante `/api/market` caído | Se muestra un error crudo del fetch. Un retry con backoff o un estado "datos anteriores" queda para una mejora posterior. |

- **[Fase 4 — Sección Blog: Registry sin component map](./04-blog.md)** — se muestra la variante del Registry cuando el contenido es homogéneo.
- **[Fase 5 — Home Dashboard con Widgets](./05-home-dashboard.md)** — se reutiliza `MarketDashboard` (versión reducida) como widget en el home, y se enlaza al proyecto completo.
