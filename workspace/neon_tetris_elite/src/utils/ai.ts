import { COLS, ROWS } from '../constants';
import { Tetromino, Position } from '../types';
import { checkCollision, rotatePiece } from './tetris';

interface Move {
  rotation: number;
  x: number;
  score: number;
}

const getColumnHeights = (grid: (string | null)[][]): number[] => {
  const heights = new Array(COLS).fill(0);
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      if (grid[y][x] !== null) {
        heights[x] = ROWS - y;
        break;
      }
    }
  }
  return heights;
};

const countHoles = (grid: (string | null)[][]): number => {
  let holes = 0;
  for (let x = 0; x < COLS; x++) {
    let blockFound = false;
    for (let y = 0; y < ROWS; y++) {
      if (grid[y][x] !== null) {
        blockFound = true;
      } else if (blockFound && grid[y][x] === null) {
        holes++;
      }
    }
  }
  return holes;
};

const getRowTransitions = (grid: (string | null)[][]): number => {
  let transitions = 0;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS - 1; x++) {
      if ((grid[y][x] === null) !== (grid[y][x + 1] === null)) {
        transitions++;
      }
    }
    // Boundaries count as transitions if they are next to an empty cell
    if (grid[y][0] === null) transitions++;
    if (grid[y][COLS - 1] === null) transitions++;
  }
  return transitions;
};

const getColTransitions = (grid: (string | null)[][]): number => {
  let transitions = 0;
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS - 1; y++) {
      if ((grid[y][x] === null) !== (grid[y + 1][x] === null)) {
        transitions++;
      }
    }
    // Top boundary doesn't count, but bottom does if it's empty (impossible in Tetris but good for logic)
    if (grid[ROWS - 1][x] === null) transitions++;
  }
  return transitions;
};

const getWellSums = (grid: (string | null)[][]): number => {
  let wellSum = 0;
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      if (grid[y][x] === null) {
        const leftFilled = (x === 0 || grid[y][x - 1] !== null);
        const rightFilled = (x === COLS - 1 || grid[y][x + 1] !== null);
        if (leftFilled && rightFilled) {
          // It's a well cell, find the depth
          let depth = 0;
          for (let k = y; k < ROWS; k++) {
            if (grid[k][x] === null) depth++;
            else break;
          }
          wellSum += depth;
          // Skip the rest of this well in this column
          y += depth - 1;
        }
      }
    }
  }
  return wellSum;
};

const countCompletedLines = (grid: (string | null)[][]): number => {
  let lines = 0;
  for (let y = 0; y < ROWS; y++) {
    if (grid[y].every(cell => cell !== null)) {
      lines++;
    }
  }
  return lines;
};

const evaluateGrid = (grid: (string | null)[][]): number => {
  const heights = getColumnHeights(grid);
  const aggregateHeight = heights.reduce((a, b) => a + b, 0);
  const completeLines = countCompletedLines(grid);
  const holes = countHoles(grid);
  const rowTransitions = getRowTransitions(grid);
  const colTransitions = getColTransitions(grid);
  const wellSums = getWellSums(grid);

  // Optimized weights
  const wHeight = -0.510066;
  const wLines = 0.760666;
  const wHoles = -0.35663;
  const wRowTrans = -0.184483;
  const wColTrans = -0.130000;
  const wWells = -0.100000;

  return (
    wHeight * aggregateHeight +
    wLines * completeLines +
    wHoles * holes +
    wRowTrans * rowTransitions +
    wColTrans * colTransitions +
    wWells * wellSums
  );
};

const simulateMove = (
  grid: (string | null)[][],
  piece: Tetromino,
  rotation: number,
  x: number
): (string | null)[][] | null => {
  let currentPiece = { ...piece };
  
  // Apply rotations
  for (let i = 0; i < rotation; i++) {
    currentPiece.shape = rotatePiece(currentPiece);
  }

  // Set x position
  currentPiece.position = { x, y: 0 };

  // Check if initial position is valid
  if (checkCollision(grid, currentPiece)) return null;

  // Drop to bottom
  while (!checkCollision(grid, currentPiece, { x: 0, y: 1 })) {
    currentPiece.position.y++;
  }

  // Create new grid with piece placed
  const newGrid = grid.map(row => [...row]);
  const { shape, position, color } = currentPiece;
  for (let py = 0; py < shape.length; py++) {
    for (let px = 0; px < shape[py].length; px++) {
      if (shape[py][px] !== 0) {
        const gy = position.y + py;
        const gx = position.x + px;
        if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
          newGrid[gy][gx] = color;
        }
      }
    }
  }

  return newGrid;
};

export const getBestMove = (
  grid: (string | null)[][], 
  piece: Tetromino, 
  nextPiece?: Tetromino
): Move | null => {
  let bestMove: Move | null = null;

  const processGrid = (g: (string | null)[][]) => {
    const lines = countCompletedLines(g);
    const gridAfterClear = g.filter(row => !row.every(cell => cell !== null));
    while (gridAfterClear.length < ROWS) {
      gridAfterClear.unshift(Array(COLS).fill(null));
    }
    return { grid: gridAfterClear, lines };
  };

  // Try all rotations (0 to 3)
  for (let r = 0; r < 4; r++) {
    // Try all x positions
    for (let x = -2; x < COLS + 2; x++) {
      const simulatedGrid = simulateMove(grid, piece, r, x);
      if (simulatedGrid) {
        const { grid: clearedGrid, lines: firstLines } = processGrid(simulatedGrid);
        let score = 0;

        if (nextPiece) {
          let bestNextScore = -Infinity;
          for (let r2 = 0; r2 < 4; r2++) {
            for (let x2 = -2; x2 < COLS + 2; x2++) {
              const nextSimulatedGrid = simulateMove(clearedGrid, nextPiece, r2, x2);
              if (nextSimulatedGrid) {
                const { grid: finalGrid, lines: secondLines } = processGrid(nextSimulatedGrid);
                const currentScore = evaluateGrid(finalGrid) + (firstLines + secondLines) * 10;
                if (currentScore > bestNextScore) {
                  bestNextScore = currentScore;
                }
              }
            }
          }
          score = bestNextScore;
        } else {
          score = evaluateGrid(clearedGrid) + firstLines * 10;
        }

        if (bestMove === null || score > bestMove.score) {
          bestMove = { rotation: r, x, score };
        }
      }
    }
  }

  return bestMove;
};
