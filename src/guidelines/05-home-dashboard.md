# Fase 5 — Home Dashboard con Widgets

Última fase del proyecto. Se completa el **home** convirtiéndolo en un dashboard de widgets. Se introduce una **variación del Registry** de la [Fase 3](./03-registry-projects.md): los widgets tienen propiedades extra `colSpan` y `rowSpan` que controlan su tamaño en un CSS Grid. Se usan tres patrones vistos en fases anteriores (Registry, discriminated union para APIs, Client Components) más uno nuevo: el patrón **widget-preview → proyecto-completo**, donde un widget del home muestra datos resumidos envueltos en un `<Link>` al proyecto correspondiente en `/projects/[slug]`.

---

## Objetivo de la fase

Al terminar:

- El home renderiza un grid de widgets responsive (`grid-cols-1` en móvil, `grid-cols-2` desde `sm:` en adelante).
- Cada widget vive en su carpeta dentro de `src/content/widgets/`, con la misma estructura que los proyectos.
- Al menos 3 widgets funcionando: uno estático (`stats`), uno con API real que enlaza a un proyecto (`clima`), y uno con Route Handler que también enlaza a un proyecto (`btc`).
- El `WidgetCard` calcula clases de span dinámicamente según `colSpan` y `rowSpan` de la metadata.
- El `WidgetList` mapea `widgets` metadata → `widgetsMap` para renderizar cada widget dentro de su card.

Lo que **no** vamos a tener (proyecto terminado):

- No hay persistencia de personalización (arrastrar widgets, ocultarlos): cada carga muestra el mismo grid.
- No hay autenticación ni contenido personalizado por usuario.
- Las mejoras (retry, backoff, MDX en blog) quedan como iteraciones futuras.

---

## Estructura de carpetas al final de la fase (proyecto completo)

```
src/
├── app/
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   ├── widgets/              ← nuevo
│   │   │   ├── WidgetList.tsx    ← Container
│   │   │   └── WidgetCard.tsx    ← Presentational con spans
│   │   └── effects/
│   │       ├── TextScramble.tsx
│   │       └── DigitalRain.tsx
│   ├── api/market/route.ts
│   ├── projects/...
│   ├── blog/...
│   ├── layout.tsx
│   ├── template.tsx
│   ├── page.tsx                  ← ahora renderiza <WidgetList />
│   └── globals.css
├── lib/
│   ├── posts.ts
│   ├── projects.ts
│   └── widgets.ts                ← nuevo (metadata con colSpan/rowSpan)
└── content/
    ├── projects/...
    └── widgets/                  ← nuevo
        ├── stats/index.tsx
        ├── clima/index.tsx
        ├── btc/index.tsx
        └── index.ts              ← widgetsMap
```

---

## Metadata con propiedades de layout

`src/lib/widgets.ts`:

```ts
export type Widget = {
  slug: string;
  title: string;
  colSpan?: 1 | 2;
  rowSpan?: 1 | 2;
};

export const widgets: Widget[] = [
  { slug: "clima", title: "Clima", rowSpan: 2 },
  { slug: "btc", title: "Mercados" },
  { slug: "stats", title: "Stats" },
];
```

Diferencias respecto a la metadata de Projects:

- **`colSpan` y `rowSpan` son opcionales.** La mayoría de widgets son 1×1 y no necesitan declararlo. Marcar la propiedad como opcional evita repetir `colSpan: 1, rowSpan: 1` en cada widget.
- **El orden del array importa**: CSS Grid coloca los elementos en el orden en que aparecen. Cambiar el orden cambia el layout sin tocar ningún componente.
- **Los tipos `1 | 2`** son un literal union: cualquier otro valor (por ejemplo `colSpan: 3`) es rechazado por TypeScript. Es una restricción de dominio: el grid es de 2 columnas, no hay `colSpan: 3` posible.

**Regla:** cuando un valor tiene un dominio finito y pequeño, se expresa como unión de literales, no como `number`.

---

## Component map

`src/content/widgets/index.ts`:

```ts
import StatsWidget from "./stats";
import ClimaWidget from "./clima";
import BtcWidget from "./btc";

export const widgetsMap = {
  "stats": StatsWidget,
  "clima": ClimaWidget,
  "btc": BtcWidget,
};

export type WidgetSlug = keyof typeof widgetsMap;
```

Mismo patrón que `projectsMap` de la fase anterior.

---

## Widget estático (Server Component)

`src/content/widgets/stats/index.tsx`:

```tsx
export default function StatsWidget() {
  const stats = [
    { label: "Labs completados", value: "5/8" },
    { label: "Proyectos", value: "3" },
    { label: "Posts", value: "7" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">{stat.label}</span>
          <span className="text-sm font-bold text-white">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
```

Sin `"use client"`, sin hooks. Se renderiza en servidor, no envía JS al navegador.

---

## Widget con API real que enlaza a proyecto

`src/content/widgets/clima/index.tsx` (esquema):

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type WeatherEntry = {
  city: string;
  temperature: number;
  weatherCode: number;
};

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "data"; data: WeatherEntry[] };

const HOME_CITIES = [
  { name: "Sapporo", latitude: 43.06, longitude: 141.35 },
  { name: "Reikiavik", latitude: 64.15, longitude: -21.94 },
  { name: "Santiago", latitude: -33.45, longitude: -70.66 },
];

export default function ClimaWidget() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function fetchCities() {
      try {
        const results = await Promise.all(
          HOME_CITIES.map(async (city) => {
            const res = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,weather_code`,
            );
            const json = await res.json();
            return {
              city: city.name,
              temperature: json.current.temperature_2m,
              weatherCode: json.current.weather_code,
            };
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

  if (state.status === "loading") return <p className="text-zinc-400">Cargando...</p>;
  if (state.status === "error") return <p className="text-red-400">Error</p>;

  return (
    <Link href="/projects/clima" className="flex flex-col gap-2">
      {state.data.map((weather) => (
        <div key={weather.city} className="flex items-center gap-3 px-3 py-2">
          <span className="text-2xl">{getWeatherIcon(weather.weatherCode)}</span>
          <span className="text-sm text-zinc-300">{weather.city}</span>
          <span className="ml-auto font-mono text-lg font-bold text-white">
            {Math.round(weather.temperature)}°C
          </span>
        </div>
      ))}
      <span className="mt-2 text-xs text-fuchsia-500">Ver más ciudades →</span>
    </Link>
  );
}

function getWeatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code < 4) return "⛅";
  if (code < 50) return "☁️";
  if (code < 70) return "🌧️";
  return "❄️";
}
```

Nótese los nombres explícitos: `weather` en lugar de `w`, `HOME_CITIES` con el prefijo que indica que es un subconjunto del proyecto completo, `WeatherEntry` como tipo de fila.

---

## El patrón widget-preview → proyecto-completo

```tsx
<Link href="/projects/clima" className="...">
  {/* datos resumidos: 3 ciudades en lugar de 8 */}
  <span>Ver más ciudades →</span>
</Link>
```

**La idea.** El widget en el home muestra un vistazo rápido: sólo 3 ciudades, formato compacto. El proyecto completo en `/projects/clima` muestra 8 ciudades con más detalle (velocidad del viento, condición completa). Ambos consumen la misma API (Open-Meteo), pero con distinto nivel de detalle.

Al envolver el contenido del widget en un `<Link>`, toda la card se convierte en clickeable. La flecha `→` al final refuerza visualmente la afordancia.

**Regla:** cuando un widget del home es una versión reducida de un proyecto, se envuelve en un `<Link>` al proyecto para dar continuidad al descubrimiento.

---

## `WidgetCard` — Presentational con spans dinámicos

`src/app/components/widgets/WidgetCard.tsx`:

```tsx
type WidgetCardProps = {
  title: string;
  colSpan: 1 | 2;
  rowSpan: 1 | 2;
  children: React.ReactNode;
};

export default function WidgetCard({ title, colSpan, rowSpan, children }: WidgetCardProps) {
  const spanClasses = [
    colSpan === 2 ? "sm:col-span-2" : "",
    rowSpan === 2 ? "sm:row-span-2" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={`neon-card flex flex-col gap-3 ${spanClasses}`}>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-fuchsia-400">
        {title}
      </h2>
      <div className="flex-1 text-zinc-400">{children}</div>
    </article>
  );
}
```

---

## Análisis: construir clases condicionales con `.filter(Boolean)`

```ts
const spanClasses = [
  colSpan === 2 ? "sm:col-span-2" : "",
  rowSpan === 2 ? "sm:row-span-2" : "",
]
  .filter(Boolean)
  .join(" ");
```

Paso a paso, con `colSpan = 2` y `rowSpan = 1`:

1. `[colSpan === 2 ? "sm:col-span-2" : "", rowSpan === 2 ? "sm:row-span-2" : ""]` → `["sm:col-span-2", ""]`
2. `.filter(Boolean)` — elimina strings vacíos (falsy) → `["sm:col-span-2"]`
3. `.join(" ")` → `"sm:col-span-2"`

**Por qué este patrón** en lugar de concatenar con `+`:

```ts
// Alternativa fea:
const spanClasses =
  (colSpan === 2 ? "sm:col-span-2 " : "") +
  (rowSpan === 2 ? "sm:row-span-2 " : "");
```

Con el patrón de array queda claro que estamos construyendo una lista de tokens y uniéndolos. La concatenación con `+` mezcla la lógica de "qué añadir" con "cómo unir".

**Regla:** para construir strings de clases condicionales, se prefiere `[...].filter(Boolean).join(" ")` a la concatenación con `+`.

---

## Análisis: por qué el prefijo `sm:` en los spans

```ts
colSpan === 2 ? "sm:col-span-2" : "";
```

En móvil (menor a 640px), el grid es de una sola columna: `grid-cols-1`. En esa configuración, `col-span-2` no tiene sentido (sólo hay 1 columna disponible). El prefijo `sm:` hace que los spans se apliquen **sólo en pantallas donde el grid es de 2 columnas**.

**Regla:** las restricciones de layout se atan al breakpoint donde el layout realmente aplica. Sin el prefijo, se producen bugs visuales en móvil.

---

## `WidgetList` — Container

`src/app/components/widgets/WidgetList.tsx`:

```tsx
import { widgets } from "@/lib/widgets";
import { widgetsMap, type WidgetSlug } from "@/content/widgets";
import WidgetCard from "./WidgetCard";

export default function WidgetList() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {widgets.map((widget) => {
        const WidgetComponent = widgetsMap[widget.slug as WidgetSlug];
        if (!WidgetComponent) return null;

        return (
          <WidgetCard
            key={widget.slug}
            title={widget.title}
            colSpan={widget.colSpan ?? 1}
            rowSpan={widget.rowSpan ?? 1}
          >
            <WidgetComponent />
          </WidgetCard>
        );
      })}
    </section>
  );
}
```

Nótese el nombre `WidgetComponent` (en lugar de `Component`): más específico, evita confusión con el tipo `React.Component`.

---

## Análisis: `widget.colSpan ?? 1`

```tsx
colSpan={widget.colSpan ?? 1}
```

El operador `??` (**nullish coalescing**) devuelve el valor de la izquierda si no es `null` ni `undefined`. Si `widget.colSpan` es `undefined` (no declarado en la metadata), se usa `1`.

**Diferencia con `||`:**

- `widget.colSpan || 1` — devuelve `1` también cuando `colSpan` es `0`, `""`, `false`. En este caso el dominio es `1 | 2` así que ninguno se daría, pero es fácil olvidarlo en otros contextos.
- `widget.colSpan ?? 1` — devuelve `1` **sólo** cuando es nullish. Es la forma correcta cuando queremos un default por ausencia, no por valor falsy.

**Regla:** para defaults ante ausencia (`undefined`/`null`), usar `??`. Para short-circuit ante falsy, usar `||`.

---

## Flujo de datos completo del home

```
widgets (metadata array)    widgetsMap (slug → Component)
         │                            │
         └──────────┬─────────────────┘
                    ▼
              WidgetList
              (mapea cada widget)
                    │
         ┌──────────┼──────────┐
         ▼          ▼          ▼
    WidgetCard  WidgetCard  WidgetCard
    ┌────────┐  ┌────────┐  ┌────────┐
    │ title  │  │ title  │  │ title  │
    │ ClimaW │  │ BtcW   │  │ StatsW │  ← children (WidgetComponent del map)
    └────────┘  └────────┘  └────────┘
```

Es exactamente el mismo esquema de Projects, con un detalle extra: el `WidgetCard` no navega a otra ruta al hacer click; el widget **es** la vista final. Si el widget quiere linkear a otro lado (patrón preview → proyecto), lo hace internamente con un `<Link>`.

---

## Home final

`src/app/page.tsx`:

```tsx
import Image from "next/image";
import TextScramble from "@/app/components/effects/TextScramble";
import WidgetList from "@/app/components/widgets/WidgetList";

export default function Home() {
  return (
    <div className="min-h-screen px-4 py-12">
      <main className="relative z-10 mx-auto w-full max-w-3xl flex flex-col gap-8">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white">
            <TextScramble text="/neonlab" />
          </h1>
          <div className="relative w-full aspect-video max-w-xl rounded-lg">
            <Image
              src="/media/valhalla.gif"
              alt="NeonLab animation"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </header>

        <WidgetList />
      </main>
    </div>
  );
}
```

**Notas:**

- **El home no tiene fondo propio**. El `DigitalRain` del `layout.tsx` (Fase 2) es el fondo compartido con el resto de rutas. Si aquí añadiéramos `bg-black`, taparíamos el canvas.
- **`Image` con `fill`**: hace que la imagen ocupe todo su contenedor padre (que tiene `aspect-video` para mantener proporción 16:9).
- **`unoptimized`** es necesario para GIFs. Sin esta prop, Next.js intentaría optimizarlos y rompería la animación.

---

## Cómo probar la fase

```bash
npm run dev
```

Verificaciones:

1. Ir a `/`. Se ve el hero "/neonlab" decodificándose, la imagen de fondo animada, y **debajo, un grid de widgets**.
2. En pantalla ancha (≥ 640px), el grid es de 2 columnas. Los widgets con `colSpan: 2` ocupan las 2 columnas; los que tienen `rowSpan: 2` ocupan 2 filas.
3. En móvil (< 640px), el grid pasa a 1 columna y los `col-span-2` se ignoran (no había esa segunda columna).
4. El widget de **stats** muestra tres líneas con datos estáticos.
5. El widget de **clima** muestra 3 ciudades con emoji, nombre y temperatura. Al pasar el cursor sobre él, la card se pinta rosa (efecto `neon-card:hover`).
6. Click en el widget de **clima**. La URL cambia a `/projects/clima` con la animación de transición, y se ve el proyecto completo con 8 ciudades.
7. El widget de **mercados** muestra los tres símbolos con precio y cambio porcentual. En la Network se ve una petición a `/api/market`.
8. Click en el widget de **mercados**. Se abre `/projects/mercados` con la versión completa.
9. Con la app cargada, dejar la pestaña abierta. El `DigitalRain` sigue animado sin bajar de FPS.

Si todos los pasos funcionan, el proyecto está terminado.

---

## Checklist para replicar esta fase

- [ ] `src/lib/widgets.ts` con el tipo `Widget` (incluye `colSpan?: 1 | 2` y `rowSpan?: 1 | 2`) y el array `widgets`.
- [ ] `src/content/widgets/` con una carpeta por widget (`index.tsx`).
- [ ] `src/content/widgets/index.ts` exporta `widgetsMap` y `WidgetSlug = keyof typeof widgetsMap`.
- [ ] `src/app/components/widgets/WidgetCard.tsx` calcula spans con `[...].filter(Boolean).join(" ")` y usa prefijo `sm:`.
- [ ] `src/app/components/widgets/WidgetList.tsx` mapea `widgets` a cards usando `widget.colSpan ?? 1` y `widget.rowSpan ?? 1`.
- [ ] Al menos un widget estático (Server Component) y uno con API real (Client Component).
- [ ] Los widgets que enlazan a proyectos envuelven su contenido en un `<Link href="/projects/{slug}">`.
- [ ] `src/app/page.tsx` renderiza `<WidgetList />` bajo el hero.
- [ ] El home no aplica `bg-black` ni tapa el `DigitalRain` del layout raíz.

---

## Limitaciones del proyecto terminado

| No funciona | Motivo |
|---|---|
| Personalizar el grid (mover, ocultar widgets) | Requeriría estado persistente por usuario (localStorage o backend). |
| Contenido MDX en blog | El blog usa strings planos. Migrar a MDX es una mejora fuera del alcance. |
| Autenticación / multi-usuario | El proyecto es un dashboard estático. |
| Retry con backoff en widgets con API | Los estados son `loading | error | data` mínimos. Un retry sería una capa extra sobre el `useEffect`. |

Estos puntos quedan como iteraciones posibles fuera del alcance del tutorial. Con esta fase, el proyecto NeonLab está completo: revisar el [índice](./00-indice.md) para ver el "Cómo agregar contenido nuevo" y el resumen de patrones.
