import TextScramble from "@/components/effects/TextScramble";
import StatsCard from "@/content/home/StatsCard";
import Changelog from "@/content/home/Changelog";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Stats</h1>
      <p className="text-zinc-400">
        {" "}
        <TextScramble text="/bizaphy" />
      </p>
      <StatsCard />
      <Changelog />
    </div>
  );
}
