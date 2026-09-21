import TextScramble2 from "./TextScramble2";

type AsciiArtProps = {
  art: string;
  className?: string;
  scrambleDurationMs?: number;
};

export default function AsciiArt({
  art,
  className = "",
  scrambleDurationMs = 2500,
}: AsciiArtProps) {
  return (
    <TextScramble2
      text={art}
      as="pre"
      scrambleDurationMs={scrambleDurationMs}
      ariaLabel="Arte ASCII"
      className={`mx-auto w-fit max-w-full overflow-x-hidden font-mono text-[clamp(6px,1.6vw,18px)] leading-none text-zinc-500 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    />
  );
}
