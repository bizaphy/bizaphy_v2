import type { Metadata } from "next";
import Image from "next/image";
import NeonnaAsciiVivo from "@/components/neonna/NeonnaAsciiVivo";
import NeonnaAsciiTexto from "@/components/neonna/NeonnaAsciiTexto";
import Neonnameter from "@/components/home/Neonnameter";

//Vitrina de todas las Neonna. Ruta escondida: no esta en la navbar, solo se
//llega escribiendo /Neonna. Las rutas distinguen mayusculas: /neonna da 404

export const metadata: Metadata = {
  title: "Neonna",
  //escondida tambien para los buscadores
  robots: { index: false, follow: false },
};

//props comunes de las poses "tele": 180 x 47 letras, 47 ≈ 180 / (640 / 280) * 0.6
const TELE = { cols: 180, rows: 47, proporcion: 640 / 280, alto: null } as const;

const TELES = [
  { n: 4, src: "neonna-tele.svg", titulo: "Tele", saltos: false, etiqueta: "Neonna dentro de una tele, con las manos apoyadas en la pantalla" },
  { n: 5, src: "neonna-tele-arriba.svg", titulo: "Tele · mirando arriba", saltos: false, etiqueta: "Neonna dentro de una tele, mirando hacia arriba" },
  { n: 6, src: "neonna-tele-arriba-2.svg", titulo: "Tele · mirando mas arriba", saltos: true, etiqueta: "Neonna dentro de una tele, mirando muy hacia arriba" },
  { n: 7, src: "neonna-tele-arriba-3.svg", titulo: "Tele · pestanea", saltos: true, etiqueta: "Neonna dentro de una tele, mirando hacia arriba y pestaneando" },
  { n: 8, src: "neonna-tele-claro.svg", titulo: "Tele · modo claro", saltos: true, etiqueta: "Neonna dentro de una tele, encandilada por el modo claro" },
  { n: 9, src: "neonna-tele-sol.svg", titulo: "Tele · le llega el sol", saltos: true, etiqueta: "Neonna dentro de una tele, apretando los ojos por la luz del sol" },
  //9.1: la v9 sobre fondo claro (el del tema), con tinta oscura
  { n: 9.1, src: "neonna-tele-sol.svg", titulo: "Tele · le llega el sol · fondo claro", saltos: true, claro: true, etiqueta: "Neonna dentro de una tele, apretando los ojos por la luz del sol, sobre fondo claro" },
  //9.2: la v9 tal cual, sobre gris oscuro (zinc-800): mas claro que el negro
  //pero lo bastante oscuro para que la paleta del personaje se siga leyendo
  { n: 9.2, src: "neonna-tele-sol.svg", titulo: "Tele · le llega el sol · fondo gris", saltos: true, fondo: "#27272a", etiqueta: "Neonna dentro de una tele, apretando los ojos por la luz del sol, sobre fondo gris" },
  { n: 10, src: "neonna-tele-soul.svg", titulo: "Tele · ojos estilo Soul Eater", saltos: true, etiqueta: "Neonna dentro de una tele, mirando hacia arriba, con ojos estilo Soul Eater" },
  { n: 11, src: "neonna-tele-toque.svg", titulo: "Tele · toc toc", saltos: true, etiqueta: "Neonna dentro de una tele, dandole toques a la pantalla con el dedo" },
  { n: 12, src: "neonna-tele-toque-2.svg", titulo: "Tele · toc toc · mano apoyada mas abajo", saltos: true, etiqueta: "Neonna dentro de una tele, con una mano apoyada mas abajo y la otra dandole toques a la pantalla" },
  { n: 13, src: "neonna-tele-toque-3.svg", titulo: "Tele · toc toc · mano apoyada bien abajo", saltos: true, etiqueta: "Neonna dentro de una tele, con una mano apoyada bien abajo y la otra dandole toques a la pantalla" },
  { n: 14, src: "neonna-tele-toque-4.svg", titulo: "Tele · toc toc · mano todavia mas abajo", saltos: true, etiqueta: "Neonna dentro de una tele, con una mano apoyada bien abajo y la otra dandole toques a la pantalla" },
  { n: 15, src: "neonna-tele-lluvia.svg", titulo: "Tele · lluvia de neon", saltos: true, etiqueta: "Neonna dentro de una tele, con lluvia de neon fucsia detras" },
  { n: 16, src: "neonna-tele-brazos.svg", titulo: "Tele · manos mas separadas", saltos: true, etiqueta: "Neonna dentro de una tele, con los brazos abiertos y una mano dandole toques a la pantalla" },
  { n: 17, src: "neonna-tele-manos.svg", titulo: "Tele · manos mas grandes", saltos: true, etiqueta: "Neonna dentro de una tele, con los brazos abiertos y una mano dandole toques a la pantalla" },
  { n: 18, src: "neonna-tele-sombra.svg", titulo: "Tele · con sombreado", saltos: true, etiqueta: "Neonna dentro de una tele, con los brazos abiertos y una mano dandole toques a la pantalla" },
];

const MODELOS = [
  { src: "neonna-base.svg", titulo: "Base", alt: "Neonna, chica chibi cyberpunk" },
  { src: "neonna-sunglasses.svg", titulo: "Lentes de sol", alt: "Neonna con lentes de sol" },
  { src: "neonna-brazos-cruzados.svg", titulo: "Brazos cruzados", alt: "Neonna con los brazos cruzados" },
  { src: "neonna-ojos-cerrados.svg", titulo: "Ojos cerrados", alt: "Neonna con los brazos cruzados y los ojos cerrados" },
];

const ROTULO = "font-mono text-[10px] tracking-widest text-zinc-500 uppercase";
const BRILLO = "drop-shadow-[0_0_12px_rgba(217,70,239,0.35)]";

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-mono text-sm text-zinc-400">
        <span className="text-fuchsia-500">{"// "}</span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export default function NeonnaPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Neonna</h1>
        <p className="font-mono text-sm text-zinc-400">
          <span className="text-fuchsia-500">~/Neonna</span> $ ls
          <span className="cursor-consola text-violet-300">_</span>
        </p>
      </header>

      {/* ---------- poses tele, en ASCII en vivo ---------- */}
      <Seccion titulo="Tele · ASCII en vivo">
        {TELES.map((t) => (
          <figure key={t.n} className="flex flex-col items-center gap-2">
            <NeonnaAsciiVivo
              src={`/images/neonna/${t.src}`}
              {...TELE}
              saltos={t.saltos}
              claro={"claro" in t && t.claro}
              fondo={"fondo" in t ? t.fondo : undefined}
              etiqueta={t.etiqueta}
              className="w-full overflow-hidden rounded-xl"
            />
            <figcaption className={ROTULO}>
              [{t.n}] {t.titulo}
            </figcaption>
          </figure>
        ))}
      </Seccion>

      {/* ---------- las 3 formas de ASCII que se probaron ---------- */}
      <Seccion titulo="ASCII · opciones">
        <div className="flex flex-wrap items-start justify-center gap-6">
          <figure className="flex flex-col items-center gap-2">
            <Image
              src="/images/neonna/ascii/neonna-ascii.gif"
              alt="Neonna en arte ASCII"
              width={481}
              height={600}
              unoptimized
              style={{ height: 300, width: "auto" }}
            />
            <figcaption className={ROTULO}>[1] GIF</figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-2">
            <NeonnaAsciiVivo />
            <figcaption className={ROTULO}>[2] En vivo</figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-2">
            <NeonnaAsciiTexto />
            <figcaption className={ROTULO}>[3] Texto</figcaption>
          </figure>
        </div>
      </Seccion>

      {/* ---------- modelos SVG ---------- */}
      <Seccion titulo="Modelos SVG">
        <div className="flex flex-wrap items-end justify-center gap-6">
          <figure className="flex flex-col items-center gap-2">
            <Image
              src="/images/misc/chibi-cyber.svg"
              alt="Neonna en la ciudad con un holograma"
              width={400}
              height={400}
              unoptimized
              className="h-auto w-56 rounded-3xl shadow-[0_0_24px_rgba(217,70,239,0.2)]"
            />
            <figcaption className={ROTULO}>Ciudad</figcaption>
          </figure>
          {MODELOS.map((m) => (
            <figure key={m.src} className="flex flex-col items-center gap-2">
              <Image
                src={`/images/neonna/${m.src}`}
                alt={m.alt}
                width={260}
                height={324}
                unoptimized
                className={`h-auto w-36 ${BRILLO}`}
              />
              <figcaption className={ROTULO}>{m.titulo}</figcaption>
            </figure>
          ))}
        </div>
      </Seccion>

      {/* ---------- cambio segun el tema ---------- */}
      <Seccion titulo="Segun el tema (oscuro / claro)">
        <div className="flex flex-wrap items-end justify-center gap-10">
          {/* en modo claro se pone lentes de sol: el tema la deslumbra.
              Solo CSS (variante claro:), cambia junto con data-theme */}
          <figure className="flex flex-col items-center gap-2">
            <Image
              src="/images/neonna/neonna-base.svg"
              alt="Neonna, chica chibi cyberpunk"
              width={260}
              height={324}
              unoptimized
              className={`h-auto w-36 ${BRILLO} claro:hidden`}
            />
            <Image
              src="/images/neonna/neonna-sunglasses.svg"
              alt="Neonna con lentes de sol, deslumbrada por el modo claro"
              width={260}
              height={324}
              unoptimized
              className={`hidden h-auto w-36 ${BRILLO} claro:block`}
            />
            <figcaption className={ROTULO}>Base / lentes de sol</figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-2">
            <Neonnameter />
            <figcaption className={ROTULO}>Neonnameter</figcaption>
          </figure>
        </div>
      </Seccion>
    </main>
  );
}
