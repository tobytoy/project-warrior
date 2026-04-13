"use client";

import React, { useEffect, useRef } from "react";
import { FileText, ArrowLeft, Maximize2, Sparkles, Terminal } from "lucide-react";
import Link from "next/link";
import { useApiKey } from "@/context/ApiKeyContext";
import { motion } from "motion/react";

export default function MarkdownPdfStudioPage() {
  const { apiKey } = useApiKey();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync API Key to iframe
  useEffect(() => {
    const syncKey = () => {
      if (iframeRef.current && apiKey) {
        iframeRef.current.contentWindow?.postMessage(
          { type: 'SET_API_KEY', apiKey }, 
          '*'
        );
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'REQUEST_API_KEY') {
        syncKey();
      }
    };

    window.addEventListener('message', handleMessage);
    // Also try syncing when apiKey changes
    syncKey();

    return () => window.removeEventListener('message', handleMessage);
  }, [apiKey]);

  return (
    <div className="flex flex-col min-h-screen bg-[#050508] text-white">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 px-8 h-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2 text-stone-500 hover:text-cyan-400 transition-all text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-3">
             <FileText size={16} className="text-orange-400" />
             <h1 className="text-xs font-black uppercase tracking-[0.2em] italic">Markdown PDF Studio</h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${apiKey ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest leading-none">
              {apiKey ? 'AI Module Linked' : 'AI Offline (No Key)'}
            </span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <a 
            href="/studio/markdown-pdf-studio/index.html" 
            target="_blank" 
            className="text-stone-500 hover:text-white transition-colors"
            title="Open Fullscreen"
          >
            <Maximize2 size={14} />
          </a>
        </div>
      </header>

      {/* Workspace Container */}
      <main className="flex-1 flex flex-col p-4 md:p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        
        {/* Subtle Decorative elements */}
        <div className="flex items-center justify-between mb-4 px-2">
           <div className="flex items-center gap-2">
              <Terminal size={12} className="text-stone-600" />
              <span className="text-[9px] text-stone-600 font-mono tracking-widest uppercase">system_boot: initialized</span>
           </div>
           <div className="flex items-center gap-4 text-[9px] text-stone-600 font-mono tracking-widest uppercase">
              <span>mode: pwa_optimized</span>
              <span>target: a4_standard</span>
           </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 glass border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative z-10"
        >
          <iframe 
            ref={iframeRef}
            src="/studio/markdown-pdf-studio/index.html" 
            className="w-full h-full border-none"
            title="Markdown PDF Studio"
            onLoad={() => {
              if (apiKey) {
                iframeRef.current?.contentWindow?.postMessage({ type: 'SET_API_KEY', apiKey }, '*');
              }
            }}
          />
        </motion.div>
        
        {/* Footer Info */}
        <div className="mt-6 flex items-center justify-center gap-4">
           <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full">
              <Sparkles size={10} className="text-cyan-400" />
              <span className="text-[8px] text-stone-400 font-bold uppercase tracking-widest">Driven by Gemini 1.5 Flash</span>
           </div>
        </div>
      </main>
    </div>
  );
}
