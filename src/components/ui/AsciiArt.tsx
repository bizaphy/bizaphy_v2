type AsciiArtProps = {
  art: string;
  className?: string;
};

export default function AsciiArt({ art, className = "" }: AsciiArtProps) {
  return (
    <pre className={`overflow-x-hidden font-mono text-[6px] leading-none text-zinc-500 sm:text-[11px] lg:text-[13px] mx-auto w-fit max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
      {art}
    </pre>
  );
}
