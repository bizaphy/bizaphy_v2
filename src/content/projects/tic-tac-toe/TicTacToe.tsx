"use client";
import { useState, useCallback } from "react";
// Definimos que una celda solo puede tener una "X", una "O", o estar vacía (null)
type CellValue = "X" | "O" | null;
// tablero es un arreglo de esas celdas.
type Board = CellValue[];

const WINNING_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function evaluateBoard(board: Board): {
  winner: CellValue;
  line: number[] | null;
} {
  // chequeo de simbolos en cada patron ganador
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);

  // 1. Calculamos el estado actual del juego en cada renderizado
  const { winner, line: winningLine } = evaluateBoard(board);
  const isDraw = !winner && board.every((cell) => cell !== null);

  // 2. Función para manejar el clic en una celda
  const handleClick = useCallback(
    (index: number) => {
      // Si la celda ya tiene algo o ya hay un ganador, no hacemos nada
      if (board[index] || winner) return;

      // Hacemos una copia del tablero, actualizamos la celda y cambiamos de turno
      const newBoard = [...board];
      newBoard[index] = xIsNext ? "X" : "O";
      setBoard(newBoard);
      setXIsNext(!xIsNext);
    },
    [board, xIsNext, winner],
  );

  // 3. Función para reiniciar el juego
  const handleReset = useCallback(() => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  }, []);

  // 4. Texto dinámico para mostrar arriba del tablero
  const statusText = winner
    ? `Ganador: ${winner}`
    : isDraw
      ? "Empate"
      : `Turno: ${xIsNext ? "X" : "O"}`;

  return (
    <section className="flex flex-col items-center gap-6 mt-12">
      {/* Título de estado */}
      <h2
        className={`text-2xl font-bold transition ${
          winner
            ? "text-fuchsia-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]"
            : isDraw
              ? "text-zinc-400"
              : "text-white"
        }`}
      >
        {statusText}
      </h2>

      {/* Cuadrícula de 3x3 */}
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => {
          // Revisamos si esta celda específica es parte de la línea ganadora
          const isWinCell = winningLine?.includes(i) ?? false;

          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              disabled={!!cell || !!winner}
              className={`flex h-24 w-24 items-center justify-center rounded-lg border text-3xl font-bold transition
                ${
                  isWinCell
                    ? "border-fuchsia-400 bg-fuchsia-500 text-black shadow-[0_0_20px_rgba(217,70,239,0.6)]" // Estilo si gana
                    : cell
                      ? "border-zinc-700 bg-zinc-900 text-fuchsia-400" // Estilo si está ocupada
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-fuchsia-500 hover:bg-zinc-900 hover:shadow-[0_0_15px_rgba(217,70,239,0.3)]" // Estilo por defecto
                }`}
            >
              {cell}
            </button>
          );
        })}
      </div>

      {/* Botón de reinicio */}
      <button
        onClick={handleReset}
        className="rounded-lg border border-fuchsia-500 bg-black px-6 py-2 text-fuchsia-400 transition hover:bg-fuchsia-500 hover:text-black hover:shadow-[0_0_15px_rgba(217,70,239,0.5)]"
      >
        Reiniciar
      </button>
    </section>
  );
}
