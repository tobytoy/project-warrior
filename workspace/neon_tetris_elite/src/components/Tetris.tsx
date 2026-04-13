import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Cpu, User, Trophy, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { COLS, ROWS, INITIAL_DROP_SPEED, MIN_DROP_SPEED, SPEED_INCREMENT, SCORING, RANDOM_NAMES } from '../constants';
import { GameState, Tetromino, LeaderboardEntry, RPGState, Monster, Equipment } from '../types';
import { createEmptyGrid, getRandomTetromino, checkCollision, rotatePiece } from '../utils/tetris';
import { getBestMove } from '../utils/ai';
import { generateMonster, generateEquipment, calculateTotalStats, checkLevelUp, getHpMax, getMpMax } from '../utils/rpg';
import { RPGPanel } from './RPG/RPGPanel';

interface TetrisProps {
  onLinesCleared?: (lines: number) => void;
}

const Tetris: React.FC<TetrisProps> = ({ onLinesCleared }) => {
  const [gameState, setGameState] = useState<GameState>({
    grid: createEmptyGrid(),
    activePiece: null,
    nextPiece: getRandomTetromino(),
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
    isPaused: false,
    mode: 'manual',
    aiSpeed: 5,
    autoPlayCount: 1,
    startTime: null,
    endTime: null,
  });

  const [rpgState, setRpgState] = useState<RPGState>({
    player: {
      level: 1,
      xp: 0,
      hp: 100,
      maxHp: 100,
      mp: 100,
      maxMp: 100,
      baseAtk: 10,
      baseDef: 5,
    },
    inventory: Array(16).fill(null),
    equipped: {
      weapon: null,
      armor_upper: null,
      armor_lower: null,
    },
    currentMonster: null,
    combatLogs: [],
  });

  const handleCombatAction = (action: 'attack' | 'q' | 'w' | 'e' | 'r') => {
    setRpgState(prev => {
      if (!prev.currentMonster) return prev;

      const totalStats = calculateTotalStats(prev.player, prev.equipped);
      const newLogs = [...prev.combatLogs];
      let playerDamage = 0;
      let heal = 0;
      let mpCost = 0;

      switch (action) {
        case 'attack':
          playerDamage = Math.max(1, totalStats.attack - prev.currentMonster.def);
          newLogs.unshift(`Player attacks for ${playerDamage} damage!`);
          break;
        case 'q': // Heal
          mpCost = 30;
          if (prev.player.mp < mpCost) return prev;
          heal = Math.floor(totalStats.maxHp * 0.25 + prev.player.level * 50);
          newLogs.unshift(`Player uses HEAL (Q) and recovers ${heal} HP!`);
          break;
        case 'w': // Power Strike
          mpCost = 40;
          if (prev.player.mp < mpCost) return prev;
          playerDamage = Math.max(1, Math.floor(totalStats.attack * 2) - prev.currentMonster.def);
          newLogs.unshift(`Player uses POWER STRIKE (W) for ${playerDamage} damage!`);
          break;
        case 'e': // Magic Burst
          mpCost = 60;
          if (prev.player.mp < mpCost) return prev;
          playerDamage = Math.max(1, Math.floor(totalStats.attack * (1 + totalStats.skillPower / 50) * 2.5) - prev.currentMonster.def);
          newLogs.unshift(`Player uses MAGIC BURST (E) for ${playerDamage} damage!`);
          break;
        case 'r': // Ultimate
          mpCost = 100;
          if (prev.player.mp < mpCost) return prev;
          playerDamage = Math.max(1, Math.floor(totalStats.attack * 5) - prev.currentMonster.def);
          heal = Math.floor(totalStats.maxHp * 0.1);
          newLogs.unshift(`Player uses ULTIMATE (R) for ${playerDamage} damage and heals ${heal} HP!`);
          break;
      }

      const newMonsterHp = Math.max(0, prev.currentMonster.hp - playerDamage);
      
      // Lifesteal (only on damage dealing actions)
      if (playerDamage > 0) {
        if (action === 'attack' && totalStats.lifeStealAtk > 0) {
          heal += Math.floor(playerDamage * (totalStats.lifeStealAtk / 100));
        } else if (action !== 'attack' && totalStats.lifeStealSkill > 0) {
          heal += Math.floor(playerDamage * (totalStats.lifeStealSkill / 100));
        }
      }
      
      const newPlayerHp = Math.min(totalStats.maxHp, prev.player.hp + heal);
      if (heal > 0 && action !== 'q' && action !== 'r') newLogs.unshift(`Player heals for ${heal} HP!`);

      let nextState = { 
        ...prev, 
        player: { 
          ...prev.player, 
          hp: newPlayerHp, 
          mp: prev.player.mp - mpCost 
        }, 
        currentMonster: { 
          ...prev.currentMonster, 
          hp: newMonsterHp 
        }, 
        combatLogs: newLogs.slice(0, 50) 
      };

      if (newMonsterHp === 0) {
        newLogs.unshift(`Monster defeated! Gained ${prev.currentMonster.xpReward} XP.`);
        let updatedPlayer = checkLevelUp({ ...nextState.player, xp: nextState.player.xp + prev.currentMonster.xpReward });
        
        // Drop logic
        const drop = Math.random() > 0.5 ? generateEquipment(prev.currentMonster.level) : null;
        const newInventory = [...nextState.inventory];
        if (drop) {
          const emptySlot = newInventory.indexOf(null);
          if (emptySlot !== -1) {
            newInventory[emptySlot] = drop;
            newLogs.unshift(`Monster dropped: ${drop.name}!`);
          } else {
            newLogs.unshift(`Inventory full! Could not pick up ${drop.name}.`);
          }
        }

        return {
          ...nextState,
          player: updatedPlayer,
          currentMonster: null,
          inventory: newInventory,
          combatLogs: newLogs.slice(0, 50)
        };
      }

      // Monster Turn (only if player didn't just heal or if monster is still alive)
      const monsterDamage = Math.max(1, prev.currentMonster.atk - totalStats.defense);
      const finalPlayerHp = Math.max(0, nextState.player.hp - monsterDamage);
      newLogs.unshift(`${prev.currentMonster.name} attacks for ${monsterDamage} damage!`);

      if (finalPlayerHp === 0) {
        newLogs.unshift(`Player defeated! Respawning...`);
        const respawnStats = calculateTotalStats(prev.player, prev.equipped);
        return {
          ...nextState,
          player: { ...nextState.player, hp: respawnStats.maxHp, mp: respawnStats.maxMp },
          currentMonster: null,
          combatLogs: newLogs.slice(0, 50)
        };
      }

      return {
        ...nextState,
        player: { ...nextState.player, hp: finalPlayerHp },
        combatLogs: newLogs.slice(0, 50)
      };
    });
  };

  const [autoPlaySetting, setAutoPlaySetting] = useState<number>(1);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('tetris-leaderboard');
    return saved ? JSON.parse(saved) : [];
  });

  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [pendingEntry, setPendingEntry] = useState<Partial<LeaderboardEntry> | null>(null);

  const gameLoopRef = useRef<number | null>(null);
  const lastDropTimeRef = useRef<number>(0);
  const dropSpeedRef = useRef<number>(INITIAL_DROP_SPEED);

  const spawnPiece = useCallback(() => {
    setGameState(prev => {
      const nextPiece = getRandomTetromino();
      const activePiece = { ...prev.nextPiece };
      
      if (checkCollision(prev.grid, activePiece)) {
        return { ...prev, gameOver: true, endTime: Date.now() };
      }

      return {
        ...prev,
        activePiece,
        nextPiece,
      };
    });
  }, []);

  const clearLines = useCallback((grid: (string | null)[][]) => {
    let linesCleared = 0;
    const newGrid = grid.filter(row => {
      const isFull = row.every(cell => cell !== null);
      if (isFull) linesCleared++;
      return !isFull;
    });

    while (newGrid.length < ROWS) {
      newGrid.unshift(Array(COLS).fill(null));
    }

    if (linesCleared > 0) {
      // RPG MP Gain
      setRpgState(prev => {
        const totalStats = calculateTotalStats(prev.player, prev.equipped);
        const mpGain = linesCleared * 20;
        return {
          ...prev,
          player: {
            ...prev.player,
            mp: Math.min(totalStats.maxMp, prev.player.mp + mpGain)
          },
          combatLogs: [`Gained ${mpGain} MP from Tetris!`, ...prev.combatLogs].slice(0, 50)
        };
      });

      if (onLinesCleared) onLinesCleared(linesCleared);
      setGameState(prev => {
        const points = [0, SCORING.SINGLE, SCORING.DOUBLE, SCORING.TRIPLE, SCORING.TETRIS][linesCleared] || 0;
        const newLines = prev.lines + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1;
        dropSpeedRef.current = Math.max(MIN_DROP_SPEED, INITIAL_DROP_SPEED - (newLevel - 1) * SPEED_INCREMENT);
        
        if (linesCleared === 4) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00f0f0', '#ffffff']
          });
        }

        return {
          ...prev,
          score: prev.score + points * newLevel,
          lines: newLines,
          level: newLevel,
        };
      });
    }

    return newGrid;
  }, [onLinesCleared]);

  const lockPiece = useCallback(() => {
    setGameState(prev => {
      if (!prev.activePiece) return prev;

      const newGrid = prev.grid.map(row => [...row]);
      const { shape, position, color } = prev.activePiece;

      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x] !== 0) {
            const gy = position.y + y;
            const gx = position.x + x;
            if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
              newGrid[gy][gx] = color;
            }
          }
        }
      }

      const gridAfterClear = clearLines(newGrid);
      return {
        ...prev,
        grid: gridAfterClear,
        activePiece: null,
      };
    });
    spawnPiece();
  }, [spawnPiece, clearLines]);

  const movePiece = useCallback((dx: number, dy: number) => {
    setGameState(prev => {
      if (!prev.activePiece || prev.gameOver || prev.isPaused) return prev;

      const newPos = { x: prev.activePiece.position.x + dx, y: prev.activePiece.position.y + dy };
      if (!checkCollision(prev.grid, { ...prev.activePiece, position: newPos })) {
        return {
          ...prev,
          activePiece: { ...prev.activePiece, position: newPos },
        };
      }

      if (dy > 0) {
        lockPiece();
      }
      return prev;
    });
  }, [lockPiece]);

  const rotate = useCallback(() => {
    setGameState(prev => {
      if (!prev.activePiece || prev.gameOver || prev.isPaused) return prev;

      const rotatedShape = rotatePiece(prev.activePiece);
      const rotatedPiece = { ...prev.activePiece, shape: rotatedShape };

      // Wall kick basic implementation
      let offset = 0;
      if (checkCollision(prev.grid, rotatedPiece)) {
        offset = 1;
        if (checkCollision(prev.grid, { ...rotatedPiece, position: { ...rotatedPiece.position, x: rotatedPiece.position.x + offset } })) {
          offset = -1;
          if (checkCollision(prev.grid, { ...rotatedPiece, position: { ...rotatedPiece.position, x: rotatedPiece.position.x + offset } })) {
            return prev;
          }
        }
      }

      return {
        ...prev,
        activePiece: { ...rotatedPiece, position: { ...rotatedPiece.position, x: rotatedPiece.position.x + offset } },
      };
    });
  }, []);

  const hardDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.activePiece || prev.gameOver || prev.isPaused) return prev;

      let newY = prev.activePiece.position.y;
      while (!checkCollision(prev.grid, { ...prev.activePiece, position: { ...prev.activePiece.position, y: newY + 1 } })) {
        newY++;
      }

      const lockedPiece = { ...prev.activePiece, position: { ...prev.activePiece.position, y: newY } };
      
      // We need to lock it immediately
      const newGrid = prev.grid.map(row => [...row]);
      const { shape, position, color } = lockedPiece;
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x] !== 0) {
            const gy = position.y + y;
            const gx = position.x + x;
            if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
              newGrid[gy][gx] = color;
            }
          }
        }
      }

      const gridAfterClear = clearLines(newGrid);
      
      return {
        ...prev,
        grid: gridAfterClear,
        activePiece: null,
      };
    });
    spawnPiece();
  }, [spawnPiece, clearLines]);

  // AI Logic
  const aiActionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (gameState.mode === 'auto' && gameState.activePiece && !gameState.gameOver && !gameState.isPaused) {
      if (aiActionTimeoutRef.current) clearTimeout(aiActionTimeoutRef.current);

      const bestMove = getBestMove(gameState.grid, gameState.activePiece, gameState.nextPiece);
      if (!bestMove) return;

      if (gameState.aiSpeed === 10) {
        // Instant mode
        for (let i = 0; i < bestMove.rotation; i++) rotate();
        const diff = bestMove.x - gameState.activePiece.position.x;
        if (diff !== 0) {
          const step = diff > 0 ? 1 : -1;
          for (let i = 0; i < Math.abs(diff); i++) movePiece(step, 0);
        }
        hardDrop();
      } else {
        // Animated mode
        const executeStep = (stepIndex: number) => {
          if (gameState.gameOver || gameState.isPaused || gameState.mode !== 'auto') return;

          const currentRotation = stepIndex < bestMove.rotation;
          if (currentRotation) {
            rotate();
            aiActionTimeoutRef.current = window.setTimeout(() => executeStep(stepIndex + 1), (11 - gameState.aiSpeed) * 50);
            return;
          }

          const currentX = gameState.activePiece?.position.x ?? 0;
          const diff = bestMove.x - currentX;
          if (diff !== 0) {
            movePiece(diff > 0 ? 1 : -1, 0);
            aiActionTimeoutRef.current = window.setTimeout(() => executeStep(stepIndex + 1), (11 - gameState.aiSpeed) * 50);
            return;
          }

          // Final drop
          hardDrop();
        };

        aiActionTimeoutRef.current = window.setTimeout(() => executeStep(0), (11 - gameState.aiSpeed) * 50);
      }
    }

    return () => {
      if (aiActionTimeoutRef.current) clearTimeout(aiActionTimeoutRef.current);
    };
  }, [gameState.mode, gameState.activePiece?.type, gameState.gameOver, gameState.isPaused, gameState.aiSpeed]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState.mode === 'auto') return;
    
    const key = e.key.toLowerCase();
    
    switch (key) {
      case 'arrowleft': movePiece(-1, 0); break;
      case 'arrowright': movePiece(1, 0); break;
      case 'arrowdown': movePiece(0, 1); break;
      case 'arrowup': rotate(); break;
      case ' ': hardDrop(); break;
      case 'p': setGameState(prev => ({ ...prev, isPaused: !prev.isPaused })); break;
      // Combat Skills
      case 'q': handleCombatAction('q'); break;
      case 'w': handleCombatAction('w'); break;
      case 'e': handleCombatAction('e'); break;
      case 'r': handleCombatAction('r'); break;
      case 'a': handleCombatAction('attack'); break;
    }
  }, [movePiece, rotate, hardDrop, gameState.mode, handleCombatAction]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const gameLoop = useCallback((time: number) => {
    if (!gameState.isPaused && !gameState.gameOver) {
      const deltaTime = time - lastDropTimeRef.current;
      if (deltaTime > dropSpeedRef.current) {
        movePiece(0, 1);
        lastDropTimeRef.current = time;
      }
    }
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isPaused, gameState.gameOver, movePiece]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameLoop]);

  const startGame = (mode: 'manual' | 'auto') => {
    setGameState(prev => ({
      grid: createEmptyGrid(),
      activePiece: null,
      nextPiece: getRandomTetromino(),
      score: 0,
      lines: 0,
      level: 1,
      gameOver: false,
      isPaused: false,
      mode,
      aiSpeed: prev.aiSpeed,
      autoPlayCount: mode === 'auto' ? autoPlaySetting : 1,
      startTime: Date.now(),
      endTime: null,
    }));
    dropSpeedRef.current = INITIAL_DROP_SPEED;
    spawnPiece();
  };

  // Handle Game Over and Leaderboard
  const leaderboardProcessedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!gameState.gameOver) {
      leaderboardProcessedRef.current = false;
      return;
    }

    if (gameState.gameOver && gameState.startTime && gameState.endTime && !leaderboardProcessedRef.current) {
      leaderboardProcessedRef.current = true;
      const duration = Math.floor((gameState.endTime - gameState.startTime) / 1000);
      
      setLeaderboard(prev => {
        const sorted = [...prev].sort((a, b) => b.score - a.score);
        const rankAtTime = sorted.findIndex(e => e.score < gameState.score) + 1 || sorted.length + 1;

        if (rankAtTime <= 10) {
          if (gameState.mode === 'auto') {
            const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
            const newEntry: LeaderboardEntry = {
              id: Math.random().toString(36).substr(2, 9),
              name: randomName,
              score: gameState.score,
              lines: gameState.lines,
              level: gameState.level,
              duration,
              timestamp: Date.now(),
              mode: 'auto',
              rankAtTime,
              type: 'tetris',
            };
            const updated = [...prev, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
            localStorage.setItem('tetris-leaderboard', JSON.stringify(updated));
            
            // Check for auto-restart
            if (gameState.autoPlayCount === -1 || gameState.autoPlayCount > 1) {
              setTimeout(() => {
                setGameState(current => ({
                  ...current,
                  grid: createEmptyGrid(),
                  activePiece: null,
                  nextPiece: getRandomTetromino(),
                  score: 0,
                  lines: 0,
                  level: 1,
                  gameOver: false,
                  isPaused: false,
                  autoPlayCount: current.autoPlayCount === -1 ? -1 : current.autoPlayCount - 1,
                  startTime: Date.now(),
                  endTime: null,
                }));
                dropSpeedRef.current = INITIAL_DROP_SPEED;
                spawnPiece();
              }, 1500); // Short delay before restart
            }
            
            return updated;
          } else {
            setPendingEntry({
              score: gameState.score,
              lines: gameState.lines,
              level: gameState.level,
              duration,
              mode: 'manual',
              rankAtTime,
            });
            setShowNameInput(true);
          }
        } else if (gameState.mode === 'auto' && (gameState.autoPlayCount === -1 || gameState.autoPlayCount > 1)) {
          // No record but still auto-restarting
          setTimeout(() => {
            setGameState(current => ({
              ...current,
              grid: createEmptyGrid(),
              activePiece: null,
              nextPiece: getRandomTetromino(),
              score: 0,
              lines: 0,
              level: 1,
              gameOver: false,
              isPaused: false,
              autoPlayCount: current.autoPlayCount === -1 ? -1 : current.autoPlayCount - 1,
              startTime: Date.now(),
              endTime: null,
            }));
            dropSpeedRef.current = INITIAL_DROP_SPEED;
            spawnPiece();
          }, 1500);
        }
        return prev;
      });
    }
  }, [gameState.gameOver, gameState.score, gameState.lines, gameState.level, gameState.startTime, gameState.endTime, gameState.mode, gameState.autoPlayCount]);

  const submitScore = () => {
    if (!playerName.trim() || !pendingEntry) return;

            const newEntry: LeaderboardEntry = {
              id: Math.random().toString(36).substr(2, 9),
              name: playerName.trim(),
              score: pendingEntry.score!,
              lines: pendingEntry.lines!,
              level: pendingEntry.level!,
              duration: pendingEntry.duration!,
              timestamp: Date.now(),
              mode: 'manual',
              rankAtTime: pendingEntry.rankAtTime!,
              type: 'tetris',
            };

    setLeaderboard(prev => {
      const updated = [...prev, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
      localStorage.setItem('tetris-leaderboard', JSON.stringify(updated));
      return updated;
    });
    
    setShowNameInput(false);
    setPlayerName('');
    setPendingEntry(null);
  };

  const stopGame = () => {
    setGameState(prev => ({
      ...prev,
      gameOver: true,
      endTime: Date.now()
    }));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[300px_1fr_400px] gap-8 items-start max-w-[1600px] w-full mx-auto">
        
        {/* Left Panel: Stats & Next Piece */}
        <div className="flex flex-col gap-6 w-full order-2 xl:order-1">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-4">Next Piece</h3>
            <div className="h-24 flex items-center justify-center">
              <div className="grid grid-cols-4 gap-1">
                {gameState.nextPiece.shape.map((row, y) => 
                  row.map((cell, x) => (
                    <div 
                      key={`${y}-${x}`} 
                      className={`w-5 h-5 rounded-sm transition-all duration-300 ${cell ? 'shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'opacity-0'}`}
                      style={{ backgroundColor: cell ? gameState.nextPiece.color : 'transparent' }}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-1">AI Speed</div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={gameState.aiSpeed} 
                onChange={(e) => setGameState(prev => ({ ...prev, aiSpeed: parseInt(e.target.value) }))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-bold text-white/20 mt-2 uppercase tracking-widest">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>
            {(!gameState.startTime || gameState.gameOver) && (
              <div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-1">Auto Runs</div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min="1"
                    max="100"
                    value={autoPlaySetting} 
                    onChange={(e) => setAutoPlaySetting(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-center font-bold text-sm focus:outline-none focus:border-cyan-500/50"
                  />
                  <span className="text-[10px] text-white/30 uppercase font-black whitespace-nowrap">(Max 100)</span>
                </div>
              </div>
            )}
            {gameState.startTime && !gameState.gameOver && gameState.mode === 'auto' && (
              <div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-1">Remaining</div>
                <div className="text-xl font-black tabular-nums">{gameState.autoPlayCount === -1 ? '∞' : gameState.autoPlayCount}</div>
              </div>
            )}
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-1">Score</div>
              <div className="text-3xl font-black tabular-nums tracking-tighter">{gameState.score.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-1">Lines</div>
              <div className="text-3xl font-black tabular-nums tracking-tighter">{gameState.lines}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {(!gameState.startTime || gameState.gameOver) ? (
              <>
                <button 
                  onClick={() => startGame('manual')}
                  className="group relative flex items-center justify-center gap-2 bg-white text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-cyan-400 transition-all active:scale-95"
                >
                  <User size={18} /> Play Manual
                </button>
                <button 
                  onClick={() => startGame('auto')}
                  className="flex items-center justify-center gap-2 bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest py-4 rounded-xl hover:bg-white/20 transition-all active:scale-95"
                >
                  <Cpu size={18} /> Auto AI
                </button>
              </>
            ) : (
              <button 
                onClick={stopGame}
                className="flex items-center justify-center gap-2 bg-red-500/20 border border-red-500/50 text-red-400 font-black uppercase tracking-widest py-4 rounded-xl hover:bg-red-500/30 transition-all active:scale-95"
              >
                <RotateCcw size={18} /> Stop {gameState.mode === 'auto' ? 'Auto' : 'Game'}
              </button>
            )}
          </div>
        </div>

        {/* Center: Game Board */}
        <div className="relative order-1 xl:order-2 mx-auto">
          <div className="bg-black border-[4px] border-white/10 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div 
              className="grid gap-[1px] bg-white/5" 
              style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
            >
              {gameState.grid.map((row, y) => 
                row.map((cell, x) => {
                  let color = cell;
                  let isActive = false;
                  
                  if (gameState.activePiece) {
                    const { shape, position, color: pColor } = gameState.activePiece;
                    const py = y - position.y;
                    const px = x - position.x;
                    if (py >= 0 && py < shape.length && px >= 0 && px < shape[py].length && shape[py][px]) {
                      color = pColor;
                      isActive = true;
                    }
                  }

                  return (
                    <div 
                      key={`${y}-${x}`} 
                      className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-100 ${isActive ? 'shadow-[inset_0_0_8px_rgba(255,255,255,0.5)]' : ''}`}
                      style={{ 
                        backgroundColor: color || 'transparent',
                        opacity: color ? 1 : 0.1,
                        border: color ? '1px solid rgba(255,255,255,0.1)' : 'none'
                      }}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Game Over Overlay */}
          <AnimatePresence>
            {gameState.gameOver && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-xl"
              >
                <Trophy className="text-yellow-400 w-16 h-16 mb-4" />
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Game Over</h2>
                <p className="text-white/60 mb-8">Final Score: <span className="text-white font-bold">{gameState.score.toLocaleString()}</span></p>
                
                {showNameInput ? (
                  <div className="w-full space-y-4">
                    <p className="text-cyan-400 font-bold uppercase tracking-widest text-xs">New Elite Record!</p>
                    <input 
                      type="text" 
                      placeholder="Enter Name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-center text-xl font-bold focus:outline-none focus:border-cyan-500 transition-all"
                      autoFocus
                    />
                    <button 
                      onClick={submitScore}
                      className="w-full bg-cyan-500 text-black font-black uppercase py-3 rounded-lg hover:bg-cyan-400 transition-all"
                    >
                      Submit Record
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => startGame(gameState.mode)}
                    className="flex items-center gap-2 bg-white text-black font-black uppercase px-8 py-3 rounded-lg hover:bg-cyan-400 transition-all"
                  >
                    <RotateCcw size={18} /> Try Again
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pause Overlay */}
          <AnimatePresence>
            {gameState.isPaused && !gameState.gameOver && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl"
              >
                <Pause className="text-white w-16 h-16 mb-4" />
                <h2 className="text-2xl font-black uppercase tracking-widest">Paused</h2>
                <button 
                  onClick={() => setGameState(prev => ({ ...prev, isPaused: false }))}
                  className="mt-6 bg-white text-black font-black uppercase px-8 py-3 rounded-lg"
                >
                  Resume
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel: RPG */}
        <div className="w-full order-3">
          <RPGPanel 
            rpgState={rpgState} 
            setRpgState={setRpgState} 
            onCombatAction={handleCombatAction} 
          />
          
          <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-4">Controls</h3>
            <div className="grid grid-cols-1 gap-4 text-xs font-bold text-white/60">
              <div className="flex justify-between border-b border-white/5 pb-2"><span>Move</span> <span>Arrows</span></div>
              <div className="flex justify-between border-b border-white/5 pb-2"><span>Rotate</span> <span>Up Arrow</span></div>
              <div className="flex justify-between border-b border-white/5 pb-2"><span>Hard Drop</span> <span>Space</span></div>
              <div className="flex justify-between border-b border-white/5 pb-2"><span>Pause</span> <span>P</span></div>
              <div className="flex justify-between border-b border-white/5 pb-2 text-cyan-400"><span>Attack</span> <span>A</span></div>
              <div className="flex justify-between border-b border-white/5 pb-2 text-cyan-400"><span>Skills</span> <span>Q, W, E, R</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tetris;
