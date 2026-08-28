# Fase 5 — Edición de hábitos

Esta fase añade **renombrar** un hábito ya creado. Sobre lo que dejó la [Fase 4](./04-navegacion-semanas.md), aparecen dos cosas nuevas: una función `renameHabit` en el provider y un **modo edición** dentro de cada `HabitItem` que reemplaza el nombre por un input controlado. La lección pedagógica es distinguir con claridad **qué estado sube al provider** (los datos que sobreviven a la sesión) y **qué estado se queda local** (la UI transitoria: "estoy editando", "el borrador dice X").

---

## Objetivo de la fase

Al terminar la Fase 5 la app debe:

- Mostrar un botón "Editar" en cada tarjeta de hábito, junto al botón "Eliminar".
- Al pulsar "Editar", sustituir el nombre por un input pre-rellenado con el nombre actual y dos botones: "Guardar" y "Cancelar".
- Guardar el nombre nuevo al pulsar "Guardar" o pulsar Enter dentro del input.
- Cancelar la edición sin efectos al pulsar "Cancelar" o la tecla Escape.
- Impedir guardar si el nombre está vacío, es sólo espacios, o coincide con el nombre actual.
- Persistir el cambio (heredado de la [Fase 3](./03-uselocalstorage.md): al recargar, el nuevo nombre sigue ahí).

Lo que **no** vamos a tener todavía:

- No hay confirmación antes de perder cambios: si el usuario navega a otra semana con el input abierto, la edición se pierde. En la práctica no ocurre porque el input está dentro de una tarjeta que no depende de la semana visible, pero el patrón sigue siendo "ganan los últimos cambios explícitos".
- No hay historial ni deshacer: renombrar es una operación destructiva sobre el nombre anterior.
- No hay validación de nombres únicos: dos hábitos pueden llamarse igual. En un tracker personal no es un problema real.

---

## Estructura de carpetas al final de la fase

**Ninguna carpeta nueva.** Los cambios son internos a archivos que ya existen.

```
src/
├── components/
│   ├── Button.tsx        ← sin cambios respecto a Fase 4
│   ├── Header.tsx        ← sin cambios
│   ├── HabitForm.tsx     ← sin cambios
│   └── HabitList.tsx     ← HabitItem gana modo edición con estado local
├── context/
│   └── HabitProvider.tsx ← se añade renameHabit al contexto
├── hooks/
│   └── useLocalStorage.ts ← sin cambios
├── guidelines/
├── App.tsx               ← sin cambios
├── main.tsx              ← sin cambios
└── index.css             ← sin cambios
```

Como en la Fase 4, la fase es corta en superficie pero introduce una decisión importante: **dónde vive el estado de "estoy editando"**. Se responde antes de tocar código.

---

## ¿Dónde vive el estado de edición?

Cuando el usuario pulsa "Editar" en la tarjeta de "Leer", aparecen dos cosas nuevas que no estaban antes:

- **`isEditing`** — un booleano que dice si esta tarjeta está en modo edición.
- **`draftName`** — el texto que se está escribiendo en el input, pendiente de confirmar.

Dos opciones para guardarlas:

| Opción | Dónde | Consecuencia |
|---|---|---|
| A | En el `HabitProvider` | Se comparten globalmente. Cualquier componente puede saber qué hábito se está editando. |
| B | En el `HabitItem` (`useState` local) | Cada tarjeta gestiona su propio modo edición. El provider no se entera. |

**Elegimos B.** Motivos:

- El único componente que necesita saber si "Leer" está en modo edición es la propia tarjeta de "Leer". Ningún otro consumidor del contexto lo usa.
- Subirlo al provider implicaría añadir dos campos al tipo `Context` (`editingId`, `draftName`) y dos setters, y guardar en `localStorage` estados que **no** queremos persistir (un input a medio escribir no debe sobrevivir a la recarga).
- Con `useState` local, cerrar la pestaña o recargar cancela la edición automáticamente sin código extra.

**Regla general:** el estado sube al ancestro común **de todos los componentes que lo necesitan**. Si un componente es el único consumidor, el estado se queda local. Es el mismo principio que aplicamos con `weekOffset` en la [Fase 4](./04-navegacion-semanas.md#idea-general-weekoffset-como-estado-derivable), sólo que aquí "no persistir" no basta: además, **nadie más lo pide**.

---

## Idea del patrón "borrador"

El input no edita directamente `habit.name`. Edita una copia local llamada `draftName`. Sólo cuando el usuario confirma con "Guardar" (o Enter) se llama a `renameHabit(habit.id, draftName)` y el nombre real cambia.

```
habit.name  →  fuente de verdad global (provider + localStorage)
draftName   →  copia editable local durante la sesión de edición
```

Ventajas:

- **Cancelar es gratis.** `cancelEditing()` sólo pone `isEditing = false`. `habit.name` nunca se tocó.
- **Se pueden imponer reglas antes de confirmar.** El botón "Guardar" se deshabilita si el borrador está vacío o coincide con el nombre actual.
- **No hay parpadeos.** Sin borrador, cada tecla dispararía un `renameHabit` que actualizaría el provider y provocaría un re-render con el input desincronizado.

Este patrón aparece con nombres distintos en libros y frameworks —"draft state", "form state", "uncommitted changes"— pero la idea es la misma: **separar el estado que se está editando del estado ya comprometido**.

**Regla:** si el usuario puede cancelar la edición, se edita en un borrador local, no en el estado global.

---

## Cambio en `HabitProvider`

Se añade una función corta y se expone en el `value`:

```tsx
type Context = {
  habits: Habit[];
  addHabit: (name: string) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string, date: Date) => void;
  renameHabit: (id: string, name: string) => void;   // ← nuevo
  visibleDates: Date[];
  isCurrentWeek: boolean;
  nextWeek: () => void;
  prevWeek: () => void;
};

// ... dentro de HabitProvider:

function renameHabit(id: string, name: string) {
  setHabits((prev) =>
    prev.map((h) => (h.id === id ? { ...h, name } : h)),
  );
}
```

Y en el `value` del `<HabitContext>`:

```tsx
<HabitContext
  value={{
    habits,
    addHabit,
    toggleHabit,
    deleteHabit,
    renameHabit,   // ← nuevo
    visibleDates,
    isCurrentWeek,
    nextWeek,
    prevWeek,
  }}
>
```

Nada más cambia en este archivo.

### Análisis: `renameHabit`

```tsx
function renameHabit(id: string, name: string) {
  setHabits((prev) =>
    prev.map((h) => (h.id === id ? { ...h, name } : h)),
  );
}
```

Es el mismo patrón que `toggleHabit`, pero más simple:

- **`setHabits((prev) => ...)`** — forma funcional, como todas las modificadoras. Regla vigente desde la [Fase 2](./02-context-y-estado.md#análisis-la-forma-funcional-setstateprev--).
- **`prev.map(...)`** — construye un array nuevo. Los hábitos que **no** son el editado se devuelven tal cual (`return h` implícito por el ternario), así que React sólo detecta cambio en la referencia del hábito modificado.
- **`{ ...h, name }`** — spread + override. Copia todas las claves de `h` (`id`, `completions`) y sobrescribe `name` con el nuevo valor. Es la técnica estándar aprendida en la [Fase 2](./02-context-y-estado.md#copia-parcial-h-completions).

`{ ...h, name }` es azúcar sintáctica para `{ ...h, name: name }`: JavaScript permite omitir el valor cuando coincide con el nombre de la clave. Es una convención muy habitual.

**¿Y si el `id` no existe?** `.map()` recorre todo el array sin encontrar coincidencia y devuelve una copia idéntica al original. `setHabits` recibe una referencia nueva pero con el mismo contenido — React re-renderiza y no cambia nada visible. Igual que con `deleteHabit`: la función tolera un `id` inexistente en vez de fallar.

---

## Código completo del `HabitItem` con modo edición

`src/components/HabitList.tsx` — el archivo entero, incluyendo el modo edición:

```tsx
import { Button } from "./Button";
import { format, isFuture, isSameDay, subDays } from "date-fns";
import { useHabits, type Habit } from "../context/HabitProvider";
import { useState } from "react";

type HabitItemProps = {
  habit: Habit;
  visibleDates: Date[];
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string, date: Date) => void;
  renameHabit: (id: string, name: string) => void;
};

export function HabitList() {
  const { habits, deleteHabit, toggleHabit, renameHabit, visibleDates } =
    useHabits();

  if (habits.length === 0) {
    return <h1>Aun no hay habitos registrados. Agrega uno para empezar!</h1>;
  }

  return (
    <div className="flex flex-col gap-3">
      {habits.map((habit) => (
        <HabitItem
          deleteHabit={deleteHabit}
          key={habit.id}
          habit={habit}
          toggleHabit={toggleHabit}
          renameHabit={renameHabit}
          visibleDates={visibleDates}
        />
      ))}
    </div>
  );
}

function HabitItem({
  habit,
  visibleDates,
  deleteHabit,
  toggleHabit,
  renameHabit,
}: HabitItemProps) {
  const streak = getStreak(habit.completions);
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(habit.name);

  function startEditing() {
    setDraftName(habit.name);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = draftName.trim();
    if (trimmed === "") return;
    renameHabit(habit.id, trimmed);
    setIsEditing(false);
  }

  return (
    <div className="rounded-xl bg-zinc-800 p-4 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex flex-1 gap-2">
            <input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") cancelEditing();
              }}
              className="flex-1 rounded-lg bg-zinc-700 px-3 py-1 outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            />
            <Button
              type="submit"
              disabled={
                draftName.trim() === "" || draftName.trim() === habit.name
              }
              className="text-sm"
            >
              Guardar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={cancelEditing}
              className="text-sm"
            >
              Cancelar
            </Button>
          </form>
        ) : (
          <>
            <div className="flex gap-3 items-center">
              <span className="font-medium">{habit.name}</span>
              {streak !== 0 && (
                <span className="text-sm text-amber-400"> 🔥{streak}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={startEditing}
                variant="secondary"
                className="text-sm"
              >
                Editar
              </Button>
              <Button
                onClick={() => deleteHabit(habit.id)}
                variant="ghost-destructive"
                className="text-sm"
              >
                Eliminar
              </Button>
            </div>
          </>
        )}
      </div>
      <div className="flex gap-1.5">
        {visibleDates.map((date) => (
          <Button
            className="flex flex-1 flex-col items-center gap-0.5 rounded-lg text-xs"
            key={date.toISOString()}
            disabled={isFuture(date)}
            onClick={() => toggleHabit(habit.id, date)}
            variant={
              habit.completions.some((d) => isSameDay(date, d))
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

function getStreak(completions: Date[]) {
  let streak = 0;
  let date = new Date();
  while (completions.some((c) => isSameDay(c, date))) {
    streak++;
    date = subDays(date, 1);
  }
  return streak;
}
```

Análisis pieza por pieza a continuación.

---

## Análisis: dos `useState` locales

```tsx
const [isEditing, setIsEditing] = useState(false);
const [draftName, setDraftName] = useState(habit.name);
```

- **`isEditing`** empieza en `false`: cada tarjeta arranca en modo "sólo lectura".
- **`draftName`** empieza con el nombre actual del hábito. Así, cuando se entra en modo edición, el input aparece pre-rellenado sin un render intermedio vacío.

Ambos son locales al `HabitItem`. Al no vivir en el provider ni en `localStorage`, se garantiza que:

- Sólo la tarjeta que se está editando conoce su estado.
- Al recargar, siempre se arranca fuera del modo edición.
- Si el usuario borra el hábito mientras lo edita, React desmonta el `HabitItem` y ambos estados desaparecen sin necesidad de limpieza manual.

### Detalle sutil: el valor inicial de `useState` sólo se usa una vez

`useState(habit.name)` no significa "cada vez que `habit.name` cambie, actualiza `draftName`". Significa "en el primer render de esta tarjeta, arranca `draftName` con `habit.name`". A partir de ahí, `draftName` vive vida propia.

En la práctica funciona bien porque:

- **Antes de entrar en edición**, `draftName` está desincronizado, pero no se muestra (el modo lectura muestra `habit.name`).
- **Al pulsar "Editar"**, `startEditing` hace `setDraftName(habit.name)` explícitamente para volver a sincronizar el borrador con el nombre actual. Sin esta línea, si el hábito se renombra desde otro sitio, al abrir la edición aparecería el nombre antiguo.

Este es el motivo de que `startEditing` haga dos cosas y no una:

```tsx
function startEditing() {
  setDraftName(habit.name);   // resincroniza el borrador
  setIsEditing(true);         // abre el modo edición
}
```

---

## Análisis: `<form>` alrededor del input

```tsx
<form onSubmit={handleSubmit} className="flex flex-1 gap-2">
  <input ... />
  <Button type="submit">Guardar</Button>
  <Button type="button" ...>Cancelar</Button>
</form>
```

Envolver el input en un `<form>` **con `onSubmit`** da tres cosas gratis:

- **Enter dentro del input dispara el submit.** El navegador lo hace por sí solo; no hace falta un `onKeyDown` para detectarlo.
- **Semántica de accesibilidad.** Los lectores de pantalla anuncian el input como parte de un formulario.
- **Un único handler** (`handleSubmit`) para todos los caminos de confirmación.

El detalle importante es marcar el botón "Cancelar" con `type="button"`. Sin esa marca, sería `type="submit"` por defecto (los `<button>` dentro de un `<form>` son submit implícitamente) y **pulsar "Cancelar" dispararía `handleSubmit`**, guardando cuando queríamos cancelar. Es un bug clásico.

**Regla:** dentro de un `<form>`, sólo el botón que confirma es `type="submit"`. Todos los demás llevan `type="button"` explícitamente.

---

## Análisis: `handleSubmit` y sus dos guardas

```tsx
function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const trimmed = draftName.trim();
  if (trimmed === "") return;
  renameHabit(habit.id, trimmed);
  setIsEditing(false);
}
```

- **`e.preventDefault()`** — como en `HabitForm` (Fase 2), evita la recarga de página que dispararía el submit HTML nativo.
- **`draftName.trim()`** — se guarda el nombre sin espacios sobrantes. `"  Leer  "` acaba como `"Leer"` en el estado. Es una limpieza silenciosa: al usuario no se le muestra el nombre recortado, se le guarda ya recortado.
- **`if (trimmed === "") return;`** — si el input está vacío o son sólo espacios, no se llama a `renameHabit`. El botón "Guardar" ya está `disabled` en ese caso, pero la guarda vale también para Enter, que puede dispararse sin pasar por el botón.
- **`renameHabit(habit.id, trimmed)`** — se llama con el nombre limpio.
- **`setIsEditing(false)`** — se cierra el modo edición. Como el hábito acaba de renombrarse, el próximo render mostrará `<span>{habit.name}</span>` con el nombre nuevo.

Notar que **`draftName` no se resetea**. No hace falta: `startEditing` lo resincroniza en la próxima apertura. Dejarlo con el último valor tampoco molesta, porque el input no se muestra fuera del modo edición.

---

## Análisis: el `disabled` doble del botón "Guardar"

```tsx
<Button
  type="submit"
  disabled={
    draftName.trim() === "" || draftName.trim() === habit.name
  }
>
  Guardar
</Button>
```

Dos motivos para deshabilitar:

1. **`draftName.trim() === ""`** — nombre vacío. Guardar `""` como nombre no aporta nada y rompería la UI (una tarjeta sin nombre).
2. **`draftName.trim() === habit.name`** — el nombre no cambió respecto al original. Guardar aquí es un no-op: llamaría a `renameHabit`, provocaría un re-render y dejaría el estado igual. Deshabilitar comunica al usuario "no hay nada que guardar" sin producir efectos invisibles.

La segunda guarda **no** está en `handleSubmit`. Si el usuario pulsa Enter con el nombre igual al original, Enter no dispara nada porque el submit lo intercepta un `<button type="submit" disabled>` en el DOM. Y aunque el navegador dispare el submit sin pulsar el botón, no pasaría nada grave: `renameHabit(habit.id, habit.name)` produce el mismo estado. Aquí la guarda es sólo cosmética.

**Diferencia con `handleSubmit`:** la guarda de "vacío" **sí** está en el handler porque es una invariante que no debe romperse. La guarda de "no cambió" es un pulido de UX que puede vivir sólo en el `disabled`.

---

## Análisis: `autoFocus` y Escape para cancelar

```tsx
<input
  autoFocus
  value={draftName}
  onChange={(e) => setDraftName(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Escape") cancelEditing();
  }}
  ...
/>
```

- **`autoFocus`** hace que el input reciba el foco automáticamente al montarse. Al pulsar "Editar", el cursor está listo dentro del campo sin un click adicional. Se usa con moderación (uno por página, idealmente) porque puede desconcertar si no se espera. Aquí es correcto: el modo edición es efímero y la única acción esperada es escribir.
- **`onKeyDown` con `e.key === "Escape"`** — captura la tecla Escape para cancelar. Es una convención muy fuerte en aplicaciones de escritorio: Enter confirma, Escape cancela. Cumplirla es gratis y hace la app sentir "nativa".

Se usa `onKeyDown`, no `onKeyPress` (obsoleto) ni `onKeyUp`. La razón práctica: `keydown` dispara antes de que el navegador procese la tecla, permite `preventDefault` si algún día hace falta, y captura todas las teclas por igual (incluidas las especiales que `keypress` ignoraba).

---

## Análisis: renderizado condicional con `? :` y `<>`

```tsx
{isEditing ? (
  <form>...</form>
) : (
  <>
    <div>...</div>
    <div>...</div>
  </>
)}
```

Dos patrones que aparecen por primera vez juntos:

- **Ternario en JSX** — `{condición ? A : B}` es la forma habitual de renderizar dos ramas mutuamente excluyentes. Cuando ambas ramas son piezas de JSX no triviales, se envuelven en paréntesis para que Prettier las formatee bien.
- **Fragment `<>...</>`** — la rama "modo lectura" tiene **dos hijos** (nombre + acciones). JSX obliga a que cada expresión devuelva un único nodo raíz. Un `<div>` extra distorsionaría el layout de flexbox del contenedor. `<>...</>` es la sintaxis corta de `<React.Fragment>...</React.Fragment>`: agrupa hijos sin generar ningún nodo en el DOM.

Sin el fragment habría dos alternativas: envolver en un `<div>` (rompe el layout) o mover las acciones a un componente aparte (abstracción prematura para dos JSX cortos). El fragment resuelve el problema sin ninguna de las dos desventajas.

---

## Ciclo de una interacción: renombrar "Leer" por "Leer 30 min"

Para consolidar el flujo completo:

1. La tarjeta "Leer" está en modo lectura. `isEditing = false`, `draftName = "Leer"` (valor inicial).
2. El usuario pulsa "Editar". `startEditing` ejecuta:
   - `setDraftName("Leer")` — resincroniza el borrador con el nombre actual.
   - `setIsEditing(true)`.
3. React re-renderiza el `HabitItem`. Como `isEditing` es ahora `true`, se muestra el `<form>` con el input. `autoFocus` pone el cursor dentro.
4. El usuario borra "Leer" y escribe "Leer 30 min". Cada tecla dispara `onChange` → `setDraftName(e.target.value)`, re-render del `HabitItem`, input actualizado. El botón "Guardar" empieza deshabilitado en "" y se habilita en cuanto el nombre difiere de "Leer".
5. El usuario pulsa Enter. El navegador dispara `submit` en el `<form>`, `handleSubmit` corre:
   - `e.preventDefault()`.
   - `trimmed = "Leer 30 min"`.
   - Como no está vacío, se llama a `renameHabit(habit.id, "Leer 30 min")`.
   - `setIsEditing(false)`.
6. `renameHabit` en el provider hace `setHabits((prev) => prev.map(...))`. La referencia del hábito "Leer" cambia; el resto se devuelven tal cual.
7. Se re-renderiza el `HabitProvider`, el objeto `value` es nuevo, todos los consumidores se actualizan.
8. En `HabitItem`, `isEditing` es ahora `false`. Se pinta el modo lectura con `habit.name = "Leer 30 min"`.
9. El `useEffect` interno de `useLocalStorage` (Fase 3) escribe el JSON actualizado. Al recargar, el nombre nuevo persiste.

Si en el paso 4 el usuario hubiera pulsado Escape, el `onKeyDown` habría llamado a `cancelEditing()`. `setIsEditing(false)` cambia el modo, el input desaparece, `habit.name` sigue siendo "Leer". `draftName` conserva el último valor tecleado, pero no se muestra: la próxima vez que se pulse "Editar", `startEditing` lo resincroniza.

---

## Cómo probar la fase

```bash
npm run dev
```

Verificaciones manuales:

1. Agregar dos hábitos: "Leer" y "Correr". Cada tarjeta muestra tres elementos en la fila superior: el nombre, un botón "Editar" y un botón "Eliminar".
2. Pulsar "Editar" en "Leer". El nombre desaparece y en su lugar aparece un input con `Leer` dentro, con el foco puesto y el texto listo para editar. También aparecen los botones "Guardar" (deshabilitado, porque no ha cambiado nada) y "Cancelar".
3. Añadir " 30 min" al final. "Guardar" se habilita.
4. Pulsar Enter. El input desaparece; la tarjeta vuelve a modo lectura con "Leer 30 min" como nombre. Los completados marcados no se pierden.
5. Pulsar "Editar" otra vez. Vaciar el input completamente. "Guardar" queda deshabilitado. Volver a escribir un nombre válido y pulsar el botón "Guardar" con el ratón. El nombre se actualiza.
6. Pulsar "Editar", teclear cualquier cosa y pulsar Escape. La edición se cancela sin cambios. El nombre sigue siendo el anterior.
7. Pulsar "Editar", teclear cualquier cosa y pulsar "Cancelar" con el ratón. Igual que Escape.
8. Pulsar "Editar", **no cambiar nada** y pulsar Enter. Como el borrador coincide con el nombre actual, "Guardar" está deshabilitado y Enter no hace nada. Cerrar con Escape o Cancelar.
9. Poner un nombre con espacios al principio y al final (`"   Leer 30 min   "`) y guardar. La tarjeta muestra el nombre recortado (`"Leer 30 min"`), sin los espacios sobrantes.
10. **Recargar la página**. Los nombres editados persisten. Si "Leer" quedó como "Leer 30 min", sigue apareciendo así.
11. Verificar que se pueden editar dos tarjetas de forma independiente: pulsar "Editar" en "Leer" y en "Correr" a la vez. Cada tarjeta tiene su propio input y su propio borrador; guardar uno no afecta al otro (cada `HabitItem` tiene su propio `useState`).

Si todos los pasos funcionan, la fase está terminada.

---

## Checklist para replicar esta fase

- [ ] El tipo `Context` en `HabitProvider.tsx` incluye `renameHabit: (id: string, name: string) => void`.
- [ ] `renameHabit` usa `setHabits((prev) => prev.map(h => h.id === id ? { ...h, name } : h))`.
- [ ] `renameHabit` está incluido en el `value` del `<HabitContext>`.
- [ ] `HabitList` obtiene `renameHabit` del contexto y lo pasa como prop a `HabitItem`.
- [ ] `HabitItemProps` declara `renameHabit: (id: string, name: string) => void`.
- [ ] `HabitItem` tiene dos `useState` locales: `isEditing` (`false` inicial) y `draftName` (`habit.name` inicial).
- [ ] `startEditing` hace `setDraftName(habit.name)` **y** `setIsEditing(true)`, en ese orden.
- [ ] `cancelEditing` sólo hace `setIsEditing(false)`, sin tocar `habit.name`.
- [ ] `handleSubmit` llama a `e.preventDefault()`, hace `trim()`, cortocircuita en vacío y llama a `renameHabit` con el nombre recortado.
- [ ] El input está dentro de un `<form>` con `onSubmit={handleSubmit}`.
- [ ] El input tiene `autoFocus` y captura Escape en `onKeyDown` para cancelar.
- [ ] El botón "Guardar" es `type="submit"` y está `disabled` cuando `draftName.trim() === ""` o `draftName.trim() === habit.name`.
- [ ] El botón "Cancelar" es `type="button"` (para no disparar el submit) y llama a `cancelEditing`.
- [ ] En modo lectura, los botones "Editar" y "Eliminar" aparecen juntos y no rompen el layout de la tarjeta.
- [ ] Ninguno de los tres estados nuevos (`isEditing`, `draftName`, ni el par derivado) vive en el provider ni en `localStorage`.
- [ ] Renombrar persiste tras recargar (herencia de la Fase 3).

---

## Limitaciones y qué viene después

| No funciona | Motivo |
|---|---|
| Marcar visualmente el "día de hoy" en la fila de días | Sigue vigente desde la Fase 4: ningún estilo diferencia hoy del resto. |
| Deshacer un renombrado | No hay historial; renombrar sobrescribe el nombre anterior. |
| Nombres únicos entre hábitos | No hay validación cruzada. |
| Estadísticas por hábito (rachas, semanas activas, gráficos) | El modelo no expone métricas derivadas más allá de `getStreak`, que se calcula al vuelo dentro del `HabitItem`. |
| Sincronizar entre dispositivos | Sigue vigente desde la Fase 3: `localStorage` es local al navegador. |

Todo esto se resuelve más adelante:

- **Fase 6 — Estadísticas** *(pendiente de escribir)* — se sacan las métricas (`getStreak`, completados por semana) a funciones puras reutilizables y se añade UI para consultarlas.
- **Fase 7 — Sincronización con backend** *(pendiente de escribir)* — `useLocalStorage` se reemplaza por llamadas a la API. El resto del código no se entera, igual que ocurrió al pasar de Fase 2 a Fase 3.
