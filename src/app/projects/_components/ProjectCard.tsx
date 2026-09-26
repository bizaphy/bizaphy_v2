import Image from "next/image";
import Link from "next/link";
import TextScramble from "@/components/effects/TextScramble";

type ProjectCardProps = {
  slug: string;
  title: string;
  description: string;
  image?: string;
  variant?: "default" | "destacado";
};

export default function ProjectCard({
  slug,
  title,
  description,
  image,
  variant = "default",
}: ProjectCardProps) {
  const isDestacado = variant === "destacado";

  const articleClasses = isDestacado
    ? "border-white/70 group-hover:border-white group-hover:shadow-[0_0_28px_rgba(255,255,255,0.35)]"
    : "border-violet-300/40 group-hover:border-violet-300 group-hover:shadow-[0_0_24px_rgba(196,181,253,0.4)]";

  const titleClasses = isDestacado
    ? "text-pink-200 group-hover:text-pink-100"
    : "text-white group-hover:text-violet-200";

  const descClasses = isDestacado ? "text-zinc-100" : "text-zinc-400";

  const ctaClasses = isDestacado
    ? "text-pink-300 group-hover:text-pink-200"
    : "text-violet-300 group-hover:text-violet-200";

  return (
    <Link
      href={`/projects/${slug}`}
      className={`group block ${isDestacado ? "card-glitch-loop" : ""}`}
    >
      <article
        className={`flex h-90 flex-col overflow-hidden rounded-xl border bg-zinc-950/60 transition duration-300 ${articleClasses}`}
      >
        {/* Imagen */}
        <div className="relative h-44 shrink-0 overflow-hidden bg-zinc-900">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center gap-3"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(217,70,239,0.05) 24px,rgba(217,70,239,0.05) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(217,70,239,0.05) 24px,rgba(217,70,239,0.05) 25px)",
              }}
            >
              <svg
                className="h-10 w-10 text-zinc-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="font-mono text-xs tracking-widest text-zinc-600">
                SIN IMAGEN
              </span>
            </div>
          )}
          {/* Degradado inferior para separar imagen de la info */}
          <div className="absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-zinc-950/80 to-transparent" />
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h2
            className={`text-base font-bold tracking-wide transition duration-200 ${titleClasses}`}
          >
            <TextScramble text={title} />
          </h2>
          <p
            className={`neon-scroll flex-1 overflow-y-auto text-sm leading-relaxed ${descClasses}`}
          >
            {description}
          </p>
          <span
            className={`mt-3 shrink-0 font-mono text-xs tracking-widest transition duration-200 ${ctaClasses}`}
          >
            [ ENTRAR ]
          </span>
        </div>
      </article>
    </Link>
  );
}
