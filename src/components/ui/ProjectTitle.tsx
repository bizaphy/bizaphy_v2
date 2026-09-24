import TextScramble from "@/components/effects/TextScramble";

type Props = {
  title: string;
};

// Titulo de proyecto con el formato del /bizaphy del home: slash fucsia y
// texto en minusculas, ambos con TextScramble.
export default function ProjectTitle({ title }: Props) {
  return (
    <h1 className="text-2xl font-semibold tracking-tight">
      <TextScramble text="/" className="text-fuchsia-500" />
      <TextScramble text={title.toLowerCase()} />
    </h1>
  );
}
