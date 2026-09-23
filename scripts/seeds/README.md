# Seeds de kanjis

Estos JSON (`n5.json`, `n4.json`, `n3.json`) son la **fuente de verdad** de
los datos de All About Kanjis: kanjis, palabras famosas, nombres famosos y
kanji traps. Un archivo por nivel JLPT, un objeto por kanji.

Dos comandos los conectan con la base de datos:

| Comando | Dirección | Para qué |
|---|---|---|
| `npm run db:export-kanjis` | BDD → JSON | Traer al JSON lo que se editó directo en la BDD |
| `npm run db:seed-kanjis -- <nivel>` | JSON → BDD | Aplicar en la BDD lo que se editó en el JSON |

Ambos aceptan uno o varios niveles (`-- n5 n4`). El export sin niveles
exporta todos.

## Tutorial: agregar una palabra a un kanji

Ejemplo real: agregar **県庁** (けんちょう, "gobierno prefectural") al
kanji 県 de N4.

| Paso | Comando o acción | Para qué |
|---|---|---|
| 1 | `npm run db:export-kanjis -- n4` | Traer a `n4.json` cualquier cambio hecho directo en la BDD |
| 2 | Editar `scripts/seeds/n4.json` | Hacer tu cambio (aquí, agregar 県庁) |
| 3 | `npm run db:seed-kanjis -- n4 --dry-run` | Validar sin escribir: revisar los totales y que no se pierda nada |
| 4 | `npm run db:seed-kanjis -- n4` | Aplicar el cambio en la BDD |
| 5 | Commit de `scripts/seeds/n4.json` | Guardar el cambio en git |

En el paso 2, dentro del objeto de 県, se agrega al final de `palabras`:

```json
{
  "palabra": "県庁",
  "furigana": "けんちょう",
  "traduccion": "gobierno prefectural"
}
```

En el paso 3 el total de palabras de N4 debe subir en 1 (por ejemplo, de
551 a 552). Si el número no es el que esperas, revisa el JSON antes de
seguir.

## Protecciones del seed

Antes de escribir, el seed compara el JSON con la BDD. Si algo se
perdería, **aborta sin tocar nada** y dice qué es:

- una palabra, nombre famoso o radical que está en la BDD y no en el JSON
  (`県: se borraría la palabra 県立`)
- un valor que en la BDD tiene dato y en el JSON viene `null`
  (significado, furigana de un nombre, etc.)
- un kanji que en la BDD pertenece a otro nivel

Cada nivel se escribe en una sola transacción: se aplica completo o no se
aplica nada.

Si el seed aborta:

- **Si lo que está en la BDD es correcto** → corre `npm run db:export-kanjis`
  para traerlo al JSON y vuelve a hacer tu cambio.
- **Si quieres borrarlo a propósito** → quítalo del JSON y bórralo a mano
  en la BDD. El seed nunca borra datos por su cuenta.

## Lo que el seed no hace

- **No borra kanjis ni kanji traps.** Solo agrega o actualiza.
- **No cambia `destacado` de kanjis existentes.** Es estado de la
  interfaz (el botón de destacar). Solo se usa al crear un kanji nuevo.
  Para destacar uno existente: hazlo en la app y después exporta.
- **No incluye `url_orden_trazos`.** Esa columna quedó obsoleta: el orden
  de trazos sale de los SVG locales en `public/svg/kanji/`.

## Formato de un kanji

```json
{
  "caracter": "県",
  "nivel": "n4",
  "significado": "prefectura",
  "onyomi": "けん",
  "kunyomi": "か.ける",
  "numeroTrazos": 9,
  "anioEscolarJapon": 3,
  "radicales": ["目", "小"],
  "fraseMnemotecnica": null,
  "urlImagenMnemotecnica": null,
  "destacado": false,
  "palabras": [{ "palabra": "県", "furigana": "けん", "traduccion": "prefectura" }],
  "nombres": [
    {
      "nombre": "都道府県かるた",
      "furigana": "とどうふけんかるた",
      "descripcion": "karuta educativo japonés para memorizar las 47 prefecturas"
    }
  ],
  "relacionadosCon": ["具"]
}
```

- `furigana` de nombres: hiragana sin espacios, la katakana del nombre se
  deja tal cual (`西野カナ` → `にしのカナ`). `null` si la lectura no es
  segura.
- `nombres` admite varios por kanji (personas, series, canciones…): la UI
  los muestra de a uno con flechas.
- `relacionadosCon`: kanjis con los que se confunde. Se guardan en ambas
  direcciones y pueden ser de otro nivel.
- `radicales`: grafemas del kanji, en el orden en que se muestran. Cada uno
  tiene que existir en `radicales.json` (el catálogo, con trazos, nombre,
  furigana y significado); si no, el seed aborta. `[]` si no tiene.

## Catálogo de radicales (`radicales.json`)

Un objeto por grafema, sacado de `public/radicales.pdf`:

```json
{ "caracter": "⺅", "numeroTrazos": 2, "nombre": "ninben", "furigana": "にんべん", "significado": "persona", "kanjiOrigen": "人" }
```

Se aplica automáticamente al inicio de cada `db:seed-kanjis`, antes de los
niveles. Para corregir un significado, se edita aquí y se vuelve a correr el
seed: el cambio se ve en todos los kanjis que usan ese radical.

## Base de datos de destino

Los scripts usan `DATABASE_URL` de `.env.local` (branch de desarrollo en
Neon) y muestran el host al inicio. Para apuntar a otra BDD, por ejemplo
producción, define la variable al ejecutar:

```bash
DATABASE_URL="<url de prod>" npm run db:seed-kanjis -- n4 --dry-run
```

Revisa el host impreso antes de quitar `--dry-run`.

## Agregar una columna nueva a la tabla kanji

El formato del JSON (`SeedKanji`) y las columnas que usa el seed se
derivan del schema, así que no hay listas de columnas que mantener a mano.

1. Agrégala en `src/content/projects/all-about-kanjis/db/schema.ts` y
   corre `npm run db:push`.
2. Corre `npx tsc --noEmit`. TypeScript marca error en
   `scripts/export-kanjis.ts` (el objeto `item`): asigna la columna ahí.
3. Corre `npm run db:export-kanjis` para que los JSON la incluyan.

El seed la toma sola: entra en el insert y en el update, y si es nullable
queda protegida contra quedar vacía. Si ejecutas el seed antes del paso 3,
aborta avisando que al JSON le falta la columna.

Casos especiales, en `scripts/kanji-seed-lib.ts`:

- **No debe viajar en el JSON** (como `id`) → agrégala a
  `COLUMNAS_FUERA_DEL_JSON`.
- **Es estado que se cambia desde la app** (como `destacado`) → agrégala a
  `COLUMNAS_SOLO_AL_CREAR`, para que el seed no la pise en kanjis
  existentes.
