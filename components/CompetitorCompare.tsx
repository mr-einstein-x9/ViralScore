"use client";

import { motion } from "framer-motion";
import { Users, Info, ShieldAlert, TrendingUp } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface CompetitorCompareProps {
  summary: string;
  competitorMetrics: {
    hookStrength: number;
    captionClarity: number;
    emotionalTrigger: number;
    trendingRelevance: number;
    callToAction: number;
    thumbnailRating: number;
  };
  userMetrics: {
    hookStrength: number;
    captionClarity: number;
    emotionalTrigger: number;
    trendingRelevance: number;
    callToAction: number;
    thumbnailRating: number;
  };
  competitorNames: string[];
  competitorBenchmarkNew?: {
    contentTier: string;
    percentileEstimate: number;
    howYouCompare: string;
    topPerformerTraits: string[];
    gapAnalysis: string;
  };
}

export default function CompetitorCompare({
  summary,
  competitorMetrics,
  userMetrics,
  competitorNames,
  competitorBenchmarkNew
}: CompetitorCompareProps) {
  const data = [
    { subject: "Hook", user: userMetrics.hookStrength, comp: competitorMetrics.hookStrength, fullMark: 100 },
    { subject: "Caption", user: userMetrics.captionClarity, comp: competitorMetrics.captionClarity, fullMark: 100 },
    { subject: "Emotion", user: userMetrics.emotionalTrigger, comp: competitorMetrics.emotionalTrigger, fullMark: 100 },
    { subject: "Trend", user: userMetrics.trendingRelevance, comp: competitorMetrics.trendingRelevance, fullMark: 100 },
    { subject: "CTA", user: userMetrics.callToAction, comp: competitorMetrics.callToAction, fullMark: 100 },
    { subject: "Visuals", user: userMetrics.thumbnailRating, comp: competitorMetrics.thumbnailRating, fullMark: 100 },
  ];

  return (
    <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-5 sm:p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <Users className="text-[#00ff87] w-5 h-5" />
          <h4 className="text-white font-display text-lg uppercase tracking-wider">
            Competitor Intel
          </h4>
        </div>
        
        {/* Visual Content Tier Badge */}
        {competitorBenchmarkNew && (
          <span className="bg-[#00ff87]/15 text-[#00ff87] border border-[#00ff87]/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            {competitorBenchmarkNew.contentTier}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Radar Chart */}
        <div className="lg:col-span-5 h-[230px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#262626" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#666", fontSize: 9, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="You"
                dataKey="user"
                stroke="#00ff87"
                fill="#00ff87"
                fillOpacity={0.25}
              />
              <Radar
                name="Competitors"
                dataKey="comp"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.25}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Right Column: Comparative Metrics and Gap Analysis */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Percentile Estimate Progress Bar */}
          {competitorBenchmarkNew && (
            <div className="bg-[#111] border border-[#222] rounded-xl p-3 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold uppercase text-[9px] tracking-wider flex items-center gap-1">
                  <TrendingUp size={10} className="text-[#00ff87]" />
                  Virality Percentile
                </span>
                <span className="text-white font-bold">{competitorBenchmarkNew.percentileEstimate}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${competitorBenchmarkNew.percentileEstimate}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-[#00ff87] rounded-full"
                />
              </div>
            </div>
          )}

          {/* Gap Analysis Box (High priority alert) */}
          {competitorBenchmarkNew?.gapAnalysis ? (
            <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
              <ShieldAlert className="text-red-400 w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-red-400 text-[9px] font-bold uppercase tracking-wider">Critical Performance Gap</span>
                <p className="text-[#eee] text-xs leading-relaxed mt-1">{competitorBenchmarkNew.gapAnalysis}</p>
              </div>
            </div>
          ) : (
            <div className="bg-[#111] p-4 rounded-xl border border-[#222]">
              <p className="text-[#888] text-xs leading-relaxed italic">
                &ldquo;{summary}&rdquo;
              </p>
            </div>
          )}

          {/* How you compare summary */}
          {competitorBenchmarkNew && (
            <div className="text-xs text-[#aaa] leading-relaxed p-1">
              {competitorBenchmarkNew.howYouCompare}
            </div>
          )}

          {/* Competitor / Benchmark Tags */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {(competitorBenchmarkNew?.topPerformerTraits || competitorNames).map((trait, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-[#161616] border border-[#222] rounded-full text-[9px] text-[#888] font-bold uppercase tracking-widest"
              >
                {trait}
              </span>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-1.5 border-t border-[#222] pt-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00ff87]" />
              <span className="text-[9px] text-gray-500 font-bold uppercase">Your Content</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-[9px] text-gray-500 font-bold uppercase">Top 10% Competitors</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
