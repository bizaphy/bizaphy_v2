"use client";
import { useEffect, useState } from "react";
type CityConfig = {
  name: string;
  latitude: number;
  longitude: number;
  wikipediaSlug: string;
};

type WeatherData = {
  city: string;
  temperature: number;
  weatherCode: number;
  timezone: string;
  localTime: string;
  windSpeed: number;
  wikipediaSlug: string;
};

type FetchState = {
  data: WeatherData[];
  loading: boolean;
  error: string | null;
};

//molde para resultados de busqueda al agregar nueva ciudad.
type GeocodingResult = {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
};

const CITIES: CityConfig[] = [
  {
    name: "Sapporo",
    latitude: 43.06,
    longitude: 141.35,
    wikipediaSlug: "Sapporo",
  },
  {
    name: "Reikiavik",
    latitude: 64.15,
    longitude: -21.94,
    wikipediaSlug: "Reykjav%C3%ADk",
  },
  {
    name: "Santiago",
    latitude: -33.45,
    longitude: -70.67,
    wikipediaSlug: "Santiago",
  },
  { name: "Tokio", latitude: 35.68, longitude: 139.69, wikipediaSlug: "Tokyo" },
  {
    name: "Londres",
    latitude: 51.51,
    longitude: -0.13,
    wikipediaSlug: "London",
  },
  { name: "Lima", latitude: -12.05, longitude: -77.04, wikipediaSlug: "Lima" },
  { name: "Moscú", latitude: 55.76, longitude: 37.62, wikipediaSlug: "Moscow" },
  {
    name: "Pekín",
    latitude: 39.91,
    longitude: 116.39,
    wikipediaSlug: "Beijing",
  },
  {
    name: "Puerto Williams",
    latitude: -54.94,
    longitude: -67.61,
    wikipediaSlug: "Puerto_Williams",
  },
  {
    name: "Perth",
    latitude: -31.95,
    longitude: 115.86,
    wikipediaSlug: "Perth",
  },
  {
    name: "Johannesburgo",
    latitude: -26.2,
    longitude: 28.03,
    wikipediaSlug: "Johannesburg",
  },
  { name: "Sofía", latitude: 42.7, longitude: 23.32, wikipediaSlug: "Sofia" },
  {
    name: "Damasco",
    latitude: 33.51,
    longitude: 36.29,
    wikipediaSlug: "Damascus",
  },
  {
    name: "Hanga Roa",
    latitude: -27.15,
    longitude: -109.43,
    wikipediaSlug: "Hanga_Roa",
  },
  {
    name: "Jakarta",
    latitude: -6.21,
    longitude: 106.85,
    wikipediaSlug: "Jakarta",
  },
  {
    name: "Bilbao",
    latitude: 43.26,
    longitude: -2.93,
    wikipediaSlug: "Bilbao",
  },
];

//helpers
function getWeatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 57) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 67) return "🌨️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌧️";
  if (code <= 86) return "❄️";
  if (code <= 99) return "⛈️";
  return "🌡️";
}
function getWeatherLabel(code: number): string {
  if (code === 0) return "Despejado";
  if (code <= 3) return "Parcialmente nublado";
  if (code <= 48) return "Niebla";
  if (code <= 57) return "Llovizna";
  if (code <= 65) return "Lluvia";
  if (code <= 67) return "Lluvia helada";
  if (code <= 77) return "Nieve";
  if (code <= 82) return "Chubascos";
  if (code <= 86) return "Nieve intensa";
  if (code <= 99) return "Tormenta";
  return "Desconocido";
}
// Formatea la hora local de una ciudad para mostrarla en formato HH:MM.
function formatLocalTime(isoTime: string): string {
  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

function buildApiUrl(city: CityConfig): string {
  return `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
}

async function fetchCities(cities: CityConfig[]): Promise<WeatherData[]> {
  //arr. de objetos (results)
  const results = await Promise.all(
    cities.map(async (city) => {
      const res = await fetch(buildApiUrl(city));
      if (!res.ok) throw new Error(`Error al obtener info de ${city.name}`);
      const json = await res.json();

      return {
        //statics
        city: city.name,
        wikipediaSlug: city.wikipediaSlug,
        //API open-meteo
        temperature: json.current.temperature_2m as number,
        weatherCode: json.current.weather_code as number,
        windSpeed: json.current.wind_speed_10m as number,
        localTime: json.current.time as string,
        timezone: json.timezone as string,
      };
    }),
  );
  return results;
}

// Busca ciudades por nombre usando la API de geocodificación de Open-Meteo.
// Sin API key, sin CORS. Devuelve hasta 5 coincidencias.
//LIMITADO A 5 -- COUNT
async function searchGeocoding(query: string): Promise<GeocodingResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=es&format=json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al buscar ciudades");

  const json = await res.json();

  return (json.results as GeocodingResult[]) ?? [];
}

///////

export default function WeatherDashboard() {
  const [state, setState] = useState<FetchState>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    //si el usuario se va antes,  el componente no existe, cancelled pasa a true y no se actualizara nada con los datos desde la api que llegan mas tarde.
    fetchCities(CITIES)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (!cancelled)
          setState({ data: [], loading: false, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // --- Estado del buscador de ciudades extra ---
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [extraCities, setExtraCities] = useState<WeatherData[]>([]); //parte como array vacio
  const [addingCity, setAddingCity] = useState<boolean>(false);

  // Búsqueda con debounce de 300ms -- efecto cada vez que el user haga input.
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    let cancelled = false;

    const timer = setTimeout(() => {
      searchGeocoding(trimmed)
        .then((results) => {
          if (!cancelled) setSuggestions(results);
        })
        .catch(() => {
          if (!cancelled) setSuggestions([]);
        })
        .finally(() => {
          if (!cancelled) setSearchLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  async function handleAddCity(result: GeocodingResult) {
    const displayName = `${result.name}${result.country ? `, ${result.country}` : ""}`;
    const alreadyInBase = CITIES.some(
      (c) => c.latitude === result.latitude && c.longitude === result.longitude,
    );
    const alreadyInExtras = extraCities.some((c) => c.city === displayName);
    //
    if (alreadyInBase || alreadyInExtras) {
      //limpiamos barra de busqueda y un return para cancelar todo, evitando repetidas.
      setSearchQuery("");
      setSuggestions([]);
      return;
    }

    const cityConfig: CityConfig = {
      name: displayName,
      latitude: result.latitude,
      longitude: result.longitude,
      wikipediaSlug: encodeURIComponent(result.name.replace(/ /g, "_")),
    };

    setAddingCity(true);
    try {
      const [data] = await fetchCities([cityConfig]);
      setExtraCities((prev) => [...prev, data]);
      setSearchQuery("");
      setSuggestions([]);
    } catch {
      // silent — se puede añadir feedback si se quiere
    } finally {
      setAddingCity(false);
    }
  }

  function handleRemoveCity(name: string) {
    setExtraCities((prev) => prev.filter((c) => c.city !== name));
  }

  if (state.loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CITIES.map((c) => (
          <div
            key={c.name}
            className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <div className="mb-4 h-5 w-24 rounded bg-zinc-800" />
            <div className="mb-3 h-10 w-20 rounded bg-zinc-800" />
            <div className="h-4 w-32 rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="rounded-xl border border-red-500/50 bg-zinc-950 p-6 text-center">
        <p className="text-red-400">{state.error}</p>
        <button
          onClick={() => {
            setState({ data: [], loading: true, error: null });
            fetchCities(CITIES)
              .then((data) => setState({ data, loading: false, error: null }))
              .catch((err: Error) =>
                setState({ data: [], loading: false, error: err.message }),
              );
          }}
          className="mt-4 rounded-lg border border-fuchsia-500 bg-black px-4 py-2 text-fuchsia-400 transition hover:bg-fuchsia-500 hover:text-black hover:shadow-[0_0_15px_rgba(217,70,239,0.5)]"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {state.data.map((weather) => (
          <a
            key={weather.city}
            href={`https://en.wikipedia.org/wiki/${weather.wikipediaSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            title={`Ver ${weather.city} en Wikipedia (EN)`}
            className="block rounded-xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-fuchsia-500 hover:shadow-[0_0_20px_rgba(217,70,239,0.3)]"
          >
            <div className="mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-fuchsia-400">
                {weather.city}
              </h3>
              <span
                className="mt-1 block font-mono text-xs text-zinc-400"
                title={weather.timezone}
              >
                {formatLocalTime(weather.localTime)}
              </span>
            </div>

            <div className="mb-3 flex items-center gap-3">
              <span className="text-4xl">
                {getWeatherIcon(weather.weatherCode)}
              </span>
              <span className="font-mono text-4xl font-bold text-white">
                {Math.round(weather.temperature)}°C
              </span>
            </div>

            <p className="text-sm text-zinc-400">
              {getWeatherLabel(weather.weatherCode)}
            </p>

            <div className="mt-4 flex items-center gap-2 border-t border-zinc-800 pt-3">
              <span className="text-xs text-zinc-500">Viento</span>
              <span className="font-mono text-sm text-zinc-300">
                {weather.windSpeed} km/h
              </span>
            </div>
          </a>
        ))}
      </div>

      <section className="space-y-4 border-t border-zinc-800 pt-8 pb-64">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-fuchsia-400">
            Añadir otra ciudad
          </h2>
          <p className="text-sm text-zinc-400">
            Busca cualquier ciudad del mundo y agrégala al listado.
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ej: París, Estambul, Osaka..."
            disabled={addingCity}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 focus:border-fuchsia-500 focus:outline-none disabled:opacity-50"
          />
          {searchLoading && (
            <span className="absolute right-3 top-3 text-xs text-zinc-500">
              Buscando...
            </span>
          )}
          {addingCity && (
            <span className="absolute right-3 top-3 text-xs text-fuchsia-400">
              Añadiendo...
            </span>
          )}

          {suggestions.length > 0 && !addingCity && (
            <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-lg">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => handleAddCity(s)}
                    className="w-full px-4 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-fuchsia-400"
                  >
                    <span className="font-semibold text-white">{s.name}</span>
                    {s.admin1 && (
                      <span className="text-zinc-500"> — {s.admin1}</span>
                    )}
                    {s.country && (
                      <span className="text-zinc-500">, {s.country}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {extraCities.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {extraCities.map((weather) => (
              <div key={weather.city} className="relative">
                <button
                  onClick={() => handleRemoveCity(weather.city)}
                  aria-label={`Quitar ${weather.city}`}
                  className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm text-zinc-400 transition hover:border-red-500 hover:bg-red-500/20 hover:text-red-400"
                >
                  ×
                </button>
                <a
                  href={`https://en.wikipedia.org/wiki/${weather.wikipediaSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Ver ${weather.city} en Wikipedia (EN)`}
                  className="block rounded-xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-fuchsia-500 hover:shadow-[0_0_20px_rgba(217,70,239,0.3)]"
                >
                  <div className="mb-4 pr-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-fuchsia-400">
                      {weather.city}
                    </h3>
                    <span
                      className="mt-1 block font-mono text-xs text-zinc-400"
                      title={weather.timezone}
                    >
                      {formatLocalTime(weather.localTime)}
                    </span>
                  </div>

                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-4xl">
                      {getWeatherIcon(weather.weatherCode)}
                    </span>
                    <span className="font-mono text-4xl font-bold text-white">
                      {Math.round(weather.temperature)}°C
                    </span>
                  </div>

                  <p className="text-sm text-zinc-400">
                    {getWeatherLabel(weather.weatherCode)}
                  </p>

                  <div className="mt-4 flex items-center gap-2 border-t border-zinc-800 pt-3">
                    <span className="text-xs text-zinc-500">Viento</span>
                    <span className="font-mono text-sm text-zinc-300">
                      {weather.windSpeed} km/h
                    </span>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
