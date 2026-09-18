export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8">
      <div className="text-sm uppercase tracking-[0.4em] text-fuchsia-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.7)]">
        cargando
      </div>
      <div className="flex gap-3">
        <span className="neon-led h-2.5 w-2.5 rounded-full bg-fuchsia-400" />
        <span
          className="neon-led h-2.5 w-2.5 rounded-full bg-fuchsia-400"
          style={{ animationDelay: "0.3s" }}
        />
        <span
          className="neon-led h-2.5 w-2.5 rounded-full bg-fuchsia-400"
          style={{ animationDelay: "0.6s" }}
        />
      </div>
    </div>
  );
}
