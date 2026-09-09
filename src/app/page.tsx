import TextScramble from "@/components/effects/TextScramble";
import StatsCard from "@/content/home/StatsCard";
import Changelog from "@/content/home/Changelog";
import APILights from "@/content/home/APILights";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-center">/bizaphy</h1>
      <p className="text-zinc-400">
        {" "}
        <TextScramble text="stats" />
      </p>
      <StatsCard />
      <APILights />
      <Changelog />
    </div>
  );
}
