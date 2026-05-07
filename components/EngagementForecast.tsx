"use client";

import { motion } from "framer-motion";
import { Users, Heart, MessageSquare, Share2, TrendingUp } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";

interface ForecastData {
  min: number;
  max: number;
  confidence: "Low" | "Moderate" | "High";
}

interface EngagementForecastProps {
  views: ForecastData;
  likes: ForecastData;
  comments: ForecastData;
  shares: ForecastData;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const CONFIDENCE_COLORS = {
  Low: "text-red-400 bg-red-400/10 border-red-400/20",
  Moderate: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  High: "text-[#00ff87] bg-[#00ff87]/10 border-[#00ff87]/20",
};

export default function EngagementForecast({
  views,
  likes,
  comments,
  shares,
}: EngagementForecastProps) {
  const stats = [
    { label: "Views", data: views, icon: Users, color: "#00ff87" },
    { label: "Likes", data: likes, icon: Heart, color: "#ff3d00" },
    { label: "Comments", data: comments, icon: MessageSquare, color: "#3b82f6" },
    { label: "Shares", data: shares, icon: Share2, color: "#a855f7" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="text-[#00ff87] w-5 h-5" />
        <h3 className="text-white font-display text-xl uppercase tracking-wider">
          Engagement Forecast
        </h3>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => {
          const chartData = [
            { name: "Min", value: stat.data.min },
            { name: "Max", value: stat.data.max },
          ];

          return (
            <motion.div
              key={stat.label}
              variants={item}
              className="bg-[#1a1a1a] border border-[#222] rounded-xl p-4 flex flex-col gap-4"
            >
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-[#222]">
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-widest ${
                    CONFIDENCE_COLORS[stat.data.confidence]
                  }`}
                >
                  {stat.data.confidence}
                </span>
              </div>

              <div>
                <p className="text-[#555] text-xs uppercase tracking-widest font-medium mb-1">
                  Predicted {stat.label}
                </p>
                <p className="text-xl font-display text-white">
                  {formatNumber(stat.data.min)} – {formatNumber(stat.data.max)}
                </p>
              </div>

              <div className="h-12 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 1 ? stat.color : `${stat.color}33`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
