type Props = {
  className?: string;
};

// Linea separadora horizontal solida en fuchsia con glow suave, sin fading
// en los extremos para marcarse bien a lo ancho del contenedor.
// className opcional para controlar spacing (my-*, mx-*) desde el consumidor.
export default function SeparatorLine({ className = "" }: Props) {
  return (
    <div
      role="separator"
      aria-hidden="true"
      className={`h-0.5 w-full bg-fuchsia-500/50 shadow-[0_0_8px_rgba(217,70,239,0.3)] ${className}`}
    />
  );
}
