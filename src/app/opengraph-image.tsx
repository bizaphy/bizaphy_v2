import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

//Imagen que aparece al compartir el link (WhatsApp, Discord, X, etc.).
//Se genera en el build y queda en cache. Satori solo entiende flexbox y un
//subconjunto de CSS: nada de grid ni clases de Tailwind, todo va en style.

export const alt = "bizaphy lab";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  //Neonna se lee como texto y se pasa como data URI: Satori no puede pedir
  //archivos de /public por url mientras se genera en el build
  const neonnaSvg = await readFile(
    join(process.cwd(), "public/images/neonna/neonna-base.svg"),
    "utf-8"
  );
  const neonna = `data:image/svg+xml;base64,${Buffer.from(neonnaSvg).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(circle at 80% 20%, rgba(217,70,239,0.25), transparent 50%), radial-gradient(circle at 10% 90%, rgba(139,92,246,0.25), transparent 50%), #09090b",
          color: "#fafafa",
          fontFamily: "monospace",
        }}
      >
        {/* marco neón */}
        <div
          style={{
            position: "absolute",
            //Satori no entiende "inset", hay que poner los 4 lados
            top: 32,
            left: 32,
            right: 32,
            bottom: 32,
            display: "flex",
            border: "3px solid #d946ef",
            borderRadius: "16px",
            boxShadow: "0 0 40px rgba(217,70,239,0.5)",
          }}
        />
        {/* Neonna a la derecha. El svg mide 260 x 324: se escala manteniendo
            esa proporcion */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={neonna}
          width={364}
          height={454}
          alt=""
          style={{ position: "absolute", right: 80, bottom: 56 }}
        />
        <div style={{ display: "flex", fontSize: 32, color: "#a1a1aa" }}>
          ~/bizaphy.dev $
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 104,
            fontWeight: 700,
            color: "#f0abfc",
            textShadow: "0 0 24px rgba(217,70,239,0.8)",
            marginTop: 16,
          }}
        >
          bizaphy lab
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            color: "#d4d4d8",
            marginTop: 24,
            //angosto para no pisar a Neonna
            maxWidth: 620,
          }}
        >
          Proyectos, blog y herramientas para estudiar japonés.
        </div>
      </div>
    ),
    { ...size }
  );
}
