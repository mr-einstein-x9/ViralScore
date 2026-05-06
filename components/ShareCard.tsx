"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Copy, Check, Share2, Loader2, Zap } from "lucide-react";
import { toPng } from "html-to-image";
import type { ViralAnalysis } from "@/lib/gemini";

interface ShareCardProps {
  result: ViralAnalysis;
  contentPreview: string; // first 60 chars of analyzed content
  isOpen: boolean;
  onClose: () => void;
}

const PLATFORM_EMOJI: Record<string, string> = {
  TikTok: "🎵",
  Instagram: "📸",
  YouTube: "▶️",
  LinkedIn: "💼",
  "Twitter/X": "𝕏",
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
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 3, // 3x resolution = crisp on retina
        backgroundColor: "#0a0a0a",
      });
      
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
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
    { name: "Hook", score: result.hookStrength },
    { name: "Caption", score: result.captionClarity },
    { name: "Emotion", score: result.emotionalTrigger },
    { name: "Trending", score: result.trendingRelevance },
    { name: "CTA", score: result.callToAction },
  ];

  const getScoreColor = (score: number) => {
    if (score < 40) return "#ff3d00";
    if (score < 70) return "#f59e0b";
    return "#00ff87";
  };

  const platformEmoji = PLATFORM_EMOJI[result.platform] || "📊";
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
                  <div className="flex justify-between h-full">
                    {/* LEFT SIDE */}
                    <div className="flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="font-display text-[14px] tracking-[0.2em] text-[#00ff87] uppercase">
                          ViralScore
                        </div>
                        <div className="inline-flex items-center gap-2 bg-[#1a1a1a] border border-[#333] rounded-full px-3 py-1">
                          <span className="text-xs">{platformEmoji}</span>
                          <span className="text-[#888] text-[10px] font-medium uppercase tracking-wider">
                            {result.platform}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[#555] text-[10px] uppercase tracking-[0.2em] font-medium">
                          Viral Potential
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-display text-[72px] text-[#00ff87] leading-none">
                            {result.overallScore}
                          </span>
                          <span className="text-[#333] text-xl font-display">/100</span>
                        </div>
                        <div className="inline-block px-2 py-0.5 rounded border border-[#00ff87]/20 bg-[#00ff87]/5 text-[#00ff87] text-[10px] font-bold uppercase tracking-widest">
                          {result.scoreLabel}
                        </div>
                      </div>

                      <div className="text-[#444] text-[10px] italic max-w-[220px] line-clamp-2 leading-relaxed">
                        "{contentPreview}..."
                      </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex flex-col justify-between items-end">
                      {/* Score circle SVG */}
                      <div className="relative w-20 h-20">
                        <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
                          <circle cx="40" cy="40" r="34" fill="none" stroke="#111" strokeWidth="6" />
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            fill="none"
                            stroke="#00ff87"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 34}
                            strokeDashoffset={2 * Math.PI * 34 * (1 - result.overallScore / 100)}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center rotate-90">
                           <Zap className="w-6 h-6 text-[#00ff87]/50" />
                        </div>
                      </div>

                      {/* Mini metrics column */}
                      <div className="space-y-1.5 mt-2">
                        {metrics.map((m) => (
                          <div key={m.name} className="flex items-center gap-3">
                            <span className="text-[#555] text-[10px] uppercase tracking-wider w-20 text-right">
                              {m.name}
                            </span>
                            <div className="w-16 h-1 bg-[#222] rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all duration-1000"
                                style={{
                                  width: `${m.score}%`,
                                  backgroundColor: getScoreColor(m.score),
                                }}
                              />
                            </div>
                            <span
                              className="text-[10px] font-bold w-6 text-right"
                              style={{ color: getScoreColor(m.score) }}
                            >
                              {m.score}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="text-right space-y-0.5 mt-4">
                        <div className="text-[#333] text-[9px] tracking-widest uppercase font-medium">
                          viral-score-coral.vercel.app
                        </div>
                        <div className="text-[#333] text-[9px] uppercase font-bold tracking-widest">
                          {today}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD BOTTOM STRIP */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 flex">
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
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 bg-[#1a1a1a] border border-[#222] text-white font-semibold py-3.5 rounded-xl hover:bg-[#222] transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#00ff87]" />
                  <span className="text-[#00ff87]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
