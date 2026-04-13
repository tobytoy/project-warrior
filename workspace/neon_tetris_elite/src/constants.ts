import { TetrominoType } from './types';

export const COLS = 10;
export const ROWS = 20;
export const INITIAL_DROP_SPEED = 800; // ms
export const MIN_DROP_SPEED = 100;
export const SPEED_INCREMENT = 50;

export const TETROMINOS: Record<TetrominoType, { shape: number[][]; color: string }> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#00f0f0', // Cyan
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#0000f0', // Blue
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#f0a000', // Orange
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#f0f000', // Yellow
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#00f000', // Green
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#a000f0', // Purple
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#f00000', // Red
  },
};

export const SCORING = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
};

export const RANDOM_NAMES = [
  "CyberBot", "NeonRider", "PixelMaster", "Zenith", "AlphaZero", 
  "DeepBlue", "Matrix", "Glitch", "Vector", "Quantum", 
  "Binary", "Logic", "Circuit", "Spark", "Flux"
];

export const ADVENTURE_LEVELS = 5;
export const BOSS_SPAWN_TIME = 60000; // 60 seconds

export const MONSTERS = [
  { type: 'Slime', hp: 50, damage: 5, color: '#4ade80', speed: 1 },
  { type: 'Ghost', hp: 80, damage: 10, color: '#f8fafc', speed: 1.2 },
  { type: 'Bat', hp: 120, damage: 15, color: '#a855f7', speed: 1.5 },
  { type: 'Skeleton', hp: 200, damage: 20, color: '#94a3b8', speed: 0.8 },
  { type: 'Demon', hp: 350, damage: 30, color: '#ef4444', speed: 1.1 },
];

export const BOSSES = [
  { type: 'King Slime', hp: 1000, damage: 50, color: '#22c55e', speed: 0.5 },
  { type: 'Phantom Lord', hp: 2000, damage: 80, color: '#cbd5e1', speed: 0.6 },
  { type: 'Vampire Bat', hp: 3500, damage: 120, color: '#7e22ce', speed: 0.8 },
  { type: 'Lich King', hp: 6000, damage: 180, color: '#475569', speed: 0.4 },
  { type: 'Demon Lord', hp: 10000, damage: 300, color: '#b91c1c', speed: 0.7 },
];

export const SKILLS = {
  Q: { name: 'Heal', cost: 20, description: 'Restore 30% HP' },
  W: { name: 'Fire Blast', cost: 30, description: 'Damage all nearby monsters' },
  E: { name: 'Mana Shield', cost: 40, description: 'Reduce damage by 50% for 5s' },
  R: { name: 'Time Freeze', cost: 100, description: 'Freeze all monsters for 5s' },
};
