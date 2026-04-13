import { COLS, ROWS, TETROMINOS } from '../constants';
import { Position, Tetromino, TetrominoType } from '../types';

export const createEmptyGrid = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

export const getRandomTetromino = (): Tetromino => {
  const types: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  const type = types[Math.floor(Math.random() * types.length)];
  const { shape, color } = TETROMINOS[type];
  
  return {
    type,
    shape,
    color,
    position: { x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 },
  };
};

export const checkCollision = (
  grid: (string | null)[][],
  piece: Tetromino,
  move: Position = { x: 0, y: 0 }
): boolean => {
  const { shape, position } = piece;
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== 0) {
        const newX = position.x + x + move.x;
        const newY = position.y + y + move.y;

        if (
          newX < 0 ||
          newX >= COLS ||
          newY >= ROWS ||
          (newY >= 0 && grid[newY][newX] !== null)
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

export const rotatePiece = (piece: Tetromino): number[][] => {
  const shape = piece.shape;
  const N = shape.length;
  const rotated = Array.from({ length: N }, () => Array(N).fill(0));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      rotated[c][N - 1 - r] = shape[r][c];
    }
  }
  return rotated;
};
