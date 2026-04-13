"use client";

import React, { useState } from "react";
import { useApiKey } from "@/context/ApiKeyContext";
import { motion, AnimatePresence } from "motion/react";
import { Key, AlertTriangle, X, Play } from "lucide-react";

export const ApiKeyModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { setApiKey } = useApiKey();
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setApiKey(inputValue.trim());
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md glass border border-cyan-500/30 rounded-2xl p-8 overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/50 rounded-xl flex items-center justify-center text-cyan-400">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">API Key Required</h3>
                  <p className="text-xs text-stone-500 uppercase tracking-widest mt-0.5">Activation Module</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-stone-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Warning Text */}
            <div className="mb-8 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-yellow-500 shrink-0" size={18} />
              <p className="text-sm text-stone-300 leading-relaxed">
                To run these demos, you <span className="text-white font-medium">must</span> provide your own <span className="text-white font-medium">Google Gemini API Key</span>. 
                External environment variables are disabled for security.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="relative space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.2em] ml-1">
                  Gemini API Key
                </label>
                <input
                  autoFocus
                  type="password"
                  placeholder="Paste your API key here..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all text-white font-mono placeholder:text-stone-600"
                />
              </div>

              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="w-full flex items-center justify-center gap-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black py-4 rounded-xl font-black shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
              >
                <Play size={18} fill="currentColor" />
                <span>ACTIVATE DEMO</span>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-stone-500 hover:text-cyan-400 uppercase tracking-widest transition-colors underline underline-offset-4"
              >
                Get a free key from Google AI Studio
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
