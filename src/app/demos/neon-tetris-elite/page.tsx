"use client";

import React from "react";
import { RotateCcw, ExternalLink, Gamepad2 } from "lucide-react";

export default function NeonTetrisElitePage() {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const reloadGame = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4 animate-fade-in relative z-10 w-full overflow-hidden">
      
      {/* 
        Container for the game. 
        Fixed max-width ensures it never stretches too wide.
        Aspect ratio handles the height naturally without absolute positioning tricks.
      */}
      <div className="w-full max-w-[1000px] flex flex-col gap-6">
        
        {/* Minimalist Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                 <Gamepad2 size={20} />
              </div>
              <div>
                 <h1 className="text-white text-lg font-black tracking-tighter uppercase italic leading-none">Neon Tetris</h1>
                 <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> Elite Run
                 </p>
              </div>
           </div>

           <div className="flex items-center gap-3">
              <button 
                onClick={reloadGame}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-lg text-[10px] font-bold text-stone-400 hover:text-white uppercase tracking-widest transition-colors"
              >
                <RotateCcw size={14} /> Restart
              </button>
              <div className="w-px h-4 bg-white/10" />
              <a 
                href="/studio/neon-tetris-elite/index.html" 
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 rounded-lg text-[10px] font-bold text-pink-400 uppercase tracking-widest transition-colors"
                title="Open Game in Full View"
              >
                <ExternalLink size={14} /> Detach
              </a>
           </div>
        </div>

        {/* Stable Game Board */}
        <div className="relative w-full aspect-[4/3] max-h-[85vh] bg-[#050508] rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(236,72,153,0.1)] overflow-hidden">
           <iframe 
             ref={iframeRef}
             src="/studio/neon-tetris-elite/index.html" 
             className="w-full h-full border-none pointer-events-auto"
             title="Neon Tetris Elite"
           />
        </div>

      </div>

    </div>
  );
}
