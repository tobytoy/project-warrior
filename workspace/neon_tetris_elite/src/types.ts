export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  color: string;
  position: Position;
}

export interface GameState {
  grid: (string | null)[][];
  activePiece: Tetromino | null;
  nextPiece: Tetromino;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
  isPaused: boolean;
  mode: 'manual' | 'auto';
  aiSpeed: number;
  autoPlayCount: number;
  startTime: number | null;
  endTime: number | null;
}

export type LeaderboardType = 'tetris' | 'rpg' | 'adventure';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  lines?: number;
  level: number;
  duration: number; // in seconds
  timestamp: number;
  mode?: 'manual' | 'auto';
  rankAtTime: number;
  type: LeaderboardType;
}

export type EquipmentType = 'weapon' | 'armor_upper' | 'armor_lower';

export interface EquipmentStats {
  attack?: number;
  defense?: number;
  maxHp?: number;
  maxMp?: number;
  skillPower?: number; // %
  lifeStealAtk?: number; // %
  lifeStealSkill?: number; // %
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  tier: number; // 1-5
  stats: EquipmentStats;
  description: string;
}

export interface PlayerStats {
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  baseAtk: number;
  baseDef: number;
}

export interface Monster {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  xpReward: number;
  image: string;
}

export interface RPGState {
  player: PlayerStats;
  inventory: (Equipment | null)[];
  equipped: {
    weapon: Equipment | null;
    armor_upper: Equipment | null;
    armor_lower: Equipment | null;
  };
  currentMonster: Monster | null;
  combatLogs: string[];
}
