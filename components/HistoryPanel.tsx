"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, X } from "lucide-react";
import {
  HistoryEntry,
  getHistory,
  deleteFromHistory,
  clearHistory,
  getScoreTrend,
} from "@/lib/history";

// ── Props ─────────────────────────────────────────────────────────────────────

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (entry: HistoryEntry) => void;
}

// ── Relative time helper ──────────────────────────────────────────────────────

function getRelativeTime(timestamp: number) {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const daysDifference = Math.round(
    (timestamp - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysDifference === 0) {
    const hoursDifference = Math.round(
      (timestamp - Date.now()) / (1000 * 60 * 60)
    );
    if (hoursDifference === 0) {
      const minutesDifference = Math.round(
        (timestamp - Date.now()) / (1000 * 60)
      );
      if (minutesDifference === 0) return "just now";
      return rtf.format(minutesDifference, "minute");
    }
    return rtf.format(hoursDifference, "hour");
  }
  return rtf.format(daysDifference, "day");
}

// ── Platform emoji ────────────────────────────────────────────────────────────

const PLATFORM_EMOJI: Record<string, string> = {
  TikTok: "🎵",
  Instagram: "📸",
  YouTube: "▶️",
  LinkedIn: "💼",
  "Twitter/X": "𝕏",
};

// ── Score Colors ──────────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 90) return "text-[#00ff87]";
  if (score >= 70) return "text-green-400";
  if (score >= 40) return "text-yellow-400";
  return "text-red-400";
}

function getBgColor(score: number): string {
  if (score >= 90) return "bg-[#00ff87]";
  if (score >= 70) return "bg-[#00ff87]"; // User wanted 70+ to be electric green
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function HistoryPanel({
  isOpen,
  onClose,
  onRestore,
}: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load history on mount and when 'historyUpdated' event fires
  useEffect(() => {
    function loadHistory() {
      setHistory(getHistory());
    }

    if (isOpen) loadHistory(); // Reload when opened

    window.addEventListener("historyUpdated", loadHistory);
    return () => window.removeEventListener("historyUpdated", loadHistory);
  }, [isOpen]);

  const trend = getScoreTrend(history);

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    setHistory(getHistory());
  };

  const handleClearAll = () => {
    if (window.confirm("Clear all history?")) {
      clearHistory();
      setHistory([]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#0f0f0f] border-l border-[#222] z-50 flex flex-col shadow-2xl"
          >
            {/* ── HEADER ── */}
            <div className="p-6 border-b border-[#222] flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-2xl text-white tracking-wide">
                    Analysis History
                  </h2>
                  <p className="text-[#555] text-sm mt-0.5">
                    {history.length} saved {history.length === 1 ? "analysis" : "analyses"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 text-[#888] hover:text-white hover:bg-[#222] rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Trend indicator */}
              {trend !== "insufficient" && (
                <div className="mt-2 text-sm font-medium">
                  {trend === "up" && (
                    <span className="text-[#00ff87]">📈 Your scores are improving!</span>
                  )}
                  {trend === "down" && (
                    <span className="text-yellow-400">📉 Scores dropping — keep iterating</span>
                  )}
                  {trend === "stable" && (
                    <span className="text-[#888]">➡️ Consistent scores</span>
                  )}
                </div>
              )}
            </div>

            {/* ── BODY ── */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 p-8">
                  <Clock size={48} className="text-[#333]" />
                  <p className="text-[#555] font-medium text-lg">No analyses yet</p>
                  <p className="text-[#444] text-sm">
                    Your history will appear here after your first analysis
                  </p>
                </div>
              ) : (
                history.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-[#1a1a1a] border border-[#222] rounded-xl p-4 hover:border-[#00ff87]/20 transition-all group flex flex-col gap-3"
                  >
                    {/* ROW 1 */}
                    <div className="flex items-center justify-between text-[#888] text-xs">
                      <div className="flex items-center gap-1.5 font-medium uppercase tracking-wider">
                        <span>{PLATFORM_EMOJI[entry.platform] ?? "📊"}</span>
                        <span>{entry.platform}</span>
                      </div>
                      <span>{getRelativeTime(entry.timestamp)}</span>
                    </div>

                    {/* ROW 2 */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 flex flex-col items-center justify-center">
                        <span
                          className={`font-display text-4xl leading-none ${getScoreColor(
                            entry.result.overallScore
                          )}`}
                        >
                          {entry.result.overallScore}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col items-start gap-1">
                        <span
                          className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border border-current ${getScoreColor(
                            entry.result.overallScore
                          )} bg-opacity-10`}
                        >
                          {entry.result.scoreLabel}
                        </span>
                        <p className="text-[#555] text-xs line-clamp-1 w-full leading-relaxed mt-0.5">
                          {entry.contentPreview || "No content preview"}
                        </p>
                      </div>
                    </div>

                    {/* ROW 3: Mini metrics bar */}
                    <div className="flex items-center gap-1.5 mt-1">
                      {[
                        { label: "Hook", score: entry.result.hookStrength },
                        { label: "Clarity", score: entry.result.captionClarity },
                        { label: "Emotion", score: entry.result.emotionalTrigger },
                        { label: "Trending", score: entry.result.trendingRelevance },
                        { label: "CTA", score: entry.result.callToAction },
                      ].map((metric, i) => (
                        <div
                          key={i}
                          title={`${metric.label}: ${metric.score}`}
                          className={`w-2 h-2 rounded-full cursor-help ${getBgColor(
                            metric.score
                          )}`}
                        />
                      ))}
                    </div>

                    {/* ROW 4 */}
                    <div className="flex items-center gap-4 mt-1 border-t border-[#222] pt-3">
                      <button
                        onClick={() => {
                          onRestore(entry);
                          onClose();
                        }}
                        className="text-[#00ff87] text-xs font-semibold hover:underline"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-[#555] text-xs font-medium hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── FOOTER ── */}
            {history.length > 0 && (
              <div className="p-4 border-t border-[#222] bg-[#0f0f0f]">
                <button
                  onClick={handleClearAll}
                  className="w-full bg-transparent border border-red-900 text-red-500 hover:bg-red-950/30 rounded-xl py-2.5 text-sm font-semibold transition-colors"
                >
                  Clear All History
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
