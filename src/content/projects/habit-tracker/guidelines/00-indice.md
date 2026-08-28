# Habit Tracker — Guía general de construcción

Este documento describe cómo abordar la construcción del proyecto **desde cero**, manteniendo un orden que evite acumular confusión a medida que aumenta la complejidad. Cada fase resuelve un problema concreto y prepara el terreno para la siguiente.

> Los tutoriales específicos de cada fase se irán creando como archivos numerados en esta misma carpeta (`src/guidelines/`).

---

## Filosofía general

El proyecto se construye por **capas de responsabilidad**, no por componentes. En lugar de escribir un componente completo con estado, eventos, persistencia y estilos a la vez, se avanza en fases donde cada una añade una única capacidad nueva sobre la anterior.

Cada fase debe:

1. **Funcionar de forma completa** antes de pasar a la siguiente (aunque sea con datos falsos).
2. **Introducir el mínimo de conceptos nuevos** para dejar la capa terminada y sin trabajo pendiente de refactor posterior.
3. **Terminar con un checklist verificable** que garantice que se puede replicar sin ambigüedad.

> **Nota importante sobre el orden**: en un aprendizaje académico se suele introducir primero `useState` en `App` con prop drilling y **después** refactorizar a Context. En este proyecto se combinan desde el inicio (Fase 2). El motivo es práctico: hacer primero prop drilling obliga a declarar tipos de props en cada nivel intermedio y luego borrarlos, lo que ensucia el código y confunde durante el refactor. Se gana claridad introduciendo `useState` **ya dentro** del `Provider`, aunque signifique aprender dos conceptos a la vez.

---

## Requisitos previos

Antes de empezar la Fase 1, el entorno debe tener:

- **Vite + React + TypeScript** ya inicializados (`npm create vite@latest`).
- **Tailwind CSS** configurado.
- **Dependencias base**: `date-fns` y `tailwind-merge`.
- La estructura mínima de carpetas dentro de `src/`:

```
src/
├── components/       ← componentes de UI
├── context/          ← providers de context (aparece en Fase 3)
├── hooks/            ← hooks personalizados (aparece en Fase 4)
├── guidelines/       ← esta carpeta, tutoriales por fase
├── App.tsx
├── main.tsx
└── index.css
```

Las carpetas `context/` y `hooks/` no existen en las fases tempranas: se crean cuando el proyecto las necesita, no antes.

---

## Índice de tutoriales

Cada fase produce un estado del proyecto **funcional y verificable**. Si algo no funciona al terminar una fase, no se avanza a la siguiente.

### [Fase 1 — Componentes funcionales sin estado](./01-stateless-components.md)

Construcción de toda la interfaz con **datos hardcodeados**. Sin `useState`, sin eventos, sin lógica. El objetivo es fijar la estructura visual y los tipos de props.

**Se aprende:**
- Componentes funcionales tipados con TypeScript.
- Composición y extensión de props HTML nativas (`ComponentProps<"button">`).
- Sistema de variantes tipado con `switch` exhaustivo.
- Renderizado condicional y listas con `.map()`.
- Combinación de clases de Tailwind con `twMerge`.

**Resultado:** una UI estática pero pixel-perfect que se ve exactamente como el producto final.

---

### Fase 2 — Estado global desde el inicio: Context + `useState`

En vez de introducir `useState` en `App` y sufrir prop drilling para luego refactorizar, se crea directamente un `HabitProvider` que contiene el estado y las funciones modificadoras. `App` queda como puro layout desde el primer día que la app deja de ser estática.

Esta fase junta lo que en la mayoría de tutoriales aparece como dos etapas separadas (estado local → refactor a Context). El motivo está explicado en la [nota de la Filosofía general](#filosofía-general): evita reescribir tipos de props que van a existir por unas horas y luego desaparecer.

**Se aprende:**

*Bloque estado (`useState`)*
- `useState` con genéricos de TypeScript.
- Forma funcional `setState(prev => ...)` para evitar valores obsoletos.
- Inmutabilidad: nunca mutar el estado, siempre crear valores nuevos con `.map()`, `.filter()`, spread.
- Patrón toggle: modelar un booleano como presencia/ausencia en un array.
- Comparación de fechas con `isSameDay`.
- IDs estables con `crypto.randomUUID()`.

*Bloque contexto (`createContext` + hook personalizado)*
- `createContext` tipado con `null | Context` para representar el estado "aún no provisto".
- Construcción de un `Provider` que encapsula el `useState` y las funciones modificadoras (`addHabit`, `deleteHabit`, `toggleHabit`).
- Hook personalizado `useHabits` con guarda de `null` que evita revalidar en cada consumidor.
- Decisión de dónde vive cada tipo: `Habit` vive en el mismo archivo que el estado, no en el componente de UI.

**Orden sugerido dentro de la fase:**
1. Crear `HabitProvider.tsx` con la estructura vacía (`createContext`, `Provider`, `useHabits`).
2. Dentro del `Provider`, declarar el `useState<Habit[]>([])`.
3. Escribir las funciones modificadoras (`addHabit`, `deleteHabit`, `toggleHabit`) accediendo al estado local.
4. Exponer todo por el `value` del `Provider`.
5. Envolver el árbol en `App` con `<HabitProvider>`.
6. En cada componente consumidor, reemplazar los datos hardcodeados de la Fase 1 por `const { ... } = useHabits()`.

**Resultado:** la aplicación es completamente interactiva y organizada, pero **pierde todo al recargar**. `App` no gestiona lógica; cada componente pide solo lo que necesita del contexto.

---

### [Fase 3 — Persistencia con `useLocalStorage`](./03-uselocalstorage.md)

Los datos ahora **sobreviven a la recarga**. Se crea un hook genérico reutilizable que sincroniza cualquier estado de React con `localStorage`.

**Se aprende:**
- Composición de hooks: envolver `useState` + `useEffect` en un hook propio.
- Lazy initializer (`useState(() => ...)`) para no leer `localStorage` en cada render.
- Serialización correcta de objetos `Date`: `JSON.stringify` los convierte a string, y hace falta un **reviver** en `JSON.parse` para reconstruirlos.
- Tipado genérico (`<T>`) para que el hook funcione con cualquier forma de dato.
- Retorno con `as const` para que TypeScript infiera una tupla en vez de un array.

**Resultado:** los hábitos y completados persisten entre sesiones.

---

### [Fase 4 — Navegación entre semanas](./04-navegacion-semanas.md)

Se añade la capacidad de moverse hacia semanas pasadas y futuras. La fecha visible ya no es siempre "hoy", sino "hoy desplazado en semanas".

**Se aprende:**
- Estado derivado a partir de un `weekOffset` en lugar de guardar la fecha completa.
- Decidir qué estado **no** persistir: al recargar, se vuelve siempre a la semana actual.
- Uso de `addWeeks`, `isSameWeek` de `date-fns`.
- Restricciones de dominio: impedir avanzar más allá de la semana actual para no marcar días futuros.
- Fechas guardadas como **absolutas** (calendario real), no relativas al momento en que se marcaron.

**Resultado:** el usuario puede consultar y editar el historial semana por semana.

---

### [Fase 5 — Edición de hábitos](./05-edicion-habitos.md)

Cada tarjeta de hábito gana un modo edición para **renombrar** el nombre ya guardado. Se introduce por primera vez la distinción entre estado que sube al provider (el nombre real, persistido) y estado que se queda local en el componente (el borrador editable, el flag `isEditing`).

**Se aprende:**
- Cuándo el estado se queda en el componente y **no** sube al provider: si sólo un componente lo consume, no hay motivo para globalizarlo.
- Patrón "borrador" (`draftName`): editar una copia local en vez del estado global para poder cancelar sin efectos.
- `<form>` + `onSubmit` para conseguir Enter, botón submit y semántica de accesibilidad gratis; `type="button"` explícito en el resto de botones.
- `autoFocus` y `onKeyDown` con Escape para respetar convenciones de teclado.
- Renderizado condicional con ternario en JSX y `<>` (Fragment) para agrupar hijos sin nodo extra en el DOM.
- Guardas de UX vs invariantes: qué comprobaciones van en el `disabled` del botón (cosmético) y cuáles en el handler (obligatorias).

**Resultado:** los hábitos se pueden renombrar sin perder sus completados. El cambio persiste tras recargar.

---

## Fases futuras (aún no implementadas)

Estas fases están planificadas pero todavía no forman parte del código. Se documentarán cuando se implementen.

- **Fase 6 — Estadísticas**: rachas (streaks), completados por semana, gráficos.
- **Fase 7 — Múltiples usuarios / sincronización**: si en algún momento se conecta a un backend, `useLocalStorage` se reemplaza por llamadas a la API.

---

## Reglas transversales

Estas reglas aplican en todas las fases, no en una en particular:

- **Nombres explícitos**. `visibleDates` es mejor que `dates`. `weekOffset` es mejor que `offset`.
- **Tipos junto al dueño del dato**. Si el estado vive en `HabitProvider`, el tipo `Habit` también.
- **Nunca mutar**. Ni arrays, ni objetos, ni el estado directamente. Siempre `.map()`, `.filter()`, spread.
- **Un componente, una responsabilidad**. Si un componente empieza a manejar más de una cosa, se divide.
- **Sin abstracciones prematuras**. Repetir tres líneas es preferible a inventar un helper que se usará una sola vez.
- **Comentarios solo cuando el "por qué" no sea evidente**. Los buenos nombres ya explican el "qué".

---

## Cómo usar esta guía

- Si se empieza el proyecto desde cero: seguir las fases **en orden**, sin saltar.
- Si se llega a mitad del código y hay una duda puntual: ir directo al tutorial de la fase correspondiente.
- Si aparece un patrón nuevo que no encaja en ninguna fase existente: crear un archivo `NN-nombre.md` nuevo en esta carpeta y añadirlo al índice.
