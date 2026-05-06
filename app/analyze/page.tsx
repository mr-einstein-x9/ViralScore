"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertCircle, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import UploadPanel from "@/components/UploadPanel";
import ScoreGauge from "@/components/ScoreGauge";
import MetricsGrid from "@/components/MetricsGrid";
import SuggestionsList from "@/components/SuggestionsList";
import HashtagPanel from "@/components/HashtagPanel";
import HistoryPanel from "@/components/HistoryPanel";
import { saveToHistory, getHistory, HistoryEntry } from "@/lib/history";
import type { ViralAnalysis } from "@/lib/gemini";

// ── Loading messages ──────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  "Analyzing your content...",
  "Checking hook strength...",
  "Measuring emotional triggers...",
  "Scoring viral potential...",
  "Generating hashtags...",
  "Almost done...",
];

// ── Score label badge colors ──────────────────────────────────────────────────

const LABEL_COLORS: Record<string, string> = {
  Low:           "text-red-400",
  Moderate:      "text-yellow-400",
  High:          "text-green-400",
  "Viral Ready": "text-[#00ff87]",
};

// ── Platform emoji ────────────────────────────────────────────────────────────

const PLATFORM_EMOJI: Record<string, string> = {
  TikTok:      "🎵",
  Instagram:   "📸",
  YouTube:     "▶️",
  LinkedIn:    "💼",
  "Twitter/X": "𝕏",
};

// ── Result animation variants ─────────────────────────────────────────────────

const resultContainerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const resultItemVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

// ── Cycling loading message ───────────────────────────────────────────────────

function useCyclingMessage(messages: string[], active: boolean) {
  const [index, setIndex] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) { setIndex(0); if (ref.current) clearInterval(ref.current); return; }
    ref.current = setInterval(() => setIndex((p) => (p + 1) % messages.length), 1500);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [active, messages.length]);

  return messages[index];
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard({ height = "h-32" }: { height?: string }) {
  return <div className={`w-full ${height} bg-[#1a1a1a] animate-pulse rounded-xl`} />;
}

// ── Sticky score mini-bar ─────────────────────────────────────────────────────

function StickyScoreBar({ result }: { result: ViralAnalysis }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() { setVisible(window.scrollY > 400); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const labelColor = LABEL_COLORS[result.scoreLabel] ?? "text-[#00ff87]";
  const platformEmoji = PLATFORM_EMOJI[result.platform] ?? "📊";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="fixed top-16 left-0 right-0 z-40
                     bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#222]
                     px-4 py-2"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            {/* Mini score circle */}
            <div className="relative flex-shrink-0">
              <svg width={40} height={40} viewBox="0 0 40 40" className="-rotate-90">
                <circle cx={20} cy={20} r={15} fill="none" stroke="#222" strokeWidth={4} />
                <circle
                  cx={20} cy={20} r={15} fill="none"
                  stroke="#00ff87" strokeWidth={4} strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 15}
                  strokeDashoffset={2 * Math.PI * 15 * (1 - result.overallScore / 100)}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center
                               font-display text-xs text-[#00ff87] rotate-0">
                {result.overallScore}
              </span>
            </div>

            {/* Score label + platform */}
            <div className="flex items-center gap-3 min-w-0">
              <span className={`font-semibold text-sm ${labelColor}`}>
                {result.scoreLabel}
              </span>
              <span className="text-[#444] text-xs hidden sm:inline">·</span>
              <span className="text-[#888] text-xs hidden sm:flex items-center gap-1">
                {platformEmoji} {result.platform}
              </span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            <span className="text-[#555] text-xs hidden sm:block">
              Scroll up to see full report
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyzePage() {
  const [analysisResult, setAnalysisResult] = useState<ViralAnalysis | null>(null);
  const [isLoading, setIsLoading]           = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed]       = useState(false);
  
  // History state
  const [historyOpen, setHistoryOpen]       = useState(false);
  const [historyCount, setHistoryCount]     = useState(0);

  const loadingMessage = useCyclingMessage(LOADING_MESSAGES, isLoading);
  const resultsRef     = useRef<HTMLDivElement>(null);

  // Load history count
  useEffect(() => {
    function updateCount() {
      setHistoryCount(getHistory().length);
    }
    updateCount();
    window.addEventListener("historyUpdated", updateCount);
    return () => window.removeEventListener("historyUpdated", updateCount);
  }, []);

  // Mobile: scroll results into view after analysis
  useEffect(() => {
    if (analysisResult && resultsRef.current) {
      if (window.innerWidth < 1024) {
        resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [analysisResult]);

  // ── Analyze handler ───────────────────────────────────────────────────────

  const handleAnalyze = useCallback(async (data: {
    contentType: "caption" | "video_url" | "image_url";
    content:     string;
    platform:    string;
    context:     string;
  }) => {
    setIsLoading(true);
    setError(null);
    setHasAnalyzed(true);
    setAnalysisResult(null);

    try {
      const res  = await fetch("/api/analyze", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error((json as { error?: string }).error ?? "Analysis failed.");
      }
      
      const resultData = json as ViralAnalysis;
      setAnalysisResult(resultData);

      // Save to history
      saveToHistory({
        platform: data.platform,
        contentType: data.contentType,
        contentPreview: data.content.slice(0, 80),
        result: resultData,
      });
      window.dispatchEvent(new Event("historyUpdated"));

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Restore handler ───────────────────────────────────────────────────────
  
  const handleRestore = (entry: HistoryEntry) => {
    setAnalysisResult(entry.result);
    setHasAnalyzed(true);
    setHistoryOpen(false);
    // Note: To perfectly restore input fields in UploadPanel, UploadPanel 
    // would need to accept controlled props. We restore the result view.
  };

  // ── Reset ─────────────────────────────────────────────────────────────────

  function handleReset() {
    setError(null);
    setAnalysisResult(null);
    setHasAnalyzed(false);
    setIsLoading(false);
  }

  // ── Right column content ──────────────────────────────────────────────────

  function renderRightColumn() {
    // STATE A — Empty
    if (!hasAnalyzed) {
      return (
        <motion.div
          key="empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8
                     text-center flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed
                          border-[#333] flex items-center justify-center">
            <Zap size={32} className="text-[#333]" />
          </div>

          <div>
            <p className="text-white font-semibold text-base sm:text-lg">
              Your virality score will appear here
            </p>
            <p className="text-[#555] text-sm mt-1">
              Paste your content on the left to get started
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {["Hook Strength", "Caption Score", "Hashtags"].map((label) => (
              <span
                key={label}
                className="border border-[#222] text-[#555] text-xs px-3 py-1 rounded-full"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="w-full flex flex-col gap-2 mt-2">
            {[75, 55, 40].map((w, i) => (
              <div
                key={i}
                className="h-2 rounded-full bg-[#1a1a1a]"
                style={{ width: `${w}%`, margin: "0 auto" }}
              />
            ))}
          </div>
        </motion.div>
      );
    }

    // STATE B — Loading
    if (isLoading) {
      return (
        <motion.div
          key="loading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-5"
        >
          <div className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8
                          flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#00ff87]/20 animate-ping" />
              <div className="absolute inset-0 rounded-full border-4 border-[#00ff87]/10" />
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4
                              border-[#00ff87]/30 flex items-center justify-center animate-pulse">
                <Zap size={30} className="text-[#00ff87]/50" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={loadingMessage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-[#888] text-sm font-medium"
              >
                {loadingMessage}
              </motion.p>
            </AnimatePresence>
          </div>

          <SkeletonCard height="h-28" />
          <SkeletonCard height="h-40" />
          <SkeletonCard height="h-32" />
        </motion.div>
      );
    }

    // STATE C — Error
    if (error) {
      return (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-red-950/20 border border-red-800/60 rounded-2xl p-5 sm:p-6
                     flex flex-col items-center gap-4 text-center"
        >
          <AlertCircle size={36} className="text-red-400" />
          <div>
            <h3 className="text-white font-semibold text-base sm:text-lg">
              Analysis Failed
            </h3>
            <p className="text-red-400/80 text-sm mt-1 leading-relaxed max-w-sm">
              {error}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="mt-2 bg-[#00ff87] text-black font-semibold px-6 py-2.5
                       rounded-full text-sm hover:bg-white transition-all duration-200"
          >
            Try Again
          </button>
        </motion.div>
      );
    }

    // STATE D — Results
    if (analysisResult) {
      return (
        <motion.div
          key="results"
          variants={resultContainerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-5"
        >
          <motion.div variants={resultItemVariants}>
            <ScoreGauge
              overallScore={analysisResult.overallScore}
              scoreLabel={analysisResult.scoreLabel}
              platform={analysisResult.platform}
            />
          </motion.div>

          <motion.div variants={resultItemVariants}>
            <MetricsGrid
              hookStrength={analysisResult.hookStrength}
              captionClarity={analysisResult.captionClarity}
              emotionalTrigger={analysisResult.emotionalTrigger}
              trendingRelevance={analysisResult.trendingRelevance}
              callToAction={analysisResult.callToAction}
              thumbnailRating={analysisResult.thumbnailRating}
            />
          </motion.div>

          <motion.div variants={resultItemVariants}>
            <SuggestionsList
              improvements={analysisResult.improvements}
              strengths={analysisResult.strengths}
              hookAnalysis={analysisResult.hookAnalysis}
            />
          </motion.div>

          <motion.div variants={resultItemVariants}>
            <HashtagPanel
              hashtags={analysisResult.hashtags}
              captionSuggestions={analysisResult.captionSuggestions}
              competitorInsight={analysisResult.competitorInsight}
            />
          </motion.div>
        </motion.div>
      );
    }

    return null;
  }

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0]">
      <Navbar />

      {/* Sticky score bar — only visible when results exist + user scrolled */}
      {analysisResult && <StickyScoreBar result={analysisResult} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16 sm:pb-20">
        {/* Page header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1
              className="font-display text-white uppercase leading-none"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              Analyze Your{" "}
              <span className="text-[#00ff87]">Content</span>
            </h1>
            <p className="text-[#555] text-sm mt-2">
              Get your virality score in seconds. Powered by Groq Llama 3.3.
            </p>
          </div>
          
          {/* History Button */}
          <button
            onClick={() => setHistoryOpen(true)}
            className="border border-[#222] text-[#888] hover:border-[#00ff87] hover:text-[#00ff87] 
                       px-4 py-2 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Clock size={16} />
            <span>History</span>
            {historyCount > 0 && (
              <span className="bg-[#00ff87] text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </div>

        {/* Two-column layout: stacks on mobile, side-by-side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">

          {/* Left — Upload Panel (sticky on desktop) */}
          <div className="lg:sticky lg:top-20">
            <div className="bg-[#111] border border-[#222] rounded-2xl p-4 sm:p-6">
              <UploadPanel onAnalyze={handleAnalyze} isLoading={isLoading} />
            </div>
          </div>

          {/* Right — Results */}
          <div ref={resultsRef} className="min-h-[360px] lg:min-h-[400px]">
            <AnimatePresence mode="wait">
              {renderRightColumn()}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRestore={handleRestore}
      />
    </main>
  );
}
