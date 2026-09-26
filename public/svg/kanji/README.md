# SVG de orden de trazos (KanjiVG)

Los archivos `.svg` de esta carpeta provienen del proyecto
[KanjiVG](https://kanjivg.tagaini.net) y **no** están bajo la misma licencia
que el resto del código de este repositorio.

- **Autor:** Copyright (C) 2009/2010/2011 Ulrich Apel
- **Licencia:** [Creative Commons Attribution-Share Alike 3.0](https://creativecommons.org/licenses/by-sa/3.0/) (CC BY-SA 3.0)
- **Fuente:** https://github.com/KanjiVG/kanjivg

## Uso en este proyecto

- Cada archivo se nombra con el code point Unicode del caracter en
  hexadecimal, 5 dígitos y minúsculas (`一` → `04e00.svg`).
- Los archivos se ordenan en subcarpetas según el nivel JLPT del kanji en
  la base de datos: `n5/`, `n4/`, `n3/`. El resto de KanjiVG (kanjis que
  aún no se usan, kana, símbolos) va en `others/`. La app arma la ruta como
  `/svg/kanji/<nivel>/<codigo>.svg` (ver `KanjiStrokeOrder.tsx`).
- Los archivos se distribuyen **sin modificaciones**. En la interfaz se
  muestran con los colores invertidos mediante CSS (`invert`), sin alterar
  los archivos.
- La atribución se muestra en la página del proyecto All About Kanjis
  (`src/content/projects/all-about-kanjis/AllAboutKanjis.tsx`).

## Importante

- **No eliminar el comentario de copyright** que trae cada SVG en su
  cabecera. Si se usa un optimizador (SVGO u otro), configurarlo para
  conservar los comentarios.
- Si se modifican los archivos (colores, trazos, números, animaciones), la
  versión modificada debe distribuirse bajo CC BY-SA 3.0 o una versión
  posterior de la misma licencia.
