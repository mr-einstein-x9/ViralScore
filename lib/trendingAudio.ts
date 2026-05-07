/**
 * Mock trending audio data for different platforms with niche-awareness.
 */
export interface TrendingAudio {
  name: string;
  artist: string;
  trendScore: number;
  previewUrl: string;
  platform: string;
  niche: string[];
}

const AUDIO_DATA: TrendingAudio[] = [
  // Fitness
  { name: "Eye of the Tiger", artist: "Survivor", trendScore: 5, previewUrl: "#", platform: "TikTok", niche: ["fitness", "motivation"] },
  { name: "Stronger", artist: "Kanye West", trendScore: 5, previewUrl: "#", platform: "TikTok", niche: ["fitness", "motivation"] },
  { name: "Till I Collapse", artist: "Eminem", trendScore: 4, previewUrl: "#", platform: "TikTok", niche: ["fitness", "motivation"] },
  { name: "Physical", artist: "Dua Lipa", trendScore: 4, previewUrl: "#", platform: "Instagram", niche: ["fitness", "lifestyle"] },
  { name: "Gym Beats Vol 1", artist: "Workout Mix", trendScore: 3, previewUrl: "#", platform: "TikTok", niche: ["fitness"] },

  // Cooking
  { name: "Sugar", artist: "Maroon 5", trendScore: 5, previewUrl: "#", platform: "Instagram", niche: ["cooking", "lifestyle"] },
  { name: "Cooking Show", artist: "Chef Beats", trendScore: 4, previewUrl: "#", platform: "TikTok", niche: ["cooking"] },
  { name: "Bon Appétit", artist: "Katy Perry", trendScore: 4, previewUrl: "#", platform: "TikTok", niche: ["cooking"] },
  { name: "Home", artist: "Edward Sharpe", trendScore: 5, previewUrl: "#", platform: "Instagram", niche: ["cooking", "lifestyle"] },
  { name: "Italian Kitchen", artist: "Acoustic Guitar", trendScore: 3, previewUrl: "#", platform: "TikTok", niche: ["cooking"] },

  // Tech
  { name: "Digital World", artist: "Future Tech", trendScore: 5, previewUrl: "#", platform: "YouTube", niche: ["tech"] },
  { name: "Future", artist: "Electronic Beats", trendScore: 4, previewUrl: "#", platform: "TikTok", niche: ["tech"] },
  { name: "Cyberpunk", artist: "Synthwave Pro", trendScore: 5, previewUrl: "#", platform: "Instagram", niche: ["tech", "gaming"] },
  { name: "Synthwave", artist: "Retro Future", trendScore: 4, previewUrl: "#", platform: "TikTok", niche: ["tech"] },
  { name: "Coding Lofi", artist: "Deep Focus", trendScore: 3, previewUrl: "#", platform: "YouTube", niche: ["tech", "education"] },

  // Comedy
  { name: "Funny Song", artist: "Comedy Gold", trendScore: 5, previewUrl: "#", platform: "TikTok", niche: ["comedy"] },
  { name: "Wah Wah", artist: "Silly Beats", trendScore: 4, previewUrl: "#", platform: "TikTok", niche: ["comedy"] },
  { name: "Comedy Show", artist: "Laugh Track", trendScore: 4, previewUrl: "#", platform: "Instagram", niche: ["comedy"] },
  { name: "Silly", artist: "Goofy Mix", trendScore: 3, previewUrl: "#", platform: "TikTok", niche: ["comedy"] },
  { name: "Prank Call", artist: "Humor Hub", trendScore: 5, previewUrl: "#", platform: "TikTok", niche: ["comedy"] },

  // Motivation
  { name: "Rise Up", artist: "Andra Day", trendScore: 5, previewUrl: "#", platform: "TikTok", niche: ["motivation"] },
  { name: "Unstoppable", artist: "Sia", trendScore: 5, previewUrl: "#", platform: "Instagram", niche: ["motivation", "lifestyle"] },
  { name: "Hall of Fame", artist: "The Script", trendScore: 4, previewUrl: "#", platform: "TikTok", niche: ["motivation"] },
  { name: "Believer", artist: "Imagine Dragons", trendScore: 5, previewUrl: "#", platform: "YouTube", niche: ["motivation"] },
  { name: "Daily Growth", artist: "Morning Vibe", trendScore: 3, previewUrl: "#", platform: "LinkedIn", niche: ["motivation", "education"] },

  // Fashion
  { name: "Vogue", artist: "Madonna", trendScore: 5, previewUrl: "#", platform: "Instagram", niche: ["fashion"] },
  { name: "Runway", artist: "Model Beats", trendScore: 4, previewUrl: "#", platform: "TikTok", niche: ["fashion"] },
  { name: "Style", artist: "Taylor Swift", trendScore: 5, previewUrl: "#", platform: "Instagram", niche: ["fashion", "lifestyle"] },

  // General / Trending
  { name: "Greedy", artist: "Tate McRae", trendScore: 5, previewUrl: "#", platform: "TikTok", niche: ["lifestyle", "dance"] },
  { name: "Water", artist: "Tyla", trendScore: 5, previewUrl: "#", platform: "TikTok", niche: ["lifestyle", "dance"] },
  { name: "Paint The Town Red", artist: "Doja Cat", trendScore: 5, previewUrl: "#", platform: "TikTok", niche: ["lifestyle"] },
  { name: "Cruel Summer", artist: "Taylor Swift", trendScore: 5, previewUrl: "#", platform: "Instagram", niche: ["lifestyle"] },
];

/**
 * Returns mock trending audio for a given platform, optionally filtered by niche.
 */
export function getTrendingAudio(platform: string, niche?: string): TrendingAudio[] {
  const platformTracks = AUDIO_DATA.filter(t => t.platform === platform);
  
  if (niche) {
    const nicheTracks = platformTracks.filter(t => t.niche.includes(niche.toLowerCase()));
    const otherTracks = platformTracks.filter(t => !t.niche.includes(niche.toLowerCase()));
    
    // Mix niche tracks first, then others to fill a reasonable set (e.g., 6 tracks)
    const combined = [...nicheTracks, ...otherTracks];
    return combined.slice(0, 6);
  }

  // If no niche, return a shuffled/varied mix
  return platformTracks.sort(() => Math.random() - 0.5).slice(0, 6);
}
