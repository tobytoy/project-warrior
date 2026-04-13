"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, RotateCcw, ArrowLeft, Trophy, Keyboard, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon } from "lucide-react";
import { useTetris } from "./useTetris";
import { COLS, ROWS } from "./constants";
import Link from "next/link";

export const TetrisGame = () => {
  const { grid, activePiece, score, gameOver, move, resetGame } = useTetris();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameOver) return;
      switch (e.key) {
        case "ArrowLeft":
          move("left");
          break;
        case "ArrowRight":
          move("right");
          break;
        case "ArrowDown":
          move("down");
          break;
        case "ArrowUp":
          move("rotate");
          break;
        case " ":
          // Hard drop could be implemented here
          break;
      }
    },
    [gameOver, move]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const renderGrid = () => {
    const displayGrid = grid.map((row) => [...row]);

    // Draw active piece
    if (activePiece) {
      activePiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const gy = activePiece.pos.y + y;
            const gx = activePiece.pos.x + x;
            if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
              displayGrid[gy][gx] = activePiece.color;
            }
          }
        });
      });
    }

    return displayGrid.map((row, y) =>
      row.map((cell, x) => (
        <div
          key={`${y}-${x}`}
          className="w-full h-full border border-white/5 rounded-sm transition-all duration-100"
          style={{
            backgroundColor: cell || "transparent",
            boxShadow: cell ? `0 0 10px ${cell}` : "none",
            opacity: cell ? 1 : 0.2,
          }}
        />
      ))
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 items-start justify-center py-12 px-4 max-w-6xl mx-auto min-h-[800px]">
      {/* Sidebar: Left */}
      <div className="flex flex-col gap-8 w-full lg:w-64 order-2 lg:order-1">
        <div className="glass border border-white/10 p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-3 text-cyan-400">
            <Trophy size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Scoreboard</span>
          </div>
          <div className="text-4xl font-black text-white tabular-nums tracking-tighter">
            {score.toLocaleString()}
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (score / 5000) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-stone-500 uppercase font-bold">Progress to next Evolution</p>
        </div>

        <div className="glass border border-white/10 p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-3 text-purple-400">
            <Keyboard size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Controls</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
             <ControlKey label="Rotate" icon={<RotateCcw size={12} />} keyLabel="↑" />
             <ControlKey label="Move Left" icon={<ArrowLeftIcon size={12} />} keyLabel="←" />
             <ControlKey label="Move Right" icon={<ArrowRightIcon size={12} />} keyLabel="→" />
             <ControlKey label="Drop Faster" icon={<ArrowDown size={12} />} keyLabel="↓" />
          </div>
        </div>
      </div>

      {/* Main Board */}
      <div className="relative order-1 lg:order-2 flex flex-col items-center">
        <div 
          className="bg-black/80 border-[8px] border-white/10 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.1)] relative"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 30px)`,
            gridTemplateRows: `repeat(${ROWS}, 30px)`,
          }}
        >
          {renderGrid()}

          <AnimatePresence>
            {gameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Trophy className="text-yellow-400 w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                </motion.div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">Game Over</h2>
                <p className="text-stone-400 text-sm mb-8 uppercase tracking-widest font-bold">
                  Final Score: <span className="text-white">{score}</span>
                </p>
                <button
                  onClick={resetGame}
                  className="bg-white text-black font-black uppercase px-8 py-3 rounded-xl hover:bg-cyan-400 transition-all active:scale-95 flex items-center gap-2"
                >
                  <RotateCcw size={18} />
                  Retry Mission
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Controls (Quick Hack) */}
        <div className="mt-8 flex lg:hidden gap-4">
           <button onClick={() => move("left")} className="w-12 h-12 glass rounded-xl flex items-center justify-center text-white"><ArrowLeftIcon /></button>
           <button onClick={() => move("rotate")} className="w-12 h-12 glass rounded-xl flex items-center justify-center text-white"><RotateCcw /></button>
           <button onClick={() => move("right")} className="w-12 h-12 glass rounded-xl flex items-center justify-center text-white"><ArrowRightIcon /></button>
           <button onClick={() => move("down")} className="w-12 h-12 glass rounded-xl flex items-center justify-center text-white"><ArrowDown /></button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 blur-[160px] rounded-full pointer-events-none z-[-1]" />
    </div>
  );
};

const ControlKey = ({ label, icon, keyLabel }: { label: string; icon: React.ReactNode; keyLabel: string }) => (
  <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all group">
    <div className="flex items-center gap-3">
      <div className="text-stone-500 group-hover:text-white transition-colors">{icon}</div>
      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-[10px] font-black text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded border border-cyan-400/20">{keyLabel}</span>
  </div>
);
