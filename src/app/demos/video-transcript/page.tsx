"use client";

import React from "react";
import { VideoTranscript } from "@/components/VideoTranscript";
import Link from "next/link";
import { ArrowLeft, Video } from "lucide-react";
import { motion } from "motion/react";

export default function VideoTranscriptDemo() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-stone-500 hover:text-cyan-400 transition-colors mb-12 uppercase tracking-widest text-[10px] font-bold"
        >
          <ArrowLeft size={14} /> Back to Hub
        </Link>

        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-lg opacity-40" />
              <div className="relative w-12 h-12 bg-black border border-purple-500/50 rounded-xl flex items-center justify-center text-purple-400">
                <Video size={28} />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-white">
                VIDEO <span className="text-purple-400">TRANSCRIPT</span>
              </h1>
              <p className="text-stone-500 text-[10px] uppercase tracking-[0.3em] mt-1">
                YouTube/Facebook Video Analysis Engine
              </p>
            </div>
          </div>
        </motion.header>

        <VideoTranscript />
      </div>
    </div>
  );
}
