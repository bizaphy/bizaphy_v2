# Meta-tutorial — Cómo escribir una guía de fase

Este archivo no explica una fase del proyecto. Explica **cómo escribir** los tutoriales que sí lo hacen. La referencia son las guías [`01-stateless-components.md`](./01-stateless-components.md) y [`02-context-y-estado.md`](./02-context-y-estado.md): cualquier guía nueva (Fase 3, Fase 4, Fase N) debe seguir la misma forma para que se lean como una serie coherente.

Se usa cuando:

- Se termina una fase de código nueva y hay que documentarla.
- Alguien retoma el proyecto meses después y necesita replicar cómo escribimos las guías anteriores.
- Se detecta que una guía existente no sigue este patrón y hay que reescribirla.

---

## Filosofía de las guías

Todas las guías del proyecto comparten cuatro reglas de fondo. Si una guía nueva rompe alguna, no encaja con el resto.

### 1. Una guía = una fase = una capacidad nueva

Cada tutorial documenta **una única capa** del proyecto: la Fase 1 introduce componentes sin estado, la Fase 2 introduce estado + contexto, etc. No se mezclan capas. Si al escribir la Fase 3 aparece la tentación de "aprovechar y explicar también cómo optimizar renders con `useMemo`", se resiste. Se abre una fase separada o se ignora.

### 2. Cada guía se basta a sí misma

Alguien que llega desde el índice y lee **sólo** la guía de la Fase 3 debe poder replicar esa fase sin abrir la de Fase 2. Se puede asumir que ya existe el estado de la fase anterior (los tutoriales enlazan hacia atrás), pero no se puede asumir que el lector la lee de arriba a abajo en una sola sesión.

### 3. Explicar el "por qué", no repetir el "qué"

El nombre del código ya dice qué hace: `addHabit` añade un hábito. La guía explica **por qué** se hizo así: por qué `crypto.randomUUID()` y no un contador, por qué la forma funcional `setState(prev => ...)`, por qué el tipo `Habit` vive en `HabitProvider.tsx` y no en `HabitList.tsx`. Cada decisión no obvia lleva una justificación.

### 4. Reglas transversales del proyecto

Estas reglas aplican dentro del código que se muestra en cualquier guía. Están declaradas en el [índice](./00-indice.md#reglas-transversales) y se repiten aquí para tenerlas a mano al redactar:

- **Nombres explícitos**: `visibleDates` mejor que `dates`, `weekOffset` mejor que `offset`.
- **Tipos junto al dueño del dato**: si el estado vive en `HabitProvider`, el tipo `Habit` también.
- **Nunca mutar**: siempre `.map()`, `.filter()`, spread. Nunca `push`, `splice`, asignación a índice.
- **Un componente, una responsabilidad**.
- **Sin abstracciones prematuras**: tres líneas repetidas son mejor que un helper que se usará una sola vez.
- **Comentarios sólo cuando el "por qué" no sea evidente**.

Cuando el código dentro de una guía rompa alguna de estas reglas, la guía deja de servir como referencia — y el problema está en el código, no en la guía.

---

## Estructura obligatoria de una guía de fase

Toda guía nueva sigue el mismo esqueleto en el mismo orden. Se puede ampliar (añadir secciones extra entre las obligatorias), pero **no** se puede reordenar ni suprimir.

```
1. Título              → # Fase N — Nombre corto
2. Introducción        → 2-4 líneas: qué introduce esta fase, cómo se conecta con la anterior
3. Objetivo            → qué se puede hacer al terminar / qué NO
4. Estructura          → árbol de carpetas al final de la fase
5. Conceptos nuevos    → un bloque por concepto, en orden de dependencia
6. Código completo     → los archivos que se crean o cambian, íntegros
7. Análisis            → explicación línea a línea de los bloques no triviales
8. Cómo probar         → pasos manuales para verificar en el navegador
9. Checklist           → lista con casillas para replicar la fase
10. Limitaciones + siguiente fase → qué no funciona todavía y en qué guía se resuelve
```

A continuación cada sección con detalle.

---

### 1. Título

Formato exacto: `# Fase N — Nombre corto en minúscula`.

- `N` es el número de la fase (Fase 1, Fase 2, ...).
- El nombre debe coincidir con el que aparece en el [índice](./00-indice.md).
- Se usa el guion largo `—` (U+2014), no el corto `-`.

Ejemplos existentes:

- `# Fase 1 — Componentes funcionales sin estado (stateless)`
- `# Fase 2 — Estado global desde el inicio: Context + \`useState\``

Después del título, siempre una línea horizontal `---` separadora.

---

### 2. Introducción (2-4 líneas)

Un párrafo corto que responde a tres preguntas:

- **¿Qué introduce esta fase?** (una frase)
- **¿Qué se apoya en la fase anterior?** (mencionarla con un enlace `[Fase N-1](./NN-nombre.md)`)
- **Cuál es el objetivo pedagógico?** (por qué se hace ahora y no antes o después)

Ejemplo (adaptado de la Fase 2):

> En esta fase la aplicación deja de ser estática. El array `habits` que en la [Fase 1](./01-stateless-components.md) estaba hardcodeado se mueve a un `useState` dentro de un `HabitProvider`. A partir de aquí se pueden agregar, eliminar y marcar hábitos, y la UI se actualiza sola.

No se abre con una lista, ni con un ToC, ni con "en este tutorial aprenderás...". Va directo.

---

### 3. Objetivo de la fase (qué sí / qué no)

Dos bloques separados con encabezado `## Objetivo de la fase`:

**Bloque A — lo que sí:** una lista de 3-6 puntos concretos que el usuario podrá hacer al terminar. Escritos en presente ("Permitir agregar un hábito"), no en futuro.

**Bloque B — lo que no:** una lista de 2-4 puntos con lo que **no** funciona todavía, cada uno con su motivo cuando aporta. Es tan importante como el bloque A porque frena expectativas y evita que el lector piense "esto está roto" cuando en realidad es de la fase siguiente.

Formato del bloque B:

```markdown
Lo que **no** vamos a tener todavía:

- No hay persistencia: al recargar la página se pierde todo.
- No hay navegación entre semanas: los días visibles siempre son los de la semana actual.
- El botón "Sig" está deshabilitado porque nunca se puede avanzar.
```

Estas dos listas se cierran con una frase corta indicando en qué fase(s) se resuelven las limitaciones.

---

### 4. Estructura de carpetas al final de la fase

Un árbol ASCII de `src/` **al terminar la fase**, comentado en las líneas relevantes. Se muestra qué carpeta o archivo es nuevo, cuál cambia y cuál no se toca.

```
src/
├── components/
│   ├── Button.tsx        ← sin cambios respecto a Fase 1
│   ├── Header.tsx        ← ahora consume el contexto
│   ├── HabitForm.tsx     ← input controlado + llamada a addHabit
│   └── HabitList.tsx     ← consume habits, deleteHabit, toggleHabit
├── context/
│   └── HabitProvider.tsx ← nuevo
├── App.tsx               ← ahora envuelve todo con <HabitProvider>
└── ...
```

Debajo del árbol, una línea que aclare qué carpetas **aún no existen** ("La carpeta `hooks/` sigue sin existir, se creará en la Fase 3"). Ayuda a alguien que replique la fase a no adelantarse.

---

### 5. Conceptos nuevos (uno por bloque, en orden de dependencia)

Aquí vive la parte pedagógica más densa. Cada concepto nuevo tiene su propio subtítulo `##` o `###`. Se ordenan por dependencia: si el concepto B necesita entender A, A va antes.

Ejemplos de bloques usados en Fase 2:

- `## Repaso rápido: qué es \`useState\``
- `## El \`HabitProvider\``
- `## Análisis: \`useState<Habit[]>([])\``
- `## Análisis: la forma funcional \`setState(prev => ...)\``
- `## Análisis: inmutabilidad`
- `## Análisis: el patrón toggle`

Cada bloque sigue una micro-estructura:

1. **Frase introductoria** — qué es el concepto en una oración.
2. **Sintaxis o firma** — el fragmento mínimo de código que lo muestra.
3. **Explicación línea a línea** o punto por punto — usando listas con negritas para los términos clave.
4. **Por qué se usa aquí** — la justificación específica al contexto del proyecto.
5. **Regla** (opcional) — si el concepto genera una regla general, se cierra con una línea `**Regla:** ...`.

Ejemplo mínimo del patrón:

```markdown
## Análisis: la forma funcional `setState(prev => ...)`

Todas las funciones modificadoras siguen el mismo patrón:

\`\`\`tsx
setHabits((prev) => /* nuevo array basado en prev */);
\`\`\`

En vez de pasarle a `setHabits` el nuevo valor directamente, le pasamos una **función** que recibe el valor anterior y devuelve el nuevo.

**¿Por qué?** Porque cuando escribimos `setHabits([...habits, nuevo])`, la variable `habits` captura el valor que había en el momento en que se creó la función. Si React programa la actualización...

**Regla:** si el nuevo estado depende del anterior, usar la forma funcional. Siempre.
```

---

### 6. Código completo de los archivos que se crean o cambian

Cuando toca mostrar el resultado, se incluye **el archivo entero** tal como quedará al final de la fase. No fragmentos.

Motivos:

- El lector puede copiar y pegar sin reconstruir el archivo mentalmente.
- Deja claro qué imports son necesarios.
- Evita el "esto va aquí, esto va allá" que confunde en tutoriales largos.

Excepción única: si el archivo se muestra por partes en un bloque de análisis previo, se puede omitir en esta sección o incluirlo comprimido. Pero como regla, va entero.

Formato:

```markdown
### El componente `HabitProvider`

\`\`\`tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import { isSameDay } from "date-fns";

export type Habit = { id: string; name: string; completions: Date[] };

// ... el archivo íntegro
\`\`\`

Análisis pieza por pieza a continuación.
```

La última línea ("Análisis pieza por pieza a continuación") es el enlace natural entre el bloque de código completo y los bloques `## Análisis: ...` que vienen después.

---

### 7. Análisis línea a línea de los bloques no triviales

Cada función o patrón que introduce algo nuevo se disecciona en su propio bloque `## Análisis: ...`. Los bloques triviales (por ejemplo un `if (habits.length === 0)` de guarda) no necesitan análisis propio.

Herramientas visuales que se usan en 01 y 02:

**Tablas** para tipos y campos:

```markdown
| Campo | Tipo | Qué es en memoria |
|---|---|---|
| `id` | `string` | Cadena de texto. UUID v4. |
| `name` | `string` | Nombre visible. |
| `completions` | `Date[]` | Array de fechas. `[]` = nunca completado. |
```

**Diagramas ASCII de memoria** para arrays y objetos:

```markdown
habits = [
  { id: "1", name: "Leer",    completions: [ Date(2026-07-27) ] },
  { id: "2", name: "Correr",  completions: [] },
]
```

Estos diagramas son especialmente útiles cuando el lector todavía no tiene un modelo mental sólido de la estructura.

**Trazas paso a paso** para flujos de interacción (ver la sección "Ciclo de una interacción" en la Fase 2). Se numeran del 1 al N y describen qué ocurre en cada paso desde que el usuario hace click hasta que la UI se actualiza.

---

### 8. Cómo probar la fase

Bloque `## Cómo probar la fase`. Empieza con el comando de arranque y sigue con una lista **numerada** de acciones concretas que el lector puede reproducir.

Cada paso combina la acción y la comprobación:

```markdown
1. Al cargar la página, no hay hábitos. Se muestra "Aun no hay habitos...".
   El header dice `0 / 0 done today`.
2. Escribir "Leer" en el input y pulsar "Agregar habito". Aparece la tarjeta
   con 7 botones grises. Header: `0 / 1 done today`.
```

Reglas para esta sección:

- **Numerar los pasos**, no usar bullets. El orden importa.
- **Cada paso debe ser verificable a ojo** en el navegador. Nada de "revisar la consola de React DevTools".
- **Incluir al menos un paso que verifique una limitación conocida** ("Recargar la página. Todo desaparece. Esto es esperado en Fase 2 y se resolverá en Fase 3").
- Cerrar con una línea única: "Si todos los pasos funcionan, la fase está terminada."

---

### 9. Checklist para replicar la fase

Bloque `## Checklist para replicar esta fase`. Lista de casillas Markdown (`- [ ]`) que resume los criterios de aceptación técnicos, **no** los pasos visuales de la sección anterior.

La diferencia:

- **"Cómo probar"** verifica que la UI funciona (test manual).
- **"Checklist"** verifica que la estructura del código es la correcta (auditoría estática).

Un checklist típico incluye:

- Archivos y carpetas que deben existir.
- Tipos exportados con sus firmas.
- Funciones clave con su implementación mínima ("`addHabit` usa `crypto.randomUUID()` y `setHabits(prev => [...prev, ...])`).
- Comprobaciones de que no queda código de fases anteriores que ya no encaja (ej. array hardcodeado).

Cuando una casilla se puede verificar leyendo el código, se marca con lo mínimo que la haga inequívoca:

```markdown
- [ ] `HabitProvider.tsx` declara y exporta el tipo `Habit`.
- [ ] Crea el contexto con `createContext<null | Context>(null)`.
- [ ] `useHabits()` comprueba `null` y lanza un error si el hook se usa fuera del provider.
```

---

### 10. Limitaciones y qué viene después

Última sección obligatoria. `## Limitaciones y qué viene después`. Cierra la guía con una tabla que agrupa las limitaciones del bloque "qué no funciona" y las conecta con la fase que las resuelve.

```markdown
| No funciona | Motivo |
|---|---|
| Persistir los hábitos al recargar | `useState` sólo guarda en memoria. |
| Ver semanas anteriores o futuras   | `visibleDates` se calcula desde `new Date()`. |
```

Debajo, un bloque de lista con enlaces a las fases futuras que se ocupan de cada limitación:

```markdown
- **[Fase 3 — Persistencia con `useLocalStorage`](./03-uselocalstorage.md)**
  *(pendiente de escribir)* — se crea un hook genérico que sincroniza
  `useState` con `localStorage`.
- **[Fase 4 — Navegación entre semanas](./04-navegacion-semanas.md)**
  *(pendiente de escribir)* — se añade `weekOffset` al provider.
```

Las fases aún no escritas llevan la etiqueta `*(pendiente de escribir)*` para que el lector sepa que el enlace apuntará a un archivo que no existe todavía.

---

## Convenciones de escritura

Estas reglas hacen que las guías se lean como si las hubiera escrito la misma persona, aunque las escriba gente distinta a lo largo del tiempo.

### Voz y tono

- **Voz impersonal en primera persona plural**: "se construye", "usamos", "aquí preferimos". Evita el "tú" y el "vosotros", que dan tono de curso comercial.
- **Presente indicativo**: "el componente recibe", no "el componente recibirá" ni "el componente recibió".
- **Sin exclamaciones ni emojis** en el cuerpo del texto. Las guías son documentación, no marketing.

### Formato

- **Negritas** para el término la primera vez que aparece (`**inmutabilidad**`), luego en texto normal.
- **`code inline`** para nombres de funciones, tipos, archivos, propiedades, atributos y cualquier identificador de código.
- **Bloques de código** con la etiqueta de lenguaje correcta (` ```tsx `, ` ```bash `, ` ```css `). No hay bloques sin etiqueta.
- **Comillas dobles rectas** (`"..."`) para strings de ejemplo. Nunca curvas.
- **Guiones largos** (`—`) para incisos.

### Cuándo usar tablas, listas y prosa

| Contenido | Formato |
|---|---|
| Estructura de un tipo o firma de función | Tabla |
| Estado en memoria de un objeto o array | Diagrama ASCII |
| Pasos secuenciales | Lista numerada |
| Alternativas independientes | Lista con bullets |
| Justificación de una decisión | Prosa |

La regla implícita: si el lector necesita **comparar** dos cosas, se usa tabla. Si necesita **seguir un orden**, lista numerada. Si necesita **entender un porqué**, prosa.

### Enlaces internos

Todas las referencias a otras guías se hacen con enlace relativo:

```markdown
[Fase 1](./01-stateless-components.md)
[nota del índice](./00-indice.md#filosofía-general)
```

- Los enlaces a fases usan el título corto ("Fase 1", no el título completo).
- Los enlaces a secciones internas de otro documento incluyen el ancla en minúscula con guiones.

### Bloques que se repiten literalmente

Algunos patrones se copian tal cual entre guías:

- La frase "Si todos los pasos funcionan, la fase está terminada." al final de "Cómo probar".
- El encabezado `## Checklist para replicar esta fase`.
- El separador `---` entre secciones principales.
- La etiqueta `*(pendiente de escribir)*` en enlaces a fases futuras.

Se copian sin modificar. La consistencia visual entre archivos es parte del contrato.

---

## Proceso recomendado para escribir una guía nueva

Cuando toque documentar una fase, este es el flujo que ha funcionado con la Fase 1 y la Fase 2:

### Paso 1 — Leer el código real de la fase

Antes de escribir, leer los archivos que la fase toca. **No inventar código**: el tutorial debe reflejar exactamente lo que hay en el repo. Si el código tiene decisiones raras, la guía debe explicarlas — y si no puede explicarlas, quizá el código deba cambiar antes de documentarse.

### Paso 2 — Identificar conceptos nuevos

Hacer una lista de todo lo que aparece por primera vez en esta fase respecto a la anterior. Ejemplos de la Fase 2: `useState`, `createContext`, forma funcional de `setState`, patrón toggle, `crypto.randomUUID()`, hook personalizado con guarda de `null`.

Cada elemento de esta lista termina siendo un bloque `## Análisis: ...` o `### ...`.

### Paso 3 — Ordenarlos por dependencia

Si el concepto B se apoya en A, A va antes. Regla útil: si al explicar el concepto B tienes que decir "esto lo veremos más adelante", el orden está mal.

### Paso 4 — Redactar el esqueleto

Crear el archivo con los 10 encabezados obligatorios vacíos. Rellenar primero el bloque "Objetivo" y la tabla de "Limitaciones". Esos dos delimitan el alcance y evitan que la guía se hinche.

### Paso 5 — Rellenar de dentro hacia afuera

En este orden:

1. **Código completo** de los archivos (copiar y pegar del repo, marcar cambios respecto a la fase anterior).
2. **Análisis** de cada bloque no trivial.
3. **Conceptos nuevos** que necesitan un bloque propio de teoría.
4. **Cómo probar** y **Checklist**.
5. **Introducción** al final. Es más fácil escribir la intro cuando ya se sabe qué va dentro.

### Paso 6 — Releer buscando "por qué" ausentes

Recorrer el texto y buscar afirmaciones sin justificación: "usamos `crypto.randomUUID()`". Si no está al lado el "porque queremos IDs únicos entre hábitos añadidos en el mismo tick", falta contenido.

### Paso 7 — Actualizar el índice

Editar [`00-indice.md`](./00-indice.md):

- Cambiar el estado de la fase de "pendiente" a enlace real.
- Ajustar los bullets de "Se aprende" si algo cambió respecto a lo previsto.
- Revisar que las fases posteriores en la sección "Fases futuras" sigan siendo coherentes.

### Paso 8 — Actualizar la guía anterior

En la sección "Limitaciones y qué viene después" de la fase N-1, sustituir el enlace `*(pendiente de escribir)*` por el enlace real a la guía nueva.

---

## Anti-patrones que hay que evitar

Cosas que **no** se hacen en las guías del proyecto:

- **No adelantar conceptos de fases futuras.** Si la Fase 2 menciona `useLocalStorage` como algo que "haremos", se rompe la promesa de que cada fase es autocontenida. Lo correcto es dejarlo en el bloque de limitaciones al final.
- **No incluir capturas de pantalla.** El texto y los diagramas ASCII bastan; las capturas envejecen rápido y no se pueden buscar con grep.
- **No inventar código que no está en el repo.** La guía es documentación, no un manifiesto de intenciones.
- **No usar frases tipo "obviamente", "es fácil", "simplemente".** Si el lector no lo encuentra obvio, la frase le hace sentir que el problema es suyo.
- **No repetir información entre secciones.** Si algo ya se explicó en "Análisis", en "Checklist" se referencia con la mínima palabra clave, no se re-explica.
- **No dejar TODOs en la guía publicada.** Si algo está pendiente, va en el bloque "pendiente de escribir" del índice, no como `// TODO:` dentro del cuerpo.
- **No mezclar tono académico con tono de blog.** Las guías son técnicas y directas; ni ceremonias ni chistes.

---

## Checklist para dar una guía por terminada

Antes de considerar publicada una guía nueva:

- [ ] El título sigue el formato `# Fase N — Nombre corto`.
- [ ] Aparecen las 10 secciones obligatorias en el orden indicado.
- [ ] "Objetivo" incluye bloque "qué sí" y bloque "qué no".
- [ ] La estructura de carpetas refleja el estado real al terminar la fase.
- [ ] Cada concepto nuevo tiene su bloque `## Análisis: ...`.
- [ ] Todos los archivos que cambian se muestran íntegros al menos una vez.
- [ ] Las decisiones no evidentes están justificadas con un "por qué".
- [ ] La sección "Cómo probar" es una lista numerada verificable en el navegador.
- [ ] El checklist final se puede auditar leyendo el código sin abrir el navegador.
- [ ] La tabla de limitaciones enlaza a las fases futuras que resuelven cada punto.
- [ ] El índice `00-indice.md` está actualizado con el enlace real.
- [ ] La guía de la fase anterior ya no enlaza al `*(pendiente de escribir)*` si esta lo resolvía.
- [ ] No hay TODOs, ni frases tipo "obviamente", ni referencias a conceptos de fases futuras dentro del cuerpo.

Si todas las casillas están marcadas, la guía está lista.
