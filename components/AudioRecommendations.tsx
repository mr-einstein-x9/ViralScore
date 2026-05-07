"use client";

import { useState } from "react";
import { Music, Copy, Check, Info } from "lucide-react";
import { TrendingAudio, getTrendingAudio } from "@/lib/trendingAudio";

interface AudioRecommendationsProps {
  platform: string;
}

const SHAKE_STYLE = `
@keyframes wave {
  0%, 100% { height: 4px; }
  50% { height: 16px; }
}
.wave-bar {
  width: 2px;
  background-color: #00ff87;
  border-radius: 1px;
  animation: wave 1s ease-in-out infinite;
}
`;

export default function AudioRecommendations({ platform }: AudioRecommendationsProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [copyAllStatus, setCopyAllStatus] = useState(false);
  const tracks = getTrendingAudio(platform);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = () => {
    const allTracks = tracks.map(t => `${t.name} - ${t.artist}`).join("\n");
    navigator.clipboard.writeText(allTracks);
    setCopyAllStatus(true);
    setTimeout(() => setCopyAllStatus(false), 2000);
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
      <style>{SHAKE_STYLE}</style>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Music className="text-[#00ff87] w-5 h-5" />
          <h3 className="text-white font-display text-xl uppercase tracking-wider">
            Trending Audio
          </h3>
        </div>
        
        <button
          onClick={handleCopyAll}
          className="flex items-center gap-2 px-4 py-1.5 bg-[#1a1a1a] border border-[#333] rounded-full text-[10px] font-bold uppercase tracking-widest text-[#888] hover:border-[#00ff87] hover:text-[#00ff87] transition-all"
        >
          {copyAllStatus ? <Check size={12} /> : <Copy size={12} />}
          {copyAllStatus ? "Copied All" : "Copy All Names"}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar -mx-2 px-2">
          {tracks.map((track, idx) => (
            <div
              key={idx}
              onClick={() => handleCopy(`${track.name} - ${track.artist}`)}
              className="flex-shrink-0 bg-[#1a1a1a] border border-[#222] hover:border-[#00ff87]/50 rounded-xl p-4 w-[240px] cursor-pointer transition-all group relative"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-0.5 h-4 items-center">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="wave-bar"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1 bg-[#00ff87]/10 px-2 py-0.5 rounded-full border border-[#00ff87]/20">
                  <span className="text-[10px] font-bold text-[#00ff87]">
                    {"🔥".repeat(track.trendScore)}
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <p className="text-white font-semibold text-sm truncate">{track.name}</p>
                <p className="text-[#555] text-xs truncate">{track.artist}</p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#222]">
                <span className="text-[10px] text-[#444] uppercase tracking-widest font-bold">
                  {copied === `${track.name} - ${track.artist}` ? "Copied!" : "Click to Copy"}
                </span>
                <Copy size={12} className="text-[#333] group-hover:text-[#00ff87] transition-colors" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 bg-[#1a1a1a]/50 p-3 rounded-lg border border-[#222]">
          <Info size={14} className="text-[#555] mt-0.5" />
          <p className="text-[11px] text-[#555] leading-relaxed">
            Trending audio analysis is updated every 24h. Using these tracks can significantly 
            increase your reach by tapping into active platform discovery algorithms.
          </p>
        </div>
      </div>
    </div>
  );
}
