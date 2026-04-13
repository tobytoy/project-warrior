"use client";

import React, { useState, useEffect } from "react";
import { ApiKeyModal } from "./ApiKeyModal";
import { useApiKey } from "@/context/ApiKeyContext";
import { motion } from "motion/react";
import { LayoutGrid, Settings, Key, Zap, Shield, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Shell = ({ children }: { children: React.ReactNode }) => {
  const { isConfigured } = useApiKey();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen selection:bg-cyan-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full animate-pulse-cyan" />
        <div className="absolute bottom-[-5%] left-[5%] w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 z-[100] border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-full px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
             <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 group-hover:opacity-40 transition-all" />
                <div className="relative w-10 h-10 bg-black border border-cyan-500/50 rounded-xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-500">
                  <Zap size={22} fill="currentColor" />
                </div>
             </div>
             <div>
                <h1 className="text-xl font-black tracking-tighter text-white">
                  WARRIOR<span className="text-cyan-400">HUB</span>
                  <span className="text-[10px] font-normal bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 tracking-widest ml-2 uppercase">v1.2</span>
                </h1>
                <p className="text-[9px] text-stone-500 uppercase tracking-widest mt-0.5">Project Demo Collection</p>
             </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className={`text-xs uppercase tracking-[0.2em] font-bold py-2 transition-all ${pathname === '/' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-stone-400 hover:text-white'}`}
            >
              Collection
            </Link>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-stone-400 hover:text-white transition-all py-2"
            >
              Settings
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-widest uppercase transition-all duration-500 ${isConfigured ? 'bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
               <Shield size={12} fill={isConfigured ? 'currentColor' : 'transparent'} />
               {isConfigured ? 'Active' : 'Missing Key'}
            </div>
            {!isConfigured && (
               <button 
                 onClick={() => setIsModalOpen(true)}
                 className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-full border border-white/10 transition-all group"
               >
                 <Key size={14} className="group-hover:rotate-12 transition-transform" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Setup</span>
               </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-20">
        {pathname.includes('/demos/neon') ? (
          // Full-screen mode: let the game own its layout
          <div className="min-h-[calc(100vh-80px)]">
            {children}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-8 min-h-screen">
            {children}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-6">
              <div className="text-[10px] text-stone-600 tracking-widest uppercase">
                 System_Core: <span className="text-stone-400">Next.js 15.0</span>
              </div>
              <div className="text-[10px] text-stone-600 tracking-widest uppercase">
                 Interface: <span className="text-stone-400">Fancy_Shell_v3</span>
              </div>
           </div>
           <div className="flex gap-4">
             <div className="w-2 h-2 rounded-full bg-green-500/40 animate-pulse" />
             <span className="text-[10px] text-stone-500 uppercase tracking-widest">Neural Link Synchronized</span>
           </div>
        </div>
      </footer>

      <ApiKeyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
