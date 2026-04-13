"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Video, Link2, Loader2, AlertCircle, CheckCircle2, 
  Copy, Download, ChevronDown, ChevronUp, Sparkles, 
  FileText, Clock, Volume2
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useApiKey } from "@/context/ApiKeyContext";
import TranscriptClient from "youtube-transcript-api";

interface TranscriptSegment {
  start: number;
  duration: number;
  text: string;
}

interface VideoInfo {
  platform: "youtube" | "facebook" | "unknown";
  videoId: string;
  url: string;
  title?: string;
}

export const VideoTranscript = () => {
  const { apiKey, isConfigured } = useApiKey();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const [transcriptExpanded, setTranscriptExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const [transcriptMode, setTranscriptMode] = useState<"cc" | "stt">("cc");

  const parseVideoUrl = (inputUrl: string): VideoInfo | null => {
    const youtubePatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    ];
    
    const facebookPatterns = [
      /facebook\.com\/.*\/videos\/(\d+)/,
      /fb\.watch\/([a-zA-Z0-9]+)/,
    ];

    for (const pattern of youtubePatterns) {
      const match = inputUrl.match(pattern);
      if (match) {
        return {
          platform: "youtube",
          videoId: match[1],
          url: inputUrl,
        };
      }
    }

    for (const pattern of facebookPatterns) {
      const match = inputUrl.match(pattern);
      if (match) {
        return {
          platform: "facebook",
          videoId: match[1],
          url: inputUrl,
        };
      }
    }

    return null;
  };

  const fetchYouTubeTranscript = async (videoId: string): Promise<TranscriptSegment[]> => {
    const client = new TranscriptClient();
    await client.ready;
    
    const result = await client.getTranscript(videoId);
    
    if (!result.tracks || result.tracks.length === 0) {
      throw new Error("無法獲取字幕 - 此影片可能沒有可用字幕");
    }
    
    const transcript = result.tracks[0].transcript;
    
    return transcript.map((item: any) => ({
      start: parseFloat(item.start),
      duration: parseFloat(item.dur),
      text: item.text,
    }));
  };

  const generateSummary = async (transcriptText: string, language: "zh" | "en"): Promise<string> => {
    const effectiveKey = apiKey;
    if (!effectiveKey) {
      throw new Error("請先設定 Gemini API Key");
    }

    const ai = new GoogleGenerativeAI(effectiveKey);
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = language === "zh"
      ? `請根據以下影片字幕，生成一段簡潔的內容摘要（200字以內），包含主要主題、關鍵論點和重要資訊。\n\n字幕內容：\n${transcriptText}`
      : `Please generate a concise summary (within 200 words) of the video content based on the following transcript. Include main topics, key points, and important information.\n\nTranscript:\n${transcriptText}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  };

  const detectLanguage = (text: string): "zh" | "en" => {
    const chineseCharCount = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const totalCharCount = text.replace(/\s/g, "").length;
    return chineseCharCount / totalCharCount > 0.3 ? "zh" : "en";
  };

  const processVideo = async () => {
    setLoading(true);
    setError(null);
    setTranscript([]);
    setSummary(null);
    setVideoInfo(null);

    try {
      const info = parseVideoUrl(url);
      if (!info) {
        throw new Error("無法識別影片網址，請確認是 YouTube 或 Facebook 影片連結");
      }

      setVideoInfo(info);

      if (info.platform === "facebook") {
        throw new Error("Facebook 影片暫不支援，建議使用 YouTube 影片");
      }

      let segments: TranscriptSegment[];
      try {
        segments = await fetchYouTubeTranscript(info.videoId);
        setTranscriptMode("cc");
      } catch (err) {
        setTranscriptMode("stt");
        throw new Error("此影片沒有字幕，將使用語音辨識（敬請期待功能）");
      }

      setTranscript(segments);

      const fullText = segments.map(s => s.text).join(" ");
      const lang = detectLanguage(fullText);
      
      try {
        const summaryText = await generateSummary(fullText, lang);
        setSummary(summaryText);
      } catch (summaryErr) {
        console.warn("生成摘要失敗:", summaryErr);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "處理失敗");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const copyTranscript = () => {
    const text = transcript.map(s => `[${formatTime(s.start)}] ${s.text}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTranscript = () => {
    const text = transcript.map(s => `[${formatTime(s.start)}] ${s.text}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${videoInfo?.videoId || "video"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black tracking-[0.3em] uppercase mb-6">
          <Video size={12} fill="currentColor" />
          Video Intelligence
        </div>
        <h2 className="text-4xl font-black tracking-tight text-white mb-4">
          影片摘要與字幕
        </h2>
        <p className="text-stone-400 max-w-xl mx-auto">
          輸入 YouTube 影片網址，快速取得內容摘要與時間軸字幕
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass border border-white/10 rounded-2xl p-6 mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Link2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="貼上 YouTube 影片網址..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-stone-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
              onKeyDown={(e) => e.key === "Enter" && processVideo()}
            />
          </div>
          <button
            onClick={processVideo}
            disabled={!url || loading}
            className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-stone-700 disabled:cursor-not-allowed text-black font-bold px-8 py-4 rounded-xl transition-all"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                處理中...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                開始分析
              </>
            )}
          </button>
        </div>
        
        {!isConfigured && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs">
            提示：需要設定 Gemini API Key 才能生成摘要。請至右上角 Settings 設定。
          </div>
        )}
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass border border-red-500/20 rounded-2xl p-6 mb-8 flex items-start gap-4"
        >
          <AlertCircle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-red-400 font-bold mb-1">發生錯誤</div>
            <div className="text-stone-400 text-sm">{error}</div>
          </div>
        </motion.div>
      )}

      {transcript.length > 0 && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass border border-white/10 rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setSummaryExpanded(!summaryExpanded)}
              className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Sparkles size={18} className="text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold">內容摘要</div>
                  <div className="text-stone-500 text-xs">AI 生成的影片重點</div>
                </div>
              </div>
              {summaryExpanded ? <ChevronUp size={18} className="text-stone-500" /> : <ChevronDown size={18} className="text-stone-500" />}
            </button>
            
            {summaryExpanded && summary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="px-6 pb-6"
              >
                <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                  <p className="text-stone-300 leading-relaxed">{summary}</p>
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <FileText size={18} className="text-cyan-400" />
                </div>
                <div>
                  <div className="text-white font-bold">時間軸字幕</div>
                  <div className="text-stone-500 text-xs flex items-center gap-2">
                    <Clock size={10} />
                    {transcript.length > 0 && `${formatTime(transcript[transcript.length - 1].start + transcript[transcript.length - 1].duration)} · ${transcriptMode === "cc" ? "CC 字幕" : "語音辨識"}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyTranscript}
                  className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-stone-400 hover:text-white text-xs transition-colors"
                >
                  {copied ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copied ? "已複製" : "複製"}
                </button>
                <button
                  onClick={downloadTranscript}
                  className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-stone-400 hover:text-white text-xs transition-colors"
                >
                  <Download size={14} />
                  下載
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setTranscriptExpanded(!transcriptExpanded)}
              className="w-full p-4 text-left text-stone-500 hover:text-stone-300 text-xs border-b border-white/5 transition-colors"
            >
              {transcriptExpanded ? "收合" : "展開全部"}
            </button>

            {transcriptExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-h-[500px] overflow-y-auto p-4 space-y-2"
              >
                {transcript.map((segment, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <span className="text-cyan-400 font-mono text-sm flex-shrink-0 w-12">
                      {formatTime(segment.start)}
                    </span>
                    <span className="text-stone-300 text-sm leading-relaxed">
                      {segment.text}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {videoInfo && transcript.length === 0 && !loading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass border border-white/10 rounded-2xl p-8 text-center"
        >
          <Volume2 size={48} className="text-stone-600 mx-auto mb-4" />
          <div className="text-stone-400">等待分析結果...</div>
        </motion.div>
      )}
    </div>
  );
};
