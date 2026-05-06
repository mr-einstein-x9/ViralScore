"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Upload, Zap, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";

// ── Animation Variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ── Animated Count-Up Hook ────────────────────────────────────────────────────

function useCountUp(target: string, inView: boolean) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;

    const numericPart = parseFloat(target.replace(/[^0-9.]/g, ""));
    const suffix = target.replace(/[0-9.]/g, "");
    const duration = 1400;
    const steps = 60;
    const increment = numericPart / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, numericPart);
      const rounded = Number.isInteger(numericPart)
        ? Math.round(current)
        : current.toFixed(0);
      setDisplay(`${rounded}${suffix}`);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [inView, target]);

  return display;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  value,
  label,
  inView,
}: {
  value: string;
  label: string;
  inView: boolean;
}) {
  const displayValue = useCountUp(value, inView);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-display text-4xl sm:text-5xl text-[#00ff87] leading-none">
        {displayValue}
      </span>
      <span className="text-[#888] text-xs uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

// ── Step Card ─────────────────────────────────────────────────────────────────

const steps = [
  {
    icon: Upload,
    title: "Drop Your Content",
    desc: "Paste a caption, video URL, or upload an image",
    number: "01",
  },
  {
    icon: Zap,
    title: "AI Analyzes It",
    desc: "Gemini AI scores 6 key virality metrics instantly",
    number: "02",
  },
  {
    icon: TrendingUp,
    title: "Get Actionable Feedback",
    desc: "Specific suggestions, hashtags, and rewrites — not generic tips",
    number: "03",
  },
];

// ── Metric Cards ──────────────────────────────────────────────────────────────

const metrics = [
  {
    emoji: "🎣",
    name: "Hook Strength",
    desc: "First 3 seconds. Make or break.",
  },
  {
    emoji: "❤️‍🔥",
    name: "Emotional Trigger",
    desc: "Does it make people feel something?",
  },
  {
    emoji: "💡",
    name: "Caption Clarity",
    desc: "Clear message = more shares",
  },
  {
    emoji: "📈",
    name: "Trending Relevance",
    desc: "Are you riding the right wave?",
  },
  {
    emoji: "🎯",
    name: "Call to Action",
    desc: "Tell people what to do next",
  },
  {
    emoji: "🖼️",
    name: "Thumbnail Rating",
    desc: "Stop the scroll before a word is read",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  // Refs for scroll-triggered sections
  const statsRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });
  const howInView = useInView(howRef, { once: true, margin: "-80px" });
  const metricsInView = useInView(metricsRef, { once: true, margin: "-80px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" });

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0]">
      <Navbar />

      {/* ════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ════════════════════════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 pt-24 pb-16 text-center overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,135,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,135,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00ff87]/5 blur-[120px] pointer-events-none" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col items-center gap-6 max-w-5xl mx-auto"
        >
          {/* 1. Eyebrow badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-block border border-[#00ff87]/30 text-[#00ff87] text-xs px-3 py-1 rounded-full bg-[#00ff87]/5 tracking-wide">
              AI-Powered · Free to Use
            </span>
          </motion.div>

          {/* 2. Main headline */}
          <motion.div variants={itemVariants} className="flex flex-col items-center">
            <h1
              className="font-display text-white leading-none uppercase"
              style={{ fontSize: "clamp(4rem, 10vw, 8rem)" }}
            >
              Will Your Content
            </h1>
            <h1
              className="font-display text-[#00ff87] leading-none uppercase"
              style={{ fontSize: "clamp(4rem, 10vw, 8rem)" }}
            >
              Go Viral?
            </h1>
          </motion.div>

          {/* 3. Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-[#888] text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Paste your caption, drop a video link, or upload an image.
            <br className="hidden sm:block" />
            Our AI scores your viral potential in seconds — with specific
            feedback on hook strength, captions, hashtags, and more.
          </motion.p>

          {/* 4. CTA row */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 mt-2"
          >
            <Link
              href="/analyze"
              className="font-display text-xl bg-[#00ff87] text-black px-8 py-4 rounded-full hover:bg-white hover:scale-105 transition-all duration-200 tracking-wide"
            >
              Analyze My Content →
            </Link>
            <a
              href="#how-it-works"
              className="text-[#888] hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              See how it works ↓
            </a>
          </motion.div>

          {/* 5. Stats row */}
          <motion.div
            variants={itemVariants}
            ref={statsRef}
            className="flex flex-col sm:flex-row items-center gap-10 sm:gap-16 mt-10 pt-10 border-t border-[#222] w-full justify-center"
          >
            <StatCard value="59M+" label="Views Analyzed" inView={statsInView} />
            <div className="hidden sm:block w-px h-10 bg-[#222]" />
            <StatCard value="94%" label="Accuracy Rate" inView={statsInView} />
            <div className="hidden sm:block w-px h-10 bg-[#222]" />
            <StatCard value="10sec" label="Average Analysis Time" inView={statsInView} />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2 — HOW IT WORKS
      ════════════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="py-24 px-4 bg-[#050505] border-t border-[#222]"
        ref={howRef}
      >
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={howInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="font-display uppercase leading-none" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
              <span className="text-white">Three Steps.</span>{" "}
              <span className="text-[#00ff87]">Real Results.</span>
            </h2>
          </motion.div>

          {/* Step cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate={howInView ? "visible" : "hidden"}
                  className="relative bg-[#111] border border-[#222] rounded-2xl p-6 overflow-hidden
                             hover:border-[#00ff87]/40 transition-all duration-300 group"
                >
                  {/* Big step number watermark */}
                  <span className="absolute top-4 right-4 font-display text-6xl text-[#00ff87]/20 leading-none select-none">
                    {step.number}
                  </span>

                  <div className="mb-4 w-12 h-12 rounded-xl bg-[#00ff87]/10 flex items-center justify-center group-hover:bg-[#00ff87]/20 transition-colors duration-300">
                    <Icon size={22} className="text-[#00ff87]" />
                  </div>

                  <h3 className="text-white font-semibold text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[#888] text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 3 — METRICS PREVIEW
      ════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 border-t border-[#222]" ref={metricsRef}>
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={metricsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2
              className="font-display text-white uppercase leading-none"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
            >
              What We{" "}
              <span className="text-[#00ff87]">Analyze</span>
            </h2>
            <p className="mt-4 text-[#888] text-base max-w-xl mx-auto">
              Six precision signals. Each one tells you exactly why content
              wins — or dies.
            </p>
          </motion.div>

          {/* Metric cards — 2x3 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.name}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={metricsInView ? "visible" : "hidden"}
                className="bg-[#111] border border-[#222] rounded-2xl p-6
                           hover:border-[#00ff87]/40 transition-all duration-300 group"
              >
                <div className="text-3xl mb-4">{metric.emoji}</div>
                <h3 className="font-semibold text-white text-base mb-1">
                  {metric.name}
                </h3>
                <p className="text-[#888] text-sm leading-relaxed">
                  {metric.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 4 — CTA BANNER
      ════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-[#00ff87]" ref={ctaRef}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2
            className="font-display text-black uppercase leading-none"
            style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
          >
            Ready to go viral?
          </h2>

          <p className="mt-4 text-black/70 text-lg font-medium">
            Free to use. No account needed. Results in 10 seconds.
          </p>

          <Link
            href="/analyze"
            className="inline-block mt-8 bg-black text-[#00ff87] font-display text-2xl uppercase px-10 py-4 rounded-full
                       hover:bg-[#0a0a0a] transition-all duration-200 hover:scale-105 tracking-wide"
          >
            Analyze My Content
          </Link>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════ */}
      <footer className="bg-[#050505] border-t border-[#222] py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left — Logo + tagline */}
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl text-[#00ff87] leading-none">
              VIRAL
            </span>
            <span className="font-display text-2xl text-white leading-none">
              SCORE
            </span>
            <span className="text-[#444] text-xs ml-3 font-medium">
              Built for 8xEngineer Contest
            </span>
          </div>

          {/* Center — Copyright */}
          <p className="text-[#444] text-sm order-last md:order-none">
            © {new Date().getFullYear()} ViralScore. All rights reserved.
          </p>

          {/* Right — Attribution */}
          <div className="flex items-center gap-2 text-[#888] text-xs font-medium">
            <span>Powered by</span>
            <span className="text-[#00ff87] font-semibold">
              Google Gemini 2.0 Flash
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
