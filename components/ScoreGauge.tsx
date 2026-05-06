"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// ── Props ─────────────────────────────────────────────────────────────────────

interface ScoreGaugeProps {
  overallScore: number;
  scoreLabel: string;
  platform: string;
}

// ── Count-up hook ─────────────────────────────────────────────────────────────

function useCountUp(target: number, duration: number = 1500): number {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return count;
}

// ── Score label styles ────────────────────────────────────────────────────────

const LABEL_STYLES: Record<string, string> = {
  Low:          "bg-red-950 text-red-400 border-red-800",
  Moderate:     "bg-yellow-950 text-yellow-400 border-yellow-800",
  High:         "bg-green-950 text-green-400 border-green-800",
  "Viral Ready": "bg-[#00ff87]/10 text-[#00ff87] border-[#00ff87]/30",
};

// ── Platform emoji map ────────────────────────────────────────────────────────

const PLATFORM_EMOJI: Record<string, string> = {
  TikTok:     "🎵",
  Instagram:  "📸",
  YouTube:    "▶️",
  LinkedIn:   "💼",
  "Twitter/X": "𝕏",
};

// ── SVG gauge constants ───────────────────────────────────────────────────────

const SIZE       = 200;
const RADIUS     = 80;
const STROKE     = 12;
const CENTER     = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// ── Component ─────────────────────────────────────────────────────────────────

export default function ScoreGauge({ overallScore, scoreLabel, platform }: ScoreGaugeProps) {
  const displayScore  = useCountUp(overallScore, 1500);
  const labelStyle    = LABEL_STYLES[scoreLabel] ?? LABEL_STYLES["Viral Ready"];
  const platformEmoji = PLATFORM_EMOJI[platform] ?? "📊";

  // strokeDashoffset: full circle = CIRCUMFERENCE (empty), 0 = full
  const targetOffset = CIRCUMFERENCE - (overallScore / 100) * CIRCUMFERENCE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#111] border border-[#222] rounded-2xl p-8 flex flex-col items-center gap-5"
    >
      {/* ── Header label ─────────────────────────────────────────────── */}
      <p className="text-[#555] text-xs uppercase tracking-widest font-medium self-start">
        Virality Score
      </p>

      {/* ── SVG Gauge ────────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
        >
          {/* Background track */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="#222"
            strokeWidth={STROKE}
          />

          {/* Score arc */}
          <motion.circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="#00ff87"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: targetOffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>

        {/* Center content — overlaid on the SVG */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className="font-display text-5xl text-[#00ff87] leading-none">
            {displayScore}
          </span>
          <span className="text-[#555] text-sm mt-0.5">/ 100</span>
        </div>
      </div>

      {/* ── Score label badge ─────────────────────────────────────────── */}
      <span
        className={`border rounded-full px-4 py-1 text-sm font-semibold ${labelStyle}`}
      >
        {scoreLabel}
      </span>

      {/* ── Platform badge ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#222] rounded-full px-4 py-1.5">
        <span className="text-base leading-none">{platformEmoji}</span>
        <span className="text-[#888] text-xs font-medium">
          Analyzed for{" "}
          <span className="text-[#ccc]">{platform}</span>
        </span>
      </div>
    </motion.div>
  );
}
