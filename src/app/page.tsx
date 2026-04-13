"use client";

import React from "react";
import { motion } from "motion/react";
import { Cpu, Terminal, Sparkles, ChevronRight, Mic, Play, ArrowRight, Gamepad2, Video, Coffee, FileText } from "lucide-react";
import Link from "next/link";

const demos = [
  {
    slug: "speech-to-text",
    title: "AI 語音轉文字助手",
    description: "轉化音頻為結構化文本，支援自動時間戳記與多格式導出。",
    icon: <Mic className="text-cyan-400" />,
    stats: { model: "Gemini 1.5 Flash", latency: "Low" },
    tag: "Audio Intelligence"
  },
  {
    slug: "video-transcript",
    title: "影片摘要與字幕",
    description: "輸入 YouTube 影片網址，快速取得 AI 生成摘要與時間軸字幕。",
    icon: <Video className="text-purple-400" />,
    stats: { model: "Gemini 2.0 Flash", latency: "Medium" },
    tag: "Video Intelligence"
  },
  {
    slug: "neon-tetris-elite",
    title: "Neon Tetris Elite",
    description: "A high-performance Tetris game featuring a dedicated play arena and a global ladder for competitive rankings.",
    icon: <Gamepad2 className="text-pink-400" />,
    stats: { model: "Vite / Static", latency: "Real-time" },
    tag: "Retro Elite"
  },
  {
    slug: "light-shop",
    title: "L'ÉLÉGANCE CAFÉ",
    description: "極致優雅的精品咖啡與茗茶購物平台，為您打造奢華的午后時光。",
    icon: <Coffee className="text-amber-400" />,
    stats: { model: "Vite / Supabase", latency: "Fast" },
    tag: "Luxury Commerce"
  },
  {
    slug: "markdown-pdf-studio",
    title: "Markdown PDF Studio",
    description: "高效率 Markdown 轉 PDF 工具，支援 AI 修辭美化與即時預覽，一鍵生成 A4 專業文件。",
    icon: <FileText className="text-orange-400" />,
    stats: { model: "Vite / Gemini", latency: "Instant" },
    tag: "Document Utility"
  },
];

export default function Home() {
  return (
    <div className="py-20">
      {/* Hero Section */}
      <section className="mb-32 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan-500/5 to-transparent blur-[100px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black tracking-[0.3em] uppercase mb-8">
            <Sparkles size={12} fill="currentColor" />
            Empowering Next-Gen AI Demos
          </div>
          
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6">
            PROJECT <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              WARRIOR
            </span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-lg text-stone-400 leading-relaxed font-medium">
            這是一個華麗的 AI 項目合輯平台。整合了多種尖端模型，
            提供直觀的界面與高效的部署方案，隨時啟動您的 AI 實驗。
          </p>
        </motion.div>
      </section>

      {/* Grid Section */}
      <section>
        <div className="flex items-center justify-between mb-12">
           <div className="flex items-center gap-4">
              <div className="w-1.5 h-12 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
              <div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">Active Collection</h3>
                 <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Found {demos.length} Ready-to-Run Modules</p>
              </div>
           </div>
           <Link href="#" className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-stone-500 hover:text-cyan-400 uppercase tracking-widest transition-all">
             View All Modules <ChevronRight size={14} />
           </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {demos.map((demo, idx) => (
            <motion.div
              key={demo.slug}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-500" />
              <div className="relative glass border border-white/5 p-8 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-500">
                
                {/* Background Decor */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full group-hover:bg-cyan-500/10 transition-colors" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                     <div className="w-14 h-14 bg-black border border-white/10 rounded-xl flex items-center justify-center text-2xl group-hover:border-cyan-500/50 group-hover:bg-cyan-500/5 transition-all duration-500">
                        {demo.icon}
                     </div>
                     <span className="text-[10px] font-bold text-stone-500 tracking-widest uppercase py-1 px-3 border border-white/10 rounded-lg">
                        {demo.tag}
                     </span>
                  </div>

                  <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {demo.title}
                  </h4>
                  <p className="text-stone-400 text-sm leading-relaxed mb-8 line-clamp-2">
                    {demo.description}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                     <div className="flex gap-4">
                        <div>
                           <div className="text-[9px] text-stone-500 uppercase tracking-widest mb-0.5">Model</div>
                           <div className="text-[10px] font-bold text-white uppercase">{demo.stats.model}</div>
                        </div>
                        <div>
                           <div className="text-[9px] text-stone-500 uppercase tracking-widest mb-0.5">Status</div>
                           <div className="text-[10px] font-bold text-green-500/80 uppercase">Operational</div>
                        </div>
                     </div>
                     <Link 
                       href={`/demos/${demo.slug}`}
                       className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 hover:text-black transition-all"
                     >
                       <ArrowRight size={18} />
                     </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Placeholder for "Add Project" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="group relative"
          >
             <div className="relative h-full border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-all group">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-stone-500 group-hover:text-cyan-400 transition-colors">
                   <Sparkles size={24} />
                </div>
                <h4 className="mt-4 text-xs font-black text-stone-500 uppercase tracking-[0.3em]">Import New Demo</h4>
                <p className="mt-1 text-[10px] text-stone-600 uppercase tracking-widest">Drop exported ZIP here</p>
             </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
