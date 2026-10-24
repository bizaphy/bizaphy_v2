//Convierte pixeles de Neonna a arte ASCII con el estilo del gif del Hero:
//letras segun el brillo, paleta violeta/fucsia y glitch en bandas
//horizontales. Lo comparten el script que genera el GIF y los fotogramas de
//texto (scripts/neonna-ascii.ts) y el componente que convierte en vivo.
//Sin DOM ni dependencias: corre igual en Node y en el navegador.

//tamano por defecto (neonna-base.svg). Cada funcion acepta otro, para poses
//con otra proporcion como neonna-tele.svg
export const COLS = 80;
//las letras miden ~0.6 de ancho por 1 de alto: 80 * (324 / 260) * 0.6 ≈ 60
export const ROWS = 60;
export const FPS = 6;
//fotogramas por vuelta: 6 s, multiplo de las animaciones del SVG (2 s, 3 s, 6 s)
export const CICLO = 36;

//el indice de color de cada caracter se guarda como un digito base 36
export const PALETA = [
  //0-9: rampa violeta -> fucsia -> casi blanco
  "#2e1065",
  "#4c1d95",
  "#6b21a8",
  "#86198f",
  "#a21caf",
  "#c026d3",
  "#d946ef",
  "#e879f9",
  "#f0abfc",
  //la piel cae aca: casi blanca (fucsia-50), como en el gif. El contraste
  //con el pelo violeta es lo que hace que la cara resalte
  "#fdf4ff",
  //a: cian (HUD, mechon, microfono)
  "#67e8f9",
  //b: blanco del glitch
  "#ffffff",
];

//para fondo claro (opcion claro): tinta oscura. Mismos indices que PALETA
export const PALETA_CLARA = [
  //0-9: de lo mas oscuro a lo mas claro del dibujo
  "#1e0b36",
  "#2e1065",
  "#3b0764",
  "#581c87",
  "#6b21a8",
  "#86198f",
  "#a21caf",
  "#c026d3",
  "#d946ef",
  "#e879f9",
  //a: cian oscuro (cyan-600): el claro no se lee sobre fondo claro
  "#0891b2",
  //b: glitch en tinta oscura en vez de blanco
  "#18181b",
];

//de menos a mas "tinta", como el gif: puntos en lo oscuro, letras densas en lo claro
const NIVELES = [".'`", ":;-~", "=+/ic", "r7zxvJ", "dbqpXZ", "QPBRgK", "MW8&#@"];
const RUIDO = "QBPRZ#@%$&8MW";
//debajo de este brillo la celda queda vacia (fondo)
const UMBRAL = 28;
//curvas para levantar los oscuros (< 1 aclara los tonos bajos):
//- la de la letra es fuerte: si no, el pelo violeta y la chaqueta negra casi
//  no se ven
//- la del color es suave: asi el iris y las pupilas quedan oscuros sobre la
//  piel clara y los ojos se leen
const GAMMA_LETRA = 0.55;
const GAMMA_COLOR = 0.8;

//caracteres y colores de todas las filas seguidas (cols por fila)
export type FotogramaAscii = { c: string; k: string };

const hash = (a: number, b: number, c: number) => {
  let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(c, 2246822519)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
};

//xorshift: aleatorio pero repetible, asi el glitch de un fotograma es siempre igual
const rng = (semilla: number) => {
  let s = semilla >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
};

//en que fotogramas del ciclo hay glitch y con que fuerza: casi siempre quieta
//y de golpe unas bandas se corren, como en el gif
const GLITCH: Record<number, number> = { 16: 1, 17: 3, 18: 2, 29: 1 };

//saltos: la imagen entera se corre de golpe hacia un lado y se queda ahi unos
//fotogramas, como el tambaleo brusco del gif. [desde fotograma, corrimiento
//como fraccion del ancho]
//(a 6 fps: 3 fotogramas = 0.5 s). Cada desvio dura poco y vuelve al centro.
//Corrimientos minimos (1 a 2 letras en 180 columnas): con mas sacudia demasiado
const SALTOS: [number, number][] = [
  [0, 0],
  [8, -0.009],
  [11, 0],
  [14, 0.004],
  [15, 0.008],
  [19, 0],
  [25, -0.005],
  [28, 0],
];

const corrimientoSalto = (f: number) => SALTOS.filter(([desde]) => desde <= f).at(-1)![1];

//fuerza del glitch en cada fotograma. Con saltos, cada salto lleva un glitch
//medio y el fotograma siguiente un resto mas suave
function fuerzaGlitch(f: number, saltos: boolean) {
  if (saltos) {
    if (SALTOS.some(([desde]) => desde === f && f > 0)) return 2;
    if (SALTOS.some(([desde]) => desde === f - 1 && desde > 0)) return 1;
  }
  return GLITCH[f] ?? 0;
}

function glitch(chars: string[], colores: string[], f: number, cols: number, rows: number, fuerza: number) {
  if (!fuerza) return;
  const r = rng(f * 7919 + 1);

  for (let n = 0; n < fuerza * 2; n++) {
    const y0 = Math.floor(r() * rows);
    const alto = 1 + Math.floor(r() * (fuerza + 2));
    //el corrimiento escala con el ancho: en una imagen ancha se corre mas
    const corrimiento = Math.round((r() * 2 - 1) * (4 + fuerza * 3) * (cols / COLS));
    const tinte = r() < 0.3 ? "a" : r() < 0.5 ? "b" : "8";

    for (let y = y0; y < Math.min(rows, y0 + alto); y++) {
      const fila = chars.slice(y * cols, (y + 1) * cols);
      const filaColor = colores.slice(y * cols, (y + 1) * cols);
      for (let x = 0; x < cols; x++) {
        const origen = x - corrimiento;
        let ch = fila[origen] ?? " ";
        let color = filaColor[origen] ?? "0";
        if (ch !== " ") {
          if (r() < 0.25) ch = RUIDO[Math.floor(r() * RUIDO.length)];
          if (r() < 0.6) color = tinte;
        }
        chars[y * cols + x] = ch;
        colores[y * cols + x] = color;
      }
    }
  }

  //linea de corte: un tramo de guiones brillantes que atraviesa la imagen
  if (fuerza >= 2) {
    const y = Math.floor(r() * rows);
    const x0 = Math.floor((r() * cols) / 2);
    const largo = Math.round((10 + Math.floor(r() * 30)) * (cols / COLS));
    for (let x = x0; x < Math.min(cols, x0 + largo); x++) {
      chars[y * cols + x] = r() < 0.5 ? "-" : "=";
      colores[y * cols + x] = "b";
    }
  }
}

//bordes: con que fuerza de cambio de brillo (Sobel, 0 a ~4) una celda pasa a
//ser contorno
const UMBRAL_BORDE = 1.1;
//color de los contornos: violeta oscuro, se lee como linea sobre la piel clara
const COLOR_BORDE = "3";

//trazo segun la direccion del borde. El gradiente apunta hacia lo claro y el
//borde corre perpendicular a el
function trazo(gx: number, gy: number) {
  const ang = Math.abs(Math.atan2(gy, gx)) * (180 / Math.PI);
  //gradiente casi horizontal: el borde es vertical
  if (ang < 22.5 || ang > 157.5) return "|";
  //gradiente casi vertical: el borde es horizontal
  if (ang > 67.5 && ang < 112.5) return "-";
  return gx * gy > 0 ? "/" : "\\";
}

//px: RGBA de cols x rows (lo que devuelve getImageData o sharp().raw())
//bordes: dibuja contornos (| - / \) donde el brillo cambia fuerte, como el
//delineado del gif. Ayuda a leer los rasgos cuando la cara ocupa mucho
//saltos: la imagen entera salta de lado a lado con glitch (ver SALTOS)
//claro: para fondo claro. Lo transparente queda vacio (se ve el fondo de la
//pagina) y la densidad se invierte, como tinta en papel: lo oscuro lleva
//letras densas y lo claro letras sueltas. Se dibuja con PALETA_CLARA
export function pixelesAAscii(
  px: ArrayLike<number>,
  frame: number,
  cols = COLS,
  rows = ROWS,
  {
    bordes = false,
    saltos = false,
    claro = false,
  }: { bordes?: boolean; saltos?: boolean; claro?: boolean } = {},
): FotogramaAscii {
  const f = ((frame % CICLO) + CICLO) % CICLO;
  const chars: string[] = [];
  const colores: string[] = [];

  //brillo de cada celda (0 a 1), aparte: los bordes miran a los vecinos
  const L = new Float32Array(cols * rows);
  for (let n = 0; n < cols * rows; n++) {
    //lo transparente cuenta como negro
    const a = px[n * 4 + 3] / 255;
    L[n] = ((0.299 * px[n * 4] + 0.587 * px[n * 4 + 1] + 0.114 * px[n * 4 + 2]) * a) / 255;
  }
  const l = (x: number, y: number) =>
    L[Math.min(rows - 1, Math.max(0, y)) * cols + Math.min(cols - 1, Math.max(0, x))];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const a = px[i + 3] / 255;
      const r = px[i] * a;
      const g = px[i + 1] * a;
      const b = px[i + 2] * a;
      const base = L[y * cols + x];
      const lum = claro
        ? //en claro el fondo es lo transparente; la letra sale de lo oscuro
          a < 0.5
          ? 0
          : 255 * Math.pow(1 - base, 0.8)
        : 255 * Math.pow(base, GAMMA_LETRA);

      if (lum < UMBRAL) {
        chars.push(" ");
        colores.push("0");
        continue;
      }

      if (bordes) {
        //Sobel 3x3
        const gx =
          l(x + 1, y - 1) + 2 * l(x + 1, y) + l(x + 1, y + 1) -
          (l(x - 1, y - 1) + 2 * l(x - 1, y) + l(x - 1, y + 1));
        const gy =
          l(x - 1, y + 1) + 2 * l(x, y + 1) + l(x + 1, y + 1) -
          (l(x - 1, y - 1) + 2 * l(x, y - 1) + l(x + 1, y - 1));
        if (Math.hypot(gx, gy) > UMBRAL_BORDE) {
          chars.push(trazo(gx, gy));
          colores.push(COLOR_BORDE);
          continue;
        }
      }

      const nivel = Math.min(
        NIVELES.length - 1,
        Math.floor(((lum - UMBRAL) / (256 - UMBRAL)) * NIVELES.length),
      );
      const set = NIVELES[nivel];
      //cada celda tiene su letra fija, y un ~6% cambia en cada fotograma:
      //asi la imagen "hierve" un poco, como en el gif
      const cambia = hash(x, y, f + 1) % 100 < 6;
      chars.push(set[(cambia ? hash(x, y, f + 99) : hash(x, y, 0)) % set.length]);

      const cian = g > 140 && b > 140 && r < 0.75 * g;
      colores.push(cian ? "a" : String(Math.min(9, Math.floor(Math.pow(base, GAMMA_COLOR) * 10))));
    }
  }

  if (saltos) {
    const corrimiento = Math.round(corrimientoSalto(f) * cols);
    if (corrimiento) {
      for (let y = 0; y < rows; y++) {
        const fila = chars.slice(y * cols, (y + 1) * cols);
        const filaColor = colores.slice(y * cols, (y + 1) * cols);
        for (let x = 0; x < cols; x++) {
          chars[y * cols + x] = fila[x - corrimiento] ?? " ";
          colores[y * cols + x] = filaColor[x - corrimiento] ?? "0";
        }
      }
    }
  }

  const fuerza = fuerzaGlitch(f, saltos);
  glitch(chars, colores, f, cols, rows, fuerza);

  //destello: en los fotogramas con glitch toda la imagen se ilumina, como en
  //el gif. Cada color sube hacia los tonos claros de la rampa segun la fuerza
  //(el cian y el blanco del glitch quedan igual)
  if (fuerza) {
    const realce = fuerza + 1;
    for (let i = 0; i < colores.length; i++) {
      const n = colores[i].charCodeAt(0) - 48;
      if (n >= 0 && n <= 9) colores[i] = String(Math.min(9, n + realce));
    }
  }
  return { c: chars.join(""), k: colores.join("") };
}

//agrupa cada fila en tramos del mismo color: menos <span> al dibujarla
export function filasConColor({ c, k }: FotogramaAscii, cols = COLS, paleta = PALETA) {
  const filas: { texto: string; color: string }[][] = [];
  for (let y = 0; y < c.length / cols; y++) {
    const tramos: { texto: string; color: string }[] = [];
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      //los espacios no se ven: se pegan al tramo anterior sin cortarlo
      const color = c[i] === " " && tramos.length ? tramos[tramos.length - 1].color : paleta[parseInt(k[i], 36)];
      const ultimo = tramos[tramos.length - 1];
      if (ultimo && ultimo.color === color) ultimo.texto += c[i];
      else tramos.push({ texto: c[i], color });
    }
    filas.push(tramos);
  }
  return filas;
}
