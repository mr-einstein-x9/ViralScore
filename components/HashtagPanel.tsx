"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Trophy } from "lucide-react";
import CompetitorCompare from "@/components/CompetitorCompare";

interface HashtagPanelProps {
  hashtags:           string[];
  captionRewrites:    string[];
  competitorInsight:  {
    summary: string;
    competitorMetrics: {
      hookStrength: number;
      captionClarity: number;
      emotionalTrigger: number;
      trendingRelevance: number;
      callToAction: number;
      thumbnailRating: number;
    };
    competitorNames: string[];
  };
  userMetrics: {
    hookStrength: number;
    captionClarity: number;
    emotionalTrigger: number;
    trendingRelevance: number;
    callToAction: number;
    thumbnailRating: number;
  };
}

type ActiveTab = "hashtags" | "captions" | "competitor";

// ── Static competitor tips ────────────────────────────────────────────────────

const COMPETITOR_TIPS = [
  "Top creators in this niche post 3x/week minimum",
  "Trending audio increases reach by up to 40%",
  "Carousel posts get 3x more saves than single images",
];

// ── Copy toast hook ───────────────────────────────────────────────────────────

function useCopyToast() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    });
  }

  return { copiedKey, copy };
}

// ── Tab content animation ─────────────────────────────────────────────────────

const tabContentVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.35, ease: "easeOut" } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function HashtagPanel({
  hashtags,
  captionRewrites,
  competitorInsight,
  userMetrics,
}: HashtagPanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("hashtags");
  const { copiedKey, copy } = useCopyToast();

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: "hashtags",   label: "Hashtags"         },
    { id: "captions",   label: "Caption Rewrites"  },
    { id: "competitor", label: "Competitor Intel"   },
  ];

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-4 sm:p-6 flex flex-col gap-5">

      {/* ── Tab pills — horizontally scrollable on mobile ────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-none"
           style={{ scrollbarWidth: "none" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-[#00ff87] text-black"
                : "border border-[#333] text-[#888] hover:border-[#00ff87] hover:text-[#00ff87]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* TAB 1 — Hashtags ──────────────────────────────────────────── */}
        {activeTab === "hashtags" && (
          <motion.div
            key="hashtags"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-4"
          >
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => copy(tag, tag)}
                  title={`Copy ${tag}`}
                  className={`bg-[#1a1a1a] border rounded-full px-3 py-1.5 text-sm
                             transition-all duration-200 cursor-pointer ${
                    copiedKey === tag
                      ? "border-[#00ff87] text-[#00ff87]"
                      : "border-[#333] text-[#ccc] hover:border-[#00ff87] hover:text-[#00ff87]"
                  }`}
                >
                  {copiedKey === tag ? (
                    <span className="flex items-center gap-1">
                      <Check size={11} /> Copied!
                    </span>
                  ) : (
                    tag
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => copy(hashtags.join(" "), "all")}
              className={`flex items-center justify-center gap-2 w-full border rounded-xl py-2.5
                         text-sm font-medium transition-all duration-200 ${
                copiedKey === "all"
                  ? "border-[#00ff87] text-[#00ff87] bg-[#00ff87]/5"
                  : "border-[#333] text-[#888] hover:border-[#00ff87] hover:text-[#00ff87]"
              }`}
            >
              {copiedKey === "all" ? (
                <><Check size={14} /> All Copied!</>
              ) : (
                <><Copy size={14} /> Copy All Hashtags</>
              )}
            </button>
          </motion.div>
        )}

        {/* TAB 2 — Caption Rewrites ──────────────────────────────────── */}
        {activeTab === "captions" && (
          <motion.div
            key="captions"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-3"
          >
            {!captionRewrites || captionRewrites.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-[#222] rounded-xl">
                <p className="text-[#555] text-sm">No rewrites generated. Try again.</p>
              </div>
            ) : (
              captionRewrites.map((caption, i) => {
                const copyKey = `caption-${i}`;
                return (
                  <div
                    key={i}
                    className="bg-[#161616] border border-[#222] rounded-xl p-3 sm:p-4
                               flex flex-col gap-3 hover:border-[#333] transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#555] text-xs uppercase tracking-widest font-medium">
                        Version {i + 1}
                      </span>
                      <button
                        onClick={() => copy(caption, copyKey)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1
                                   rounded-full transition-all duration-200 ${
                          copiedKey === copyKey
                            ? "bg-[#00ff87]/10 text-[#00ff87]"
                            : "bg-[#222] text-[#888] hover:text-white"
                        }`}
                      >
                        {copiedKey === copyKey ? (
                          <><Check size={11} /> Copied</>
                        ) : (
                          <><Copy size={11} /> Copy</>
                        )}
                      </button>
                    </div>
                    <p className="text-[#ccc] text-sm leading-relaxed whitespace-pre-wrap">{caption}</p>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {/* TAB 3 — Competitor Intel ──────────────────────────────────── */}
        {activeTab === "competitor" && (
          <motion.div
            key="competitor"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-4"
          >
            <CompetitorCompare
              summary={competitorInsight.summary}
              competitorMetrics={competitorInsight.competitorMetrics}
              userMetrics={userMetrics}
              competitorNames={competitorInsight.competitorNames}
            />

            <div className="flex flex-col gap-2 mt-4">
              <p className="text-[#555] text-[10px] uppercase tracking-widest font-bold mb-1">
                Strategy Tips
              </p>
              {COMPETITOR_TIPS.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-[#111] border border-[#222]
                             rounded-xl p-3 hover:border-[#00ff87]/20 transition-all duration-200"
                >
                  <Trophy size={14} className="text-[#00ff87] flex-shrink-0 mt-0.5" />
                  <p className="text-[#888] text-xs leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
