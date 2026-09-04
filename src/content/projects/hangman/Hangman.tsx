// types
type GameStatus = "playing" | "won" | "lost";
type LetterState = "idle" | "correct" | "wrong";
//consts
//array de letras
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
const MAX_WRONG = 6;
//consts-mocks
const MOCK_WORD = "javascript";
const MOCK_GUESSED: string[] = ["j", "a", "m", "d"];
const MOCK_STATUS: GameStatus = "playing";
const MOCK_WRONG = 3;

//funciones helpers.

function getLetterState(letter: string): LetterState {
  if (!MOCK_GUESSED.includes(letter)) return "idle";
  return MOCK_WORD.includes(letter) ? "correct" : "wrong";
}

//main
export default function Hangman() {
  const statusText =
    MOCK_STATUS === "won"
      ? "Ganaste"
      : MOCK_STATUS === "lost"
        ? `Perdiste — era "${MOCK_WORD}"`
        : `Errores: ${MOCK_WRONG} / ${MAX_WRONG}`;

  return (
    <section className="flex flex-col items-center gap-8 py-10">
      {/* STATUS TEXT*/}
      <p className="text-lg font-semibold text-zinc-400">{statusText}</p>

      {/* Render (pronto) */}
      <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-zinc-700 text-zinc-600 text-sm"></div>

      {/* Palabra a adivinar */}
      <div className="flex gap-2">
        {MOCK_WORD.split("").map((letter, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="h-7 text-xl font-bold text-fuchsia-400">
              {MOCK_GUESSED.includes(letter) ? letter.toUpperCase() : ""}
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
              disabled={state !== "idle"}
              className={`h-9 w-9 rounded text-sm font-semibold uppercase transition
                ${state === "correct" ? "border border-fuchsia-500 bg-fuchsia-900 text-fuchsia-300 opacity-60" : ""}
                ${state === "wrong" ? "border border-zinc-700 bg-zinc-900 text-zinc-600 opacity-40" : ""}
                ${state === "idle" ? "border border-zinc-600 bg-zinc-800 text-zinc-200 hover:border-fuchsia-500 hover:bg-zinc-700" : ""}
              `}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* BOTON PARA REINICIAR */}
      <button className="rounded-lg border border-fuchsia-500 bg-black px-6 py-2 text-fuchsia-400 transition hover:bg-fuchsia-500 hover:text-black">
        Reiniciar
      </button>
    </section>
  );
}
