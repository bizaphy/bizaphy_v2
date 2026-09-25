# bizaphyv2

Portafolio personal hecho con Next.js (App Router). Reúne una sección **About me**, un **blog** y una colección de **proyectos** interactivos que se cargan dinámicamente por slug.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- [Drizzle ORM](https://orm.drizzle.team) + [Neon](https://neon.tech) (PostgreSQL serverless)
- [Playwright](https://playwright.dev) (solo para generar capturas de los proyectos)

## Proyectos

| Slug | Título | Descripción |
|---|---|---|
| `habit-tracker` | Sistema de hábitos | Webapp para practicar un sistema de hábitos, con puntajes. |
| `apothecary` | Boticaria CL | Información de plantas y fitofármacos. |
| `tic-tac-toe` | Tic Tac Toe | Juego clásico de Tic Tac Toe. |
| `translation-checker` | Translation-checker | Práctica de traducción ES/EN a japonés con validación exacta. |
| `weather-dashboard` | Clima mundial | Reloj mundial en tiempo real con algunas ciudades del mundo. |
| `all-about-kanjis` | All About Kanjis | Información para estudiar cada kanji del JLPT (usa la base de datos). |
| `hangman` | Hangman (Capitales) | Adivina la capital del país antes de que el ahorcado se complete. |
| `pokedex` | Pokedex | Busca pokémon por nombre, guarda favoritos y revisa tu historial. |

Cada proyecto se ve en `/projects/<slug>`.

## Primeros pasos

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env.local` y completa las variables:

   | Variable | Uso |
   |---|---|
   | `DATABASE_URL` | Branch **dev** de Neon. La usan la app y Drizzle Kit por defecto. |
   | `DATABASE_URL_PROD` | Branch **main** (producción). Solo como referencia; ver [migraciones](./guidelines/all-about-kanjis/02-migraciones.md). |

3. Levanta el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Build de producción. |
| `npm run start` | Sirve el build de producción. |
| `npm run lint` | Ejecuta ESLint. |
| `npm run db:generate` | Genera migraciones SQL en `drizzle/` a partir de `src/db/schema.ts`. |
| `npm run db:migrate` | Aplica las migraciones pendientes. |
| `npm run db:push` | Sincroniza el schema directo con la BD (sin archivo de migración). |
| `npm run db:studio` | Abre Drizzle Studio. |
| `npm run db:seed-kanjis -- n5 [n4 n3] [--dry-run]` | Carga `scripts/seeds/<nivel>.json` en la BD. Aborta si se perderían datos. |
| `npm run db:export-kanjis` | Exporta los kanjis de la BD al JSON (úsalo antes del seed si editaste datos en la BD). |
| `npm run screenshots` | Genera las capturas de `public/images/projects/` contra `localhost:3000`. |
| `npm run screenshots:prod` | Lo mismo, contra el dominio de producción. |

## Estructura

```
src/
├── app/                      Rutas (App Router)
│   ├── about-me/
│   ├── blog/
│   └── projects/
│       ├── _components/      Componentes internos de /projects (carpeta privada, no genera rutas)
│       ├── [slug]/           Página dinámica que carga el proyecto según el slug
│       ├── layout.tsx
│       └── page.tsx          Lista de proyectos
├── components/               Componentes compartidos (layout, ui, effects, home, about-me)
├── content/
│   └── projects/             Un directorio por proyecto (componente + metadata)
└── db/                       Cliente de Drizzle y schema agregador
scripts/                      Seeds, exportación de kanjis y capturas
guidelines/                   Guías de diseño y de implementación por fase
drizzle/                      Migraciones generadas
```

## Agregar un proyecto nuevo

Los proyectos siguen un patrón *registry* (detalle en [`guidelines/general/03-registry-projects.md`](./guidelines/general/03-registry-projects.md)):

1. Crea `src/content/projects/<slug>/` con el componente y un `index.ts` que exporte `meta` (`slug`, `title`, `description`, `image`, `variant`).
2. Agrega ese `meta` a `projectsMeta` en `src/content/projects/index.ts`.
3. Agrega el loader del componente en `componentLoaders` de `src/app/projects/[slug]/page.tsx`.
4. (Opcional) Agrega el slug a `scripts/screenshots.ts` y ejecuta `npm run screenshots`.
