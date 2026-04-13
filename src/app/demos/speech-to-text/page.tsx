"use client";

/**
 * AI 語音轉文字助手 - Integrated into WarriorHub
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { 
  Mic, 
  Square, 
  Upload, 
  FileText, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Cpu,
  Zap,
  Activity,
  Terminal,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApiKey } from "@/context/ApiKeyContext";
import Link from 'next/link';

// --- Types ---
interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

// --- Utilities ---
const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
};

const convertToSRT = (segments: TranscriptionSegment[]): string => {
  return segments.map((s, i) => {
    const start = formatTime(s.start).replace('.', ',');
    const end = formatTime(s.end).replace('.', ',');
    return `${i + 1}\n${start} --> ${end}\n${s.text}\n`;
  }).join('\n');
};

const convertToTXT = (segments: TranscriptionSegment[]): string => {
  return segments.map(s => `[${formatTime(s.start).split('.')[0]}] ${s.text}`).join('\n');
};

export default function SpeechToTextDemo() {
  const { apiKey, isConfigured } = useApiKey();
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        setAudioBlob(blob);
        setFileName('RECORDING_VOICE_DATA.mp3');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('ACCESS_DENIED: Microphone permission required.');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/') || file.name.endsWith('.mp3')) {
        setAudioBlob(file);
        setFileName(file.name.toUpperCase());
        setSegments([]);
        setError(null);
      } else {
        setError('INVALID_FORMAT: Please upload an audio file (MP3).');
      }
    }
  };

  const processAudio = async () => {
    if (!audioBlob) return;
    
    // Only use the key provided by the user in the UI.
    // We explicitly avoid using .env fallbacks as per the new requirement.
    const effectiveKey = apiKey;

    if (!effectiveKey) {
      setError('MISSING_API_KEY: Please enter your Gemini API Key in Settings.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        const ai = new GoogleGenerativeAI(effectiveKey);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: audioBlob.type || "audio/mp3",
                    data: base64Data,
                  },
                },
                {
                  text: "Transcribe this audio to text with precise timestamps. Output MUST be a JSON array of objects, each with 'start' (number, seconds), 'end' (number, seconds), and 'text' (string). Ensure the language is detected automatically.",
                }
              ],
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  start: { type: SchemaType.NUMBER },
                  end: { type: SchemaType.NUMBER },
                  text: { type: SchemaType.STRING },
                },
                required: ["start", "end", "text"],
              },
            },
          },
        });

        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);
        setSegments(parsed);
        setIsProcessing(false);
      };
    } catch (err) {
      setError('CORE_PROCESS_FAILURE: AI transcription failed.');
      setIsProcessing(false);
      console.error(err);
    }
  };

  const downloadFile = (content: string, ext: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TRANSCRIPT_${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-12 px-4 max-w-5xl mx-auto">
      {/* Breadcrumbs / Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-cyan-400 transition-colors mb-12 uppercase tracking-widest text-[10px] font-bold">
        <ArrowLeft size={14} /> Back to Hub
      </Link>

      {/* Hero */}
      <header className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-40 animate-pulse" />
            <div className="relative w-12 h-12 bg-black border border-cyan-500/50 rounded-xl flex items-center justify-center text-cyan-400">
              <Cpu size={28} />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white">
              AI <span className="text-cyan-400">SPEECH</span> RECORDER
            </h1>
            <p className="text-stone-500 text-[10px] uppercase tracking-[0.3em] mt-1">Multi-format Audio Processing Unit</p>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid gap-8">
        {/* API Warning */}
        {!isConfigured && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
               <AlertCircle className="text-red-500" />
               <p className="text-sm text-stone-300 font-medium tracking-tight">
                 偵測到未配置 API KEY。請在右上角設置中填入您的 Gemini API 密鑰。
               </p>
            </div>
          </motion.div>
        )}

        {/* Input Controls */}
        <section className="glass rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="bg-white/5 px-8 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-stone-500" />
              <span className="text-[10px] text-stone-500 tracking-widest uppercase">Audio_Input_Stream.v3</span>
            </div>
          </div>

          <div className="p-10">
            <div className="grid md:grid-cols-2 gap-10">
              {/* Record Block */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-500" />
                <div className="relative flex flex-col items-center justify-center p-12 bg-black/40 rounded-2xl border border-white/5">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 transition-all duration-500 border-2 ${isRecording ? 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]' : 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400'}`}>
                    {isRecording ? <Activity className="animate-pulse" size={40} /> : <Mic size={40} />}
                  </div>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-full py-4 rounded-xl font-black tracking-[0.2em] transition-all text-xs ${isRecording ? 'bg-red-500 text-white' : 'bg-cyan-500 text-black hover:bg-cyan-400'}`}
                  >
                    {isRecording ? 'TERMINATE_REC' : 'INITIALIZE_REC'}
                  </button>
                </div>
              </div>

              {/* Upload Block */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-500" />
                <div className="relative flex flex-col items-center justify-center p-12 bg-black/40 rounded-2xl border border-white/5 cursor-pointer">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="audio/*"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-24 h-24 rounded-full border-2 border-purple-500/20 bg-purple-500/5 text-purple-400 flex items-center justify-center mb-8 group-hover:border-purple-500 transition-all">
                    <Upload size={40} />
                  </div>
                  <button className="w-full py-4 bg-white/5 text-white rounded-xl font-black tracking-[0.2em] hover:bg-white/10 transition-all border border-white/10 text-xs">
                    IMPORT_DATA
                  </button>
                </div>
              </div>
            </div>

            {fileName && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-12 p-8 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-black border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400">
                    <FileText size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] text-cyan-500/60 uppercase tracking-widest font-black mb-1">Active_Cache</div>
                    <div className="font-bold text-white text-lg truncate max-w-[200px] md:max-w-md uppercase tracking-tight">{fileName}</div>
                  </div>
                </div>
                <button
                  disabled={isProcessing}
                  onClick={processAudio}
                  className="w-full md:w-auto flex items-center justify-center gap-4 px-10 py-5 bg-cyan-500 text-black rounded-xl font-black hover:bg-cyan-400 disabled:opacity-30 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] text-xs tracking-widest"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
                  {isProcessing ? 'SYNCHRONIZING...' : 'EXECUTE_TRANSCRIPTION'}
                </button>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 p-5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl flex items-center gap-4 text-xs font-bold uppercase tracking-wider"
              >
                <AlertCircle size={20} /> {error}
              </motion.div>
            )}
          </div>
        </section>

        {/* Output Section */}
        <AnimatePresence>
          {segments.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl border border-white/5 overflow-hidden shadow-2xl"
            >
              <div className="bg-white/5 px-8 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity size={16} className="text-cyan-400" />
                  <span className="text-[10px] text-stone-500 tracking-widest uppercase font-black">Output_Buffer.json</span>
                </div>
                <div className="flex gap-6">
                  <button
                    onClick={() => downloadFile(convertToTXT(segments), 'txt')}
                    className="text-[10px] text-stone-400 hover:text-cyan-400 font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                  >
                    <Download size={14} /> Export_TXT
                  </button>
                  <button
                    onClick={() => downloadFile(convertToSRT(segments), 'srt')}
                    className="text-[10px] text-stone-400 hover:text-cyan-400 font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                  >
                    <Download size={14} /> Export_SRT
                  </button>
                </div>
              </div>

              <div className="p-10 space-y-8 max-h-[800px] overflow-y-auto custom-scrollbar">
                {segments.map((segment, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group"
                  >
                    <div className="flex items-start gap-8">
                      <div className="flex flex-col items-end pt-1 shrink-0">
                        <span className="text-[11px] font-black text-cyan-500/50 group-hover:text-cyan-400 transition-colors tracking-tighter">
                          {formatTime(segment.start).split('.')[0]}
                        </span>
                        <div className="w-px h-10 bg-gradient-to-b from-cyan-500/20 to-transparent my-1" />
                        <span className="text-[11px] font-black text-purple-500/50 group-hover:text-purple-400 transition-colors tracking-tighter">
                          {formatTime(segment.end).split('.')[0]}
                        </span>
                      </div>
                      <div className="flex-1 p-6 rounded-2xl bg-white/5 border border-white/5 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/5 transition-all duration-500">
                        <p className="text-stone-300 leading-relaxed text-base">{segment.text}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
