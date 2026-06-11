"use client";

import { useState } from "react";
import { Music, Copy, Check, Info, Flame, Search } from "lucide-react";
import { getTrendingAudio } from "@/lib/trendingAudio";

interface AudioRecommendationsProps {
  platform: string;
  trendingAudioNew?: {
    audioType: string;
    energyMatch: string;
    whyItWorks: string;
    platformTip: string;
    sampleSearchTerms: string[];
  };
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

export default function AudioRecommendations({ platform, trendingAudioNew }: AudioRecommendationsProps) {
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);
  const legacyTracks = getTrendingAudio(platform);

  const handleCopyTerm = (term: string) => {
    navigator.clipboard.writeText(term);
    setCopiedTerm(term);
    setTimeout(() => setCopiedTerm(null), 1800);
  };

  const getEnergyBadgeClass = (energy: string) => {
    switch (energy?.toLowerCase()) {
      case "high":
        return "bg-red-500/15 text-red-400 border border-red-500/30";
      case "medium":
        return "bg-orange-500/15 text-orange-400 border border-orange-500/30";
      case "low":
        return "bg-blue-500/15 text-blue-400 border border-blue-500/30";
      default:
        return "bg-[#1a1a1a] text-[#888] border border-[#333]";
    }
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
      <style>{SHAKE_STYLE}</style>
      
      {/* Header */}
      <div className="flex items-center gap-2">
        <Music className="text-[#00ff87] w-5 h-5 animate-pulse" />
        <h3 className="text-white font-display text-xl uppercase tracking-wider">
          Audio Strategy
        </h3>
      </div>

      {trendingAudioNew ? (
        /* Upgraded AI Dynamic Audio Recommendations */
        <div className="flex flex-col gap-4">
          
          {/* Vibe and Energy Box */}
          <div className="bg-[#161616] border border-[#222] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-[#555] uppercase tracking-wider">Recommended Vibe</span>
              <h4 className="text-white font-bold text-base mt-0.5">{trendingAudioNew.audioType}</h4>
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${getEnergyBadgeClass(trendingAudioNew.energyMatch)}`}>
                <Flame size={12} />
                Energy: {trendingAudioNew.energyMatch}
              </span>
            </div>
          </div>

          {/* Why It Works & Search Guidance */}
          <div className="bg-[#161616]/40 border border-[#222] rounded-xl p-4 flex flex-col gap-3">
            <div>
              <span className="text-[10px] font-bold text-[#555] uppercase tracking-wider">Why it fits</span>
              <p className="text-[#ccc] text-xs sm:text-sm leading-relaxed mt-1">{trendingAudioNew.whyItWorks}</p>
            </div>

            <div className="border-t border-[#222] pt-3">
              <span className="text-[10px] font-bold text-[#555] uppercase tracking-wider">How to locate</span>
              <p className="text-[#888] text-xs leading-relaxed mt-1">{trendingAudioNew.platformTip}</p>
            </div>
          </div>

          {/* Interactive Search Term Chips */}
          {trendingAudioNew.sampleSearchTerms && trendingAudioNew.sampleSearchTerms.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-[#555] uppercase tracking-wider flex items-center gap-1">
                <Search size={10} />
                Click to copy search queries
              </span>
              <div className="flex flex-wrap gap-2">
                {trendingAudioNew.sampleSearchTerms.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => handleCopyTerm(term)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all flex items-center gap-2 ${
                      copiedTerm === term 
                        ? "border-[#00ff87] text-[#00ff87] bg-[#00ff87]/5" 
                        : "border-[#2c2c2c] text-[#aaa] bg-[#1a1a1a] hover:border-[#00ff87] hover:text-[#00ff87]"
                    }`}
                  >
                    <span>{term}</span>
                    {copiedTerm === term ? <Check size={11} /> : <Copy size={11} className="opacity-40 group-hover:opacity-100" />}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Legacy Shuffled Platform Recommendations (Fallback) */
        <div className="flex flex-col gap-3">
          <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar -mx-2 px-2">
            {legacyTracks.map((track, idx) => {
              const copyText = `${track.name} - ${track.artist}`;
              return (
                <div
                  key={idx}
                  onClick={() => handleCopyTerm(copyText)}
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
                      {copiedTerm === copyText ? "Copied!" : "Click to Copy"}
                    </span>
                    <Copy size={12} className="text-[#333] group-hover:text-[#00ff87] transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-start gap-2 bg-[#1a1a1a]/50 p-3 rounded-lg border border-[#222]">
            <Info size={14} className="text-[#555] mt-0.5" />
            <p className="text-[11px] text-[#555] leading-relaxed">
              Trending audio analysis is updated every 24h. Using these tracks can significantly 
              increase your reach by tapping into active platform discovery algorithms.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
