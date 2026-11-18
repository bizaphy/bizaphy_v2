# bizaphyv2

Portafolio personal hecho con Next.js (App Router). Reúne un **home** con paneles de actividad, una sección **About me**, un **blog**, un **compendio** de apps, la mascota **Neonna**, una colección de **proyectos** interactivos que se cargan por slug y un **panel de administración** privado.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- [Drizzle ORM](https://orm.drizzle.team) + [Neon](https://neon.tech) (PostgreSQL serverless)
- [Better Auth](https://www.better-auth.com) con login de GitHub y rol `admin`
- [Biome](https://biomejs.dev) para lint y formato (reemplaza a ESLint)
- [Sonner](https://sonner.emilkowal.ski) para los toasts
- [Playwright](https://playwright.dev) (solo para generar capturas y el ASCII de Neonna)

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Home: hero con Neonna, heatmap de actividad, estadísticas, frase del día y panel del sistema. |
| `/about-me` | Perfil, educación, certificaciones, idiomas, setup y hobbies. |
| `/blog`, `/blog/[slug]` | Posts publicados (se leen de la base de datos). |
| `/compendio` | Apps que uso, agrupadas por categoría y con filtro lateral. |
| `/neonna` | La mascota del sitio en sus distintas versiones (incluida la ASCII). |
| `/projects`, `/projects/[slug]` | Listado de proyectos y la página de cada uno. |
| `/admin` | Panel privado (solo `admin`). Ver [Panel de administración](#panel-de-administración). |

## Proyectos

| Slug | Título | Descripción |
|---|---|---|
| `apothecary` | Boticaria CL | Información de plantas y fitofármacos. |
| `weather-dashboard` | Clima mundial | Reloj mundial en tiempo real con algunas ciudades del mundo. |
| `all-about-kanjis` | All About Kanjis | Explorador de kanjis del JLPT (usa la base de datos), KanjiTrainer de vocabulario y VerbTrainer con tests de verbos N5-N3. |
| `grammar-booster` | Grammar Booster | Ejercicios de gramática japonesa del JLPT N5 al N3. |
| `hangman` | Hangman (Capitales) | Adivina la capital del país antes de que el ahorcado se complete. |
| `pocket-qf` | Pocket QF | Proyecto **externo**: su tarjeta abre el repositorio en GitHub. |

Cada proyecto interno se ve en `/projects/<slug>`. Los de `variant: "externo"` no tienen componente: `/projects/<slug>` redirige a su `url`.

## Panel de administración

Todo lo que está bajo `/admin` es privado en dos capas:

1. `src/proxy.ts` redirige al home a quien no tenga cookie de sesión.
2. Cada página llama a `requireAdminPage()` (y cada server action a `assertAdmin()`) de `src/server/auth/guards.ts`, que valida la sesión y el rol `admin`.

| Sección | Qué hace |
|---|---|
| `/admin/planes` | Ideas y tareas pendientes. |
| `/admin/blog` | Crear, editar y publicar posts. |
| `/admin/reading` | Editor de textos japoneses para practicar lectura y traducción. |

### Reading

Editor por pasos para trabajar textos en japonés:

| Pestaña | Para qué |
|---|---|
| **Almacén** | Textos guardados (JLPT N3 - Reading 1 a 9) con su furigana original. Cada tarjeta muestra el avance de traducción y las palabras del comodín. |
| **1 · Texto** | Subir un `.txt`/`.md` o pegar el texto. Cada línea es una fila; el botón "Cortar en 。！？" separa por oraciones. |
| **2 · Filas** | Cada fila con furigana (interruptor para mostrarla u ocultarla) y un campo para escribir su significado. Arriba, el **Comodín**: palabras que no sabes, separadas por comas. |
| **3 · Exportar** | Texto original + tu traducción, con instrucciones opcionales para revisarla con una IA. Copiar o descargar `.txt`. |
| **4 · Traducción real** | Tu traducción al lado de la traducción de referencia, fila por fila (solo textos del Almacén). |

La furigana se escribe con el formato `[漢字|かんじ]`, el mismo de All About Kanjis (parser en `src/lib/furigana.ts`). Por ahora el borrador se guarda en el `localStorage` del navegador y los textos del almacén viven en `src/app/admin/reading/_data/almacen.ts`.

## Primeros pasos

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env.local` y completa las variables:

   | Variable | Uso |
   |---|---|
   | `DATABASE_URL` | Branch **dev** de Neon. La usan la app y Drizzle Kit por defecto. |
   | `DATABASE_URL_PROD` | Branch **main** (producción). Solo como referencia. |
   | `BETTER_AUTH_SECRET` | Secreto con el que Better Auth firma las sesiones. |
   | `BETTER_AUTH_URL` | URL base de la app (por ejemplo `http://localhost:3000`). |
   | `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Credenciales de la OAuth App de GitHub para el login. |

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
| `npm run lint` | Lint con Biome. |
| `npm run format` | Formatea el código con Biome. |
| `npm run check` | Lint + formato + orden de imports con Biome, aplicando los arreglos. |
| `npm run db:generate` | Genera migraciones SQL en `drizzle/` a partir de `src/server/db/schema/`. |
| `npm run db:migrate` | Aplica las migraciones pendientes. |
| `npm run db:push` | Sincroniza el schema directo con la BD (sin archivo de migración). |
| `npm run db:studio` | Abre Drizzle Studio. |
| `npm run db:seed-kanjis -- n5 [n4 n3] [--dry-run]` | Carga `scripts/seeds/<nivel>.json` en la BD. Aborta si se perderían datos. |
| `npm run db:export-kanjis` | Exporta los kanjis de la BD al JSON (úsalo antes del seed si editaste datos en la BD). |
| `npm run screenshots` | Genera las capturas de `public/images/projects/` contra `localhost:3000`. |
| `npm run screenshots:prod` | Lo mismo, contra el dominio de producción. |
| `npm run neonna:ascii` | Genera los fotogramas ASCII de Neonna (JSON y GIF) a partir de su SVG. |

El flujo de los seeds de kanjis está explicado paso a paso en [`scripts/seeds/README.md`](./scripts/seeds/README.md).

## Estructura

```
src/
├── app/                      Rutas (App Router)
│   ├── about-me/
│   ├── admin/                Panel privado: planes, blog y reading
│   ├── api/auth/[...all]/    Endpoint de Better Auth
│   ├── blog/
│   ├── compendio/
│   ├── neonna/
│   └── projects/
│       ├── _components/      Componentes internos de /projects (carpeta privada, no genera rutas)
│       └── [slug]/           Página dinámica que carga el proyecto según el slug
├── components/               Componentes compartidos (layout, ui, effects, home, about-me, compendio, neonna)
├── content/
│   └── projects/             Un directorio por proyecto (componente + metadata)
├── lib/                      Utilidades que corren en cliente y servidor (furigana, barajar, auth-client…)
├── shared/types/             Tipos compartidos entre servidor y cliente
├── server/                   Código solo de servidor
│   ├── actions/              Server actions (formularios del admin, kanjis)
│   ├── auth/                 Config de Better Auth y guards de admin
│   ├── db/                   Cliente de Drizzle y schema (una tabla por archivo)
│   └── services/             Consultas a la BD y APIs externas (GitHub)
└── proxy.ts                  Protege /admin antes de renderizar
scripts/                      Seeds, exportación de kanjis, capturas y ASCII de Neonna
drizzle/                      Migraciones generadas
```

### Reglas de capas

Biome (`biome.json`) hace cumplir dos barreras de imports:

- `src/app`, `src/components` y `src/content` **no** importan `@/server/db`: la interfaz pasa por un service de `@/server/services` o un tipo de `@/shared`.
- `src/shared` y `src/lib` **no** importan nada de `@/server`, porque también corren en el navegador (excepción: `src/lib/auth-client.ts`).

## Agregar un proyecto nuevo

Los proyectos siguen un patrón *registry*:

1. Crea `src/content/projects/<slug>/` con el componente y un `index.ts` que exporte `meta` (`slug`, `title`, `description`, `image`, `variant`).
2. Agrega ese `meta` a `projectsMeta` en `src/content/projects/index.ts`.
3. Agrega el loader del componente en `componentLoaders` de `src/app/projects/[slug]/page.tsx`.
4. (Opcional) Agrega el slug a `scripts/screenshots.ts` y ejecuta `npm run screenshots`.

Si el proyecto es externo (solo un enlace a su repositorio), usa `variant: "externo"` con `url` y salta el paso 3.
