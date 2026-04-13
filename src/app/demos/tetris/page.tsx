"use client";

import React from "react";
import { TetrisGame } from "./TetrisGame";
import { ArrowLeft, Gamepad2, Play, Trophy } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TetrisDemo() {
  return (
    <div className="py-20 px-8 max-w-7xl mx-auto min-h-screen">
      {/* Breadcrumbs / Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-cyan-400 transition-colors mb-12 uppercase tracking-widest text-[10px] font-bold">
        <ArrowLeft size={14} /> Back to Hub
      </Link>

      {/* Header */}
      <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="relative">
             <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-40 animate-pulse" />
             <div className="relative w-14 h-14 bg-black border border-cyan-500/50 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-500">
               <Gamepad2 size={32} fill="currentColor" />
             </div>
          </div>
          <div>
             <h2 className="text-5xl font-black tracking-tighter text-white italic uppercase">
               WARRIOR <span className="text-cyan-400">TETRIS</span>
             </h2>
             <p className="text-stone-500 text-xs uppercase tracking-[0.4em] mt-2 font-bold">Next-Gen Custom Tetris Engine v1.0</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xl group">
           <div className="flex items-center gap-3 px-4 py-2 text-stone-400 text-[10px] font-black uppercase tracking-widest">
              <Trophy size={14} className="text-yellow-500" />
              <span>Personal Best: <span className="text-white">0</span></span>
           </div>
           <div className="h-8 w-px bg-white/10" />
           <div className="flex items-center gap-3 px-4 py-2 text-stone-400 text-[10px] font-black uppercase tracking-widest">
              <Play size={14} className="text-green-500" />
              <span>Status: <span className="text-green-400">Operational</span></span>
           </div>
        </div>
      </header>

      {/* Game Content */}
      <div className="relative">
         <div className="absolute inset-x-0 -top-12 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
         <TetrisGame />
         <div className="absolute inset-x-0 -bottom-12 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      </div>

      {/* Background Decor Component */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none z-[-1]" />
    </div>
  );
}
