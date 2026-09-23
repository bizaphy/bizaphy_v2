import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

// Barra informativa a todo el ancho del contenedor: etiqueta "INFO" en
// fuchsia + texto libre (children). Pensada para notas, creditos o avisos
// de licencia. className opcional para spacing (my-*, mt-*) desde el
// consumidor. Para links dentro del texto, usar la clase exportada
// infoLinkClass y mantener el mismo estilo en todos los usos.
export default function Info({ children, className = "" }: Props) {
  return (
    <aside
      role="note"
      className={`w-full rounded-md border border-zinc-700 bg-zinc-900/60 px-4 py-3 ${className}`}
    >
      <p className="font-mono text-xs leading-relaxed text-zinc-400">
        <span className="tracking-widest text-fuchsia-300">INFO</span>
        <span className="mx-2 text-zinc-600">|</span>
        {children}
      </p>
    </aside>
  );
}

export const infoLinkClass =
  "text-fuchsia-300 underline underline-offset-2 hover:text-fuchsia-200";
