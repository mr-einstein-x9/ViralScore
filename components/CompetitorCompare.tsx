"use client";

import { motion } from "framer-motion";
import { Users, Info } from "lucide-react";
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
}

export default function CompetitorCompare({
  summary,
  competitorMetrics,
  userMetrics,
  competitorNames,
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
    <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="text-[#00ff87] w-5 h-5" />
        <h4 className="text-white font-display text-lg uppercase tracking-wider">
          Competitor Comparison
        </h4>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#555", fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="You"
                dataKey="user"
                stroke="#00ff87"
                fill="#00ff87"
                fillOpacity={0.4}
              />
              <Radar
                name="Competitors"
                dataKey="comp"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {competitorNames.map((name, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-[#222] border border-[#333] rounded-full text-[10px] text-[#888] font-bold uppercase tracking-widest"
              >
                {name}
              </span>
            ))}
          </div>

          <div className="bg-[#111] p-4 rounded-xl border border-[#222]">
            <p className="text-[#888] text-xs leading-relaxed italic">
              "{summary}"
            </p>
          </div>

          <div className="flex items-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00ff87]" />
              <span className="text-[10px] text-[#555] font-bold uppercase">Your Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <span className="text-[10px] text-[#555] font-bold uppercase">Average Competitor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
