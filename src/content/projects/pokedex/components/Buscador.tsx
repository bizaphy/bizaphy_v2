"use client";
import { useState, useEffect } from "react";
import { Historial } from "./Historial";
import { Favoritos } from "./Favoritos";

const POKEAPI_BASE = "https://pokeapi.co/api/v2/pokemon";

type Pokemon = {
  name: string;
  sprites: { front_default: string };
  types: Array<{ type: { url: string } }>;
};

type TipoData = {
  names: Array<{ name: string; language: { name: string } }>;
  sprites: { "generation-v": { "black-white": { name_icon: string } } };
};

const cargarGuardado = (clave: string): string[] => {
  if (typeof window === "undefined") return [];
  const guardado = localStorage.getItem(clave);
  return guardado ? (JSON.parse(guardado) as string[]) : [];
};

export function Buscador() {
  const [texto, setTexto] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historial, setHistorial] = useState<string[]>(() =>
    cargarGuardado("pokedex-historial"),
  );
  const [segundos, setSegundos] = useState(0);
  const [favoritos, setFavoritos] = useState<string[]>(() =>
    cargarGuardado("pokedex-favoritos"),
  );
  const [tipos, setTipos] = useState<string[]>([]);
  const [iconosTipos, setIconosTipos] = useState<string[]>([]);

  const esFavorito = pokemon && favoritos.includes(pokemon.name);

  const handleQuitarFavorito = (nombre: string) => {
    setFavoritos((prev) => prev.filter((fav) => fav !== nombre));
  };

  const handleToggleFavorito = () => {
    setFavoritos((prev) => {
      const yaEsFavorito = prev.includes(pokemon!.name);
      if (yaEsFavorito) return prev.filter((n) => n !== pokemon!.name);
      return [pokemon!.name, ...prev];
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && texto) setBusqueda(texto.toLowerCase());
  };

  // fetch al presionar buscar o debounce
  useEffect(() => {
    if (!busqueda) return;
    setLoading(true);
    setError(null);
    fetch(`${POKEAPI_BASE}/${busqueda}`)
      .then((res) => {
        if (!res.ok) throw new Error("No se encontró ese pokémon");
        return res.json() as Promise<Pokemon>;
      })
      .then((data) => {
        setPokemon(data);
        setHistorial((prev) => {
          if (prev.includes(busqueda)) return prev;
          return [busqueda, ...prev];
        });
      })
      .catch((err: Error) => {
        setError(err.message);
        setPokemon(null);
      })
      .finally(() => setLoading(false));
  }, [busqueda]);

  // debounce: busca 700ms después del último tecleo
  useEffect(() => {
    if (!texto) return;
    const id = setTimeout(() => setBusqueda(texto.toLowerCase()), 700);
    return () => clearTimeout(id);
  }, [texto]);

  // cronómetro por pokémon
  useEffect(() => {
    if (!pokemon) return;
    setSegundos(0);
    const id = setInterval(() => setSegundos((prev) => prev + 1), 1000);
    return () => clearInterval(id);
  }, [pokemon]);

  // persistencia historial
  useEffect(() => {
    localStorage.setItem("pokedex-historial", JSON.stringify(historial));
  }, [historial]);

  // persistencia favoritos
  useEffect(() => {
    localStorage.setItem("pokedex-favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  // tipos del pokémon en español con iconos
  useEffect(() => {
    if (!pokemon) return;
    const promesas = pokemon.types.map((t) =>
      fetch(t.type.url).then((res) => res.json() as Promise<TipoData>),
    );
    Promise.all(promesas).then((resultados) => {
      const nombres = resultados.map((td) => {
        const traduccion = td.names.find((n) => n.language.name === "es");
        return traduccion?.name ?? td.names[0]?.name ?? "";
      });
      const iconos = resultados.map(
        (td) => td.sprites["generation-v"]["black-white"].name_icon,
      );
      setTipos(nombres);
      setIconosTipos(iconos);
    });
  }, [pokemon]);

  return (
    <div className="flex flex-col gap-4">
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="pikachu"
        className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-base text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-yellow-300"
      />
      <button
        onClick={() => setBusqueda(texto.toLowerCase())}
        className="w-full cursor-pointer rounded-xl bg-yellow-300 px-4 py-3 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-80"
      >
        Buscar
      </button>

      {loading && <p className="text-sm text-zinc-400">Cargando...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {pokemon && !loading && (
        <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-6 text-center">
          <h2 className="mb-2 text-xl capitalize">{pokemon.name}</h2>
          <div className="mb-1 flex items-center justify-center gap-2">
            {iconosTipos.map((url, i) => (
              <img key={url} src={url} alt={tipos[i]} className="h-5 w-auto" />
            ))}
            <p className="text-sm text-zinc-400">{tipos.join(" / ")}</p>
          </div>
          <img
            src={pokemon.sprites.front_default}
            alt={pokemon.name}
            className="mx-auto h-[120px] w-[120px] [image-rendering:pixelated]"
          />
          <p className="mt-2 text-sm text-zinc-400">
            Llevas {segundos}s viendo a {pokemon.name}
          </p>
          <button
            onClick={handleToggleFavorito}
            className="mt-3 w-full cursor-pointer rounded-xl border border-yellow-300/50 bg-transparent px-4 py-2 text-sm font-semibold text-yellow-300 transition-opacity hover:opacity-80"
          >
            {esFavorito ? "★ Quitar de favoritos" : "☆ Agregar a favoritos"}
          </button>
        </div>
      )}

      <Historial historial={historial} />
      <Favoritos favoritos={favoritos} onQuitarFavorito={handleQuitarFavorito} />
    </div>
  );
}
