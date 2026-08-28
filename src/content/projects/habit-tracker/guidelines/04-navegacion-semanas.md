# Fase 4 — Navegación entre semanas

Hasta la [Fase 3](./03-uselocalstorage.md) la app siempre mostraba la semana actual: `visibleDates` se recalculaba en cada componente desde `new Date()`. En esta fase se añade la capacidad de **moverse hacia semanas pasadas y futuras**. El truco pedagógico es que no guardamos una fecha completa como estado: guardamos un simple **número entero** —`weekOffset`— y derivamos todo lo demás (fecha de referencia, días visibles, si estamos o no en la semana de hoy) a partir de él.

Esta fase también introduce dos decisiones de diseño finas: **no** persistir el `weekOffset` (al recargar siempre se vuelve a hoy) y guardar las fechas de `completions` en formato **absoluto** (fecha calendario) en vez de relativo al momento del clic.

---

## Objetivo de la fase

Al terminar la Fase 4 la app debe:

- Permitir retroceder a semanas pasadas pulsando "Prev", sin límite hacia atrás.
- Permitir avanzar hacia semanas futuras con "Sig", **excepto** cuando ya estamos en la semana actual (para evitar marcar días que aún no llegan).
- Mostrar el rango textual de la semana visible en el header (`Jul 27 - Aug 2`, `Aug 3 - Aug 9`, ...) y actualizarlo al navegar.
- Poder marcar y desmarcar días de semanas pasadas: `toggleHabit` sigue funcionando exactamente igual sobre las fechas de la semana visible, sea cual sea.
- Al recargar la página, volver siempre a la semana actual, aunque los hábitos y sus completados sí persistan (herencia de Fase 3).

Lo que **no** vamos a tener todavía:

- No hay indicador visual del "día de hoy" cuando estamos en la semana actual (todos los botones de la semana visible tienen el mismo tratamiento).
- No hay rachas ni estadísticas: el `HabitItem` sigue siendo sólo el nombre + los 7 botones de día.
- No se puede renombrar un hábito ya creado.

Estas capacidades se añaden en fases posteriores (Fase 5 en adelante).

---

## Estructura de carpetas al final de la fase

**Ninguna carpeta nueva.** Los cambios son internos a archivos que ya existen.

```
src/
├── components/
│   ├── Button.tsx        ← sin cambios respecto a Fase 3
│   ├── Header.tsx        ← consume visibleDates, isCurrentWeek, prevWeek, nextWeek
│   ├── HabitForm.tsx     ← sin cambios
│   └── HabitList.tsx     ← consume visibleDates desde el contexto (ya no lo calcula)
├── context/
│   └── HabitProvider.tsx ← nuevo estado weekOffset + derivados en el contexto
├── hooks/
│   └── useLocalStorage.ts ← sin cambios
├── guidelines/
├── App.tsx               ← sin cambios
├── main.tsx              ← sin cambios
└── index.css             ← sin cambios
```

Es una fase corta en superficie pero densa en decisiones. Todo el trabajo se concentra en el `HabitProvider`: ese archivo pasa a ser el dueño de la noción "qué semana estoy viendo".

---

## Idea general: `weekOffset` como estado derivable

En vez de guardar **la semana visible** como una fecha (`Date`), se guarda un **desplazamiento entero** relativo a hoy:

```
weekOffset =  0 → semana actual
weekOffset = -1 → semana anterior
weekOffset = -2 → dos semanas atrás
weekOffset = +1 → semana siguiente  (sólo teóricamente: la UI no permite llegar)
```

A partir de este número, se **deriva** todo lo demás en cada render:

```
referenceDate  = addWeeks(new Date(), weekOffset)
visibleDates   = eachDayOfInterval({ start: startOfWeek(...), end: endOfWeek(...) })
isCurrentWeek  = isSameWeek(referenceDate, new Date())
```

Ninguna de estas tres variables vive en el estado. Se recalculan cada vez que el `HabitProvider` se renderiza. Es lo que en React se llama **estado derivado**: si algo se puede recalcular con un cálculo trivial a partir del estado real, no se guarda como estado adicional.

**¿Por qué no guardar `visibleDates` en `useState` y actualizarlo en `nextWeek` / `prevWeek`?**

- Dos fuentes de verdad para lo mismo (`weekOffset` y `visibleDates`) se pueden desincronizar. Alguien actualiza una y olvida la otra.
- Un `Date` como estado es traicionero: si abriéramos la app un domingo a las 23:59 y siguiéramos usándola pasada la medianoche, la fecha de referencia "hoy" se quedaría atascada.
- Con `weekOffset`, la referencia a "hoy" se calcula de nuevo en cada render (`new Date()`), así que el día real siempre está actualizado.

**Regla:** el estado guarda lo mínimo. Lo que se pueda calcular con una función pura sobre ese mínimo, se calcula al vuelo.

---

## Código completo del `HabitProvider`

`src/context/HabitProvider.tsx`:

```tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  isSameDay,
  isSameWeek,
  startOfWeek,
} from "date-fns";
import { useLocalStorage } from "../hooks/useLocalStorage";

export type Habit = { id: string; name: string; completions: Date[] };

type Context = {
  habits: Habit[];
  addHabit: (name: string) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string, date: Date) => void;
  visibleDates: Date[];
  isCurrentWeek: boolean;
  nextWeek: () => void;
  prevWeek: () => void;
};

type HabitProviderProps = {
  children: ReactNode;
};

export const HabitContext = createContext<null | Context>(null);

export function HabitProvider({ children }: HabitProviderProps) {
  const [habits, setHabits] = useLocalStorage<Habit[]>("habits", []);
  const [weekOffset, setWeekOffset] = useState(0);

  const referenceDate = addWeeks(new Date(), weekOffset);

  const visibleDates = eachDayOfInterval({
    start: startOfWeek(referenceDate, { weekStartsOn: 1 }),
    end: endOfWeek(referenceDate, { weekStartsOn: 1 }),
  });

  const isCurrentWeek = isSameWeek(referenceDate, new Date(), {
    weekStartsOn: 1,
  });

  function nextWeek() {
    if (isCurrentWeek) return;
    setWeekOffset((prev) => prev + 1);
  }

  function prevWeek() {
    setWeekOffset((prev) => prev - 1);
  }

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
    <HabitContext
      value={{
        habits,
        addHabit,
        deleteHabit,
        toggleHabit,
        visibleDates,
        isCurrentWeek,
        nextWeek,
        prevWeek,
      }}
    >
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

## Análisis: `useState(0)` sin genérico

```tsx
const [weekOffset, setWeekOffset] = useState(0);
```

- **`0`** es el valor inicial. Al arrancar la app siempre estamos en la semana actual.
- **No hace falta genérico** `<number>` porque TypeScript infiere el tipo desde el valor inicial: `0` es `number`, así que `weekOffset` es `number` y `setWeekOffset` acepta `number` o `(prev: number) => number`.

Contraste con `useState<Habit[]>([])`: allí el genérico era necesario porque `[]` sin más se infiere como `never[]`. Aquí, `0` es un valor unívoco.

---

## Análisis: `useState` normal, no `useLocalStorage`

```tsx
const [weekOffset, setWeekOffset] = useState(0);
//                                  ↑ importante: NO useLocalStorage
```

Los hábitos se persisten (`useLocalStorage`), pero el `weekOffset` **no**. Es una decisión consciente:

- **Comportamiento esperado por el usuario:** cuando cierro la app y vuelvo a abrirla, quiero ver **hoy**. No quiero descubrir que estoy tres semanas atrás porque la última vez que la usé estaba revisando el historial.
- **Datos frágiles frente al tiempo:** si guardáramos `weekOffset = -1` el 30 de julio y volviéramos a abrir el 6 de agosto, `weekOffset = -1` significaría "la semana del 30 de julio" en el primer caso y "la semana del 30 de julio" también en el segundo — pero el usuario esperaría que "hace una semana" fuera relativo al momento actual, no al momento de guardado. Persistir el offset da resultados contraintuitivos.

**Regla:** no todo el estado merece persistencia. La regla informal: si el usuario se sorprendería al recargar y **no** encontrar ese estado, se persiste; si se sorprendería al encontrarlo, no. La semana visible cae en el segundo grupo.

---

## Análisis: `referenceDate` con `addWeeks`

```tsx
const referenceDate = addWeeks(new Date(), weekOffset);
```

`addWeeks(fecha, n)` de `date-fns` devuelve una **fecha nueva** desplazada `n` semanas respecto a `fecha`:

- `addWeeks(new Date(), 0)` → hoy.
- `addWeeks(new Date(), -1)` → mismo día de hace una semana.
- `addWeeks(new Date(), +2)` → mismo día dentro de dos semanas.

No importa **qué día** dentro de la semana devuelva: lo único que nos interesa es que caiga **dentro** de la semana que queremos mostrar. Luego `startOfWeek` y `endOfWeek` normalizan al lunes y al domingo de esa semana.

`new Date()` se evalúa **en cada render**. Si el usuario tiene la app abierta a las 23:59 del domingo con `weekOffset = 0` y el reloj cruza a las 00:00 del lunes, en el siguiente render `referenceDate` ya cae en la nueva semana. La UI se actualiza sola sin que hagamos nada especial. Es un pequeño beneficio de calcular al vuelo en vez de guardar la fecha.

---

## Análisis: `visibleDates` con `eachDayOfInterval`

```tsx
const visibleDates = eachDayOfInterval({
  start: startOfWeek(referenceDate, { weekStartsOn: 1 }),
  end: endOfWeek(referenceDate, { weekStartsOn: 1 }),
});
```

Tres funciones de `date-fns` colaboran:

- **`startOfWeek(fecha, { weekStartsOn: 1 })`** — devuelve el **lunes** de la semana en la que cae `fecha`. `weekStartsOn: 1` fuerza semana europea (0 = domingo, 1 = lunes).
- **`endOfWeek(fecha, { weekStartsOn: 1 })`** — devuelve el **domingo** de esa misma semana, con hora 23:59:59.999.
- **`eachDayOfInterval({ start, end })`** — devuelve un `Date[]` con **cada día** entre `start` y `end`, ambos incluidos. Aquí siempre son 7 fechas.

El resultado es un array como:

```
visibleDates = [
  Date(lunes),  Date(martes),  Date(miércoles),
  Date(jueves), Date(viernes), Date(sábado),
  Date(domingo),
]
```

En la [Fase 2](./02-context-y-estado.md) este cálculo vivía dentro de `HabitList` y `Header` por separado. Ahora vive en el provider una sola vez, y ambos componentes lo leen del contexto. **Regla:** cuando dos componentes calculan lo mismo, el cálculo sube al ancestro común y se comparte.

---

## Análisis: `isCurrentWeek` con `isSameWeek`

```tsx
const isCurrentWeek = isSameWeek(referenceDate, new Date(), {
  weekStartsOn: 1,
});
```

`isSameWeek(a, b, opts)` devuelve `true` si `a` y `b` caen en la **misma semana calendario**. No es lo mismo que "hace menos de 7 días": si hoy es lunes y `referenceDate` es el domingo pasado, están a 1 día pero en semanas distintas, y `isSameWeek` devuelve `false`.

El `weekStartsOn: 1` tiene que coincidir con el que usamos en `startOfWeek` y `endOfWeek`. Si aquí lo omitiéramos, `isSameWeek` usaría el domingo como primer día y la comparación fallaría en los bordes.

`isCurrentWeek` se usa para **dos cosas**:

1. Deshabilitar el botón "Sig" en el header cuando ya estamos en la semana de hoy.
2. Cortocircuitar `nextWeek()` si por algún motivo se llamara desde otro sitio.

Es la barrera que impide que el usuario navegue a semanas futuras.

---

## Análisis: `nextWeek` con guarda de dominio

```tsx
function nextWeek() {
  if (isCurrentWeek) return;
  setWeekOffset((prev) => prev + 1);
}
```

Aquí conviven dos protecciones:

- **En la UI:** `<Button onClick={nextWeek} disabled={isCurrentWeek}>Sig</Button>`. El botón no se puede pulsar cuando ya estamos en la semana actual.
- **En la lógica:** el propio `nextWeek` comprueba `isCurrentWeek` y devuelve pronto si es `true`.

**¿Por qué la doble protección?** Porque la UI no siempre es el único camino. Si mañana se añadiese un atajo de teclado (`→`) que llamara a `nextWeek`, o si otro componente reutilizara la función, la guarda dentro de la función seguiría vigente. La UI se ocupa de la experiencia; la lógica se ocupa de la corrección.

**Regla:** las invariantes del dominio se protegen en el punto donde se aplican, no sólo en la UI. Un botón `disabled` es una comodidad; la garantía real vive en la función.

---

## Análisis: `prevWeek` sin límite

```tsx
function prevWeek() {
  setWeekOffset((prev) => prev - 1);
}
```

Hacia atrás no hay tope. El usuario puede navegar arbitrariamente lejos en el pasado. Motivos:

- **No es un problema de dominio:** las semanas pasadas siempre existieron; marcarlas o desmarcarlas es válido (útil si olvidé anotar algo).
- **No es un problema de rendimiento:** el cálculo de `visibleDates` es constante independientemente de qué tan atrás vayamos.
- **La memoria no crece:** `weekOffset` sigue siendo un `number` sin importar su magnitud.

Al no haber tope, `prevWeek` es una función de una línea. Comparada con `nextWeek`, es un buen ejemplo de que las asimetrías del dominio se traducen en asimetrías del código.

---

## Análisis: `toggleHabit` no cambia

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

**Idéntica a la de las fases anteriores.** Este es el punto interesante: la función recibe una `date` cualquiera y trabaja sobre esa fecha absoluta. No sabe ni le importa si esa fecha pertenece a la semana visible, a una pasada o a una futura.

Como en `HabitList` cada botón de día pasa su propia `date` desde `visibleDates`, marcar el lunes de hace tres semanas simplemente hace `toggleHabit(id, esaFechaLunes)`. La función guarda o quita esa fecha absoluta del array `completions`, sin lógica de "convertir a offset" ni cálculos relativos.

### ¿Por qué guardar fechas absolutas y no relativas?

Otra opción sería guardar cada completado como "hace N días" desde la fecha de creación del hábito. Sería un desastre:

- El significado cambiaría con el paso del tiempo. Una entrada de "hace 3 días" grabada un lunes no significa lo mismo si la leemos un jueves.
- Habría que recalcular todos los offsets cada vez que quisiéramos mostrar algo.
- El backup del JSON dejaría de ser interpretable sin conocer la fecha exacta en que se creó.

Guardar `Date` absolutos (fecha calendario) hace que el JSON sea autocontenido y **estable en el tiempo**. El coste es que hace falta el reviver de la [Fase 3](./03-uselocalstorage.md#análisis-el-reviver-de-jsonparse) para reconstruir los `Date`, pero eso ya está resuelto.

**Regla:** las fechas guardadas son absolutas. Los offsets son sólo para navegación en la UI, nunca para almacenamiento.

---

## Cambio en `Header`

`src/components/Header.tsx` deja de calcular `startOfWeek` / `endOfWeek` por su cuenta y conecta los botones a `prevWeek` / `nextWeek`:

```tsx
import { useHabits } from "../context/HabitProvider";
import { Button } from "./Button";
import { format, isToday } from "date-fns";

export function Header() {
  const { habits, visibleDates, isCurrentWeek, nextWeek, prevWeek } =
    useHabits();

  const doneToday = habits.filter((h) =>
    h.completions.some((c) => isToday(c)),
  ).length;

  const firstDay = format(visibleDates[0], "MMM d");
  const lastDay = format(visibleDates[6], "MMM d");

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
          <Button onClick={prevWeek}>Prev</Button>
          <Button onClick={nextWeek} disabled={isCurrentWeek}>
            Sig
          </Button>
        </div>
      </div>
    </header>
  );
}
```

Diferencias respecto a la Fase 3:

- **`visibleDates`, `isCurrentWeek`, `nextWeek`, `prevWeek`** ahora vienen del contexto.
- **`firstDay` y `lastDay`** se calculan a partir de `visibleDates[0]` y `visibleDates[6]`, no volviendo a llamar a `startOfWeek` / `endOfWeek` como antes. Menos código y una única fuente de verdad.
- **`doneToday`** sigue usando `isToday(c)`, **no** `visibleDates`. Es intencional: la métrica del header se refiere siempre a **hoy real**, aunque el usuario esté mirando otra semana. Si estamos revisando la semana pasada, el `X / Y done today` sigue diciéndonos cuántos hábitos hemos completado en el día de hoy, no en la semana visible.

---

## Cambio en `HabitList`

`src/components/HabitList.tsx` deja de calcular `visibleDates` localmente y lo recibe del contexto:

```tsx
import { Button } from "./Button";
import { format, isFuture, isSameDay } from "date-fns";
import { useHabits, type Habit } from "../context/HabitProvider";

type HabitItemProps = {
  habit: Habit;
  visibleDates: Date[];
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string, date: Date) => void;
};

export function HabitList() {
  const { habits, deleteHabit, toggleHabit, visibleDates } = useHabits();

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

Diferencias respecto a la Fase 3:

- **`visibleDates`** viene del contexto. Los imports `eachDayOfInterval`, `startOfWeek`, `endOfWeek` **desaparecen** de este archivo porque ya no se calcula nada de fechas aquí.
- **`isFuture(date)`** se mantiene. Su rol también cambia sutilmente: en Fase 3 sólo era relevante en la semana actual (los días futuros eran los que aún no llegaron esta semana). En Fase 4 sigue disparándose sólo en la semana actual, porque las semanas pasadas no contienen días futuros y las semanas futuras no son alcanzables por la navegación. La lógica del botón es la misma; el motivo por el que rara vez aparece deshabilitado no.

---

## Ciclo de una interacción: pulsar "Prev"

Para consolidar el flujo con la nueva navegación:

1. El usuario pulsa el botón "Prev" del header.
2. React ejecuta `onClick={prevWeek}` → `setWeekOffset((prev) => prev - 1)`.
3. React encola la actualización de `weekOffset`. El nuevo valor pasa de `0` a `-1`.
4. Se re-renderiza el `HabitProvider`. Con `weekOffset = -1`:
   - `referenceDate = addWeeks(new Date(), -1)` → hace una semana.
   - `visibleDates` = los 7 días de esa semana pasada.
   - `isCurrentWeek = isSameWeek(hace_una_semana, hoy) = false`.
5. El objeto pasado a `<HabitContext value={{...}}>` es nuevo (referencia distinta). Los consumidores se re-renderizan.
6. En `Header`, `firstDay` y `lastDay` se recalculan a partir de las nuevas `visibleDates`. El texto pasa de `Aug 3 - Aug 9` a `Jul 27 - Aug 2`. El botón "Sig" deja de estar `disabled` porque `isCurrentWeek` ahora es `false`.
7. En `HabitList`, cada `HabitItem` re-renderiza sus 7 botones de día con las fechas de la semana pasada. Los botones se pintan violetas o grises según si esa fecha aparece en `habit.completions`.
8. `doneToday` en el header **no cambia**: sigue midiéndose contra `isToday(c)`, que ignora `visibleDates`.

Volver hacia adelante es simétrico: `nextWeek` incrementa `weekOffset`. Cuando el nuevo `weekOffset` hace que `isCurrentWeek` vuelva a ser `true`, el botón "Sig" se auto-deshabilita.

---

## Cómo probar la fase

```bash
npm run dev
```

Verificaciones manuales:

1. Al abrir la app, el header muestra el rango de la semana actual (por ejemplo, `Aug 4 - Aug 10` si hoy es 4 de agosto). El botón "Sig" aparece deshabilitado. El botón "Prev" está habilitado.
2. Agregar "Leer" y marcar el día de hoy. El botón se pone violeta.
3. Pulsar "Prev". El rango del header pasa a la semana anterior. Los 7 botones de día en cada hábito muestran los días de esa semana. "Sig" ahora está habilitado.
4. Pulsar "Prev" varias veces más (5, 10). El rango sigue retrocediendo sin límite.
5. Marcar un día cualquiera de una semana pasada. El botón se pone violeta. Volver a pulsar "Sig" hasta llegar de nuevo a la semana actual: el botón "Sig" se deshabilita en el momento exacto en que `isCurrentWeek` vuelve a ser `true`.
6. Estando en la semana actual, verificar que el botón del día de hoy sigue violeta (paso 2) y que ningún botón está marcado en semanas futuras: no se puede llegar a ellas.
7. Retroceder 3 semanas, marcar dos días distintos, volver a la semana actual y **recargar la página**. Los hábitos y sus completados siguen ahí (herencia de Fase 3), pero el rango del header vuelve a mostrar la semana actual. Retroceder 3 semanas y comprobar que los dos días marcados se conservan.
8. Abrir DevTools → Application → Local Storage. La clave `habits` está presente; **no** debe existir una clave `weekOffset` ni similar.

Si todos los pasos funcionan, la fase está terminada.

---

## Checklist para replicar esta fase

- [ ] `HabitProvider` declara `useState(0)` para `weekOffset`, **sin** `useLocalStorage`.
- [ ] El tipo `Context` incluye `visibleDates: Date[]`, `isCurrentWeek: boolean`, `nextWeek: () => void`, `prevWeek: () => void`.
- [ ] `referenceDate = addWeeks(new Date(), weekOffset)` se recalcula en cada render.
- [ ] `visibleDates` se calcula con `eachDayOfInterval` + `startOfWeek` + `endOfWeek`, todos con `{ weekStartsOn: 1 }`.
- [ ] `isCurrentWeek = isSameWeek(referenceDate, new Date(), { weekStartsOn: 1 })`.
- [ ] `nextWeek` cortocircuita si `isCurrentWeek` es `true` (guarda de dominio además del `disabled` en el botón).
- [ ] `prevWeek` no tiene límite y usa la forma funcional `setWeekOffset((prev) => prev - 1)`.
- [ ] `toggleHabit` **no cambió** respecto a fases anteriores: sigue guardando fechas absolutas.
- [ ] `Header` obtiene `visibleDates`, `isCurrentWeek`, `nextWeek`, `prevWeek` del contexto.
- [ ] `Header` calcula `firstDay`/`lastDay` a partir de `visibleDates[0]` y `visibleDates[6]`, no volviendo a llamar a `startOfWeek`/`endOfWeek`.
- [ ] `Header` mantiene `doneToday` con `isToday(c)`, no con `visibleDates`.
- [ ] `HabitList` obtiene `visibleDates` del contexto y ya **no** lo calcula localmente.
- [ ] Los imports de `startOfWeek`, `endOfWeek`, `eachDayOfInterval` han desaparecido de los componentes de UI.
- [ ] Los botones "Prev" y "Sig" del header están conectados a `prevWeek` y `nextWeek`.
- [ ] "Sig" está `disabled` cuando `isCurrentWeek` es `true`.
- [ ] Al recargar, los hábitos persisten pero se vuelve siempre a la semana actual.

---

## Limitaciones y qué viene después

| No funciona | Motivo |
|---|---|
| Marcar visualmente qué botón corresponde al día de hoy | Ningún estilo diferencia el día actual del resto dentro de la semana visible. |
| Renombrar un hábito ya creado | Todavía no hay UI ni función para editar el `name`. |
| Rachas (streaks) o resúmenes semanales | El modelo `Habit` no expone métricas derivadas; los componentes tampoco las calculan. |
| Sincronizar entre dispositivos | Sigue vigente la limitación de la [Fase 3](./03-uselocalstorage.md): `localStorage` es local al navegador. |

Todo esto se resuelve más adelante:

- **[Fase 5 — Edición de hábitos](./05-edicion-habitos.md)** — se añade una función `renameHabit(id, name)` al provider y un modo edición en `HabitItem`.
- **Fase 6 — Estadísticas** *(pendiente de escribir)* — rachas, completados por semana, gráficos. El cálculo vive en funciones puras sobre `habit.completions`.
- **Fase 7 — Sincronización con backend** *(pendiente de escribir)* — `useLocalStorage` se reemplaza por llamadas a la API. El resto del código no se entera, igual que ocurrió al pasar de Fase 2 a Fase 3.
