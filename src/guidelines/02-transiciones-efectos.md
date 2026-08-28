# Fase 2 — Transiciones y efectos visuales

En esta fase la app deja de ser estática. Se añade `template.tsx` a la raíz con la clase de transición `page-scan`, y se construyen dos Client Components de efecto: **`TextScramble`** (texto que se decodifica progresivamente) y **`DigitalRain`** (canvas de fondo con líneas hex desplazándose). El home de la [Fase 1](./01-cimientos-sistema-visual.md) gana un hero animado.

---

## Objetivo de la fase

Al terminar esta fase:

- Cada navegación entre páginas dispara una animación **scan-line** (línea neon que barre la pantalla revelando el contenido).
- El home muestra un título "/neonlab" que se decodifica con caracteres aleatorios.
- El fondo de la app tiene una lluvia de líneas hex sutiles (10% de opacidad) animadas con canvas.
- Existen clases `page-scan` y `page-glitch` en `globals.css` listas para usar como transiciones.
- Los efectos son Client Components y usan `useEffect` + cleanup correctamente.

Lo que **no** vamos a tener todavía:

- No hay contenido real: `/projects` y `/blog` siguen dando 404.
- El home no muestra widgets, sólo el hero.
- Los templates específicos por sección (`/projects/[slug]/template.tsx` con `page-glitch`) se añaden dentro de la Fase 3 cuando la ruta exista.

---

## Estructura de carpetas al final de la fase

Aparecen archivos nuevos dentro de `app/components/effects/` y un `template.tsx` raíz:

```
src/
├── app/
│   ├── components/
│   │   ├── Nav.tsx              ← sin cambios respecto a Fase 1
│   │   ├── Footer.tsx           ← sin cambios
│   │   └── effects/
│   │       ├── TextScramble.tsx ← nuevo (Client Component)
│   │       └── DigitalRain.tsx  ← nuevo (Client Component, canvas)
│   ├── layout.tsx               ← ahora renderiza DigitalRain como fondo
│   ├── template.tsx             ← nuevo (page-scan global)
│   ├── page.tsx                 ← ahora usa TextScramble
│   └── globals.css              ← se añaden .page-scan y .page-glitch
└── ... (resto sigue vacío)
```

Las carpetas `projects/`, `blog/`, `lib/`, `content/projects/`, `content/widgets/` siguen sin contenido.

---

## Repaso rápido: `layout.tsx` vs `template.tsx`

Ambos envuelven las páginas hijas. La diferencia crítica está en el ciclo de vida:

| Propiedad | `layout.tsx` | `template.tsx` |
|---|---|---|
| Se re-monta al navegar | **No** (persiste) | **Sí** (se destruye y recrea) |
| Mantiene estado | Sí | No |
| Ideal para | Nav, Footer, providers de contexto | Animaciones de entrada |

**Por qué `template.tsx` se re-monta.** Cuando un componente se monta, sus animaciones CSS se ejecutan. Si el componente persiste (como un layout), la animación sólo corre una vez, la primera. Al usar template, cada navegación destruye el `div` viejo y crea uno nuevo, re-ejecutando la animación.

**Regla:** si queremos animar la entrada de contenido en cada navegación, va en `template.tsx`, no en `layout.tsx`.

---

## Transiciones en `globals.css`

Se añaden dos bloques nuevos al `globals.css` de la Fase 1.

### `page-scan` — línea neon que barre la pantalla

```css
.page-scan {
  animation: scan-reveal 0.5s ease-out both;
}

.page-scan::before {
  content: "";
  position: fixed;
  top: 0; left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d946ef, #e879f9, #d946ef, transparent);
  box-shadow: 0 0 15px rgba(217, 70, 239, 0.8), 0 0 30px rgba(217, 70, 239, 0.4);
  animation: scan-line-move 0.5s ease-out both;
  z-index: 50;
  pointer-events: none;
}

@keyframes scan-reveal {
  0%   { clip-path: inset(0 0 100% 0); }  /* todo oculto */
  100% { clip-path: inset(0); }           /* todo visible */
}

@keyframes scan-line-move {
  0%   { top: 0; opacity: 1; }
  85%  { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
```

Son **dos animaciones sincronizadas**:

1. **`scan-reveal`** usa `clip-path: inset()` para revelar el contenido de arriba a abajo, como si bajara una persiana.
2. **`scan-line-move`** desliza un pseudo-elemento de 2px (la "línea de escaneo") de arriba a abajo. Esta línea es un `linear-gradient` que brilla en el centro y se desvanece en los bordes, más un `box-shadow` que le da el glow neon.

Ambas duran 0.5s. La línea desaparece al llegar al fondo.

### `page-glitch` — distorsión cromática al entrar

```css
.page-glitch {
  animation: glitch-in 0.4s ease-out both;
}

@keyframes glitch-in {
  0%   { opacity: 0;   transform: translate(4px, -2px);  filter: hue-rotate(90deg); }
  25%  { opacity: 0.7; transform: translate(-3px, 2px);  filter: hue-rotate(-60deg); }
  50%  { opacity: 0.5; transform: translate(2px, -1px);  filter: hue-rotate(30deg); }
  75%  { opacity: 0.9; transform: translate(-1px, 0);    filter: none; }
  100% { opacity: 1;   transform: translate(0);          filter: none; }
}
```

Combina tres propiedades animadas simultáneamente:

- **`opacity`** — el contenido aparece progresivamente.
- **`transform: translate()`** — el contenido "tiembla" desplazándose unos pixeles.
- **`filter: hue-rotate()`** — los colores cambian erráticamente simulando interferencia.

El resultado se ve como una pantalla CRT perdiendo señal y recuperándola. Este efecto se usará en Fase 3 dentro de `/projects/[slug]/template.tsx`.

---

## El `template.tsx` raíz

`src/app/template.tsx`:

```tsx
"use client";

export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-scan">{children}</div>;
}
```

Aplica el efecto `page-scan` a **todas** las páginas del sitio.

**Por qué `"use client"`.** El re-mount del template requiere que React maneje el ciclo de vida del componente en el cliente. Sin la directiva, Next.js podría intentar renderizarlo como Server Component y las animaciones de re-mount no funcionarían consistentemente.

**Regla:** los `template.tsx` que aplican animaciones CSS de entrada son Client Components.

---

## El componente `TextScramble`

Toma un texto y lo revela progresivamente sustituyendo caracteres aleatorios por los reales — como si un hacker estuviera decodificando información.

### Código completo

```tsx
"use client";

import { useEffect, useState } from "react";

type TextScrambleProps = {
  text: string;
  className?: string;
};

const SCRAMBLE_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789";

export default function TextScramble({ text, className = "" }: TextScrambleProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let frame = 0;
    const totalFrames = text.length * 3;
    let animationId: number;

    const animate = () => {
      frame++;
      const revealedCount = Math.floor((frame / totalFrames) * text.length);

      const result = text
        .split("")
        .map((char, i) => {
          if (i < revealedCount) return char;
          if (char === " ") return " ";
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join("");

      setDisplayed(result);

      if (frame < totalFrames) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [text]);

  return <span className={className} aria-label={text}>{displayed}</span>;
}
```

Análisis a continuación.

---

## Análisis: el loop con `requestAnimationFrame`

```tsx
let frame = 0;
const totalFrames = text.length * 3;
let animationId: number;

const animate = () => {
  frame++;
  const revealedCount = Math.floor((frame / totalFrames) * text.length);
  /* ...construir string y setDisplayed... */
  if (frame < totalFrames) {
    animationId = requestAnimationFrame(animate);
  }
};

animationId = requestAnimationFrame(animate);
return () => cancelAnimationFrame(animationId);
```

- **`requestAnimationFrame(callback)`** llama a `callback` justo antes del próximo repaint del navegador (típicamente 60 veces por segundo). Devuelve un ID que sirve para cancelar la llamada.
- **`totalFrames = text.length * 3`** — cada carácter tiene 3 frames de "scramble" antes de revelarse. Un texto de 8 caracteres se revela en 24 frames (~400ms a 60fps).
- **`revealedCount`** — en cada frame calcula cuántos caracteres deberían estar ya revelados. Es un progreso lineal.
- **Para cada carácter del texto**:
  - Si su índice `i < revealedCount`, se muestra el carácter real.
  - Si es un espacio, se respeta el espacio (para que las palabras no se junten).
  - Si aún no fue revelado, se muestra un carácter aleatorio de `SCRAMBLE_CHARS`.
- **El cleanup `return () => cancelAnimationFrame(animationId)`** — si el componente se desmonta mientras el loop está corriendo (por ejemplo, navegar a otra ruta), se cancela la próxima llamada y evitamos leaks.

**Regla:** cualquier `useEffect` que inicia un loop, un timer o una suscripción **debe** devolver una función de cleanup que lo cancele.

---

## Análisis: `aria-label={text}` para accesibilidad

```tsx
return <span className={className} aria-label={text}>{displayed}</span>;
```

Los lectores de pantalla reciben `text` (el original), no `displayed` (el scrambleado). Sin este atributo, un lector diría "signo exclamación arroba almohadilla" mientras la animación transcurre.

**Regla:** cuando un componente muestra texto animado o modificado, el original se expone con `aria-label`.

---

## El componente `DigitalRain`

Un canvas a pantalla completa que muestra líneas horizontales de datos hex desplazándose lentamente, con glitches esporádicos.

### Código completo (simplificado)

```tsx
"use client";

import { useEffect, useRef } from "react";

export default function DigitalRain({ opacity = 0.10 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Cada "línea" tiene: posición Y, velocidad, texto, offset horizontal,
    // tono de color, brillo, y un timer de glitch.
    // El loop de animación mueve el offset de cada línea. Cada ~2.5s
    // selecciona líneas aleatorias para un "glitch": aumenta su brillo,
    // cambia su hue y la desplaza verticalmente unos pixeles.

    let animationId: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    /* ...definir líneas, loop con requestAnimationFrame... */

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
```

---

## Análisis: por qué `<canvas>` y no divs animados

Si se dibujaran 30 líneas de texto con 100+ caracteres cada una, animadas individualmente con CSS, el navegador tendría que:

- Mantener cientos de nodos DOM.
- Recalcular layouts en cada frame.
- Crear capas de composición para cada elemento animado.

Con un canvas, hay **un solo elemento DOM**. Toda la renderización ocurre en un buffer de pixeles que la GPU dibuja directamente. Es órdenes de magnitud más eficiente para este tipo de animación.

**Regla:** cuando la animación tiene decenas de elementos o partículas independientes, se hace en canvas. CSS/DOM se reserva para animar unos pocos elementos discretos.

---

## Análisis: las clases del canvas

```tsx
<canvas
  ref={canvasRef}
  className="pointer-events-none fixed inset-0 z-0"
  style={{ opacity }}
  aria-hidden="true"
/>
```

- **`fixed inset-0`** — cubre toda la ventana y no se mueve al hacer scroll.
- **`z-0`** — queda detrás de cualquier contenido con `z-10` o superior.
- **`pointer-events-none`** — los clicks pasan a través del canvas al contenido de abajo.
- **`opacity: 0.10`** — casi transparente. El efecto es sutil, como datos corriendo en un monitor de fondo.
- **`aria-hidden="true"`** — el canvas es puramente decorativo. Los lectores de pantalla lo ignoran.

---

## Análisis: cleanup de listeners y animation frames

```tsx
return () => {
  window.removeEventListener("resize", resize);
  cancelAnimationFrame(animationId);
};
```

Dos cosas que hay que limpiar:

- **El listener de `resize`** — sin removerlo, cada navegación registra uno nuevo. En 10 navegaciones, cada `resize` dispararía 10 callbacks acumulados.
- **El animation frame** — si el canvas se desmonta a mitad de un frame programado, ese frame intentaría escribir en un canvas que ya no existe.

**Regla:** cualquier suscripción externa (listeners globales, timers, RAF, WebSockets) se limpia en el `return` del `useEffect`.

---

## Actualización del layout y el home

`src/app/layout.tsx` ahora renderiza `DigitalRain` como fondo global:

```tsx
import type { Metadata } from "next";
import { Oxanium } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import DigitalRain from "./components/effects/DigitalRain";

const oxanium = Oxanium({ /* ... */ });

export const metadata: Metadata = { title: "neonlab", description: "..." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${oxanium.className} antialiased min-h-screen flex flex-col relative`}>
        <DigitalRain />
        <Nav />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

Cambios respecto a la Fase 1:

- Se importa y renderiza `<DigitalRain />` antes del `<Nav />`.
- El `<main>` gana `relative z-10` para quedar **por encima** del canvas (que está en `z-0`).
- El body gana `relative` para establecer un contexto de stacking.

Y `src/app/page.tsx` con el hero:

```tsx
import TextScramble from "@/app/components/effects/TextScramble";

export default function Home() {
  return (
    <div className="min-h-screen px-4 py-12">
      <main className="relative z-10 mx-auto w-full max-w-3xl flex flex-col gap-8">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white">
            <TextScramble text="/neonlab" />
          </h1>
        </header>
      </main>
    </div>
  );
}
```

El widget grid del home se añade en la Fase 6; por ahora sólo aparece el título "/neonlab" decodificándose.

---

## Cómo probar la fase

```bash
npm run dev
```

Verificaciones en `http://localhost:3000`:

1. Al cargar la página, el fondo tiene una **lluvia de líneas hex tenues** desplazándose lentamente. Es sutil, casi imperceptible al principio.
2. **Cada ~2.5 segundos**, alguna línea del fondo "glitchea" (brilla más fuerte y cambia de color por un instante).
3. El título "/neonlab" **aparece con caracteres aleatorios** que se decodifican progresivamente hasta mostrar el texto real (aprox. 400ms).
4. Hacer click en `> Blog` en el nav. La URL cambia y en la nueva página **una línea neon barre la pantalla de arriba a abajo** revelando el contenido (aunque el contenido sea un 404).
5. Al volver a `/`, el efecto de scan se repite: el `template.tsx` se re-monta y la animación vuelve a ejecutarse.
6. **El DigitalRain es continuo** y no se corta al navegar: vive en el `layout.tsx`, que persiste entre navegaciones.
7. Con las DevTools abiertas y la CPU throttling activada (4x slowdown), las animaciones CSS siguen siendo suaves.

Si todos los pasos funcionan, la fase está terminada.

---

## Checklist para replicar esta fase

- [ ] `globals.css` incluye los bloques `.page-scan` con `::before`, `@keyframes scan-reveal` y `scan-line-move`.
- [ ] `globals.css` incluye `.page-glitch` con `@keyframes glitch-in`.
- [ ] `src/app/template.tsx` existe, marca `"use client"` y aplica `page-scan` al wrapper.
- [ ] `src/app/components/effects/TextScramble.tsx` es Client Component, usa `useEffect` con cleanup vía `cancelAnimationFrame`.
- [ ] `TextScramble` expone el texto original con `aria-label={text}`.
- [ ] `src/app/components/effects/DigitalRain.tsx` renderiza un `<canvas>` con `fixed inset-0 z-0 pointer-events-none`.
- [ ] `DigitalRain` limpia el listener de `resize` y el animation frame en el cleanup.
- [ ] `layout.tsx` renderiza `<DigitalRain />` dentro del body y da `relative z-10` al `<main>`.
- [ ] `page.tsx` usa `<TextScramble text="/neonlab" />` en el hero.
- [ ] Al navegar entre rutas se ve la animación scan.
- [ ] El scramble decodifica el título al cargar el home.

---

## Limitaciones y qué viene después

| No funciona | Motivo |
|---|---|
| Rutas `/projects` y `/blog` | Las carpetas siguen vacías desde la Fase 1. |
| Widgets en el home | El `WidgetList` no existe todavía. Se construye en Fase 5. |
| Transición `page-glitch` visible | La clase existe en CSS, pero ningún `template.tsx` la aplica todavía. La usará `/projects/[slug]/template.tsx` en la Fase 3. |

- **[Fase 3 — El patrón Registry: sección Projects](./03-registry-projects.md)** — construye `/projects` completo, introduce el patrón Registry y añade el `template.tsx` con `page-glitch` para las páginas dinámicas.
