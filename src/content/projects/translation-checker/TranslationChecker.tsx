"use client";

import { useState, useEffect, useCallback } from "react";
import { phrases } from "./data/phrases";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, "");
}

export default function TranslationChecker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [selfRating, setSelfRating] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });

  useEffect(() => {
    setCurrentIndex(Math.floor(Math.random() * phrases.length));
  }, []);

  const phrase = phrases[currentIndex];

  const handleCheck = useCallback(() => {
    const result = normalize(userInput) === normalize(phrase.romaji);
    setIsCorrect(result);
    return result;
  }, [userInput, phrase.romaji]);

  const handleCorrect = useCallback(() => {
    const result = handleCheck();
    if (result) {
      setSelfRating("correct");
    } else {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 2000);
    }
  }, [handleCheck]);

  const handleNext = useCallback(() => {
    if (selfRating === "correct") {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else if (selfRating === "incorrect") {
      setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
    setCurrentIndex(Math.floor(Math.random() * phrases.length));
    setUserInput("");
    setIsCorrect(null);
    setShowAnswer(false);
    setSelfRating(null);
  }, [selfRating]);

  return (
    <section className="mx-auto max-w-2xl space-y-5">
      {/* Score */}
      <div className="flex items-center gap-4 text-sm font-bold">
        <span className="text-fuchsia-400 drop-shadow-[0_0_6px_rgba(217,70,239,0.6)]">
          Correct: {score.correct}
        </span>
        <span className="text-zinc-500">Incorrect: {score.incorrect}</span>
      </div>

      {/* Prompt */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <p className="text-sm font-semibold text-zinc-400">
          Translate to Japanese (romaji)
        </p>
        <p className="mt-2 text-lg font-bold text-white">{phrase.english}</p>
        <span className="mt-2 inline-block rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-500">
          {phrase.level}
        </span>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheck()}
          placeholder="Type your translation in romaji..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white transition focus:border-fuchsia-500 focus:shadow-[0_0_10px_rgba(217,70,239,0.3)] focus:outline-none"
        />
        <p className="text-xs text-zinc-600">
          You typed: <code className="text-zinc-400">{userInput}</code>
        </p>
      </div>

      {/* Check + Show answer */}
      <div className="flex gap-3">
        <button
          onClick={handleCheck}
          className="rounded-lg border border-fuchsia-500 bg-black px-5 py-2 text-fuchsia-400 transition hover:bg-fuchsia-500 hover:text-black hover:shadow-[0_0_15px_rgba(217,70,239,0.5)]"
        >
          Check
        </button>
        <button
          onClick={() => setShowAnswer(true)}
          className="rounded-lg border border-zinc-700 bg-black px-5 py-2 text-zinc-400 transition hover:border-fuchsia-500 hover:text-fuchsia-400 hover:shadow-[0_0_10px_rgba(217,70,239,0.3)]"
        >
          Show answer
        </button>
      </div>

      {/* Result */}
      {isCorrect !== null && (
        <p
          className={`text-sm font-bold ${
            isCorrect
              ? "text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.7)]"
              : "text-red-400"
          }`}
        >
          {isCorrect ? "Correct!" : "Incorrect"}
        </p>
      )}

      {/* Answer reveal */}
      {showAnswer && (
        <div className="rounded-xl border border-fuchsia-500/30 bg-zinc-900 p-4 shadow-[0_0_15px_rgba(217,70,239,0.15)]">
          <p className="text-sm text-white">
            <span className="font-semibold text-fuchsia-400">Romaji: </span>
            {phrase.romaji}
          </p>
          <p className="mt-1 text-sm text-white">
            <span className="font-semibold text-fuchsia-400">Japanese: </span>
            {phrase.japanese}
          </p>
          <p className="mt-2 text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">Explanation: </span>
            {phrase.explanation}
          </p>
        </div>
      )}

      {/* Self-rating */}
      <div className="flex gap-3">
        <button
          onClick={handleCorrect}
          className={`rounded-lg border px-5 py-2 transition ${
            selfRating === "correct"
              ? "border-fuchsia-400 bg-fuchsia-500 text-black font-bold shadow-[0_0_15px_rgba(217,70,239,0.5)]"
              : "border-zinc-700 bg-black text-zinc-400 hover:border-fuchsia-500 hover:text-fuchsia-400 hover:shadow-[0_0_10px_rgba(217,70,239,0.3)]"
          }`}
        >
          Correct
        </button>
        <button
          onClick={() => setSelfRating("incorrect")}
          className={`rounded-lg border px-5 py-2 transition ${
            selfRating === "incorrect"
              ? "border-red-400 bg-red-500/20 text-red-400 font-bold"
              : "border-zinc-700 bg-black text-zinc-400 hover:border-red-400 hover:text-red-400"
          }`}
        >
          Incorrect
        </button>
      </div>

      {/* Warning */}
      {showWarning && (
        <p className="text-xs text-amber-400">
          You must enter the correct answer first
        </p>
      )}

      {/* Next */}
      <button
        onClick={handleNext}
        className="w-full rounded-lg border border-fuchsia-500 bg-black py-3 text-fuchsia-400 transition hover:bg-fuchsia-500 hover:text-black hover:shadow-[0_0_20px_rgba(217,70,239,0.5)]"
      >
        Next
      </button>
    </section>
  );
}
