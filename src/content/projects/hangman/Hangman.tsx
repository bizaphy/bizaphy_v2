"use client";
import { useState, useCallback, useEffect } from "react";
import { WORDS, type WordEntry } from "./words";

type WikiInfo = {
  image?: string;
  url: string;
};

async function fetchWikiInfo(title: string, signal: AbortSignal): Promise<WikiInfo> {
  const encoded = encodeURIComponent(title.replace(/ /g, "_"));
  const fallbackUrl = `https://es.wikipedia.org/wiki/${encoded}`;
  const res = await fetch(
    `https://es.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
    { signal },
  );
  if (!res.ok) return { url: fallbackUrl };
  const data = await res.json();
  return {
    image: data.thumbnail?.source,
    url: data.content_urls?.desktop?.page ?? fallbackUrl,
  };
}

// types
type GameStatus = "playing" | "won" | "lost";
type LetterState = "idle" | "correct" | "wrong";

//consts
//array de letras
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
const MAX_WRONG = 6;
const HINT_PENALTY = 2;

//funciones helpers.

function pickEntry(): WordEntry {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

//main
export default function Hangman() {
  const [entry, setEntry] = useState(() => pickEntry()); //lazy inic. obtiene word + hint.
  const secretWord = entry.word;
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set()); //set inicial vacio.
  const [hintRevealed, setHintRevealed] = useState(false);
  const [wikiInfo, setWikiInfo] = useState<WikiInfo | null>(null);
  //devuelve la length de un array, con la ctd. de letras que NO SON correctas.
  const wrongLetters = [...guessedLetters].filter(
    (letterGuessed) => !secretWord.includes(letterGuessed),
  ).length;
  //la pista suma HINT_PENALTY errores al total.
  const rawWrong = wrongLetters + (hintRevealed ? HINT_PENALTY : 0);
  //se muestra tope MAX_WRONG aunque la pista lo pase; la derrota si dispara con el crudo.
  const wrongCount = Math.min(rawWrong, MAX_WRONG);
  //revisa que cada letra, sin faltar, de la palabra secreta a adivinar, ya fuese ingresada por el usuario.
  const secretWordLetters = secretWord.split("");
  //
  const isWon = secretWordLetters.every((letterGuessed) =>
    guessedLetters.has(letterGuessed),
  );

  const isLost = rawWrong >= MAX_WRONG;
  //define playing al montar, va variando dsps.
  const gameStatus: GameStatus = isWon ? "won" : isLost ? "lost" : "playing";

  //agrega letra adivinada al set. solo se rerenderiza si hay nueva letra, si se gana, o pierde.
  const handleGuess = useCallback(
    (letter: string) => {
      if (guessedLetters.has(letter) || isWon || isLost) return undefined;
      setGuessedLetters(new Set([...guessedLetters, letter]));
    },
    [guessedLetters, isWon, isLost],
  );

  //resetea. nueva palabra y vacia el set.
  const handleRestart = useCallback(() => {
    setEntry(pickEntry());
    setGuessedLetters(new Set());
    setHintRevealed(false);
    setWikiInfo(null);
  }, []);

  //al ganar, consulta la api de wikipedia para traer miniatura y url canonica.
  useEffect(() => {
    if (!isWon) return;
    const controller = new AbortController();
    fetchWikiInfo(entry.wikipedia, controller.signal)
      .then(setWikiInfo)
      .catch(() => {
        // AbortError o red caida: ignorar. handleRestart limpia el estado.
      });
    return () => controller.abort();
  }, [isWon, entry.wikipedia]);
  //para una letra esp. determina si esta en estado idle, correcta o equivocada.
  //en ALPHABET.map del html se ejecuta para cada una de las letras en cada rerender.
  function getLetterState(letter: string): LetterState {
    if (!guessedLetters.has(letter)) return "idle";
    return secretWord.includes(letter) ? "correct" : "wrong";
  }

  const statusText =
    gameStatus === "won"
      ? "Ganaste"
      : gameStatus === "lost"
        ? `Perdiste — era "${secretWord}"`
        : `Errores: ${wrongCount} / ${MAX_WRONG}`;

  return (
    <section className="flex flex-col items-center gap-8 py-10">
      {/* STATUS TEXT*/}
      <p
        className={`text-lg font-semibold transition ${
          gameStatus === "won"
            ? "text-fuchsia-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]"
            : gameStatus === "lost"
              ? "text-red-400"
              : "text-zinc-400"
        }`}
      >
        {statusText}
      </p>

      {/* Slot principal: dibujo del ahorcado / imagen wikipedia al ganar */}
      {gameStatus === "won" ? (
        <a
          href={wikiInfo?.url ?? `https://es.wikipedia.org/wiki/${encodeURIComponent(entry.wikipedia.replace(/ /g, "_"))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center gap-2"
        >
          <div className="flex h-48 w-48 items-center justify-center overflow-hidden rounded-lg border border-zinc-700 transition group-hover:border-fuchsia-500 group-hover:shadow-[0_0_15px_rgba(217,70,239,0.4)]">
            {wikiInfo?.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={wikiInfo.image}
                alt={entry.label}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs text-zinc-600">cargando…</span>
            )}
          </div>
          <span className="text-sm text-zinc-300 underline-offset-4 transition group-hover:text-fuchsia-300 group-hover:underline">
            {entry.label}, capital de {entry.country}
          </span>
        </a>
      ) : (
        <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-zinc-700 p-4 text-center text-sm text-zinc-500">
          Puedes pedir una pista (cuenta como 2 errores)
        </div>
      )}

      {/* Palabra a adivinar */}
      <div className="flex gap-2">
        {secretWord.split("").map((letter, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="h-7 text-xl font-bold text-fuchsia-400">
              {guessedLetters.has(letter) ? letter.toUpperCase() : ""}
            </span>
            {/* linea inferior, guiones guia controlables, en reemplazo de - */}
            <span className="block h-px w-6 bg-zinc-500" />
          </div>
        ))}
      </div>

      {/* Teclado */}
      <div className="flex flex-wrap justify-center gap-2 max-w-sm">
        {ALPHABET.map((letter) => {
          const state = getLetterState(letter);
          return (
            <button
              key={letter}
              onClick={() => handleGuess(letter)}
              disabled={state !== "idle" || isWon || isLost}
              className={`h-9 w-9 rounded text-sm font-semibold uppercase transition
                ${state === "correct" ? "border border-fuchsia-500 bg-fuchsia-900 text-fuchsia-300 opacity-60" : ""}
                ${state === "wrong" ? "border border-zinc-700 bg-zinc-900 text-zinc-600 opacity-40" : ""}
                ${state === "idle" && !isWon && !isLost ? "border border-zinc-600 bg-zinc-800 text-zinc-200 hover:border-fuchsia-500 hover:bg-zinc-700" : ""}
                ${state === "idle" && (isWon || isLost) ? "border border-zinc-700 bg-zinc-900 text-zinc-600 opacity-40" : ""}
              `}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* PISTA */}
      <div className="flex flex-col items-center gap-2 min-h-[3.5rem]">
        {!hintRevealed ? (
          <button
            onClick={() => setHintRevealed(true)}
            disabled={isWon || isLost}
            className="rounded border border-zinc-600 bg-zinc-800 px-4 py-1.5 text-xs uppercase tracking-wider text-zinc-300 transition hover:border-fuchsia-500 hover:text-fuchsia-300 disabled:opacity-40 disabled:hover:border-zinc-600 disabled:hover:text-zinc-300"
          >
            Pedir pista
          </button>
        ) : (
          <p className="max-w-md text-center text-sm italic text-zinc-400">
            {entry.hint}
          </p>
        )}
      </div>

      {/* BOTON PARA REINICIAR */}
      <button
        onClick={handleRestart}
        className="rounded-lg border border-fuchsia-500 bg-black px-6 py-2 text-fuchsia-400 transition hover:bg-fuchsia-500 hover:text-black hover:shadow-[0_0_15px_rgba(217,70,239,0.5)]"
      >
        Reiniciar
      </button>
    </section>
  );
}
