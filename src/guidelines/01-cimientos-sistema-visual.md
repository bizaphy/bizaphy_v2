# Fase 1 — Cimientos y sistema visual

Esta es la primera fase del proyecto. Se inicializa el andamiaje con `create-next-app`, se congela la estructura de carpetas final, se define el **sistema visual entero** en `globals.css` y se construye el layout raíz con `Nav` y `Footer`. Aún no hay contenido real: al terminar, la app corre y se ve con estética neon, pero navegar a `/projects` o `/blog` da 404.

---

## Objetivo de la fase

Al terminar esta fase deberíamos tener:

- Un proyecto Next.js 16 arrancable con `npm run dev`.
- La estructura completa de carpetas creada (aunque muchas queden vacías).
- El archivo `globals.css` con Tailwind activado, variables de color, clases neon reutilizables (`neon-card`, `neon-link`, `neon-nav`, `neon-led`) y las animaciones (`neon-border-pulse`, `led-blink`).
- Un layout raíz que envuelve `Nav` + `Footer` y aplica la fuente Oxanium.
- Un home mínimo con un título de bienvenida.
- La navegación superior con links a `/blog` y `/projects` (las rutas todavía dan 404, pero los links funcionan a nivel HTML).

Lo que **no** vamos a tener todavía:

- No hay transiciones al navegar entre páginas.
- No hay efectos visuales (`TextScramble`, `DigitalRain`).
- No existen las páginas `/blog` ni `/projects`: los links del nav apuntan al vacío.
- No hay widgets en el home.

Las transiciones y efectos llegan en la Fase 2; las secciones y el dashboard, en las Fases 3 a 5.

---

## Inicialización del proyecto

Se parte de un proyecto vacío creado con `create-next-app`:

```bash
npx create-next-app@latest neonlab
```

El CLI hace varias preguntas. Éstas son las respuestas y **por qué**:

| Pregunta         | Respuesta | Por qué                                                                                                                                                                               |
| ---------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript       | **Yes**   | Todo el proyecto usa tipado estricto. Sin TypeScript, el tipo `MiniLabSlug` (inferido con `keyof typeof`) no funcionaría y se perdería la seguridad en tiempo de edición.             |
| ESLint           | **Yes**   | Avisa de imports sin usar y variables no declaradas.                                                                                                                                  |
| Tailwind CSS     | **Yes**   | Sistema de estilos utility-first. Tailwind 4 se configura vía PostCSS automáticamente.                                                                                                |
| `src/` directory | **Yes**   | Separa el código fuente de los archivos de configuración (`package.json`, `tsconfig.json`, etc.).                                                                                     |
| App Router       | **Yes**   | El sistema de routing moderno de Next.js. Soporta Server Components nativamente.                                                                                                      |
| Import alias     | `@/*`     | Permite escribir `@/lib/labs` en lugar de `../../../lib/labs`. Sin este alias, un componente en `src/app/lab/[slug]/page.tsx` tendría que escribir cuatro `../` para llegar a `lib/`. |

Las dependencias finales (sin nada extra):

```json
{
  "dependencies": {
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.1",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

**Regla:** cada dependencia añadida es una responsabilidad más. Si el objetivo se puede alcanzar con las herramientas base, no se instala nada.

---

## Estructura de carpetas al final de la fase

Aunque muchas carpetas queden vacías, se crean **todas** ahora. La estructura de carpetas **es** la arquitectura del proyecto: definirla al inicio evita improvisar más adelante.

```
src/
├── app/                          ← Routing y UI (Next.js App Router)
│   ├── components/               ← Componentes compartidos (Nav, Footer)
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   ├── widgets/              ← vacío (Fase 5)
│   │   └── effects/              ← vacío (Fase 2)
│   ├── api/                      ← vacío (Fase 3)
│   ├── projects/                 ← vacío (Fase 3)
│   ├── blog/                     ← vacío (Fase 4)
│   ├── layout.tsx                ← Layout raíz (Nav + Footer)
│   ├── page.tsx                  ← Home mínimo
│   └── globals.css               ← Estilos globales + sistema neon
│
├── lib/                          ← Datos puros (vacío en Fase 1)
└── content/                      ← Implementaciones React
    ├── projects/                 ← vacío (Fase 3)
    └── widgets/                  ← vacío (Fase 5)
```

La lógica de la separación:

| Carpeta        | Responsabilidad        | Qué contiene                                 | Qué NO contiene          |
| -------------- | ---------------------- | -------------------------------------------- | ------------------------ |
| `src/app/`     | Routing y presentación | Pages, layouts, templates, componentes de UI | Lógica de negocio, datos |
| `src/lib/`     | Datos puros            | Types y arrays de metadata                   | Imports de React, JSX    |
| `src/content/` | Implementaciones React | Componentes reales de cada project/widget    | Routing, metadata        |

Cada capa puede cambiar sin tocar las otras. Si se cambia la fuente de datos (de un array hardcoded a una API), sólo se toca `lib/`. Si cambia el diseño de las cards, sólo se toca `app/`.

**Archivos especiales de Next.js** que aparecen ya en esta fase:

| Archivo      | Qué hace                                                    | Cuándo se ejecuta                  |
| ------------ | ----------------------------------------------------------- | ---------------------------------- |
| `page.tsx`   | Define la UI de una ruta                                    | Cuando el usuario navega a esa URL |
| `layout.tsx` | Envuelve las páginas hijas. **Persiste** entre navegaciones | Una sola vez, al montar            |

---

## Configuración base

### `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

**Está vacío por elección.** Next.js 16 tiene defaults sensatos y no necesitamos configurar redirects, rewrites ni headers. Cada línea de configuración es una decisión que hay que recordar; no se añade lo que no se necesita.

### `tsconfig.json` — el alias `@/*`

Ya lo configura `create-next-app`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Cuando TypeScript ve `@/lib/labs`, lo reemplaza por `./src/lib/labs`. Este alias funciona en cualquier archivo sin importar la profundidad.

### Fuente tipográfica: Oxanium

Se carga desde Google Fonts a través del sistema de fuentes de Next.js. Este sistema descarga la fuente en build time, la sirve localmente y elimina el "flash" de fuente sin cargar:

```tsx
// Va en src/app/layout.tsx (código completo más adelante)
import { Oxanium } from "next/font/google";

const oxanium = Oxanium({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-oxanium",
});
```

**Por qué tantos weights.** Diferentes partes de la UI necesitan distintos grosores: los títulos con `font-bold` (700), el texto normal (400), y textos sutiles con weights más ligeros. Cargar sólo un weight aplanaría la jerarquía visual.

---

## El sistema visual: `globals.css`

Es el archivo más importante de esta fase. Se construye en capas, de lo más general a lo más específico.

### Código completo

```css
@import "tailwindcss";

:root {
  --background: #000000;
  --foreground: #ededed;
  color-scheme: dark;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

@layer components {
  .neon-card {
    @apply rounded-xl border border-fuchsia-500 bg-zinc-950/40 p-5 transition;
  }

  .neon-card:hover {
    @apply bg-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.6)];
  }

  .neon-card-title,
  .neon-card-text {
    @apply transition;
  }

  .neon-link {
    @apply text-zinc-300 transition;
  }

  .neon-link:hover {
    @apply text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)];
  }
}

@keyframes neon-border-pulse {
  0%,
  100% {
    box-shadow: 0 1px 8px rgba(217, 70, 239, 0.15);
  }
  50% {
    box-shadow: 0 1px 20px rgba(217, 70, 239, 0.45);
  }
}

@keyframes led-blink {
  0%,
  100% {
    opacity: 1;
    box-shadow:
      0 0 6px rgba(217, 70, 239, 0.8),
      0 0 12px rgba(217, 70, 239, 0.4);
  }
  50% {
    opacity: 0.4;
    box-shadow: 0 0 2px rgba(217, 70, 239, 0.3);
  }
}

.neon-nav {
  animation: neon-border-pulse 3s ease-in-out infinite;
}
.neon-led {
  animation: led-blink 2s ease-in-out infinite;
}
```

Análisis pieza por pieza a continuación.

---

## Análisis: `@import "tailwindcss"` y el modo oscuro forzado

```css
@import "tailwindcss";

:root {
  --background: #000000;
  --foreground: #ededed;
  color-scheme: dark;
}
```

- **`@import "tailwindcss"`** activa Tailwind CSS 4. Sin esta línea, ninguna clase de Tailwind funciona.
- **`:root`** define las variables de color a nivel de documento. `--background: #000000` y `--foreground: #ededed` fijan fondo negro y texto casi blanco.
- **`color-scheme: dark`** le indica al navegador que renderice elementos nativos (scrollbars, inputs, select) en modo oscuro.
- **No hay `@media (prefers-color-scheme)`**. La app fuerza dark mode siempre porque toda la estética cyberpunk depende del fondo oscuro: los glows fuchsia, el DigitalRain y las sombras neon se ven mal sobre fondo blanco.

**Regla:** si el diseño depende del modo oscuro para funcionar, se fuerza en `:root`. Mantener un modo claro que nunca se usa bien es peor que no tenerlo.

---

## Análisis: `@theme inline`

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

Registra las variables CSS dentro del sistema de Tailwind 4. Después de esto, se pueden usar como clases utility: `bg-background`, `text-foreground`. Es el puente entre CSS puro y las clases utility de Tailwind.

---

## Análisis: las clases neon (`@layer components`)

```css
@layer components {
  .neon-card {
    @apply rounded-xl border border-fuchsia-500 bg-zinc-950/40 p-5 transition;
  }
  /* ... */
}
```

`.neon-card` combina cinco piezas:

- **`rounded-xl`** — bordes redondeados para suavizar la card.
- **`border border-fuchsia-500`** — borde rosa neon, color principal de acento.
- **`bg-zinc-950/40`** — fondo gris casi negro al 40% de opacidad. La opacidad parcial permite que efectos de fondo (como `DigitalRain`, que llega en Fase 2) se intuyan por detrás.
- **`p-5`** — padding interno para que el contenido respire.
- **`transition`** — anima cualquier cambio de propiedad (necesario para el hover suave).

Y el hover:

```css
.neon-card:hover {
  @apply bg-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.6)];
}
```

- **`bg-fuchsia-400`** — el fondo pasa a rosa brillante.
- **`shadow-[0_0_20px_rgba(217,70,239,0.6)]`** — glow rosa difuminado (blur de 20px, opacidad 60%). El `0_0` significa que la sombra no tiene offset horizontal ni vertical: es simétrica alrededor de la card, como un halo.

**Por qué `@layer components`.** Tailwind tiene tres capas de prioridad: `base` < `components` < `utilities`. Poner las clases en `components` permite que las utility (como `p-8` o `bg-red-500`) puedan sobreescribirlas cuando haga falta.

**Regla:** las clases reutilizables van en `@layer components`, no como CSS suelto en el archivo global.

---

## Análisis: animaciones (`@keyframes`)

```css
@keyframes neon-border-pulse {
  0%,
  100% {
    box-shadow: 0 1px 8px rgba(217, 70, 239, 0.15);
  }
  50% {
    box-shadow: 0 1px 20px rgba(217, 70, 239, 0.45);
  }
}

.neon-nav {
  animation: neon-border-pulse 3s ease-in-out infinite;
}
```

**Por qué animaciones CSS y no JavaScript.** Rendimiento. Las animaciones CSS corren en el compositor del navegador (un hilo separado del JS principal). Pueden ir a 60fps aunque haya JavaScript pesado ejecutándose. Un `requestAnimationFrame` para lo mismo competiría con el resto del código.

- **`neon-border-pulse`** — un glow que crece y decrece suavemente. Se aplica al nav y al footer para que parezcan "vivos", como circuitos con corriente.
- **`led-blink`** — un punto parpadeante simulando un LED. Se usa junto al logo NEONLAB.

**Regla:** cualquier animación que se pueda expresar declarativamente en CSS, va en CSS. JS se reserva para animaciones que dependen de estado (p. ej. progreso condicional).

---

## Paleta de colores

Toda la app usa sólo estos colores. La restricción es intencional: una paleta limitada crea cohesión visual.

| Rol              | Tailwind                     | Hex                  | Dónde se usa               |
| ---------------- | ---------------------------- | -------------------- | -------------------------- |
| Fondo principal  | `bg-black`, `bg-zinc-950`    | `#000000`            | Body, containers           |
| Texto principal  | `text-white`                 | `#ffffff`            | Títulos, datos importantes |
| Texto secundario | `text-zinc-400`              | —                    | Descripciones, labels      |
| Bordes           | `border-zinc-800`            | —                    | Separadores sutiles        |
| Acento neon      | `fuchsia-400`, `fuchsia-500` | `#e879f9`, `#d946ef` | Bordes, hovers, glows, LED |

---

## El layout raíz

`src/app/layout.tsx` es el **único lugar** de la app donde pueden aparecer las tags `<html>` y `<body>`. Es literalmente el esqueleto de todo lo demás.

### Código completo

```tsx
import type { Metadata } from "next";
import { Oxanium } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

const oxanium = Oxanium({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-oxanium",
});

export const metadata: Metadata = {
  title: "neonlab",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${oxanium.className} antialiased min-h-screen flex flex-col`}
      >
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

---

## Análisis: el truco del footer pegado al fondo

```
body:  flex flex-col  +  min-h-screen
       ┌──────────────────────┐
       │ Nav                  │  ← tamaño fijo
       │                      │
       │ main (flex-1)        │  ← CRECE para llenar el espacio
       │                      │
       │                      │
       │ Footer               │  ← tamaño fijo, siempre abajo
       └──────────────────────┘
```

- **`flex flex-col`** en el body organiza los hijos verticalmente.
- **`min-h-screen`** obliga a que el body ocupe al menos toda la altura de la ventana.
- **`flex-1`** en el `<main>` le dice: "ocupa todo el espacio sobrante entre Nav y Footer".

Sin este truco, en páginas cortas el footer subiría y quedaría flotando a mitad de pantalla.

**Regla:** en cualquier layout raíz, `min-h-screen + flex-col + flex-1` en el main es el patrón estándar para pegar el footer al fondo.

---

## Análisis: `Readonly<{ children: React.ReactNode }>`

```tsx
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
```

**`Readonly<T>`** convierte todas las propiedades del tipo en sólo lectura. Aunque en la práctica React nunca reasigna `children`, marcar el tipo con `Readonly` documenta la intención y previene mutaciones accidentales dentro del componente.

Es una convención que `create-next-app` genera por defecto.

---

## El componente `Nav`

`src/app/components/Nav.tsx`:

```tsx
import Link from "next/link";

export default function Nav() {
  return (
    <nav className="neon-nav flex items-center border-b border-fuchsia-500 px-6 py-4">
      <Link
        href="/"
        className="neon-link flex items-center gap-2 font-bold tracking-widest"
      >
        <span className="neon-led inline-block h-2 w-2 rounded-full bg-fuchsia-500" />
        NEONLAB
      </Link>

      <div className="ml-auto flex gap-5">
        <Link href="/blog" className="neon-link">
          <span className="text-fuchsia-500">&gt;</span> Blog
        </Link>
        <Link href="/projects" className="neon-link">
          <span className="text-fuchsia-500">&gt;</span> Projects
        </Link>
      </div>
    </nav>
  );
}
```

Puntos clave:

- **`Link` y no `<a>`**. En Next.js, `Link` hace navegación del lado del cliente: en lugar de recargar toda la página, sólo actualiza el contenido que cambió. Con `<a>` cada click sería una recarga completa del navegador.
- **Sin `"use client"`**. El `Nav` no tiene estado ni efectos. Los `Link` manejan la navegación internamente; el nav es un Server Component estático que se renderiza una vez.
- **`neon-nav`** — la animación de pulso en el borde (definida en `globals.css`).
- **`neon-led`** — el punto fuchsia parpadeante junto al logo, simulando un LED de estado.
- **`ml-auto`** — empuja los links de navegación a la derecha.
- **El `>` fuchsia** antes de cada link simula un prompt de terminal (`> Blog`), reforzando la estética cyberpunk.

---

## El componente `Footer`

`src/app/components/Footer.tsx`:

```tsx
export default function Footer() {
  return (
    <footer className="neon-nav flex items-center justify-between border-t border-fuchsia-500 px-6 py-4 text-sm text-zinc-500">
      <p>
        <span className="text-fuchsia-500">&gt;</span>{" "}
        {new Date().getFullYear()} NeonLab
      </p>
      <p className="flex items-center gap-2">
        Creado con Next.js
        <span className="neon-led inline-block h-2 w-2 rounded-full bg-fuchsia-500" />
      </p>
    </footer>
  );
}
```

Replica la estética del `Nav` (borde fuchsia, pulso neon, LED) para dar simetría visual. `new Date().getFullYear()` muestra el año actual automáticamente y nunca queda desactualizado.

---

## El home mínimo

`src/app/page.tsx` en esta fase es una página de bienvenida sin efectos:

```tsx
export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 flex flex-col gap-8">
      <h1 className="text-3xl font-bold">NeonLab</h1>
      <p className="text-zinc-400">
        Plataforma educativa con estética cyberpunk. Explorá los labs, proyectos
        y notas del blog.
      </p>
    </div>
  );
}
```

El hero con `TextScramble` y `DigitalRain` llega en la Fase 2. Aquí sólo verificamos que el layout, el nav, el footer y la fuente se apliquen correctamente.

---

## Cómo probar la fase

```bash
npm run dev
```

Abrimos `http://localhost:3000`. Verificaciones:

1. **Nav visible en la parte superior**: logo NEONLAB con el LED parpadeante a la izquierda, y los links `> Blog` y `> Projects` a la derecha.
2. **El borde inferior del nav pulsa** en un ciclo de 3 segundos (glow rosa que crece y decrece).
3. **El LED parpadea** en un ciclo de 2 segundos.
4. **Home visible**: título "NeonLab" y un párrafo de bienvenida.
5. **Footer pegado al fondo**: aunque la página tenga poco contenido, el footer aparece en la parte inferior de la ventana (no flotando en medio).
6. **Al hacer hover sobre un link del nav**, el texto se pone blanco con un glow blanco tenue.
7. **Al hacer click en `/blog`**, la URL cambia pero se ve una página 404 de Next.js. Esto es esperado en Fase 1 y se resuelve en la Fase 4.
8. **La fuente Oxanium** se aplica en todo el texto (letras geométricas con trazos rectos).

Si todos los pasos funcionan, la fase está terminada.

---

## Checklist para replicar esta fase

- [ ] Proyecto creado con `npx create-next-app@latest` seleccionando TypeScript, Tailwind, `src/`, App Router y alias `@/*`.
- [ ] Estructura completa de carpetas creada dentro de `src/` (aunque `lib/`, `content/projects/`, `content/widgets/` queden vacías).
- [ ] `next.config.ts` vacío (sin custom config).
- [ ] `globals.css` con `@import "tailwindcss"`, variables `--background` / `--foreground`, `color-scheme: dark`.
- [ ] `@layer components` en `globals.css` con `.neon-card`, `.neon-card:hover`, `.neon-link`, `.neon-link:hover`.
- [ ] `@keyframes neon-border-pulse` y `led-blink` definidos, y aplicados con `.neon-nav` y `.neon-led`.
- [ ] `layout.tsx` importa Oxanium con los 7 weights y aplica `oxanium.className` al `<body>`.
- [ ] `layout.tsx` usa `min-h-screen flex flex-col` en body y `flex-1` en `<main>`.
- [ ] `Nav.tsx` usa `Link` de Next.js, la clase `neon-nav`, el LED y el `>` fuchsia antes de cada texto.
- [ ] `Footer.tsx` replica la estética del Nav (borde fuchsia, pulso, LED).
- [ ] `page.tsx` renderiza un home mínimo con título y párrafo, sin efectos.
- [ ] `npm run dev` levanta la app en `http://localhost:3000` sin errores.

---

## Limitaciones y qué viene después

| No funciona                            | Motivo                                                                              |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| Transiciones al navegar                | No existe `template.tsx`. Al hacer click en `/`, el contenido cambia sin animación. |
| Efectos `TextScramble` y `DigitalRain` | No están creados.                                                                   |
| Rutas `/blog` y `/projects`            | Las carpetas están vacías. Ir a esas rutas da 404 de Next.js.                       |
| Home con hero animado y widgets        | El home es sólo un párrafo estático.                                                |

Todo esto se resuelve más adelante:

- **[Fase 2 — Transiciones y efectos visuales](./02-transiciones-efectos.md)** — se crea `template.tsx` con `page-scan`, y los componentes `TextScramble` y `DigitalRain`.
- **[Fase 3 — El patrón Registry: sección Projects](./03-registry-projects.md)** — la ruta `/projects` cobra vida.
- **[Fase 4 — Sección Blog](./04-blog.md)** — la ruta `/blog` cobra vida.
- **[Fase 5 — Home Dashboard](./05-home-dashboard.md)** — el home se convierte en el dashboard final.
