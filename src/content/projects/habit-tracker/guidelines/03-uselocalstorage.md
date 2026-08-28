# Fase 3 — Persistencia con `useLocalStorage`

En esta fase los hábitos **sobreviven a la recarga**. La [Fase 2](./02-context-y-estado.md) dejó los datos en memoria: al cerrar la pestaña se perdían. Ahora se crea un hook genérico —`useLocalStorage`— que se comporta como `useState` pero además sincroniza el valor con `localStorage` del navegador. En el `HabitProvider` cambia **una sola línea**: la del `useState`.

---

## Objetivo de la fase

Al terminar la Fase 3 la app debe:

- Guardar los hábitos y sus completados en `localStorage` automáticamente, sin llamadas manuales desde los componentes.
- Restaurar el estado completo al recargar la página o volver más tarde.
- Reconstruir los objetos `Date` guardados (que `JSON` serializa como strings) sin que ningún consumidor tenga que preocuparse.
- Ofrecer un hook reutilizable (`useLocalStorage<T>`) que sirva para cualquier tipo de estado, no sólo para `Habit[]`.

Lo que **no** vamos a tener todavía:

- No hay navegación entre semanas: los días visibles siguen siendo los de la semana actual.
- Los botones "Prev" y "Sig" siguen inertes.
- No hay sincronización con un servidor: si el usuario cambia de navegador o borra los datos del sitio, empieza de cero.

La navegación semanal llega en la Fase 4. La sincronización entre dispositivos queda para las fases futuras.

---

## Estructura de carpetas al final de la fase

Aparece una carpeta nueva: `hooks/`.

```
src/
├── components/
│   ├── Button.tsx        ← sin cambios respecto a Fase 2
│   ├── Header.tsx        ← sin cambios
│   ├── HabitForm.tsx     ← sin cambios
│   └── HabitList.tsx     ← sin cambios
├── context/
│   └── HabitProvider.tsx ← cambia una línea: useState → useLocalStorage
├── hooks/
│   └── useLocalStorage.ts ← nuevo
├── guidelines/
├── App.tsx               ← sin cambios
├── main.tsx              ← sin cambios
└── index.css             ← sin cambios
```

Toda la fase se concentra en un archivo nuevo (`useLocalStorage.ts`) y un cambio mínimo en `HabitProvider.tsx`. Los componentes de UI **no se tocan**: siguen consumiendo `useHabits()` sin enterarse de dónde salen los datos.

---

## Repaso rápido: `localStorage`

`localStorage` es una API del navegador para guardar pares clave/valor de manera **persistente**: sobrevive a recargas, cierres de pestaña e incluso a apagar el equipo. Los datos viven por origen (dominio + protocolo + puerto).

Interfaz mínima:

```ts
localStorage.setItem("clave", "valor");   // escribe
const s = localStorage.getItem("clave");  // lee (string | null)
localStorage.removeItem("clave");         // borra
localStorage.clear();                     // borra todo
```

Restricciones que conviene tener presentes:

- **Sólo guarda strings.** Para objetos y arrays hay que serializar con `JSON.stringify` al escribir y `JSON.parse` al leer.
- **Es síncrono.** Cada lectura o escritura bloquea el hilo principal. En volúmenes normales no se nota, pero conviene no llamarlo dentro de bucles.
- **Cada origen tiene ~5 MB de cuota.** Muy amplio para un tracker de hábitos, insuficiente para guardar imágenes.
- **`JSON.stringify` convierte `Date` en string ISO**, y `JSON.parse` **no** lo revierte. Esto obliga a un tratamiento especial que se cubre más abajo.

---

## Idea del hook: `useLocalStorage`

El objetivo es que un componente pueda escribir:

```tsx
const [habits, setHabits] = useLocalStorage<Habit[]>("habits", []);
```

...y no tener que pensar más en persistencia. La firma es idéntica a la de `useState`, con una `key` extra al principio para saber bajo qué nombre guardar los datos.

Bajo el capó, el hook envuelve **dos hooks primitivos** en uno:

- **`useState`** para tener el valor vivo en memoria y provocar re-renders al cambiar.
- **`useEffect`** para escribir a `localStorage` cada vez que el valor cambia.

Es el patrón de **composición de hooks**: agrupar varios hooks primitivos dentro de una función que empiece por `use` y devolver una interfaz cómoda para el consumidor. Un hook personalizado no aporta magia nueva; sólo empaqueta hooks existentes bajo un nombre significativo.

**Regla:** cualquier función que llame a hooks de React debe empezar por `use`. Es el contrato que activa las reglas de hooks del linter y el compilador.

---

## Código completo del hook

`src/hooks/useLocalStorage.ts`:

```ts
import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    if (stored === null) return initialValue;

    return JSON.parse(stored, (_key, val) => {
      if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
        return new Date(val);
      }
      return val;
    }) as T;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

Análisis pieza por pieza a continuación.

---

## Análisis: el genérico `<T>`

```ts
export function useLocalStorage<T>(key: string, initialValue: T) {
```

- **`<T>`** es un **parámetro de tipo**. No representa un valor concreto: es un hueco que TypeScript rellena en el momento de llamar al hook.
- **`initialValue: T`** dice "el valor por defecto es del tipo `T`, sea el que sea".
- El tipo interno del `useState` también será `T`, y por tanto el `value` devuelto.

Cuando el consumidor escribe `useLocalStorage<Habit[]>("habits", [])`, `T` se resuelve a `Habit[]` para esta llamada. Si otro componente escribe `useLocalStorage<string>("theme", "dark")`, `T` es `string`. El mismo hook sirve para los dos casos sin duplicar código.

Sin genérico, habría que forzar un `any` (perdiendo el chequeo de tipos) o escribir una versión del hook por cada forma de dato (redundante).

**Regla:** si un hook tiene sentido para más de una forma de dato, se hace genérico con `<T>`. Es la forma correcta de reutilización en TypeScript.

---

## Análisis: lazy initializer `useState(() => ...)`

```ts
const [value, setValue] = useState<T>(() => {
  const stored = localStorage.getItem(key);
  if (stored === null) return initialValue;
  return JSON.parse(stored, /* ... */) as T;
});
```

El primer argumento de `useState` puede ser **el valor inicial directamente** o **una función que devuelve el valor inicial**. Cuando es una función, se llama **lazy initializer**.

Diferencia clave:

- `useState(computarValor())` — llama a `computarValor` **en cada render**, aunque React ignore el resultado a partir del segundo. Malgasta trabajo.
- `useState(() => computarValor())` — llama a `computarValor` **sólo en el primer render**. En los siguientes, React ni siquiera ejecuta la función.

Aquí importa porque `localStorage.getItem` + `JSON.parse` son operaciones síncronas y no gratis: bloquean el hilo. Ejecutarlas en cada render sería lento y, además, inútil (el valor guardado no cambia entre renders del mismo componente).

**Regla:** si el valor inicial requiere cálculo, lectura de I/O o parseo, pasarlo dentro de una arrow function.

---

## Análisis: leer de `localStorage`

```ts
const stored = localStorage.getItem(key);
if (stored === null) return initialValue;
```

`localStorage.getItem(key)` devuelve:

- Un **string** si esa clave existe.
- **`null`** si nunca se escribió nada bajo esa clave.

En el primer arranque de la app no hay nada guardado y el hook cae en `return initialValue`. En arranques posteriores, `stored` es el string JSON que se persistió la sesión anterior.

Se compara con `null` (`===`), no con `!stored`. El string `"false"` o el string `"0"` son valores válidos guardados; usar `!stored` los tomaría por vacíos y devolvería `initialValue` por error.

---

## Análisis: el problema de las fechas

`JSON.stringify` no sabe representar objetos `Date` como tales. Los convierte a strings ISO:

```ts
JSON.stringify(new Date("2026-08-04"));
// → "\"2026-08-04T00:00:00.000Z\""
```

`JSON.parse` **no** hace el camino inverso. Devuelve el string tal cual:

```ts
JSON.parse("\"2026-08-04T00:00:00.000Z\"");
// → "2026-08-04T00:00:00.000Z"  ← string, NO Date
```

Consecuencia si no hacemos nada: al recargar, `habits[0].completions[0]` sería un string. Cualquier llamada a `isSameDay(c, date)` fallaría porque `date-fns` espera objetos `Date`, y los botones de días marcados aparecerían todos grises pese a estar "guardados".

Hay dos formas de resolverlo:

1. **Recorrer el árbol** tras el `JSON.parse` y transformar los strings de fecha en `Date`. Costoso y frágil: hay que saber en qué campos aparecen fechas.
2. **Usar el reviver de `JSON.parse`.** Es la opción que usamos.

---

## Análisis: el reviver de `JSON.parse`

```ts
return JSON.parse(stored, (_key, val) => {
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
    return new Date(val);
  }
  return val;
}) as T;
```

`JSON.parse` acepta un **segundo argumento**: una función llamada **reviver**. Se ejecuta una vez por cada valor del árbol JSON, de las hojas hacia la raíz. Lo que devuelve el reviver es lo que termina en el resultado final.

Punto por punto:

- **`(_key, val)`** — el reviver recibe la clave y el valor. Aquí no usamos la clave, por eso va con guion bajo (convención para "sí, existe, pero la ignoramos a propósito").
- **`typeof val === "string"`** — sólo nos interesan los valores que hoy son strings; el resto (números, booleanos, arrays, objetos) se devuelven tal cual con `return val`.
- **`/^\d{4}-\d{2}-\d{2}T/`** — expresión regular que reconoce el **prefijo** de una fecha ISO: cuatro dígitos, guion, dos dígitos, guion, dos dígitos, `T`. Ejemplo: `"2026-08-04T00:00:00.000Z"`.
- **`new Date(val)`** — reconstruye el objeto `Date` a partir de ese string.

**¿Por qué no una regex más estricta?** La versión completa de ISO 8601 se vuelve ilegible enseguida. El prefijo `AAAA-MM-DDT` ya descarta casi cualquier string humano (nombres de hábitos, IDs UUID, etc.) y es suficiente para nuestros datos.

**¿Qué pasa con un nombre de hábito tipo `"2026-08-04T mañana"`?** Sería un falso positivo. En la práctica no ocurre, pero conviene tenerlo en mente: si algún día se permitieran nombres arbitrarios que empezaran así, la regex habría que reforzarla.

**Regla:** cuando un tipo (como `Date`) no sobrevive el ciclo `stringify → parse`, la restauración va en el reviver del `parse`, no dispersa por los consumidores.

---

## Análisis: `as T` al final del parse

```ts
return JSON.parse(stored, /* ... */) as T;
```

`JSON.parse` devuelve `any`. Con `as T` se le indica a TypeScript "confiamos en que el JSON guardado corresponde al tipo `T`". Es una promesa que el hook hace al consumidor: si guardó un `Habit[]`, al leer recibirá un `Habit[]`.

Esta afirmación **no** verifica nada en tiempo de ejecución. Si el JSON estuviera corrupto (por ejemplo, el usuario editó `localStorage` a mano), el error aparecería más tarde, al usar el dato. Para aplicaciones críticas se validaría con Zod, Valibot o similar; en un tracker personal el nivel de riesgo no lo justifica.

---

## Análisis: `useEffect` para escribir

```ts
useEffect(() => {
  localStorage.setItem(key, JSON.stringify(value));
}, [key, value]);
```

`useEffect` ejecuta la función que le pasamos **después** de que React haya pintado el render. El array de dependencias `[key, value]` le dice a React "vuelve a ejecutar este efecto si `key` o `value` cambian".

- **Al montar** el componente: se ejecuta una vez, guardando el valor inicial en `localStorage`.
- **Cada vez que cambia `value`**: se ejecuta y persiste el nuevo valor.
- **Si cambia `key`**: también se persiste bajo la nueva clave (raro en la práctica, pero contemplado por el sistema de dependencias).

**¿Por qué en un efecto y no envolviendo `setValue`?** Podríamos escribir una función que actualice el estado **y** llame a `localStorage.setItem`. Pero al usar `useState` directamente aprovechamos la forma funcional (`setValue(prev => ...)`), que se pierde si envolvemos el setter. Delegar la escritura a un efecto mantiene la firma idéntica a la de `useState` y todos los patrones aprendidos en la [Fase 2](./02-context-y-estado.md#análisis-la-forma-funcional-setstateprev--) siguen funcionando.

**¿Por qué no `useLayoutEffect`?** `useEffect` corre después del pintado, sin bloquearlo. Para persistencia no importa cuándo se escriba mientras se escriba; `useEffect` es la opción por defecto.

**¿Y el replacer de `JSON.stringify`?** No hace falta. `JSON.stringify(value)` recorre el árbol y convierte los `Date` a strings ISO automáticamente. La conversión de ida sale gratis; sólo el camino de vuelta necesita ayuda (el reviver del `parse`).

---

## Análisis: `as const` en el retorno

```ts
return [value, setValue] as const;
```

Sin `as const`, TypeScript inferiría el tipo de retorno como:

```ts
(T | React.Dispatch<React.SetStateAction<T>>)[]
```

Es decir, "un array cuyos elementos son o el valor o el setter, en cualquier orden". El consumidor haría `const [x, setX] = useLocalStorage(...)` y ambos tendrían el tipo unión, obligando a comprobar cuál es cada uno.

Con `as const`, TypeScript infiere una **tupla**:

```ts
readonly [T, React.Dispatch<React.SetStateAction<T>>]
```

Ahora la posición 0 tiene tipo `T` y la posición 1 tiene el tipo del setter, sin unión. `useState` interno ya devuelve una tupla; con `as const` propagamos esa forma al consumidor sin volver a escribir tipos.

**Regla:** un hook que devuelve `[valor, setter]` cierra con `as const`. Es la única forma corta de conseguir la tupla en el retorno.

---

## El único cambio en `HabitProvider`

`src/context/HabitProvider.tsx` cambia **un import y una línea**:

```tsx
import { createContext, useContext, type ReactNode } from "react";
import { isSameDay } from "date-fns";
import { useLocalStorage } from "../hooks/useLocalStorage";

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
  const [habits, setHabits] = useLocalStorage<Habit[]>("habits", []);

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

Los cambios respecto a la [Fase 2](./02-context-y-estado.md):

- **Se importa** `useLocalStorage` desde `../hooks/useLocalStorage`.
- **Desaparece** el import de `useState` (ya no se usa aquí directamente).
- **Se reemplaza** `useState<Habit[]>([])` por `useLocalStorage<Habit[]>("habits", [])`.

Nada más. Las tres funciones modificadoras (`addHabit`, `deleteHabit`, `toggleHabit`) siguen igual porque la firma de `setHabits` no cambió: `useLocalStorage` devuelve la misma tupla `[valor, setter]` que `useState`.

Este es el efecto más importante de la fase: el resto del código **no se entera** de que ahora hay persistencia. Es lo que hace que sea seguro añadir capacidades por capas.

---

## Ciclo de una interacción con persistencia

Para consolidar cómo todo encaja, este es el flujo completo cuando el usuario **marca un día**:

1. Click en un botón de día → `toggleHabit(habit.id, date)` (idéntico a la Fase 2).
2. `setHabits((prev) => ...)` encola la actualización.
3. React recalcula el estado, re-renderiza el `HabitProvider` y todos los consumidores ven los nuevos datos.
4. **Nuevo:** al terminar el render, el `useEffect` interno de `useLocalStorage` detecta que `value` cambió y llama a `localStorage.setItem("habits", JSON.stringify(value))`.
5. El navegador escribe el JSON. Si el usuario cierra la pestaña ahora, al volver los hábitos siguen ahí.

Cuando la app **arranca desde cero** en una recarga:

1. React monta el árbol y llega al `HabitProvider`.
2. Se ejecuta el lazy initializer del `useState` interno: `localStorage.getItem("habits")` devuelve el JSON de la sesión anterior.
3. `JSON.parse` con reviver recorre el árbol y transforma los strings de fecha en `Date`.
4. El estado inicial ya es el `Habit[]` completo. Los consumidores se renderizan con los datos reales desde el primer pintado.

El usuario no ve un flash de "sin hábitos" seguido del contenido real: como la lectura es síncrona y ocurre antes del primer render, la UI aparece directamente con todo cargado.

---

## Cómo probar la fase

```bash
npm run dev
```

Verificaciones manuales:

1. Al abrir la app por primera vez (o tras borrar los datos del sitio), no hay hábitos. Se muestra el mensaje de bienvenida y el header dice `0 / 0 done today`.
2. Agregar "Leer" y "Correr". Marcar el día de hoy en "Leer". El header pasa a `1 / 2 done today`.
3. **Recargar la página** (F5). Los dos hábitos siguen ahí. "Leer" continúa marcada hoy con el botón violeta. El header sigue diciendo `1 / 2 done today`.
4. Abrir las DevTools del navegador → pestaña **Application** → **Local Storage** → seleccionar el origen. Debe existir una clave `habits` con un JSON tipo:
   ```json
   [{"id":"...","name":"Leer","completions":["2026-08-04T..."]},{"id":"...","name":"Correr","completions":[]}]
   ```
5. Borrar la entrada `habits` desde las DevTools y recargar. La app vuelve al estado vacío. Confirma que el hook lee de la clave correcta.
6. Agregar un hábito y **cerrar la pestaña** por completo. Volver a abrir la URL en una pestaña nueva: el hábito sigue.
7. Marcar el día de hoy en un hábito, recargar y comprobar que sigue marcado con el botón violeta. Esto valida que las fechas se rehidratan como `Date` reales; si volvieran como strings, `isSameDay` fallaría y el botón aparecería gris pese a estar guardado.

Si todos los pasos funcionan, la fase está terminada.

---

## Checklist para replicar esta fase

- [ ] Existe la carpeta `src/hooks/` con el archivo `useLocalStorage.ts`.
- [ ] `useLocalStorage` es genérica: `<T>(key: string, initialValue: T)`.
- [ ] Usa un lazy initializer `useState<T>(() => ...)` que lee de `localStorage.getItem(key)`.
- [ ] Trata `stored === null` como "primer arranque" y devuelve `initialValue`.
- [ ] `JSON.parse` recibe un reviver que convierte strings con formato ISO en `new Date(val)`.
- [ ] Un `useEffect` con dependencias `[key, value]` escribe a `localStorage.setItem(key, JSON.stringify(value))`.
- [ ] El hook devuelve `[value, setValue] as const` para conservar la forma de tupla.
- [ ] En `HabitProvider`, `useState<Habit[]>([])` fue reemplazado por `useLocalStorage<Habit[]>("habits", [])`.
- [ ] El import de `useState` se retiró de `HabitProvider` si ya no se usa allí.
- [ ] Ningún componente de UI cambió: siguen consumiendo `useHabits()` sin conocer la persistencia.
- [ ] Los hábitos, sus IDs y sus completados sobreviven a la recarga.
- [ ] Las fechas de `completions` vuelven a ser objetos `Date` reales (verificable porque los botones siguen pintados de violeta tras recargar).

---

## Limitaciones y qué viene después

| No funciona | Motivo |
|---|---|
| Ver semanas anteriores o futuras | `visibleDates` sigue calculándose desde `new Date()` sin desplazamiento. |
| Los botones "Prev" y "Sig" | Todavía no tienen `onClick` que modifique el estado de la semana visible. |
| Sincronización entre dispositivos | `localStorage` es local al navegador. Cambiar de equipo o borrar los datos del sitio pierde el historial. |
| Migrar el esquema si cambia el tipo `Habit` | El JSON guardado no lleva versión. Si mañana el tipo `Habit` gana un campo nuevo, hay que decidir cómo tratar los datos antiguos. |

Todo esto se resuelve más adelante:

- **[Fase 4 — Navegación entre semanas](./04-navegacion-semanas.md)** — se añade un `weekOffset` al `HabitProvider` y los botones Prev/Sig cobran vida. Se decide, además, **no** persistir el `weekOffset`: al recargar siempre se vuelve a la semana actual.
- **Fases futuras** — sincronización con backend y versionado del esquema. `useLocalStorage` se sustituye por llamadas a la API cuando llegue el momento.
