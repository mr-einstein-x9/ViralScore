"use client";

import { motion } from "framer-motion";
import { Clock, Layers, Share2 } from "lucide-react";

interface PostingStrategyProps {
  bestTime: string;
  contentFormat: string;
  crossPlatformPotential: string;
}

export default function PostingStrategy({
  bestTime,
  contentFormat,
  crossPlatformPotential
}: PostingStrategyProps) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#222] pb-4">
        <h3 className="text-white font-display text-xl uppercase tracking-wider flex items-center gap-2">
          📬 Distribution Strategy
        </h3>
        <span className="text-[10px] font-bold tracking-wider uppercase text-[#555] border border-[#222] px-2 py-0.5 rounded-md">
          Algorithmic Schedule
        </span>
      </div>

      {/* Grid of Strategy Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Best Time Card */}
        <div className="bg-[#161616] border border-[#222] rounded-xl p-4 flex flex-col gap-3 hover:border-[#00ff87]/30 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-[#00ff87]/10 flex items-center justify-center flex-shrink-0 border border-[#00ff87]/20">
            <Clock size={16} className="text-[#00ff87]" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-[#555] uppercase tracking-wider block">Optimal Posting Window</span>
            <p className="text-white text-sm font-semibold mt-1">{bestTime}</p>
          </div>
        </div>

        {/* Content Format Card */}
        <div className="bg-[#161616] border border-[#222] rounded-xl p-4 flex flex-col gap-3 hover:border-blue-500/30 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
            <Layers size={16} className="text-blue-400" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-[#555] uppercase tracking-wider block">Recommended Layout/Format</span>
            <p className="text-white text-sm font-semibold mt-1">{contentFormat}</p>
          </div>
        </div>

        {/* Cross Platform Card */}
        <div className="bg-[#161616] border border-[#222] rounded-xl p-4 flex flex-col gap-3 hover:border-yellow-500/30 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0 border border-yellow-500/20">
            <Share2 size={16} className="text-yellow-400" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-[#555] uppercase tracking-wider block">Repurposing Strategy</span>
            <p className="text-white text-xs mt-1 leading-relaxed">{crossPlatformPotential}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
