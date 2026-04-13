import React, { useState } from 'react';
import { LeaderboardEntry, LeaderboardType } from '../types';
import { Trophy, Clock, Target, Calendar, Gamepad2, Sword } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries }) => {
  const [activeType, setActiveType] = useState<LeaderboardType>('adventure');

  const filteredEntries = entries
    .filter(e => e.type === activeType)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 w-full max-w-3xl overflow-hidden shadow-2xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/10">
            <Trophy className="text-yellow-400 w-7 h-7" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Elite Ladder</h2>
        </div>

        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveType('adventure')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
              activeType === 'adventure'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sword size={14} />
            Adventure
          </button>
          <button
            onClick={() => setActiveType('tetris')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
              activeType === 'tetris'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gamepad2 size={14} />
            Tetris
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {filteredEntries.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-white/20 text-center py-20 italic font-medium flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 opacity-20" />
              </div>
              No records yet. Be the first to claim glory!
            </motion.div>
          ) : (
            <motion.div 
              key={activeType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] cursor-default ${
                    index === 0 
                      ? 'bg-yellow-500/10 border-yellow-500/30 shadow-lg shadow-yellow-500/5' 
                      : index === 1 
                      ? 'bg-gray-400/10 border-gray-400/30'
                      : index === 2
                      ? 'bg-orange-500/10 border-orange-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <span className={`text-2xl font-black w-8 text-center ${
                      index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-white/20'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-black text-xl tracking-tight">{entry.name}</span>
                        {entry.mode && (
                          <span className={`text-[9px] px-2 py-0.5 rounded-lg uppercase font-black tracking-widest ${
                            entry.mode === 'auto' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}>
                            {entry.mode}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        {entry.lines !== undefined && (
                          <span className="flex items-center gap-1.5"><Target size={12} className="text-cyan-500/50" /> {entry.lines} lines</span>
                        )}
                        <span className="flex items-center gap-1.5"><Trophy size={12} className="text-yellow-500/50" /> Level {entry.level}</span>
                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-purple-500/50" /> {Math.floor(entry.duration / 60)}:{(entry.duration % 60).toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-white tabular-nums tracking-tighter">{entry.score.toLocaleString()}</div>
                    <div className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black mt-1">Points</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
