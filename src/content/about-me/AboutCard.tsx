import Image from "next/image";
import { ReactNode } from "react";

type AboutCardProps = {
  imageSrc: string;
  imageAlt?: string;
  summary: ReactNode;
  extra?: ReactNode;
};

export default function AboutCard({ imageSrc, imageAlt = "Profile picture", summary, extra }: AboutCardProps) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-xl border border-zinc-700 bg-zinc-900 px-8 py-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex shrink-0 justify-center sm:w-1/3">
        <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-zinc-600">
          <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 text-center sm:w-2/3 sm:text-left">
        <h2 className="text-xl font-bold text-zinc-100">About me</h2>
        <p className="text-sm leading-relaxed text-zinc-400">{summary}</p>
        {extra && <p className="text-xs leading-relaxed text-zinc-500">{extra}</p>}
      </div>
    </div>
  );
}
