"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Copy, Check, Share2, Loader2, Zap, Instagram, Linkedin, Youtube, Twitter, Music } from "lucide-react";
import html2canvas from "html2canvas";
import type { ViralAnalysis } from "@/lib/groq";

interface ShareCardProps {
  result: ViralAnalysis;
  contentPreview: string; // first 60 chars of analyzed content
  isOpen: boolean;
  onClose: () => void;
}

const PLATFORM_ICONS: Record<string, any> = {
  TikTok: Music,
  Instagram: Instagram,
  YouTube: Youtube,
  LinkedIn: Linkedin,
  "Twitter/X": Twitter,
};

export default function ShareCard({
  result,
  contentPreview,
  isOpen,
  onClose,
}: ShareCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      // Small delay to ensure any animations are settled
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 3,
        logging: false,
        useCORS: true,
      });
      
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `viralscore-${result.overallScore}-${result.platform.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 2,
        useCORS: true,
      });
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch (err) {
      console.error("Copy to clipboard failed:", err);
    }
  };

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const metrics = [
    { name: "Hook Strength", score: result.hookStrength },
    { name: "Caption Clarity", score: result.captionClarity },
    { name: "Emotional Trigger", score: result.emotionalTrigger },
    { name: "Trending Relevance", score: result.trendingRelevance },
    { name: "Call to Action", score: result.callToAction },
    { name: "Visual Hook", score: result.thumbnailRating },
  ].sort((a, b) => b.score - a.score).slice(0, 3);

  const getScoreColor = (score: number) => {
    if (score < 40) return "#ff3d00";
    if (score < 70) return "#f59e0b";
    return "#00ff87";
  };

  const PlatformIcon = PLATFORM_ICONS[result.platform] || Music;
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative max-w-lg w-full bg-[#0f0f0f] border border-[#222] rounded-2xl p-6 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#00ff87]" />
              Share Your Score
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#555] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body - Preview Area */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative group">
              {/* Scaled Preview */}
              <div className="scale-[0.65] sm:scale-[0.75] origin-center -my-10">
                {/* THE ACTUAL SCORE CARD (Capture Target) */}
                <div
                  ref={cardRef}
                  className="w-[480px] h-[280px] bg-[#0a0a0a] border border-[#222] rounded-[20px] p-8 flex flex-col justify-between relative overflow-hidden shrink-0"
                  style={{
                    background: `radial-gradient(ellipse at top left, rgba(0,255,135,0.08) 0%, transparent 60%), #0a0a0a`,
                  }}
                >
                  <div className="absolute inset-0 z-0 overflow-hidden rounded-[20px]">
                    <div 
                      className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-20"
                      style={{
                        background: `radial-gradient(circle at center, #00ff87 0%, transparent 40%)`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between h-full relative z-10">
                    {/* LEFT SIDE */}
                    <div className="flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 bg-[#00ff87] rounded flex items-center justify-center">
                              <Zap size={14} className="text-black" />
                           </div>
                           <div className="font-display text-[18px] tracking-[0.2em] text-white uppercase">
                            ViralScore
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#333] rounded-full px-3 py-1">
                          <PlatformIcon size={12} className="text-[#00ff87]" />
                          <span className="text-[#888] text-[10px] font-bold uppercase tracking-wider">
                            {result.platform}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[#555] text-[10px] uppercase tracking-[0.2em] font-bold">
                          Virality Score
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-display text-[84px] text-[#00ff87] leading-none">
                            {result.overallScore}
                          </span>
                          <span className="text-[#333] text-2xl font-display">/100</span>
                        </div>
                        <div className="inline-block px-3 py-1 rounded-lg border border-[#00ff87]/20 bg-[#00ff87]/5 text-[#00ff87] text-[11px] font-bold uppercase tracking-[0.2em]">
                          {result.scoreLabel}
                        </div>
                      </div>

                      <div className="text-[#444] text-[10px] italic max-w-[220px] line-clamp-2 leading-relaxed border-l border-[#222] pl-3">
                        "{contentPreview}..."
                      </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex flex-col justify-between items-end">
                      {/* Score circle SVG */}
                      <div className="relative w-24 h-24">
                        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
                          <circle cx="48" cy="48" r="42" fill="none" stroke="#111" strokeWidth="8" />
                          <circle
                            cx="48"
                            cy="48"
                            r="42"
                            fill="none"
                            stroke="#00ff87"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 42}
                            strokeDashoffset={2 * Math.PI * 42 * (1 - result.overallScore / 100)}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center rotate-90">
                           <Zap className="w-8 h-8 text-[#00ff87]/50" />
                        </div>
                      </div>

                      {/* Top 3 Metrics */}
                      <div className="space-y-3 mt-4 w-[180px]">
                        <p className="text-[#555] text-[9px] uppercase tracking-widest font-bold text-right mb-1">
                          Top Performance Metrics
                        </p>
                        {metrics.map((m) => (
                          <div key={m.name} className="flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[#888] text-[9px] uppercase tracking-wider font-medium">
                                {m.name}
                              </span>
                              <span
                                className="text-[9px] font-bold"
                                style={{ color: getScoreColor(m.score) }}
                              >
                                {m.score}%
                              </span>
                            </div>
                            <div className="w-full h-1 bg-[#222] rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all duration-1000"
                                style={{
                                  width: `${m.score}%`,
                                  backgroundColor: getScoreColor(m.score),
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-right space-y-1 mt-6">
                        <div className="text-[#00ff87] text-[10px] tracking-[0.3em] uppercase font-bold">
                          Analyzed by ViralScore
                        </div>
                        <div className="text-[#333] text-[9px] uppercase font-bold tracking-widest">
                          {today}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD BOTTOM STRIP */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 flex">
                    {[
                      result.hookStrength,
                      result.captionClarity,
                      result.emotionalTrigger,
                      result.trendingRelevance,
                      result.callToAction,
                      result.thumbnailRating,
                    ].map((score, idx) => (
                      <div
                        key={idx}
                        className="h-full first:rounded-bl-full last:rounded-br-full"
                        style={{
                          width: `${100 / 6}%`,
                          backgroundColor: getScoreColor(score),
                          opacity: 0.8,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[#444] text-[11px] uppercase tracking-[0.2em] mt-4">
              Preview Mode
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 bg-[#00ff87] text-black font-bold py-3.5 rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                  <span>Download PNG</span>
                </>
              )}
            </button>
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center justify-center gap-2 bg-[#1a1a1a] border border-[#222] text-white font-semibold py-3.5 rounded-xl hover:bg-[#222] transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#00ff87]" />
                  <span className="text-[#00ff87]">Copied Image!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
