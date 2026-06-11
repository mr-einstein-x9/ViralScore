"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertCircle, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import UploadPanel from "@/components/UploadPanel";
import ScoreGauge from "@/components/ScoreGauge";
import MetricsGrid from "@/components/MetricsGrid";
import EngagementForecast from "@/components/EngagementForecast";
import HookTimeline from "@/components/HookTimeline";
import SuggestionsList from "@/components/SuggestionsList";
import HashtagPanel from "@/components/HashtagPanel";
import AudioRecommendations from "@/components/AudioRecommendations";
import HistoryPanel from "@/components/HistoryPanel";
import ShareCard from "@/components/ShareCard";
import PostingStrategy from "@/components/PostingStrategy";
import { saveToHistory, getHistory, HistoryEntry } from "@/lib/history";
import type { ViralAnalysis } from "@/lib/groq";
import { Share2 } from "lucide-react";

// ── Loading messages ──────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  "Analyzing visual hooks...",
  "Calculating emotional resonance...",
  "Checking platform trends...",
  "Predicting engagement reach...",
  "Scanning competitor intel...",
  "Generating improvement checklist...",
];

const VIRAL_TIPS = [
  "The first 3 seconds are make-or-break.",
  "Add 'Wait for it' to increase retention.",
  "Closed loops in hooks force users to watch until the end.",
  "LinkedIn favors text-heavy posts with a strong CTA.",
  "TikTok trends move fast—post within 48h of a song peaking.",
  "Respond to every comment in the first hour.",
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
  hidden:  { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.15 } },
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
  const [resultsExpanded, setResultsExpanded] = useState(false);
  
  // History state
  const [historyOpen, setHistoryOpen]       = useState(false);
  const [historyCount, setHistoryCount]     = useState(0);

  // Share state
  const [shareOpen, setShareOpen]           = useState(false);
  const [lastContent, setLastContent]       = useState("");
  const [analysisTimestamp, setAnalysisTimestamp] = useState<number>(Date.now());

  const loadingMessage = useCyclingMessage(LOADING_MESSAGES, isLoading);
  const resultsRef     = useRef<HTMLDivElement>(null);

  const leftPanelClass = resultsExpanded
    ? "w-full md:w-[72px] transition-all duration-[350ms] ease-in-out opacity-40 md:opacity-60 overflow-hidden pointer-events-none md:pointer-events-auto"
    : "w-full md:w-1/2 transition-all duration-[350ms] ease-in-out opacity-100 pointer-events-auto";

  const rightPanelClass = resultsExpanded
    ? "w-full md:w-[calc(100%-72px)] transition-all duration-[350ms] ease-in-out opacity-100"
    : "w-full md:w-1/2 transition-all duration-[350ms] ease-in-out";

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
    setLastContent(data.content);

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
      setResultsExpanded(true);
      setAnalysisTimestamp(Date.now());

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
    setResultsExpanded(true);
    setLastContent(entry.contentPreview);
    setAnalysisTimestamp(entry.timestamp);
    setHasAnalyzed(true);
    setHistoryOpen(false);
    // Note: To perfectly restore input fields in UploadPanel, UploadPanel 
    // would need to accept controlled props. We restore the result view.
  };

  // ── Reset ─────────────────────────────────────────────────────────────────

  function handleReset() {
    setError(null);
    setAnalysisResult(null);
    setResultsExpanded(false);
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
          {/* Share Score Button + Edit Button on Mobile */}
          <div className="sticky top-[64px] md:relative z-20 flex justify-between items-center mb-2 md:mb-0 bg-[#0a0a0a]/95 backdrop-blur-sm md:bg-transparent py-2 md:py-0">
            {resultsExpanded && (
              <button
                onClick={() => setResultsExpanded(false)}
                className="md:hidden bg-[#1a1a1a] border border-[#333] text-[#888] 
                           hover:border-[#00ff87] hover:text-[#00ff87]
                           px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all font-semibold"
              >
                <span>← Edit</span>
              </button>
            )}
            <div className="flex-grow" />
            <button
              onClick={() => setShareOpen(true)}
              className="bg-[#1a1a1a] border border-[#333] text-[#888] 
                         hover:border-[#00ff87] hover:text-[#00ff87]
                         px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Score</span>
            </button>
          </div>

          <motion.div variants={resultItemVariants}>
            <ScoreGauge
              overallScore={analysisResult.overallScore}
              scoreLabel={analysisResult.scoreLabel}
              platform={analysisResult.platform}
              scoreColor={analysisResult.scoreColor}
              oneLiner={analysisResult.oneLiner}
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
            <EngagementForecast
              views={analysisResult.predictedViews}
              likes={analysisResult.predictedLikes}
              comments={analysisResult.predictedComments}
              shares={analysisResult.predictedShares}
            />
          </motion.div>

          <motion.div variants={resultItemVariants}>
            <HookTimeline events={analysisResult.hookTimeline} />
          </motion.div>

          <motion.div variants={resultItemVariants}>
            <SuggestionsList
              improvements={analysisResult.improvements}
              strengths={analysisResult.strengths}
              hookAnalysis={analysisResult.hookAnalysis}
              timestamp={analysisTimestamp}
              improvedHook={analysisResult.metricsNew?.hookStrength.improvedHook}
              top3Actions={analysisResult.top3Actions}
            />
          </motion.div>

          <motion.div variants={resultItemVariants}>
            <HashtagPanel
              hashtags={analysisResult.hashtags}
              captionRewrites={analysisResult.captionRewrites}
              competitorInsight={analysisResult.competitorInsight}
              userMetrics={{
                hookStrength: analysisResult.hookStrength,
                captionClarity: analysisResult.captionClarity,
                emotionalTrigger: analysisResult.emotionalTrigger,
                trendingRelevance: analysisResult.trendingRelevance,
                callToAction: analysisResult.callToAction,
                thumbnailRating: analysisResult.thumbnailRating,
              }}
              hashtagsNew={analysisResult.hashtagsNew}
              competitorBenchmarkNew={analysisResult.competitorBenchmarkNew}
            />
          </motion.div>

          <motion.div variants={resultItemVariants}>
            <AudioRecommendations 
              platform={analysisResult.platform} 
              trendingAudioNew={analysisResult.trendingAudioNew}
            />
          </motion.div>

          {analysisResult.postingStrategy && (
            <motion.div variants={resultItemVariants}>
              <PostingStrategy
                bestTime={analysisResult.postingStrategy.bestTime}
                contentFormat={analysisResult.postingStrategy.contentFormat}
                crossPlatformPotential={analysisResult.postingStrategy.crossPlatformPotential}
              />
            </motion.div>
          )}
        </motion.div>
      );
    }

    return null;
  }

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0]">
      <Navbar />

      {/* ── Tips Marquee ──────────────────────────────────────────────── */}
      <div className="w-full bg-[#111] border-b border-[#222] overflow-hidden py-2 hidden sm:block">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-12"
        >
          {[...VIRAL_TIPS, ...VIRAL_TIPS].map((tip, i) => (
            <div key={i} className="flex items-center gap-3">
              <Zap size={12} className="text-[#00ff87]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#555]">
                {tip}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

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

        {/* Two-column layout: stacks on mobile, side-by-side on desktop with flex transition */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start w-full relative">

          {/* Left — Upload Panel (sticky on desktop) */}
          <div className={`${leftPanelClass} md:sticky md:top-20`}>
            <div className={`bg-[#111] border border-[#222] rounded-2xl transition-all duration-[350ms] ${
              resultsExpanded ? "p-2 sm:p-3" : "p-4 sm:p-6"
            }`}>
              <UploadPanel
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                collapsed={resultsExpanded}
                onExpand={() => setResultsExpanded(false)}
                overallScore={analysisResult?.overallScore}
                scoreColor={analysisResult?.scoreColor}
              />
            </div>
          </div>

          {/* Right — Results */}
          <div ref={resultsRef} className={`${rightPanelClass} min-h-[360px] md:min-h-[400px]`}>
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

      {analysisResult && (
        <ShareCard
          result={analysisResult}
          contentPreview={lastContent.slice(0, 60)}
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      )}
    </main>
  );
}
