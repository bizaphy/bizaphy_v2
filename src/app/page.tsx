import TextScramble from "@/components/effects/TextScramble";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Remade de bizaphy lab</h1>
      <p className="text-zinc-400">
        {" "}
        <TextScramble text="/bizaphy" />
      </p>
    </div>
  );
}
