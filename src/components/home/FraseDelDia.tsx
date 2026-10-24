import Image from "next/image";

type Frase = {
  texto: string;
  autor: string;
  imagen: string;
};

//ruta del placeholder. Si `frase.imagen` coincide, mostramos disclaimer en hover.
const PLACEHOLDER_IMAGE = "/images/misc/dorothy_placeholder.webp";

//para agregar una frase basta con sumarla aqui: rota sola, una por dia
const FRASES: Frase[] = [
  {
    texto: "Apurarse es perder el tiempo",
    autor: "Mujer del sur",
    imagen: PLACEHOLDER_IMAGE,
  },
];

const DIA_MS = 24 * 60 * 60 * 1000;

//fuera del componente: la regla react-hooks/purity no deja leer la fecha
//durante el render. Sin Math.random: el indice depende solo del dia (en hora
//de Chile), asi servidor y cliente eligen la misma frase. La home se regenera
//cada hora (ver ActivityHeatmap), asi que el cambio llega a mas tardar 1 h
//despues de medianoche.
const fraseDeHoy = () => {
  const hoy = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Santiago",
  });
  const dias = Math.floor(new Date(`${hoy}T00:00:00Z`).getTime() / DIA_MS);
  return FRASES[dias % FRASES.length];
};

export default function FraseDelDia() {
  const frase = fraseDeHoy();
  const isPlaceholder = frase.imagen === PLACEHOLDER_IMAGE;

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 flex">
      <div className="flex items-center justify-center px-3 border-r border-zinc-700">
        <span className="font-mono text-xs tracking-widest text-zinc-500 [writing-mode:vertical-rl] rotate-180">
          FRASE DEL DIA
        </span>
      </div>

      <div className="flex flex-col items-center gap-4 px-6 py-6 flex-1">
        <div className="group relative h-32 w-32 rounded-lg">
          <div className="relative h-full w-full overflow-hidden rounded-lg">
            <Image
              src={frase.imagen}
              alt="Frase del día"
              fill
              sizes="128px"
              className="object-cover"
              unoptimized
            />
          </div>
          {/* bocadillo estilo comic/manga (solo si sigue siendo el placeholder). Habla la imagen en primera persona.
              Oculto hasta lg: en pantallas chicas no hay hover y, aunque invisible, ocupaba espacio y generaba scroll horizontal. */}
          {isPlaceholder && (
            <div className="pointer-events-none absolute left-full top-1/2 z-10 ml-4 hidden w-56 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 lg:block">
              <div className="relative rounded-3xl border-2 border-fuchsia-500 bg-black px-4 py-3 shadow-[0_0_15px_rgba(217,70,239,0.35)]">
                <p className="text-center font-mono text-[11px] leading-snug text-fuchsia-200">
                  Solo soy un placeholder
                </p>
                {/* cola del bocadillo: cuadrado rotado 45° con solo bordes izq + inf; forma la punta hacia la imagen */}
                <div className="absolute -left-1.75 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-fuchsia-500 bg-black" />
              </div>
            </div>
          )}
        </div>
        <p className="italic text-center text-zinc-300 text-sm max-w-sm">
          &ldquo;{frase.texto}&rdquo;
        </p>
        <span className="font-mono text-xs text-fuchsia-400">
          — {frase.autor}
        </span>
      </div>
    </div>
  );
}
