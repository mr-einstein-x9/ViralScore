"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// ── Props ─────────────────────────────────────────────────────────────────────

interface ScoreGaugeProps {
  overallScore: number;
  scoreLabel: string;
  platform: string;
  scoreColor?: "red" | "orange" | "yellow" | "lime" | "green";
  oneLiner?: string;
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

// ── Premium Color Themes ───────────────────────────────────────────────────────

const COLOR_THEMES = {
  red: {
    stroke: "#ef4444",
    text: "text-red-400",
    border: "border-red-900/30",
    bg: "bg-red-950/20",
    glow: "rgba(239, 68, 68, 0.15)"
  },
  orange: {
    stroke: "#f97316",
    text: "text-orange-400",
    border: "border-orange-900/30",
    bg: "bg-orange-950/20",
    glow: "rgba(249, 115, 22, 0.15)"
  },
  yellow: {
    stroke: "#eab308",
    text: "text-yellow-400",
    border: "border-yellow-900/30",
    bg: "bg-yellow-950/20",
    glow: "rgba(234, 179, 8, 0.15)"
  },
  lime: {
    stroke: "#84cc16",
    text: "text-lime-400",
    border: "border-lime-900/30",
    bg: "bg-lime-950/20",
    glow: "rgba(132, 204, 22, 0.15)"
  },
  green: {
    stroke: "#00ff87",
    text: "text-[#00ff87]",
    border: "border-[#00ff87]/30",
    bg: "bg-[#00ff87]/10",
    glow: "rgba(0, 255, 135, 0.15)"
  }
};

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

export default function ScoreGauge({ overallScore, scoreLabel, platform, scoreColor, oneLiner }: ScoreGaugeProps) {
  const displayScore  = useCountUp(overallScore, 1500);
  
  // Decide the theme color based on scoreColor mapping or fallback
  const theme = scoreColor && COLOR_THEMES[scoreColor]
    ? COLOR_THEMES[scoreColor]
    : overallScore >= 90
    ? COLOR_THEMES.green
    : overallScore >= 75
    ? COLOR_THEMES.lime
    : overallScore >= 60
    ? COLOR_THEMES.yellow
    : overallScore >= 40
    ? COLOR_THEMES.orange
    : COLOR_THEMES.red;

  const labelStyle = scoreColor
    ? `${theme.bg} ${theme.text} ${theme.border}`
    : LABEL_STYLES[scoreLabel] ?? LABEL_STYLES["Viral Ready"];
    
  const platformEmoji = PLATFORM_EMOJI[platform] ?? "📊";

  // strokeDashoffset: full circle = CIRCUMFERENCE (empty), 0 = full
  const targetOffset = CIRCUMFERENCE - (overallScore / 100) * CIRCUMFERENCE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-5 relative overflow-hidden"
    >
      {/* Dynamic Glow Background */}
      <div 
        className="absolute w-[200px] h-[200px] rounded-full blur-[100px] pointer-events-none -bottom-10 opacity-30 transition-all duration-700" 
        style={{ backgroundColor: theme.stroke }}
      />

      {/* ── Header label ─────────────────────────────────────────────── */}
      <div className="w-full flex items-center justify-between">
        <p className="text-[#555] text-xs uppercase tracking-widest font-medium">
          Virality Score
        </p>
        <span className="text-[10px] font-bold tracking-wider uppercase text-[#444] border border-[#222] px-2 py-0.5 rounded-md">
          Calibrated
        </span>
      </div>

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
            stroke="#1a1a1a"
            strokeWidth={STROKE}
          />

          {/* Score arc */}
          <motion.circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={theme.stroke}
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
          <span 
            className="font-display text-5xl leading-none transition-colors duration-500"
            style={{ color: theme.stroke }}
          >
            {displayScore}
          </span>
          <span className="text-[#555] text-sm mt-0.5">/ 100</span>
        </div>
      </div>

      {/* ── Score label badge ─────────────────────────────────────────── */}
      <span
        className={`border rounded-full px-5 py-1 text-sm font-semibold transition-all duration-500 ${labelStyle}`}
      >
        {scoreLabel}
      </span>

      {/* ── Platform badge ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 bg-[#161616] border border-[#222] rounded-full px-4 py-1.5 z-10">
        <span className="text-base leading-none">{platformEmoji}</span>
        <span className="text-[#888] text-xs font-medium">
          Platform: <span className="text-white">{platform}</span>
        </span>
      </div>

      {/* ── Dynamic One Liner Card ─────────────────────────────────────── */}
      {oneLiner && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full mt-2 bg-[#161616]/80 backdrop-blur-md border border-[#222] rounded-xl p-4 flex items-start gap-3 z-10"
        >
          <div 
            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-pulse" 
            style={{ backgroundColor: theme.stroke, boxShadow: `0 0 8px ${theme.stroke}` }}
          />
          <p className="text-[#ccc] text-xs sm:text-sm leading-relaxed font-medium italic">
            &ldquo;{oneLiner}&rdquo;
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
