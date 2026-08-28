export default function Footer() {
  return (
    <footer className="neon-nav flex items-center justify-between border-t border-fuchsia-500 px-6 py-4 text-sm text-zinc-500">
      <p>
        <span className="text-fuchsia-500">&gt;</span>{" "}
        {new Date().getFullYear()} bizaphy lab
      </p>
      <p className="flex items-center gap-2">
        Creado con Next.js
        <span className="neon-led inline-block h-2 w-2 rounded-full bg-fuchsia-500" />
      </p>
    </footer>
  );
}
