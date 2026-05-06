"use client";

import { motion } from "framer-motion";

// ── Props ─────────────────────────────────────────────────────────────────────

interface MetricsGridProps {
  hookStrength:      number;
  captionClarity:    number;
  emotionalTrigger:  number;
  trendingRelevance: number;
  callToAction:      number;
  thumbnailRating:   number;
}

// ── Metric definitions ────────────────────────────────────────────────────────

const METRICS = [
  { key: "hookStrength",      emoji: "🎣",   label: "Hook Strength"      },
  { key: "captionClarity",    emoji: "💡",   label: "Caption Clarity"    },
  { key: "emotionalTrigger",  emoji: "❤️‍🔥", label: "Emotional Trigger"  },
  { key: "trendingRelevance", emoji: "📈",   label: "Trending Relevance" },
  { key: "callToAction",      emoji: "🎯",   label: "Call to Action"     },
  { key: "thumbnailRating",   emoji: "🖼️",  label: "Thumbnail Rating"   },
] as const;

// ── Score status ──────────────────────────────────────────────────────────────

function getStatus(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Excellent ✓", color: "text-[#00ff87]"  };
  if (score >= 70) return { label: "Strong",       color: "text-green-400"  };
  if (score >= 40) return { label: "Average",      color: "text-yellow-400" };
  return               { label: "Needs Work",      color: "text-red-400"    };
}

// ── Animation variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// ── Metric Card ───────────────────────────────────────────────────────────────

function MetricCard({
  emoji,
  label,
  score,
  barDelay,
}: {
  emoji: string;
  label: string;
  score: number;
  barDelay: number;
}) {
  const status = getStatus(score);

  return (
    <motion.div
      variants={cardVariants}
      className="bg-[#111] border border-[#222] rounded-2xl p-4 sm:p-5 flex flex-col gap-3
                 hover:border-[#00ff87]/30 transition-all duration-200 group"
    >
      {/* Row 1 — emoji + name */}
      <div className="flex items-center gap-2">
        <span className="text-xl sm:text-2xl leading-none">{emoji}</span>
        <span className="text-[#888] font-medium text-xs sm:text-sm">{label}</span>
      </div>

      {/* Row 2 — score number */}
      <div className="flex items-baseline gap-1">
        <span className="font-display text-3xl sm:text-4xl text-[#00ff87] leading-none">
          {score}
        </span>
        <span className="text-[#555] text-sm">/100</span>
      </div>

      {/* Row 3 — animated progress bar */}
      <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #00ff87, #00d4ff)" }}
          initial={{ width: "0%" }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: barDelay }}
        />
      </div>

      {/* Row 4 — status label */}
      <span className={`text-xs font-semibold ${status.color}`}>
        {status.label}
      </span>
    </motion.div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MetricsGrid(props: MetricsGridProps) {
  const scores: Record<string, number> = {
    hookStrength:      props.hookStrength,
    captionClarity:    props.captionClarity,
    emotionalTrigger:  props.emotionalTrigger,
    trendingRelevance: props.trendingRelevance,
    callToAction:      props.callToAction,
    thumbnailRating:   props.thumbnailRating,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-base">Metric Breakdown</h2>
        <span className="text-[#555] text-xs">6 signals analyzed</span>
      </div>

      {/* Always 2-col grid — even on mobile (grid-cols-2 no override) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3 sm:gap-4"
      >
        {METRICS.map((metric, i) => (
          <MetricCard
            key={metric.key}
            emoji={metric.emoji}
            label={metric.label}
            score={scores[metric.key]}
            barDelay={i * 0.1}
          />
        ))}
      </motion.div>
    </div>
  );
}
