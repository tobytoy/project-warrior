import { useState, useCallback, useEffect, useRef } from "react";
import { COLS, ROWS, TETROMINOS, Shape } from "./constants";

export const createEmptyGrid = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export const useTetris = () => {
  const [grid, setGrid] = useState<(string | null)[][]>(createEmptyGrid());
  const [activePiece, setActivePiece] = useState<{
    shape: Shape;
    pos: { x: number; y: number };
    color: string;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [dropTime, setDropTime] = useState<number | null>(800);

  const spawnPiece = useCallback(() => {
    const keys = Object.keys(TETROMINOS);
    const key = keys[Math.floor(Math.random() * keys.length)];
    const piece = TETROMINOS[key];
    const newPiece = {
      shape: piece.shape,
      pos: { x: Math.floor(COLS / 2) - 2, y: 0 },
      color: piece.color,
    };

    if (checkCollision(newPiece.pos, newPiece.shape, grid)) {
      setGameOver(true);
      setDropTime(null);
    } else {
      setActivePiece(newPiece);
    }
  }, [grid]);

  const checkCollision = (pos: { x: number; y: number }, shape: Shape, currentGrid: (string | null)[][]) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          if (
            newX < 0 ||
            newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && currentGrid[newY][newX] !== null)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotate = (shape: Shape) => {
    const rotated = shape[0].map((_, index) =>
      shape.map((col) => col[index]).reverse()
    );
    return rotated;
  };

  const move = (dir: "left" | "right" | "down" | "rotate") => {
    if (!activePiece || gameOver) return;

    if (dir === "left") {
      if (!checkCollision({ x: activePiece.pos.x - 1, y: activePiece.pos.y }, activePiece.shape, grid)) {
        setActivePiece((prev) => prev && { ...prev, pos: { ...prev.pos, x: prev.pos.x - 1 } });
      }
    } else if (dir === "right") {
      if (!checkCollision({ x: activePiece.pos.x + 1, y: activePiece.pos.y }, activePiece.shape, grid)) {
        setActivePiece((prev) => prev && { ...prev, pos: { ...prev.pos, x: prev.pos.x + 1 } });
      }
    } else if (dir === "down") {
      if (!checkCollision({ x: activePiece.pos.x, y: activePiece.pos.y + 1 }, activePiece.shape, grid)) {
        setActivePiece((prev) => prev && { ...prev, pos: { ...prev.pos, y: prev.pos.y + 1 } });
      } else {
        lockPiece();
      }
    } else if (dir === "rotate") {
      const rotated = rotate(activePiece.shape);
      if (!checkCollision(activePiece.pos, rotated, grid)) {
        setActivePiece((prev) => prev && { ...prev, shape: rotated });
      }
    }
  };

  const lockPiece = useCallback(() => {
    if (!activePiece) return;

    const newGrid = [...grid.map((row) => [...row])];
    activePiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const gy = activePiece.pos.y + y;
          const gx = activePiece.pos.x + x;
          if (gy >= 0) newGrid[gy][gx] = activePiece.color;
        }
      });
    });

    // Clear lines
    let linesCleared = 0;
    const filteredGrid = newGrid.filter((row) => {
      if (row.every((cell) => cell !== null)) {
        linesCleared++;
        return false;
      }
      return true;
    });

    while (filteredGrid.length < ROWS) {
      filteredGrid.unshift(Array(COLS).fill(null));
    }

    if (linesCleared > 0) {
      setScore((prev) => prev + linesCleared * 100);
      setDropTime((prev) => (prev ? Math.max(MIN_DROP_SPEED, prev - 10) : null));
    }

    setGrid(filteredGrid);
    setActivePiece(null);
    spawnPiece();
  }, [activePiece, grid, spawnPiece]);

  useInterval(() => {
    move("down");
  }, dropTime);

  const resetGame = () => {
    setGrid(createEmptyGrid());
    setScore(0);
    setGameOver(false);
    setDropTime(800);
    setActivePiece(null);
  };

  useEffect(() => {
    if (!activePiece && !gameOver) {
      spawnPiece();
    }
  }, [activePiece, gameOver, spawnPiece]);

  return { grid, activePiece, score, gameOver, move, resetGame, checkCollision };
};
export const MIN_DROP_SPEED = 100;
