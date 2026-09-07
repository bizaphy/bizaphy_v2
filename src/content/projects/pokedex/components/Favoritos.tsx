type FavoritosProps = {
  favoritos: string[];
  onQuitarFavorito: (nombre: string) => void;
};

export function Favoritos({ favoritos, onQuitarFavorito }: FavoritosProps) {
  if (favoritos.length === 0) return null;
  return (
    <div className="mt-2 text-left">
      <h3 className="mb-3 text-xs uppercase tracking-wider text-zinc-400">
        Favoritos
      </h3>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {favoritos.map((nombre) => (
          <li
            key={nombre}
            className="flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm capitalize text-zinc-100"
          >
            {nombre}
            <button
              onClick={() => onQuitarFavorito(nombre)}
              className="rounded-lg border border-zinc-700 bg-transparent px-2 py-1 text-sm text-zinc-400 transition-colors hover:border-red-400 hover:text-red-400"
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
