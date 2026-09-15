type Props = {
  caracter: string;
};

export default function KanjiCard({ caracter }: Props) {
  return (
    <div className="flex aspect-square items-center justify-center rounded-md border border-fuchsia-500/40 bg-zinc-900/60 font-mono text-2xl text-fuchsia-100 shadow-[0_0_6px_rgba(217,70,239,0.25)] transition select-none hover:border-fuchsia-400 hover:text-white hover:shadow-[0_0_12px_rgba(217,70,239,0.6)]">
      {caracter}
    </div>
  );
}
