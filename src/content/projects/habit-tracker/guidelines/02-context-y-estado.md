# Fase 2 — Estado global desde el inicio: Context + `useState`

En esta fase la aplicación deja de ser estática. El array `habits` que en la [Fase 1](./01-stateless-components.md) estaba hardcodeado dentro de `HabitList` se mueve a un **`useState`** que vive dentro de un **`HabitProvider`**. A partir de este momento se pueden **agregar**, **eliminar** y **marcar/desmarcar** hábitos, y la UI se actualiza sola.

Lo importante de esta fase es el **orden** con el que se introducen los conceptos. La mayoría de tutoriales presentan primero `useState` en `App` (con prop drilling en cada nivel intermedio) y **después** refactorizan a Context. Aquí se hace en un único paso: el `useState` nace ya dentro del `Provider`. El motivo está en la [nota del índice](./00-indice.md#filosofía-general): declarar tipos de props que van a existir por unas horas y luego borrarse ensucia el código y confunde durante el refactor.

---

## Objetivo de la fase

Al terminar la Fase 2 la app debe:

- Permitir **agregar** un hábito desde el formulario.
- Permitir **eliminar** un hábito desde su tarjeta.
- Permitir **marcar y desmarcar** cada día de la semana (toggle).
- Mostrar en el header `X / Y done today`, contando los completados **reales** en la fecha de hoy.
- No mostrar la lista si no hay hábitos, mostrando en su lugar un mensaje de bienvenida.

Lo que **no** vamos a tener todavía:

- No hay persistencia: al recargar la página se pierde todo. Los datos viven sólo en memoria.
- No hay navegación entre semanas: los días visibles siempre son los de la semana actual.
- El botón "Sig" está deshabilitado permanentemente porque nunca se puede avanzar (no hay semanas futuras a las que ir).

Estas dos capacidades se añaden en la Fase 3 (`useLocalStorage`) y la Fase 4 (navegación semanal).

---

## Estructura de carpetas al final de la fase

Aparece una carpeta nueva: `context/`.

```
src/
├── components/
│   ├── Button.tsx        ← sin cambios respecto a Fase 1
│   ├── Header.tsx        ← ahora consume el contexto
│   ├── HabitForm.tsx     ← input controlado + llamada a addHabit
│   └── HabitList.tsx     ← consume habits, deleteHabit, toggleHabit
├── context/
│   └── HabitProvider.tsx ← nuevo
├── guidelines/
├── App.tsx               ← ahora envuelve todo con <HabitProvider>
├── main.tsx              ← sin cambios
└── index.css             ← sin cambios
```

La carpeta `hooks/` sigue sin existir, se creará en la Fase 3.

---

## Repaso rápido: qué es `useState`

`useState` es un hook de React que hace dos cosas:

1. **Guarda un valor** entre renders. Una variable declarada con `const` normal (`const x = 0`) se reinicia cada vez que el componente se vuelve a ejecutar. `useState` conserva el valor.
2. **Notifica a React** cuando ese valor cambia, para que vuelva a renderizar el componente.

Sintaxis:

```tsx
const [valor, setValor] = useState<Tipo>(valorInicial);
```

Devuelve una **tupla** de dos elementos:

- Posición 0: el valor actual.
- Posición 1: una función para actualizarlo. Llamarla dispara un re-render.

El **valor inicial** sólo se usa en el primer render. En los siguientes, `useState` devuelve el valor guardado, ignorando el argumento.

---

## El `HabitProvider`

Todo el estado global vive en un único archivo: `src/context/HabitProvider.tsx`. Este archivo hace cuatro cosas:

1. Declara el **tipo** `Habit` (y también el tipo `Context` con la forma del valor compartido).
2. Crea el **contexto** con `createContext`.
3. Define el componente **`HabitProvider`** que envuelve al árbol y encapsula el `useState`.
4. Exporta un **hook personalizado** `useHabits()` para leer el contexto con seguridad.

### El tipo `Habit` vive junto al estado

En la Fase 1 el tipo `Habit` estaba dentro de `HabitList.tsx` porque era el único componente que lo usaba. Ahora que el estado se comparte, el tipo tiene que estar donde vive el estado: en `HabitProvider.tsx`. Cualquier otro componente que necesite el tipo lo importa desde ahí:

```tsx
import { useHabits, type Habit } from "../context/HabitProvider";
```

**Regla general:** los tipos viven junto al dueño del dato, no junto al primer componente que los muestra. Si el tipo cambia, sólo cambia en un lugar.

### El tipo `Context`

Además del array `habits` hay que compartir las funciones que lo modifican. Todo eso va agrupado en un único tipo:

```tsx
type Context = {
  habits: Habit[];
  addHabit: (name: string) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string, date: Date) => void;
};
```

Cada campo:

| Campo         | Tipo                               | Qué hace                                               |
| ------------- | ---------------------------------- | ------------------------------------------------------ |
| `habits`      | `Habit[]`                          | Array vivo de hábitos, gestionado por `useState`.      |
| `addHabit`    | `(name: string) => void`           | Añade un hábito nuevo al final del array.              |
| `deleteHabit` | `(id: string) => void`             | Quita el hábito con ese `id`.                          |
| `toggleHabit` | `(id: string, date: Date) => void` | Alterna un día concreto en `completions` de un hábito. |

Las tres funciones devuelven `void`: no producen un valor nuevo, sólo tienen el efecto secundario de actualizar el estado.

### `createContext<null | Context>(null)`

```tsx
export const HabitContext = createContext<null | Context>(null);
```

El tipo genérico `<null | Context>` indica que el contexto puede tener **dos formas**:

- `null` — cuando un componente intenta leerlo **fuera** de un `HabitProvider`. Es el valor por defecto que se pasa como argumento.
- `Context` — cuando está dentro del provider y tiene datos reales.

Esta unión es a propósito. Si tipáramos el contexto como `Context` directamente (sin `null`), TypeScript no nos obligaría a comprobar si el hook se está usando en el árbol correcto y podríamos leer `undefined.habits` en producción.

### El componente `HabitProvider`

```tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import { isSameDay } from "date-fns";

export type Habit = { id: string; name: string; completions: Date[] };

type Context = {
  habits: Habit[];
  addHabit: (name: string) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string, date: Date) => void;
};

type HabitProviderProps = {
  children: ReactNode;
};

export const HabitContext = createContext<null | Context>(null);

export function HabitProvider({ children }: HabitProviderProps) {
  const [habits, setHabits] = useState<Habit[]>([]);

  function addHabit(name: string) {
    setHabits((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, completions: [] },
    ]);
  }

  function deleteHabit(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  function toggleHabit(id: string, date: Date) {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const alreadyDone = h.completions.some((c) => isSameDay(c, date));
        const completions = alreadyDone
          ? h.completions.filter((c) => !isSameDay(c, date))
          : [...h.completions, date];
        return { ...h, completions };
      }),
    );
  }

  return (
    <HabitContext value={{ habits, addHabit, deleteHabit, toggleHabit }}>
      {children}
    </HabitContext>
  );
}

export function useHabits() {
  const habitContext = useContext(HabitContext);
  if (habitContext == null) throw new Error("Null context");
  return habitContext;
}
```

Análisis pieza por pieza a continuación.

---

## Análisis: `useState<Habit[]>([])`

```tsx
const [habits, setHabits] = useState<Habit[]>([]);
```

- **`<Habit[]>`** es el genérico. Le dice a TypeScript "este estado es un array de `Habit`". Sin el genérico, TypeScript infiere el tipo desde el valor inicial (`[]` sería `never[]`) y no dejaría añadir ningún elemento.
- **`[]`** es el valor inicial. Empezamos sin hábitos.
- **`habits`** es el valor actual (siempre un `Habit[]`).
- **`setHabits`** es la función para actualizarlo.

En memoria, durante el primer render, tenemos:

```
habits    → []            ← array vacío
setHabits → function      ← siempre la misma referencia entre renders
```

Después de llamar a `addHabit("Leer")`, en el siguiente render:

```
habits    → [ { id: "uuid-1", name: "Leer", completions: [] } ]
setHabits → function      ← misma función
```

---

## Análisis: la forma funcional `setState(prev => ...)`

Todas las funciones modificadoras siguen el mismo patrón:

```tsx
setHabits((prev) => /* nuevo array basado en prev */);
```

En vez de pasarle a `setHabits` el nuevo valor directamente (`setHabits([...habits, nuevo])`), le pasamos una **función** que recibe el valor anterior y devuelve el nuevo.

**¿Por qué?** Porque cuando escribimos `setHabits([...habits, nuevo])`, la variable `habits` captura el valor que había en el momento en que se creó la función. Si React programa la actualización de estado y en el intermedio hay otra actualización, la nuestra usaría el `habits` antiguo y **perderíamos cambios**.

Con la forma funcional, React garantiza que `prev` es siempre el valor más reciente en la cola de actualizaciones. Es la manera segura de trabajar cuando el nuevo estado depende del anterior.

**Regla:** si el nuevo estado depende del anterior, usar la forma funcional. Siempre.

---

## Análisis: inmutabilidad

Ninguna de las funciones **muta** el array `habits` ni sus objetos. En su lugar, construyen **valores nuevos**:

| Operación     | Método usado                             | Qué devuelve                                            |
| ------------- | ---------------------------------------- | ------------------------------------------------------- |
| Añadir        | `[...prev, nuevo]`                       | Un array nuevo con un elemento extra al final.          |
| Quitar        | `prev.filter(...)`                       | Un array nuevo sin los elementos filtrados.             |
| Reemplazar    | `prev.map(h => h.id === id ? nuevo : h)` | Un array nuevo con un elemento sustituido.              |
| Copiar objeto | `{ ...h, completions: nuevo }`           | Un objeto nuevo con las mismas claves y una modificada. |

**Por qué importa.** React decide si volver a renderizar comparando la **referencia** del estado (no su contenido). Si mutamos `habits.push(x)`, la referencia del array no cambia, `setHabits` no detecta la diferencia y no re-renderiza. Además, mutar el estado rompe la garantía de que "el render N tiene tal estado" y hace prácticamente imposible depurar el flujo.

**Regla:** el estado se trata como si fuera de sólo lectura. Cualquier cambio se hace creando un valor nuevo.

---

## Análisis: `addHabit`

```tsx
function addHabit(name: string) {
  setHabits((prev) => [
    ...prev,
    { id: crypto.randomUUID(), name, completions: [] },
  ]);
}
```

Tres puntos:

- **`...prev`** copia todos los hábitos existentes en el mismo orden.
- **`{ id, name, completions }`** es el nuevo hábito. `completions: []` significa "aún no se marcó ningún día".
- **`crypto.randomUUID()`** es una API nativa del navegador (`window.crypto`) que devuelve un string UUID v4 tipo `"550e8400-e29b-41d4-a716-446655440000"`. Nos garantiza que dos hábitos añadidos consecutivamente tengan `id` distintos, incluso si se crean en el mismo milisegundo. En Fase 1 usábamos `"1"`, `"2"`, `"3"` manualmente porque los datos eran fijos; ahora que los añadimos dinámicamente necesitamos un generador.

Una buena `key` en React tiene que ser **única y estable**. `crypto.randomUUID()` cumple las dos: es única porque el espacio de UUIDs es virtualmente infinito, y es estable porque se calcula **una sola vez** al crear el hábito y luego se guarda en el estado.

---

## Análisis: `deleteHabit`

```tsx
function deleteHabit(id: string) {
  setHabits((prev) => prev.filter((h) => h.id !== id));
}
```

`.filter()` devuelve un array nuevo con los elementos que **cumplen** la condición. En este caso conservamos todos los hábitos cuyo `id` **no** es el que queremos borrar.

Si el `id` no existiera en el array, `.filter()` devolvería una copia igual al original y el resto de la app seguiría funcionando sin fallar. Ese comportamiento tolerante nos deja llamar `deleteHabit` sin comprobar si el hábito todavía está en la lista.

---

## Análisis: `toggleHabit` (el más importante)

```tsx
function toggleHabit(id: string, date: Date) {
  setHabits((prev) =>
    prev.map((h) => {
      if (h.id !== id) return h;
      const alreadyDone = h.completions.some((c) => isSameDay(c, date));
      const completions = alreadyDone
        ? h.completions.filter((c) => !isSameDay(c, date))
        : [...h.completions, date];
      return { ...h, completions };
    }),
  );
}
```

Esta función encierra tres ideas nuevas: el patrón toggle, la comparación de fechas y la copia parcial de objetos.

### El patrón toggle: presencia/ausencia en un array

En muchas apps, "hábito completado hoy sí/no" se modelaría con un booleano en cada día. Aquí lo modelamos como **presencia o ausencia de una fecha** dentro del array `completions`:

- Si `date` **está** en `completions` → el hábito está marcado ese día.
- Si `date` **no está** en `completions` → no está marcado.

**Toggle** = si está, quitarlo; si no está, añadirlo. Es exactamente lo que hace el operador ternario del código.

Ventajas de este modelo:

- No hay que crear un objeto vacío por cada día de la vida del hábito.
- La estructura crece sólo con los días efectivamente marcados.
- Consultar "cuántos días marcó en total" es `completions.length`.

### `isSameDay`

```tsx
h.completions.some((c) => isSameDay(c, date));
```

`isSameDay` de `date-fns` compara **sólo la parte del día**, ignorando hora, minutos y milisegundos. Dos `Date` con distinta hora pero mismo día devuelven `true`.

Sin `isSameDay`, la comparación por defecto (`===`) compararía referencias de objeto y siempre daría `false`. Y si comparásemos por timestamp (`c.getTime() === date.getTime()`), tampoco funcionaría, porque el `date` que viene del botón se creó a las 00:00 pero el `date` guardado en `completions` puede haberse creado a las 15:23:45.

### Copia parcial: `{ ...h, completions }`

```tsx
return { ...h, completions };
```

- `...h` copia todas las claves del hábito original (`id`, `name`).
- `completions` sobrescribe la clave `completions` con el nuevo array.

El resultado es un objeto **nuevo** que comparte referencia con el original en el resto de campos. Esta técnica se llama **spread + override** y es la forma estándar de "actualizar un campo" sin mutar.

### Los hábitos que no cambian se devuelven tal cual

```tsx
if (h.id !== id) return h;
```

Al hacer `prev.map(...)`, si el `id` no coincide devolvemos **el mismo objeto** sin copiar. Esto es importante por rendimiento: sólo el hábito modificado tiene una nueva referencia; los demás quedan intactos. React puede optimizar renders comparando referencias por hijo.

---

## Análisis: el `return` con el `<HabitContext>`

```tsx
return (
  <HabitContext value={{ habits, addHabit, deleteHabit, toggleHabit }}>
    {children}
  </HabitContext>
);
```

- **`<HabitContext value={...}>`** hace que todo lo que esté dentro (los `children`) pueda leer ese `value` con `useContext(HabitContext)`. En React 19 se usa el propio contexto como componente; en React 18 y anteriores había que escribir `<HabitContext.Provider value={...}>`.
- El objeto que pasamos como `value` se **recrea en cada render** del `Provider`. Cada vez que `habits` cambia, ese objeto es nuevo, todos los consumidores se re-renderizan y ven los datos actualizados. Es lo que queremos.
- **`{children}`** renderiza dentro del provider lo que sea que se le pase entre etiquetas de apertura y cierre. En nuestro caso, todo el árbol de la app.

---

## Análisis: el hook `useHabits`

```tsx
export function useHabits() {
  const habitContext = useContext(HabitContext);
  if (habitContext == null) throw new Error("Null context");
  return habitContext;
}
```

Dos cosas a la vez:

1. **Lee el contexto** con `useContext(HabitContext)`. El resultado tiene tipo `null | Context`.
2. **Actúa como guarda**: si el resultado es `null`, lanza un error inmediatamente.

Después del `if`, TypeScript **estrecha** el tipo de `habitContext` a `Context` (sin el `null`). El consumidor puede escribir `const { addHabit } = useHabits()` sin tener que comprobar `null` cada vez.

**¿Por qué envolver `useContext` en un hook propio en vez de usar `useContext(HabitContext)` directamente?**

- Sin el hook, cada componente consumidor tendría que hacer la comprobación de `null` por su cuenta, o vivir con un tipo `null | Context` en cada uso.
- Con el hook, la comprobación se hace **una vez** y todos los consumidores reciben un tipo limpio.
- Si mañana cambia el nombre del contexto, sólo se toca en un archivo.

**`habitContext == null`** con `==` (doble igual): compara con `null` y también con `undefined` a la vez. Es la comprobación estándar de "vacío" en JavaScript.

---

## Envolver la app con el provider

`src/App.tsx` cambia respecto a Fase 1: ahora envuelve todo el árbol con `<HabitProvider>`.

```tsx
import { Header } from "./components/Header";
import { HabitForm } from "./components/HabitForm";
import { HabitList } from "./components/HabitList";
import { HabitProvider } from "./context/HabitProvider";

export default function App() {
  return (
    <HabitProvider>
      <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
        <Header />
        <HabitForm />
        <HabitList />
      </div>
    </HabitProvider>
  );
}
```

`App` **no gestiona lógica**. Sigue siendo un componente de layout puro; su única novedad es el `HabitProvider` alrededor del árbol. Los tres hijos consumen el contexto por su cuenta, sin recibir props desde `App`.

Esto es a propósito. Es exactamente lo contrario del prop drilling que evitamos: en lugar de que `App` reciba `habits` y lo pase a `Header` y `HabitList`, cada componente pide directamente lo que necesita.

---

## Consumir el contexto: `HabitForm`

`src/components/HabitForm.tsx` gana dos cosas respecto a Fase 1: **input controlado** con `useState` local y una llamada real a `addHabit` en el submit.

```tsx
import { useHabits } from "../context/HabitProvider";
import { Button } from "./Button";
import { useState } from "react";

export function HabitForm() {
  const [name, setName] = useState("");
  const { addHabit } = useHabits();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (name.trim() === "") return;
    addHabit(name);
    setName("");
  }

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        placeholder="Habito nuevo"
      />
      <Button
        disabled={name.trim() === ""}
        className=" rounded-lg px-4 py-2 font-medium"
      >
        Agregar habito
      </Button>
    </form>
  );
}
```

Puntos clave:

- **`useState("")`** guarda el texto del input. El tipo se infiere como `string` desde el valor inicial `""`, no hace falta genérico.
- **Input controlado**: al escribir `value={name}` + `onChange={(e) => setName(e.target.value)}`, el estado de React se convierte en la **fuente de verdad**. Cada tecla dispara un render con el nuevo valor. En Fase 1 el input era del navegador; ahora es de React.
- **`e.preventDefault()`** evita la recarga de página al hacer submit.
- **`name.trim() === ""`** valida que el nombre no esté vacío ni sea sólo espacios. Se usa dos veces: para deshabilitar el botón y para bloquear el submit por si acaso.
- **`setName("")`** limpia el input tras agregar. Como el input es controlado, poner el estado en `""` hace que se vacíe visualmente sin tocar el DOM directamente.
- **No hay ningún tipo de `Props`** en este componente: no recibe nada de fuera. Se autoabastece con el contexto.

---

## Consumir el contexto: `HabitList`

`src/components/HabitList.tsx` sustituye el array hardcodeado por `useHabits()` y añade `onClick` reales.

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
import { useHabits, type Habit } from "../context/HabitProvider";

type HabitItemProps = {
  habit: Habit;
  visibleDates: Date[];
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string, date: Date) => void;
};

export function HabitList() {
  const { habits, deleteHabit, toggleHabit } = useHabits();
  const visibleDates = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });

  if (habits.length === 0) {
    return <h1>Aun no hay habitos registrados. Agrega uno para empezar!</h1>;
  }

  return (
    <div className="flex flex-col gap-3">
      {habits.map((habit) => (
        <HabitItem
          key={habit.id}
          habit={habit}
          visibleDates={visibleDates}
          deleteHabit={deleteHabit}
          toggleHabit={toggleHabit}
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
}: HabitItemProps) {
  return (
    <div className="rounded-xl bg-zinc-800 p-4 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="font-medium">{habit.name}</span>
        <Button
          onClick={() => deleteHabit(habit.id)}
          variant="ghost-destructive"
          className="text-sm"
        >
          Eliminar
        </Button>
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
```

Diferencias con Fase 1:

- **`const habits: Habit[] = [ ... ]`** hardcodeado **desaparece**. Ahora los hábitos llegan del contexto.
- **`useHabits()`** se llama en el padre (`HabitList`), no en el hijo (`HabitItem`). Esto es una decisión de diseño: `HabitItem` sigue siendo un componente "tonto" que recibe todo por props. Facilita testear `HabitItem` de forma aislada y deja claro qué datos necesita.
- **`onClick={() => deleteHabit(habit.id)}`** en el botón "Eliminar". Se envuelve en una flecha para poder pasarle el `habit.id` capturado; si escribiéramos `onClick={deleteHabit(habit.id)}` se ejecutaría la función durante el render, no al click.
- **`onClick={() => toggleHabit(habit.id, date)}`** en cada botón de día. Misma técnica.

**Sobre el tipo `HabitItemProps`:** se declara con las cuatro props que necesita (`habit`, `visibleDates`, `deleteHabit`, `toggleHabit`). Alternativa: llamar a `useHabits()` dentro de `HabitItem` y no pasar `deleteHabit` ni `toggleHabit` como props. Ambas opciones son válidas. Aquí se prefiere props explícitas porque hacen el componente hijo más autocontenido y trazable de un vistazo.

---

## Consumir el contexto: `Header`

`src/components/Header.tsx` sustituye los números falsos por conteos reales.

```tsx
import { useHabits } from "../context/HabitProvider";
import { Button } from "./Button";
import { format, isToday, startOfWeek, endOfWeek } from "date-fns";

export function Header() {
  const { habits } = useHabits();

  // Cuántos hábitos ya se marcaron HOY.
  const doneToday = habits.filter((h) =>
    h.completions.some((c) => isToday(c)),
  ).length;

  const firstDay = format(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    "MMM d",
  );
  const lastDay = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "MMM d");

  return (
    <header className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Habit Tracker</h1>
        <span className="text-zinc-400 text-sm">
          {doneToday} / {habits.length} done today
        </span>
      </div>
      <div className="flex flex-col gap-1 items-end">
        <span className="text-zinc-400 text-sm">
          {firstDay} - {lastDay}
        </span>
        <div className="flex items-center gap-3">
          <Button>Prev</Button>
          <Button disabled>Sig</Button>
        </div>
      </div>
    </header>
  );
}
```

Puntos clave:

- **`doneToday`** se calcula filtrando los hábitos que tengan al menos una fecha marcada hoy. `isToday(c)` compara `c` contra `new Date()` a nivel de día.
- **`habits.length`** es directamente el total de hábitos.
- **`firstDay` / `lastDay`** se calculan al vuelo con `format`. El patrón `"MMM d"` produce `"Jul 27"`.
- Los botones **Prev/Sig siguen sin hacer nada**. En esta fase no existe todavía la noción de "semana visible" separada de "hoy". Se implementa en la Fase 4.

---

## Ciclo de una interacción, paso a paso

Para consolidar cómo todo encaja, este es el flujo completo cuando el usuario **marca el lunes en "Leer"**:

1. El usuario hace click en el botón del lunes dentro de la tarjeta "Leer".
2. React ejecuta el handler: `() => toggleHabit(habit.id, date)`.
3. `toggleHabit` llama a `setHabits((prev) => ...)`.
4. React encola la actualización. Cuando se ejecuta, la función recibe `prev` (el array actual) y devuelve uno nuevo con "Leer" modificado: `completions` ahora contiene la fecha del lunes.
5. React detecta que la referencia de `habits` cambió y **re-renderiza el `HabitProvider`**.
6. Al re-renderizar el provider, el objeto pasado a `value={{ ... }}` es nuevo. Todos los consumidores (`Header`, `HabitList`, `HabitForm`) también se re-renderizan.
7. En `HabitList`, el `.map()` vuelve a ejecutarse. Como sólo el objeto de "Leer" tiene referencia nueva (los demás se devolvieron con `return h`), React puede reconciliar el resto sin trabajo extra.
8. Dentro de la tarjeta "Leer", el botón del lunes evalúa de nuevo la variante: `habit.completions.some(...)` ahora devuelve `true`, así que la variante pasa de `"secondary"` a `"primary"` y el botón se pinta violeta.
9. En `Header`, `doneToday` se recalcula. Si hoy es lunes, sube en 1.

Todo esto sucede sin que ningún componente sepa dónde viven los datos ni cómo se guardan.

---

## Cómo probar la fase

```bash
npm run dev
```

Verificaciones manuales:

1. Al cargar la página, no hay hábitos. Se muestra "Aun no hay habitos registrados. Agrega uno para empezar!". El header dice `0 / 0 done today`.
2. Escribir "Leer" en el input y pulsar "Agregar habito". Aparece la tarjeta con los 7 botones grises. El header pasa a `0 / 1 done today`. El input queda vacío.
3. Escribir "Correr" y agregar. Ahora hay dos tarjetas. Header: `0 / 2 done today`.
4. Hacer click en el botón correspondiente a **hoy** de la tarjeta "Leer". El botón se vuelve violeta. Header: `1 / 2 done today`.
5. Hacer click otra vez en ese mismo botón. Vuelve a gris. Header: `0 / 2 done today`. (Toggle funciona en ambos sentidos.)
6. Hacer click en el botón "Eliminar" de la tarjeta "Correr". La tarjeta desaparece. Header: `0 / 1 done today` o `1 / 1 done today` según el estado del lunes.
7. **Recargar la página**. Todo desaparece. La app vuelve al estado inicial "sin hábitos". Esto es esperado en Fase 2 y se resolverá en Fase 3.

Si todos los pasos funcionan, la fase está terminada.

---

## Checklist para replicar esta fase

- [ ] Existe la carpeta `src/context/` con el archivo `HabitProvider.tsx`.
- [ ] `HabitProvider.tsx` declara y exporta el tipo `Habit`.
- [ ] Declara el tipo `Context` con `habits`, `addHabit`, `deleteHabit`, `toggleHabit`.
- [ ] Crea el contexto con `createContext<null | Context>(null)`.
- [ ] `HabitProvider` recibe `children: ReactNode` y contiene un `useState<Habit[]>([])`.
- [ ] `addHabit` usa `crypto.randomUUID()` y `setHabits(prev => [...prev, ...])`.
- [ ] `deleteHabit` usa `setHabits(prev => prev.filter(...))`.
- [ ] `toggleHabit` usa `setHabits(prev => prev.map(...))`, `isSameDay`, y devuelve `{ ...h, completions }` sin mutar.
- [ ] `useHabits()` comprueba `null` y lanza un error si el hook se usa fuera del provider.
- [ ] `App.tsx` envuelve el árbol con `<HabitProvider>` y **no** contiene lógica de negocio.
- [ ] `HabitForm` controla su input con `useState("")` y limpia el campo tras agregar.
- [ ] `HabitList` obtiene `habits`, `deleteHabit`, `toggleHabit` del contexto (nada hardcodeado).
- [ ] `HabitItem` recibe `deleteHabit` y `toggleHabit` como props y las llama con arrow functions en los `onClick`.
- [ ] `Header` calcula `doneToday` con `.filter` + `isToday`, y usa `habits.length` para el total.
- [ ] Agregar, eliminar y marcar/desmarcar hábitos funcionan en la UI.
- [ ] Al recargar, los datos se pierden (comportamiento esperado hasta Fase 3).

---

## Limitaciones y qué viene después

| No funciona                                       | Motivo                                                                                                                |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Persistir los hábitos al recargar                 | `useState` sólo guarda en memoria. Al recargar la página, React inicializa el estado con el valor por defecto (`[]`). |
| Ver semanas anteriores o futuras                  | `visibleDates` se calcula siempre desde `new Date()`. No hay un estado que represente "qué semana estoy mirando".     |
| Los botones "Prev" y "Sig"                        | No tienen `onClick` real. En esta fase se dejan visibles pero inertes.                                                |
| Rachas (streaks), estadísticas, edición de nombre | Son features de fases posteriores.                                                                                    |

Todo esto se resuelve más adelante:

- **[Fase 3 — Persistencia con `useLocalStorage`](./03-uselocalstorage.md)** — se crea un hook genérico que sincroniza `useState` con `localStorage`, sustituyendo la única línea `useState<Habit[]>([])` sin tocar el resto del provider.
- **[Fase 4 — Navegación entre semanas](./04-navegacion-semanas.md)** — se añade un `weekOffset` al provider, se mueven `visibleDates`, `isCurrentWeek`, `nextWeek` y `prevWeek` al contexto, y los botones Prev/Sig cobran vida.
