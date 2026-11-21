// Descarga el icono oficial de cada app del compendio a public/compendio/
// y escribe src/components/compendio/iconos.ts con { nombre: ruta }.
//
//   npm run compendio:iconos
//
// Por cada app busca en el HTML de su web, en este orden: apple-touch-icon,
// el <link rel="icon"> mas grande, /favicon.ico y por ultimo el servicio de
// favicons de Google. Las apps que fallen quedan fuera del mapa y la pagina
// les muestra la inicial como antes. Se puede volver a correr: pisa todo.

import fs from "fs";
import path from "path";
import { CATEGORIAS } from "../src/components/compendio/apps";

const CARPETA = path.join(process.cwd(), "public", "compendio");
const MAPA = path.join(process.cwd(), "src", "components", "compendio", "iconos.ts");
const NAVEGADOR = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" };

const EXTENSIONES: Record<string, string> = {
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const slug = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Candidatos sacados del HTML, del mejor al peor
function iconosDelHtml(html: string, base: string): string[] {
  const candidatos: { url: string; puntaje: number }[] = [];
  for (const [etiqueta] of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = /rel=["']([^"']+)["']/i.exec(etiqueta)?.[1].toLowerCase() ?? "";
    const href = /href=["']([^"']+)["']/i.exec(etiqueta)?.[1];
    if (!href || !rel.includes("icon") || rel.includes("mask")) continue;
    const tamano = Number(/sizes=["'](\d+)x\d+/i.exec(etiqueta)?.[1] ?? 0);
    const puntaje =
      (rel.includes("apple-touch-icon") ? 1000 : 0) +
      (href.endsWith(".svg") ? 500 : 0) +
      tamano;
    candidatos.push({ url: new URL(href, base).href, puntaje });
  }
  return candidatos.sort((a, b) => b.puntaje - a.puntaje).map((c) => c.url);
}

async function bajar(url: string) {
  const respuesta = await fetch(url, {
    headers: NAVEGADOR,
    signal: AbortSignal.timeout(10_000),
  });
  if (!respuesta.ok) return null;
  const tipo = respuesta.headers.get("content-type")?.split(";")[0].trim() ?? "";
  const extension = EXTENSIONES[tipo];
  const datos = Buffer.from(await respuesta.arrayBuffer());
  // Menos de 100 bytes suele ser un pixel vacio o un error disfrazado
  if (!extension || datos.length < 100) return null;
  return { extension, datos };
}

async function iconoDe(url: string) {
  const candidatos: string[] = [];
  try {
    const pagina = await fetch(url, {
      headers: NAVEGADOR,
      signal: AbortSignal.timeout(10_000),
    });
    if (pagina.ok) candidatos.push(...iconosDelHtml(await pagina.text(), pagina.url));
  } catch {}
  const dominio = new URL(url).hostname;
  candidatos.push(
    new URL("/favicon.ico", url).href,
    `https://www.google.com/s2/favicons?domain=${dominio}&sz=128`,
  );

  for (const candidato of candidatos) {
    try {
      const icono = await bajar(candidato);
      if (icono) return { ...icono, desde: candidato };
    } catch {}
  }
  return null;
}

async function main() {
  fs.rmSync(CARPETA, { recursive: true, force: true });
  fs.mkdirSync(CARPETA, { recursive: true });

  const apps = CATEGORIAS.flatMap((categoria) => categoria.apps);
  const mapa: Record<string, string> = {};

  for (const app of apps) {
    const icono = await iconoDe(app.url);
    if (!icono) {
      console.log(`✗ ${app.nombre}: sin icono (queda la inicial)`);
      continue;
    }
    const archivo = `${slug(app.nombre)}.${icono.extension}`;
    fs.writeFileSync(path.join(CARPETA, archivo), icono.datos);
    mapa[app.nombre] = `/compendio/${archivo}`;
    console.log(`✓ ${app.nombre} <- ${icono.desde}`);
  }

  const lineas = Object.entries(mapa)
    .map(([nombre, ruta]) => `  ${JSON.stringify(nombre)}: ${JSON.stringify(ruta)},`)
    .join("\n");
  fs.writeFileSync(
    MAPA,
    `// Generado por scripts/descargar-iconos-compendio.ts: no editar a mano.\n// { nombre de la app: icono en public/ }. Si una app no esta, se muestra su inicial.\n\nexport const ICONOS: Record<string, string> = {\n${lineas}\n};\n`,
  );
  console.log(`\n${Object.keys(mapa).length}/${apps.length} iconos descargados`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
