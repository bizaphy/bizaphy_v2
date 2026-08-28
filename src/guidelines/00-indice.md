# NeonLab — Guía general de construcción

Este documento describe cómo abordar la construcción del proyecto **desde cero**, manteniendo un orden que evite acumular confusión a medida que aumenta la complejidad. Cada fase resuelve un problema concreto y prepara el terreno para la siguiente.

> Los tutoriales específicos de cada fase se encuentran como archivos numerados en esta misma carpeta (`src/guidelines/`).

---

## Filosofía general

El proyecto se construye por **capas de responsabilidad**, no por sección. En lugar de escribir la sección "Projects" entera (metadata, componente, mapa, layout, página lista, página dinámica, template) a la vez, se avanza en fases donde cada una añade una única capacidad nueva sobre la anterior.

Cada fase debe:

1. **Funcionar de forma completa** antes de pasar a la siguiente (aunque sea con una sola página).
2. **Introducir el mínimo de conceptos nuevos** para dejar la capa terminada y sin trabajo pendiente de refactor posterior.
3. **Terminar con un checklist verificable** que garantice que se puede replicar sin ambigüedad.

> **Nota importante sobre el orden**: se define el **sistema visual completo** (CSS + clases neon + animaciones) **antes** de escribir componentes. Si los componentes vinieran primero, cada uno inventaría sus propios colores y bordes, y terminaríamos con 15 tonos de fuchsia y ninguna consistencia. El manual de marca va antes que los carteles.

---

## Requisitos previos

Antes de empezar la Fase 1, hace falta tener instalado:

- **Node.js** en versión reciente (20 o superior).
- **npm** (viene con Node) o el gestor de paquetes preferido.
- Un editor con soporte de TypeScript (VS Code).

El proyecto se construye con **Next.js 16**, **React 19**, **TypeScript** y **Tailwind CSS 4**. No se instala ninguna dependencia externa fuera de las que trae `create-next-app`: la intención es demostrar qué tan lejos se puede llegar con las herramientas base antes de agregar librerías. Cada dependencia añadida es una responsabilidad más (actualizaciones, vulnerabilidades, conflictos); si se puede lograr lo mismo sin ella, no se necesita.

---

## Estructura final del proyecto

Al terminar todas las fases, `src/` queda así:

```
src/
├── app/                          ← Routing + UI (Next.js App Router)
│   ├── api/market/route.ts       ← Route Handler (proxy Yahoo Finance)
│   ├── blog/
│   │   ├── [slug]/page.tsx
│   │   ├── components/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── projects/
│   │   ├── [slug]/page.tsx + template.tsx
│   │   ├── components/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── effects/              ← TextScramble, DigitalRain
│   │   ├── widgets/              ← WidgetList, WidgetCard
│   │   ├── Nav.tsx
│   │   └── Footer.tsx
│   ├── layout.tsx
│   ├── template.tsx
│   ├── page.tsx
│   └── globals.css
│
├── lib/                          ← Datos puros (sin React)
│   ├── posts.ts
│   ├── projects.ts
│   └── widgets.ts
│
├── content/                      ← Implementaciones React de cada slug
│   ├── projects/                 ← 1 carpeta por proyecto + index.ts (projectsMap)
│   └── widgets/                  ← 1 carpeta por widget + index.ts (widgetsMap)
│
└── guidelines/                   ← Esta carpeta con los tutoriales
```

**Tres capas, unidireccionales:** `app/` puede importar de `lib/` y de `content/`. `content/` puede importar de `lib/`. `lib/` no importa de nadie. Este orden garantiza que los datos son sustituibles (podrían venir de una API), que las implementaciones son autocontenidas y que la UI solo compone.

---

## Índice de tutoriales

Cada fase produce un estado del proyecto **funcional y verificable**. Si algo no funciona al terminar una fase, no se avanza a la siguiente.

### [Fase 1 — Cimientos y sistema visual](./01-cimientos-sistema-visual.md)

Se inicializa el proyecto con `create-next-app`, se congela la estructura de carpetas final, se define el **sistema visual completo** en `globals.css` (clases neon, animaciones, transiciones) y se construyen el layout raíz, el `Nav` y el `Footer`. Al terminar, la app corre y se ve con la estética cyberpunk, aunque el contenido sea mínimo.

**Se aprende:**
- Inicialización de Next.js con App Router, TypeScript y Tailwind 4.
- Alias de imports (`@/*`) en `tsconfig.json`.
- Cómo funcionan `layout.tsx`, `page.tsx` y las rutas por convención de carpetas.
- Sistema de clases CSS reutilizables con `@layer components`.
- Animaciones CSS con `@keyframes` (por qué se prefieren a JS).
- El truco de `flex-col + min-h-screen + flex-1` para pegar el footer al fondo.

**Resultado:** una página en blanco con nav, footer y estética neon aplicada. La navegación entre `/`, `/blog`, `/projects` todavía lleva a 404 (las páginas no existen).

---

### [Fase 2 — Transiciones y efectos visuales](./02-transiciones-efectos.md)

Se añade la capa de **movimiento**: `template.tsx` con la transición neon `page-scan`, y los componentes de efectos `TextScramble` (texto decodificándose) y `DigitalRain` (canvas con líneas hex de fondo). El home deja de estar vacío y muestra un hero animado.

**Se aprende:**
- Diferencia entre `layout.tsx` (persiste entre navegaciones) y `template.tsx` (se re-monta).
- Client Components (`"use client"`): cuándo y por qué son necesarios.
- Animación con `requestAnimationFrame` y `useEffect` + cleanup.
- Renderizado con `<canvas>` frente a divs animados (rendimiento).
- Accesibilidad de efectos visuales con `aria-label` y `aria-hidden`.

**Resultado:** el home tiene un hero con efecto de texto decodificándose, el fondo tiene lluvia digital animada, y cada navegación aplica una transición neon.

---

### [Fase 3 — El patrón Registry: sección Projects](./03-registry-projects.md)

Se introduce el **patrón Registry** —el concepto arquitectónico más importante del proyecto— construyendo la sección **Projects** de punta a punta. El patrón separa **metadata** (arrays de datos puros en `lib/`) de **implementaciones** (componentes React en `content/`), unidos por un `component map`. Se conocen Server Components y Client Components mostrando ejemplos de ambos, se introduce la máquina de estados `loading | error | data` para proyectos con API real, y se crea un **Route Handler** (`/api/market`) como proxy server-side para APIs con CORS restrictivo.

**Se aprende:**
- El patrón **metadata + component map**: por qué separar datos de componentes.
- `keyof typeof` para inferir tipos desde un objeto.
- Rutas dinámicas con `[slug]` y `params` asíncronos en Next.js 16.
- Container/Presentational pattern (`ProjectList` obtiene datos, `ProjectCard` los muestra).
- Server vs Client Components: cuándo aplica cada uno.
- Discriminated unions `{ status: "loading" | "error" | "data" }` para APIs.
- Flag `cancelled` en `useEffect` para evitar `setState` sobre un componente desmontado.
- Route Handlers (`route.ts`) como puente cliente ↔ APIs externas.
- Cache HTTP con `next: { revalidate: N }`.

**Resultado:** la ruta `/projects` muestra una lista de cards, `/projects/[slug]` renderiza el componente correspondiente, y proyectos como `clima`, `hora-mundial` y `mercados` consumen APIs reales con datos vivos.

---

### [Fase 4 — Sección Blog: Registry sin component map](./04-blog.md)

Se construye la sección **Blog** como variante del patrón Registry. La diferencia clave: cada post es solo `title` + `content` (strings), no un componente React distinto. Por eso **no hace falta component map**. Sirve para entender que el patrón se adapta al tipo de contenido.

**Se aprende:**
- Cuándo el component map **no** es necesario.
- Cómo un mismo patrón (Registry) puede simplificarse cuando el contenido es homogéneo.
- Diferencia entre "cada elemento tiene UI propia" (Projects) y "cada elemento tiene solo datos" (Blog).

**Resultado:** la ruta `/blog` lista posts y `/blog/[slug]` renderiza el contenido directamente desde la metadata.

---

### [Fase 5 — Home Dashboard con Widgets](./05-home-dashboard.md)

Última fase. Se construye el **home** como un dashboard de widgets, usando una variación del Registry con campos extra `colSpan` y `rowSpan` para controlar el layout en un CSS Grid. Se combinan widgets estáticos, widgets con API real y widgets que enlazan a proyectos completos (patrón preview → detalle).

**Se aprende:**
- Registry extendido con propiedades de layout (`colSpan`, `rowSpan`).
- Cómo construir un grid CSS responsive con spans variables.
- Patrón **widget-preview → proyecto-completo**: un `<Link>` como wrapper del contenido.
- El operador `??` (nullish coalescing) para defaults.

**Resultado:** el home muestra un grid de widgets vivos (clima, hora mundial, mercados, notas, etc.) con la estética cyberpunk completa.

---

## Reglas transversales

Estas reglas aplican en todas las fases, no en una en particular:

- **Nombres explícitos**. `WidgetComponent` es mejor que `Component`. `quote` es mejor que `q`. `urlSlug` es mejor que `s`.
- **Datos separados de UI**. Los archivos en `lib/` no importan React. Los archivos en `content/` no importan de `app/`. La regla es unidireccional: `app/` → `content/` → `lib/`.
- **Server Components por defecto, Client Components sólo cuando hacen falta**. La directiva `"use client"` sube el coste de JS enviado al navegador. Se usa sólo si hay `useState`, `useEffect`, `onClick` o cualquier API del navegador.
- **Un componente, una responsabilidad**. `ProjectList` obtiene datos, `ProjectCard` los muestra. Si uno empieza a hacer las dos cosas, se divide.
- **Sin abstracciones prematuras**. Dos secciones (`Projects`, `Blog`) casi idénticas son preferibles a un `<GenericSection>` que las intente unificar.
- **Comentarios sólo cuando el "por qué" no sea evidente**. Los buenos nombres ya explican el "qué".

---

## Cómo agregar contenido nuevo

Esta es la prueba de fuego de la arquitectura: ¿qué tan fácil es añadir contenido? Si el patrón está bien aplicado, debe ser **mecánico**.

### Añadir un Project

Tres pasos, siempre los mismos:

1. **Crear el componente** en `src/content/projects/mi-proyecto/`:
   - `MiProyecto.tsx` con la implementación
   - `index.ts` con `export { default } from "./MiProyecto"`
2. **Añadir metadata** en `src/lib/projects.ts`:
   ```ts
   { slug: "mi-proyecto", title: "Mi Proyecto", description: "Lo que hace" }
   ```
3. **Registrar en el map** en `src/content/projects/index.ts`:
   ```ts
   import MiProyecto from "./mi-proyecto";
   export const projectsMap = {
     /* ...los existentes... */
     "mi-proyecto": MiProyecto,
   };
   ```

La card aparece automáticamente en `/projects` y `/projects/mi-proyecto` renderiza el componente.

### Añadir un Widget

Mismos 3 pasos usando `src/content/widgets/`, `src/lib/widgets.ts` (con `colSpan` / `rowSpan` opcionales), y `widgetsMap`.

### Añadir un Post al Blog

Sólo **1 paso**: añadir una entrada a `src/lib/posts.ts` con `slug`, `title`, `content`. No hay component map ni carpeta de implementaciones — el post es datos puros.

### Añadir un Widget que enlaza a un Project

Combinación de dos casos:

1. Crear el proyecto siguiendo los 3 pasos de "Añadir un Project".
2. Crear el widget como Client Component con datos resumidos.
3. Envolver el contenido del widget en `<Link href="/projects/mi-proyecto">` y añadir el texto "Ver más →" al final.
4. Registrar el widget siguiendo los 3 pasos de "Añadir un Widget".

### Por qué siempre 3 pasos (o 1 en el blog)

Porque el sistema está diseñado para que el contenido y la infraestructura sean independientes. No hay que crear páginas, rutas, cards, links, ni transiciones: todo eso ya existe y se genera automáticamente desde los datos del registry.

---

## Resumen de patrones clave

| Patrón | Dónde se usa | Propósito |
|---|---|---|
| Registry (metadata + map) | Projects, Widgets | Separar datos de componentes |
| Registry sin map | Blog | Cuando el contenido es homogéneo (sólo datos) |
| Container / Presentational | `*List` + `*Card` en cada sección | Separar obtención de datos y renderizado |
| Server Component (default) | `ServerTime`, `StatsWidget` | 0 JS al cliente, más rápido |
| Client Component (`"use client"`) | Widgets/proyectos con API, forms, efectos | Necesario para hooks y eventos |
| Discriminated union para APIs | `WeatherDashboard`, `MarketDashboard`, `ClimaWidget` | Estados `loading \| error \| data` sin flags booleanos |
| Flag `cancelled` en `useEffect` | Todo fetch con `setState` | Evitar `setState` sobre componente desmontado |
| Route Handler (`route.ts`) | `/api/market` | Proxy server-side para APIs con CORS |
| Widget → Proyecto | Widgets `clima`, `btc`, `hora-mundial` | Preview compacto en home enlazado al detalle en `/projects` |
| `template.tsx` re-mount | En cada nivel de ruta | Animaciones de entrada por navegación |
| Canvas para muchos elementos | `DigitalRain` | Rendimiento cuando hay decenas de partículas |
| Clases neon en `@layer components` | `.neon-card`, `.neon-link` | Sistema visual consistente definido una vez |

---

## Cómo usar esta guía

- Si se empieza el proyecto desde cero: seguir las fases **en orden**, sin saltar.
- Si se llega a mitad del código y hay una duda puntual: ir directo al tutorial de la fase correspondiente.
- Si aparece un patrón nuevo que no encaja en ninguna fase existente: crear un archivo `NN-nombre.md` nuevo en esta carpeta y añadirlo al índice.
