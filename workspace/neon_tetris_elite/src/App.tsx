import React, { useState, useEffect } from 'react';
import Tetris from './components/Tetris';
import { Leaderboard } from './components/Leaderboard';
import { Trophy, Gamepad2, Sword, LayoutDashboard, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LeaderboardEntry } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'game' | 'ladder'>('game');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('tetris-leaderboard');
    return saved ? JSON.parse(saved) : [];
  });

  const refreshLeaderboard = () => {
    const saved = localStorage.getItem('tetris-leaderboard');
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
  };

  const handleGameOver = (score: number, level: number) => {
    const duration = 0; // Simplified for now
    const sorted = [...leaderboard].filter(e => e.type === 'tetris').sort((a, b) => b.score - a.score);
    const rankAtTime = sorted.findIndex(e => e.score < score) + 1 || sorted.length + 1;

    if (rankAtTime <= 10) {
      const name = prompt('New Record! Enter your name:') || 'Hero';
      const newEntry: LeaderboardEntry = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        score,
        level,
        duration,
        timestamp: Date.now(),
        rankAtTime,
        type: 'tetris',
      };
      const updated = [...leaderboard, newEntry].sort((a, b) => b.score - a.score);
      setLeaderboard(updated);
      localStorage.setItem('tetris-leaderboard', JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Gamepad2 className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter hidden sm:block">
              Neon <span className="text-cyan-400">Saga</span>
            </h1>
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setCurrentPage('game')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg font-bold uppercase text-[10px] sm:text-xs tracking-widest transition-all ${
                currentPage === 'game'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <Gamepad2 size={16} />
              Play Game
            </button>
            <button
              onClick={() => {
                refreshLeaderboard();
                setCurrentPage('ladder');
              }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg font-bold uppercase text-[10px] sm:text-xs tracking-widest transition-all ${
                currentPage === 'ladder'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy size={16} />
              Ladder
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="pt-24 pb-12 px-4">
        <AnimatePresence mode="wait">
          {currentPage === 'game' ? (
            <motion.div
              key="game"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-[1600px] mx-auto"
            >
              <Tetris onGameOver={handleGameOver} />
            </motion.div>
          ) : (
            <motion.div
              key="ladder"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto flex flex-col items-center"
            >
              <div className="text-center mb-12">
                <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">
                  Global <span className="text-cyan-400">Ladder</span>
                </h2>
                <p className="text-white/40 max-w-md mx-auto font-medium">
                  The elite rankings of the Neon Saga universe. Only the fastest and most strategic players make it here.
                </p>
              </div>
              <Leaderboard entries={leaderboard} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent blur-sm" />
    </div>
  );
}
