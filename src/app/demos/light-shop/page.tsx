"use client";

import React from "react";
import { RotateCcw, ExternalLink, Coffee } from "lucide-react";

export default function LightShopPage() {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const reloadGame = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4 animate-fade-in relative z-10 w-full overflow-hidden">
      
      {/* 
        Container for the app. 
      */}
      <div className="w-full max-w-[1200px] flex flex-col gap-6">
        
        {/* Minimalist Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                 <Coffee size={20} />
              </div>
              <div>
                 <h1 className="text-white text-lg font-black tracking-tighter uppercase italic leading-none">L'ÉLÉGANCE CAFÉ</h1>
                 <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Luxury Commerce
                 </p>
              </div>
           </div>

           <div className="flex items-center gap-3">
              <button 
                onClick={reloadGame}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-lg text-[10px] font-bold text-stone-400 hover:text-white uppercase tracking-widest transition-colors"
              >
                <RotateCcw size={14} /> Refresh
              </button>
              <div className="w-px h-4 bg-white/10" />
              <a 
                href="/studio/light-shop/index.html" 
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-[10px] font-bold text-amber-400 uppercase tracking-widest transition-colors"
                title="Open Shop in Full View"
              >
                <ExternalLink size={14} /> Detach
              </a>
           </div>
        </div>

        {/* Shop Viewport */}
        <div className="relative w-full aspect-video max-h-[85vh] bg-[#050508] rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(245,158,11,0.05)] overflow-hidden">
           <iframe 
             ref={iframeRef}
             src="/studio/light-shop/index.html" 
             className="w-full h-full border-none pointer-events-auto"
             title="L'ÉLÉGANCE CAFÉ"
           />
        </div>

      </div>

    </div>
  );
}
