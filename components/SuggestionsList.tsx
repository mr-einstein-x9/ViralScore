"use client";

import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

// ── Props ─────────────────────────────────────────────────────────────────────

interface SuggestionsListProps {
  improvements: string[];  // 5 items
  strengths:    string[];  // 3 items
  hookAnalysis: string;
}

// ── Animation variants ────────────────────────────────────────────────────────

const listContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const listItemVariants = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// ── Section heading ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-white font-semibold text-base flex items-center gap-2">
      {children}
    </h3>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SuggestionsList({
  improvements,
  strengths,
  hookAnalysis,
}: SuggestionsListProps) {
  return (
    <div className="flex flex-col gap-6">

      {/* ── SECTION A — Hook Analysis ────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <SectionHeading>🎣 Hook Analysis</SectionHeading>
          <span className="border border-[#333] text-[#555] text-xs px-2.5 py-0.5 rounded-full">
            First 3 Seconds
          </span>
        </div>

        <div className="bg-[#111] border border-[#222] rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-[#ccc] leading-relaxed text-sm">{hookAnalysis}</p>

          {/* Pro tip row */}
          <div className="flex items-start gap-3 bg-[#00ff87]/5 border border-[#00ff87]/20 rounded-xl p-3">
            <Lightbulb size={15} className="text-[#00ff87]/70 mt-0.5 flex-shrink-0" />
            <p className="text-[#00ff87]/80 text-sm leading-relaxed">
              <span className="font-semibold">Pro tip:</span> The first line of your
              caption is shown before the "more" fold — make it a statement, 
              a bold claim, or an open loop that forces curiosity.
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION B — Strengths ────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <SectionHeading>✅ What&apos;s Working</SectionHeading>

        <motion.div
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-2"
        >
          {strengths.map((strength, i) => (
            <motion.div
              key={i}
              variants={listItemVariants}
              className="bg-green-950/20 border border-green-900/40 rounded-xl p-4
                         flex items-start gap-3"
            >
              <span className="text-green-400 font-bold text-sm mt-0.5 flex-shrink-0">
                →
              </span>
              <p className="text-[#ccc] text-sm leading-relaxed">{strength}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── SECTION C — Improvements ─────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <SectionHeading>🚀 5 Ways to Improve</SectionHeading>

        <motion.div
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-2"
        >
          {improvements.map((improvement, i) => (
            <motion.div
              key={i}
              variants={listItemVariants}
              className="bg-[#111] border border-[#222] rounded-xl p-4
                         flex items-start gap-3 group cursor-default
                         hover:border-[#00ff87]/30 transition-all duration-200"
            >
              {/* Step number */}
              <span
                className="font-display text-2xl text-[#00ff87]/40 leading-none
                           group-hover:text-[#00ff87] transition-colors duration-200
                           flex-shrink-0 w-7"
              >
                {i + 1}
              </span>
              <p className="text-[#ccc] text-sm leading-relaxed">{improvement}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

    </div>
  );
}
