import type { ReactNode } from "react";
import Image from "next/image";

type Props = {
  children: ReactNode;
  className?: string;
};

// Avatar decorativo a la izquierda: solo aligera visualmente el bloque de
// texto, por eso alt="" (los lectores de pantalla lo ignoran).
const AVATAR = "/images/misc/dorothy_placeholder.webp";

// Barra informativa a todo el ancho del contenedor: avatar + etiqueta
// "INFO" en fuchsia + texto libre (children). Pensada para notas, creditos
// o avisos de licencia. className opcional para spacing (my-*, mt-*) desde
// el consumidor. Para links dentro del texto, usar la clase exportada
// infoLinkClass y mantener el mismo estilo en todos los usos.
export default function Info({ children, className = "" }: Props) {
  return (
    <aside
      role="note"
      className={`flex w-full items-center gap-3.75 rounded-md border border-zinc-700 bg-zinc-900/60 px-3.75 py-2.5 ${className}`}
    >
      {/* pixelated: la imagen es pixel art, sin esto se ve borrosa al
          escalar. Se muestra completa, sin recorte ni marco. */}
      <Image
        src={AVATAR}
        alt=""
        width={205}
        height={170}
        className="h-15 w-auto shrink-0 [image-rendering:pixelated]"
        unoptimized
      />
      <p className="border-l border-zinc-700 pl-3.75 font-mono text-[15px] leading-relaxed text-zinc-400">
        <span className="tracking-widest text-fuchsia-300">INFO</span>
        <span className="mx-2.5 text-zinc-600">|</span>
        {children}
      </p>
    </aside>
  );
}

export const infoLinkClass =
  "text-fuchsia-300 underline underline-offset-2 hover:text-fuchsia-200";
