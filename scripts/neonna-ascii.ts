//Genera a Neonna en arte ASCII (estilo del gif del Hero) a partir de
//neonna-base.svg:
//  - neonna-ascii.json: los fotogramas como texto (opcion "texto")
//  - neonna-ascii.gif:  esos mismos fotogramas dibujados (opcion "gif")
//
//Abre el SVG en Chromium, congela sus animaciones CSS y las avanza a mano
//fotograma por fotograma, asi cada captura es exacta y el loop cierra.
//
//  npm run neonna:ascii

import { chromium } from "@playwright/test";
import sharp from "sharp";
import { GIFEncoder, quantize, applyPalette } from "gifenc";
import path from "path";
import fs from "fs";
import {
  COLS,
  ROWS,
  FPS,
  CICLO,
  PALETA,
  pixelesAAscii,
  filasConColor,
  type FotogramaAscii,
} from "../src/lib/neonna-ascii";

const NEONNA_DIR = path.join(import.meta.dirname, "..", "public", "images", "neonna");
const SVG = path.join(NEONNA_DIR, "neonna-base.svg");
const OUT_DIR = path.join(NEONNA_DIR, "ascii");

//pagina para dibujar el GIF (el SVG se captura aparte, a COLS x ROWS)
const ANCHO = 520;
const ALTO = 648;

//tipografia del GIF: 12px por letra y 12px por fila
const FUENTE_PX = 12;
//tamano final del GIF. El ancho de las letras depende de la fuente, asi que
//cada captura se reescala a la proporcion real de Neonna (260 x 324)
const GIF_ALTO = 600;
const GIF_ANCHO = Math.round((GIF_ALTO * 260) / 324);

const htmlFotograma = (f: FotogramaAscii) =>
  filasConColor(f)
    .map((tramos) =>
      tramos
        .map(({ texto, color }) => `<span style="color:${color}">${texto.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>`)
        .join(""),
    )
    .join("\n");

async function generar() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const svg = fs
    .readFileSync(SVG, "utf8")
    //Chromium dibuja el SVG directo a COLS x ROWS (estirado, como drawImage en
    //NeonnaAsciiVivo), asi las tres opciones salen iguales. Antes se capturaba
    //grande y sharp promediaba: el "07" cian del pecho se diluia en la chaqueta
    .replace('width="260" height="324"', `width="${COLS}" height="${ROWS}" preserveAspectRatio="none"`);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: ANCHO, height: ALTO } });

  // ---------- 1. capturar el SVG animado ----------
  await page.setContent(`<body style="margin:0;background:#000">${svg}</body>`);
  await page.evaluate(() => document.getAnimations().forEach((a) => a.pause()));

  const fotogramas: FotogramaAscii[] = [];
  for (let f = 0; f < CICLO; f++) {
    const ms = (f * 1000) / FPS;
    await page.evaluate((ms) => document.getAnimations().forEach((a) => (a.currentTime = ms)), ms);
    const png = await page.screenshot({ clip: { x: 0, y: 0, width: COLS, height: ROWS } });
    const px = await sharp(png).ensureAlpha().raw().toBuffer();
    fotogramas.push(pixelesAAscii(px, f));
  }

  fs.writeFileSync(
    path.join(OUT_DIR, "neonna-ascii.json"),
    JSON.stringify({ cols: COLS, rows: ROWS, fps: FPS, paleta: PALETA, frames: fotogramas }),
  );
  console.log(`  neonna-ascii.json ✓ (${fotogramas.length} fotogramas)`);

  // ---------- 2. dibujar el texto y armar el GIF ----------
  await page.setContent(
    `<body style="margin:0;background:#000"><pre id="p" style="display:inline-block;margin:0;background:#000;font:${FUENTE_PX}px/${FUENTE_PX}px Consolas,'Courier New',monospace"></pre></body>`,
  );
  const pre = page.locator("#p");
  const gif = GIFEncoder();

  for (const f of fotogramas) {
    await page.evaluate((html) => (document.getElementById("p")!.innerHTML = html), htmlFotograma(f));
    const png = await pre.screenshot();
    const { data, info } = await sharp(png)
      .resize(GIF_ANCHO, GIF_ALTO, { fit: "fill" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const rgba = new Uint8Array(data);
    const paleta = quantize(rgba, 64);
    gif.writeFrame(applyPalette(rgba, paleta), info.width, info.height, {
      palette: paleta,
      delay: Math.round(1000 / FPS),
    });
  }

  gif.finish();
  fs.writeFileSync(path.join(OUT_DIR, "neonna-ascii.gif"), gif.bytes());
  console.log(`  neonna-ascii.gif ✓`);

  await browser.close();
}

generar();
