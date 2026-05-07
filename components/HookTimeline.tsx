"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle2, AlertCircle, Minus } from "lucide-react";

interface TimelineEvent {
  time: string;
  label: string;
  impact: "Positive" | "Negative" | "Neutral";
}

interface HookTimelineProps {
  events: TimelineEvent[];
}

const IMPACT_CONFIG = {
  Positive: { icon: CheckCircle2, color: "text-[#00ff87]", bg: "bg-[#00ff87]/10" },
  Negative: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10" },
  Neutral: { icon: Minus, color: "text-[#555]", bg: "bg-[#555]/10" },
};

export default function HookTimeline({ events }: HookTimelineProps) {
  if (!events || events.length === 0) return null;

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-8">
        <Clock className="text-[#00ff87] w-5 h-5" />
        <h3 className="text-white font-display text-xl uppercase tracking-wider">
          Visual Hook Timeline
        </h3>
      </div>

      <div className="relative pl-4 space-y-8 before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#00ff87] before:via-[#222] before:to-transparent">
        {events.map((event, idx) => {
          const config = IMPACT_CONFIG[event.impact];
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-10"
            >
              {/* Dot */}
              <div className={`absolute left-[-4.5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#111] ${config.color.replace("text-", "bg-")}`} />
              
              <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-[#00ff87]/30 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${config.bg}`}>
                    <config.icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#555] uppercase tracking-[0.2em]">
                      At {event.time}
                    </span>
                    <p className="text-white text-sm font-medium mt-0.5 group-hover:text-[#00ff87] transition-colors">
                      {event.label}
                    </p>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${config.color} ${config.bg} border-current/20`}>
                  {event.impact} Impact
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[10px] text-[#444] mt-8 text-center uppercase tracking-[0.2em]">
        AI-Generated Timeline based on content flow & pacing
      </p>
    </div>
  );
}
