import Image from "next/image";

interface InProgressProps {
  message?: string;
}

export default function InProgress({
  message = "In Progress",
}: InProgressProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10">
      <div
        className="
          relative overflow-hidden rounded-xl
          w-36 h-36
          sm:w-56 sm:h-56
          lg:w-80 lg:h-80
          border border-fuchsia-500/40
          shadow-[0_0_24px_rgba(217,70,239,0.2)]
        "
      >
        <Image
          src="/images/misc/pixel-dorothy.gif"
          alt="Proyecto en progreso"
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <p className="font-mono text-center px-4 max-w-sm text-sm sm:text-base lg:text-lg text-zinc-400">
        <span className="text-fuchsia-500">// </span>
        {message}
      </p>
    </div>
  );
}
