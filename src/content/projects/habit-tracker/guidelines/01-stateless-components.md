# Fase 1 — Componentes funcionales sin estado (stateless)

Esta es la primera fase del proyecto. Se construye **toda la interfaz visual** con datos falsos escritos a mano. Aún no hay `useState`, ni context, ni interactividad real. El objetivo es congelar la estructura de tipos, la composición de componentes y la apariencia final antes de introducir lógica.

---

## Objetivo de la fase

Al terminar esta fase deberíamos tener:

- Una página que se ve **exactamente** igual que el producto final.
- Formulario que se puede rellenar (input controlado por el navegador), pero cuyo botón no hace nada al enviar.
- Una lista de hábitos con sus días de la semana, todos con datos inventados.
- Botones con tres variantes de estilo (primario, secundario, destructivo).
- Cero lógica de negocio. Si se recarga la página, los mismos datos falsos vuelven a aparecer.

Lo que **no** vamos a tener todavía:

- No se pueden agregar hábitos reales.
- No se pueden marcar días como completados.
- No se puede eliminar un hábito.
- Los datos no persisten porque directamente no cambian.

---

## Instalación del entorno

### 1. Andamiaje del proyecto

Se parte de un proyecto vacío creado con **Vite** en modo React + TypeScript:

```bash
npm create vite@latest habit-tracker -- --template react-ts
cd habit-tracker
npm install
```

Esto instala tres bloques básicos:

| Paquete | Para qué sirve |
|---|---|
| `react` y `react-dom` | La librería de UI. `react` define componentes; `react-dom` los pinta en el navegador. |
| `typescript` | Añade tipos al JavaScript. Permite declarar cómo debe ser cada dato y detectar errores antes de ejecutar. |
| `vite` | Servidor de desarrollo y bundler. Corre `npm run dev` y refresca el navegador al guardar. |

### 2. Tailwind CSS 4

En Tailwind 4 la configuración vive dentro del CSS, no en un `tailwind.config.js`.

```bash
npm install tailwindcss @tailwindcss/vite
```

Después hay que registrarlo en `vite.config.ts` y activarlo en `src/index.css`:

```css
/* src/index.css */
@import "tailwindcss";

body {
  background-color: var(--color-zinc-900);
  color: var(--color-zinc-100);
}
```

`@import "tailwindcss"` es lo único que hace falta para que todas las clases utilitarias (`bg-violet-600`, `flex`, `rounded-lg`, etc.) estén disponibles.

### 3. Dependencias de dominio

```bash
npm install date-fns tailwind-merge
```

- **`date-fns`**: manipulación de fechas sin instalar Moment.js. Cada función se importa por separado (`import { format } from "date-fns"`), lo que mantiene el bundle pequeño. En esta fase usamos:
  - `startOfWeek` / `endOfWeek` para calcular los límites de la semana.
  - `eachDayOfInterval` para obtener el array de 7 días.
  - `format` para mostrar `"Lun"` o `"27"`.
  - `isFuture` para deshabilitar los botones de días que aún no llegan.

- **`tailwind-merge`**: fusiona clases de Tailwind resolviendo conflictos. Sin esta librería, si un componente ya tiene `bg-violet-600` y le pasás `className="bg-red-500"` desde fuera, ambas clases terminan en el DOM y el navegador decide por orden de importación (imprevisible). `twMerge` garantiza que la última gana.

### 4. Estructura de carpetas al final de la fase

```
habit-tracker/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Header.tsx
│   │   ├── HabitForm.tsx
│   │   └── HabitList.tsx
│   ├── guidelines/       ← esta carpeta con los tutoriales
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.ts
```

**Todavía no existen** las carpetas `context/` ni `hooks/`. Se crearán en fases siguientes.

---

## El modelo de datos

En esta fase todo el modelo cabe en un único tipo: `Habit`.

```tsx
type Habit = {
  id: string;
  name: string;
  completions: Date[];
};
```

Cada campo es un tipo primitivo o una colección:

| Campo | Tipo | Qué es en memoria |
|---|---|---|
| `id` | `string` | Cadena de texto. En fases futuras será un UUID v4 tipo `"550e8400-e29b-41d4-a716-446655440000"`. En Fase 1 basta con `"1"`, `"2"`, `"3"`. |
| `name` | `string` | Cadena de texto con el nombre visible del hábito. |
| `completions` | `Date[]` | **Array de objetos `Date`**. Cada elemento es una fecha concreta del calendario en la que el hábito fue marcado. Un array vacío `[]` significa "nunca se completó". |

Un hábito, en memoria, se ve así:

```
{
  id:          "1"                              ← string
  name:        "Leer"                           ← string
  completions: [ Date(2026-07-27), Date(2026-07-29) ]   ← array de 2 objetos Date
}
```

Y una lista de hábitos es un **array de objetos Habit**:

```
habits = [
  { id: "1", name: "Leer",   completions: [ Date(2026-07-27) ] },
  { id: "2", name: "Correr", completions: [] },
  { id: "3", name: "Meditar", completions: [ Date(2026-07-28), Date(2026-07-29) ] },
]
```

En Fase 1 este array se escribe **a mano** dentro del componente que lo consume. No hay `useState`, no hay context, no hay `localStorage`. Es una constante.

---

## Los 7 días visibles de la semana

Además de la lista de hábitos, la UI necesita mostrar los 7 días de la semana actual. Esto se calcula con `date-fns`:

```tsx
import { eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";

const visibleDates = eachDayOfInterval({
  start: startOfWeek(new Date(), { weekStartsOn: 1 }),
  end:   endOfWeek(new Date(),   { weekStartsOn: 1 }),
});
```

**Análisis línea por línea:**

- `new Date()` devuelve un objeto `Date` con **el instante actual** (fecha y hora).
- `startOfWeek(fecha, { weekStartsOn: 1 })` devuelve un `Date` correspondiente al **lunes** de esa semana a las 00:00. `weekStartsOn: 1` significa lunes; `0` sería domingo.
- `endOfWeek(...)` es lo mismo pero para el **domingo** a las 23:59.
- `eachDayOfInterval({ start, end })` devuelve un **array de `Date`** con un elemento por cada día del intervalo.

El resultado `visibleDates` es de tipo `Date[]` y en memoria contiene siete objetos:

```
visibleDates = [
  Date(2026-07-27 lunes),
  Date(2026-07-28 martes),
  Date(2026-07-29 miércoles),
  Date(2026-07-30 jueves),
  Date(2026-07-31 viernes),
  Date(2026-08-01 sábado),
  Date(2026-08-02 domingo),
]
```

En Fase 1 esta variable se declara **directamente dentro del componente que la usa** (`HabitList`). No se pasa como prop y no se almacena en ningún estado.

---

## Componente Button

`Button` es el primer componente que se construye porque el resto lo usa. Vive en `src/components/Button.tsx`.

### Tipos

```tsx
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type Variant = "primary" | "secondary" | "ghost-destructive";

type ButtonProps = {
  variant?: Variant;
} & ComponentProps<"button">;
```

**`Variant`** es un **tipo de unión de literales de string**. Sólo hay tres valores posibles:

```
"primary" | "secondary" | "ghost-destructive"
```

Cualquier otro string es rechazado por TypeScript en tiempo de edición.

**`ButtonProps`** es una **intersección de tipos** (con `&`):

- La parte izquierda declara nuestra prop personalizada `variant` (opcional, indicada con `?`).
- La parte derecha `ComponentProps<"button">` **hereda automáticamente** todas las props nativas de un `<button>` HTML: `onClick`, `disabled`, `type`, `className`, `children`, etc.

El resultado en memoria es un tipo con esta forma aproximada:

```
ButtonProps = {
  variant?: "primary" | "secondary" | "ghost-destructive",
  onClick?: (event) => void,
  disabled?: boolean,
  type?: "button" | "submit" | "reset",
  className?: string,
  children?: ReactNode,
  ... (todas las demás props HTML del botón)
}
```

### Implementación

```tsx
export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={twMerge(
        "transition-colors rounded px-2 py-1 disabled:opacity-30 disabled:cursor-not-allowed",
        getVariantStyles(variant),
        className,
      )}
    />
  );
}
```

Puntos clave:

- **`variant = "primary"`**: valor por defecto. Si no se pasa la prop, se asume `"primary"`.
- **`...props`**: recoge el resto de props (todas las nativas). Se reenvían al `<button>` con `{...props}`.
- **`twMerge(...)`**: combina tres bloques de clases:
  1. Base — se aplica siempre.
  2. `getVariantStyles(variant)` — clases específicas de la variante.
  3. `className` — clases externas que sobreescriben lo anterior.

### El switch tipado

```tsx
function getVariantStyles(variant: Variant) {
  switch (variant) {
    case "primary":
      return "bg-violet-600 hover:bg-violet-400";
    case "secondary":
      return "bg-zinc-700 hover:bg-zinc-600 text-zinc-400";
    case "ghost-destructive":
      return "hover:bg-red-800 text-red-400 hover:text-red-200";
    default:
      throw new Error(`Invalid variant: ${variant satisfies never}`);
  }
}
```

El **`satisfies never`** en el default es una comprobación de exhaustividad. Si mañana añadimos `"warning"` al tipo `Variant` pero olvidamos el `case` correspondiente, TypeScript falla en compilación porque `variant` en la rama `default` ya no sería `never`.

---

## Componente Header

Vive en `src/components/Header.tsx`. En Fase 1 muestra el título, un contador falso y los botones de navegación (que aún no hacen nada).

```tsx
import { Button } from "./Button";

export function Header() {
  // Datos falsos para Fase 1:
  const doneToday = 2;
  const totalHabits = 3;
  const rangeText = "Jul 27 - Aug 2";

  return (
    <header className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Habit Tracker</h1>
        <span className="text-zinc-400 text-sm">
          {doneToday} / {totalHabits} done today
        </span>
      </div>
      <div className="flex flex-col gap-1 items-end">
        <span className="text-zinc-400 text-sm">{rangeText}</span>
        <div className="flex items-center gap-3">
          <Button>Prev</Button>
          <Button disabled>Sig</Button>
        </div>
      </div>
    </header>
  );
}
```

**Tipos de las variables locales:**

| Variable | Tipo | Nota |
|---|---|---|
| `doneToday` | `number` | Entero inventado. |
| `totalHabits` | `number` | Entero inventado. |
| `rangeText` | `string` | Rango de fechas como texto plano. |

En fases siguientes estas tres variables se derivarán del estado real (contando completados y calculando el rango con `format`).

---

## Componente HabitForm

Vive en `src/components/HabitForm.tsx`. En Fase 1 el formulario **acepta texto** pero al enviar no hace nada. El input está controlado por el navegador porque no le damos `value` ni `onChange`: es un input HTML plano.

```tsx
import { Button } from "./Button";

export function HabitForm() {
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        placeholder="Habito nuevo"
      />
      <Button className="rounded-lg px-4 py-2 font-medium">
        Agregar habito
      </Button>
    </form>
  );
}
```

**Detalle importante:** el `onSubmit={(e) => e.preventDefault()}` evita que el navegador recargue la página al hacer submit. Si no lo pusiéramos, al pulsar "Agregar habito" el navegador intentaría enviar el formulario a una URL y la aplicación se reiniciaría desde cero.

En fases siguientes este componente pasará a controlar su input con `useState` y llamará a `addHabit(name)` en el submit.

---

## Componente HabitList

Vive en `src/components/HabitList.tsx` y contiene dos cosas: el propio `HabitList` y un subcomponente `HabitItem` en el mismo archivo.

### Datos hardcodeados dentro del componente

```tsx
import { Button } from "./Button";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isFuture,
  isSameDay,
  startOfWeek,
} from "date-fns";

type Habit = {
  id: string;
  name: string;
  completions: Date[];
};

const habits: Habit[] = [
  {
    id: "1",
    name: "Leer",
    completions: [new Date(2026, 6, 27), new Date(2026, 6, 29)],
  },
  {
    id: "2",
    name: "Correr",
    completions: [],
  },
  {
    id: "3",
    name: "Meditar",
    completions: [new Date(2026, 6, 28)],
  },
];
```

**Sobre `new Date(2026, 6, 27)`**:
- Los meses en `Date` van de `0` a `11`. `6` es **julio** (no junio).
- Los días sí van de `1` a `31`.
- Sin argumentos de hora, se asume medianoche local.

**Estado de `habits` en memoria**, tal como lo vería el motor de JavaScript:

```
habits = [
  {
    id: "1",
    name: "Leer",
    completions: [ Date(2026-07-27), Date(2026-07-29) ]
  },
  {
    id: "2",
    name: "Correr",
    completions: []
  },
  {
    id: "3",
    name: "Meditar",
    completions: [ Date(2026-07-28) ]
  },
]
```

Cada objeto ocupa un espacio propio en memoria; el array almacena referencias a ellos.

### El componente HabitList

```tsx
export function HabitList() {
  const visibleDates = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end:   endOfWeek(new Date(),   { weekStartsOn: 1 }),
  });

  if (habits.length === 0) {
    return <h1>Aun no hay habitos registrados. Agrega uno para empezar!</h1>;
  }

  return (
    <div className="flex flex-col gap-3">
      {habits.map((habit) => (
        <HabitItem key={habit.id} habit={habit} visibleDates={visibleDates} />
      ))}
    </div>
  );
}
```

Puntos clave:

- **`visibleDates`** es una constante local. Se recalcula en cada render, pero como el componente sólo se renderiza una vez (no hay estado que cambie), en la práctica se ejecuta una sola vez.
- **Render condicional**: si `habits.length === 0`, se devuelve un mensaje y no se llega al `return` principal. En Fase 1 esta rama no se ejecuta nunca porque `habits` tiene tres elementos hardcodeados, pero la dejamos preparada.
- **`.map()`** transforma cada `habit` del array en un elemento JSX. React necesita **una `key` única y estable** por elemento; usamos `habit.id`.

### El subcomponente HabitItem

```tsx
type HabitItemProps = {
  habit: Habit;
  visibleDates: Date[];
};

function HabitItem({ habit, visibleDates }: HabitItemProps) {
  return (
    <div className="rounded-xl bg-zinc-800 p-4 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="font-medium">{habit.name}</span>
        <Button variant="ghost-destructive" className="text-sm">
          Eliminar
        </Button>
      </div>
      <div className="flex gap-1.5">
        {visibleDates.map((date) => (
          <Button
            className="flex flex-1 flex-col items-center gap-0.5 rounded-lg text-xs"
            key={date.toISOString()}
            disabled={isFuture(date)}
            variant={
              habit.completions.some((c) => isSameDay(date, c))
                ? "primary"
                : "secondary"
            }
          >
            <span className="font-medium">{format(date, "EEE")}</span>
            <span className="font-medium">{format(date, "d")}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
```

Análisis:

| Elemento | Explicación |
|---|---|
| `habit.completions.some((c) => isSameDay(date, c))` | Devuelve `true` si el hábito ya tiene ese día marcado. `some` recorre el array y para en cuanto encuentra un match. |
| `isSameDay(date, c)` | Compara **sólo la parte del día**, ignorando hora, minutos y milisegundos. Sin esto, dos `Date` del mismo día pero diferente hora se considerarían distintos. |
| `isFuture(date)` | `true` si `date` es posterior a `new Date()` (el instante en que se renderiza). |
| `format(date, "EEE")` | Devuelve el string abreviado del día (`"Mon"`, `"Tue"`, etc.). |
| `format(date, "d")` | Devuelve el número del día (`"27"`, `"28"`, etc.). |
| `key={date.toISOString()}` | Cada `Date` se convierte a un string único (`"2026-07-27T00:00:00.000Z"`) que sirve como key. |

**Nota sobre la key**: aquí `date.toISOString()` es estable porque los siete `Date` del array `visibleDates` no cambian durante el render. Usar el índice (`key={index}`) también funcionaría **en esta fase** porque el array no se reordena, pero por convención evitamos índices para no acostumbrarnos.

---

## Composición final en App

`src/App.tsx` es el punto donde se ensamblan los componentes. En Fase 1 no gestiona ni estado ni contexto: sólo compone.

```tsx
import { Header } from "./components/Header";
import { HabitForm } from "./components/HabitForm";
import { HabitList } from "./components/HabitList";

export default function App() {
  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
      <Header />
      <HabitForm />
      <HabitList />
    </div>
  );
}
```

Y `src/main.tsx` monta la aplicación en el DOM:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

**Qué hace cada línea:**

- `document.getElementById("root")!` obtiene el `<div id="root">` de `index.html`. El `!` le dice a TypeScript "confío en que existe, no me pidas manejar el `null`".
- `createRoot(...).render(...)` conecta React con ese nodo del DOM.
- `<StrictMode>` es un modo de desarrollo que hace doble render intencionadamente para exponer efectos secundarios mal escritos. No afecta al build de producción.

---

## Cómo probar la fase

```bash
npm run dev
```

Abrimos `http://localhost:5173` (o el puerto que Vite indique). Deberíamos ver:

1. **Header** con "Habit Tracker", "2 / 3 done today", el rango "Jul 27 - Aug 2" y dos botones ("Prev" y "Sig" deshabilitado).
2. **HabitForm** con un input de texto que se puede rellenar y un botón "Agregar habito" que **no hace nada** al hacer click.
3. **HabitList** con tres tarjetas (Leer, Correr, Meditar). Cada tarjeta muestra 7 botones (Lun a Dom) donde:
   - Los días marcados en `completions` aparecen en violeta (variante `primary`).
   - Los no marcados aparecen en gris (variante `secondary`).
   - Los días futuros aparecen deshabilitados (`opacity-30`, `cursor-not-allowed`).
4. Al hacer click en cualquier botón de día, **no ocurre nada** — todavía no hay handler.

Si todo esto se ve correcto, la fase está terminada.

---

## Checklist para replicar esta fase

- [ ] Proyecto creado con `npm create vite@latest ... -- --template react-ts`.
- [ ] Tailwind 4 instalado y activado con `@import "tailwindcss"` en `index.css`.
- [ ] Dependencias `date-fns` y `tailwind-merge` instaladas.
- [ ] Carpeta `src/components/` con `Button.tsx`, `Header.tsx`, `HabitForm.tsx`, `HabitList.tsx`.
- [ ] Componente `Button` con tipo `Variant`, `ComponentProps<"button">` y `twMerge`.
- [ ] `getVariantStyles` con `default: throw new Error(... satisfies never)`.
- [ ] `HabitList` con array `habits` hardcodeado de al menos 2 hábitos.
- [ ] `HabitList` calcula `visibleDates` con `eachDayOfInterval` + `startOfWeek` + `endOfWeek`.
- [ ] `HabitItem` recibe `habit` y `visibleDates` como props tipadas.
- [ ] Cada botón de día muestra el nombre abreviado y el número, y se deshabilita si es futuro.
- [ ] `App.tsx` compone `Header`, `HabitForm`, `HabitList` en ese orden.
- [ ] `npm run dev` levanta la aplicación y se ve como el producto final.

---

## Limitaciones y qué viene después

Lo que **no** funciona todavía y por qué:

| No funciona | Motivo |
|---|---|
| Agregar un hábito nuevo | El `<input>` no está controlado por React y no hay ningún mecanismo para mutar el array `habits`. |
| Marcar un día como completado | Los botones no tienen `onClick`. Aunque lo tuvieran, `habits` está declarado con `const` fuera de cualquier hook: React no re-renderizaría al modificarlo. |
| Eliminar un hábito | Mismo motivo que arriba. |
| Navegar a la semana pasada | `visibleDates` siempre se calcula desde `new Date()`. No hay noción de "semana visible" separada de "hoy". |
| Persistir datos al recargar | Los datos son literales en el código, no en `localStorage` ni en un servidor. |

Todo esto se resuelve en la **[Fase 2 — Estado global desde el inicio: Context + `useState`](./02-context-y-estado.md)** *(pendiente de escribir)*, donde:

- El array `habits` se mueve a un `useState` dentro de un `HabitProvider`.
- Los componentes dejan de tener datos hardcodeados y consumen el contexto con `useHabits()`.
- Aparecen las funciones `addHabit`, `deleteHabit`, `toggleHabit` que mutan el estado de forma inmutable.
