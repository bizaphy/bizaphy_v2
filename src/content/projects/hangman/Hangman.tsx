"use client";
import { useState, useCallback } from "react";
import { WORDS } from "./words";

// types
type GameStatus = "playing" | "won" | "lost";
type LetterState = "idle" | "correct" | "wrong";

//consts
//array de letras
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
const MAX_WRONG = 6;

//funciones helpers.

function pickWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

//main
export default function Hangman() {
  const [secretWord, setSecretWord] = useState(() => pickWord()); //lazy inic. usando pickword obtenemos secretword.
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set()); //set inicial vacio.
  //devuelve la length de un array, con la ctd. de letras que NO SON correctas.
  const wrongCount = [...guessedLetters].filter(
    (letterGuessed) => !secretWord.includes(letterGuessed),
  ).length;
  //revisa que cada letra, sin faltar, de la palabra secreta a adivinar, ya fuese ingresada por el usuario.
  const secretWordLetters = secretWord.split("");
  //
  const isWon = secretWordLetters.every((letterGuessed) =>
    guessedLetters.has(letterGuessed),
  );

  const isLost = wrongCount >= MAX_WRONG;
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
    setSecretWord(pickWord());
    setGuessedLetters(new Set());
  }, []);
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

      {/* Render (pronto) */}
      <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-zinc-700 text-zinc-600 text-sm">
        dibujo — sgte fase
      </div>

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
