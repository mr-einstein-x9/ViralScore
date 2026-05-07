"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, CheckCircle, Circle, RotateCcw, PartyPopper } from "lucide-react";

// ── Props ─────────────────────────────────────────────────────────────────────

interface SuggestionsListProps {
  improvements: string[];  // 5 items
  strengths:    string[];  // 3 items
  hookAnalysis: string;
  timestamp:    number;
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
  timestamp,
}: SuggestionsListProps) {
  const [checkedItems, setCheckedItems] = useState<boolean[]>(new Array(5).fill(false));
  const [showConfetti, setShowConfetti] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`viralscore-checklist-${timestamp}`);
    if (saved) {
      try {
        setCheckedItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse checklist state", e);
      }
    } else {
      setCheckedItems(new Array(5).fill(false));
    }
  }, [timestamp]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(`viralscore-checklist-${timestamp}`, JSON.stringify(checkedItems));
    
    // Check if all completed
    if (checkedItems.length > 0 && checkedItems.every(item => item === true)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [checkedItems, timestamp]);

  const toggleItem = (index: number) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
  };

  const resetAll = () => {
    setCheckedItems(new Array(5).fill(false));
  };

  const completedCount = checkedItems.filter(Boolean).length;
  const isAllCompleted = completedCount === improvements.length;
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
      <div className="flex flex-col gap-3 relative">
        <div className="flex items-center justify-between">
          <SectionHeading>🚀 5 Ways to Improve</SectionHeading>
          <div className="flex items-center gap-4">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isAllCompleted ? "text-[#00ff87]" : "text-[#555]"}`}>
              {completedCount} of {improvements.length} completed
            </span>
            <button 
              onClick={resetAll}
              className="p-1.5 hover:bg-[#222] rounded-lg transition-colors text-[#555] hover:text-white"
              title="Reset Checklist"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

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
              onClick={() => toggleItem(i)}
              className={`bg-[#111] border rounded-xl p-4 flex items-start gap-3 group cursor-pointer transition-all duration-200 ${
                checkedItems[i] 
                  ? "border-[#00ff87]/40 bg-[#00ff87]/5" 
                  : "border-[#222] hover:border-[#333]"
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {checkedItems[i] ? (
                  <CheckCircle size={18} className="text-[#00ff87]" />
                ) : (
                  <Circle size={18} className="text-[#333] group-hover:text-[#555]" />
                )}
              </div>
              <p className={`text-sm leading-relaxed transition-all duration-200 ${
                checkedItems[i] ? "text-[#00ff87]/60 line-through italic" : "text-[#ccc]"
              }`}>
                {improvement}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Subtle Confetti Overlay */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 bg-black/40 backdrop-blur-sm rounded-2xl border border-[#00ff87]/30"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <PartyPopper size={48} className="text-[#00ff87]" />
              </motion.div>
              <p className="font-display text-2xl text-[#00ff87] mt-2 uppercase tracking-widest">Great Work!</p>
              <p className="text-[#555] text-xs">All improvements checklist complete</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
