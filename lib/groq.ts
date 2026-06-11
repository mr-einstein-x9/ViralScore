import Groq from "groq-sdk";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ViralAnalysis = {
  // Legacy fields (kept for backward compatibility and to avoid breaking client views/history)
  overallScore:       number;
  scoreLabel:         string;
  platform:           string;
  hookStrength:       number;
  captionClarity:     number;
  emotionalTrigger:   number;
  trendingRelevance:  number;
  callToAction:       number;
  thumbnailRating:    number;
  hookAnalysis:       string;
  captionSuggestions: string[];
  captionRewrites:    string[];
  hashtags:           string[];
  competitorInsight: {
    summary: string;
    competitorMetrics: {
      hookStrength: number;
      captionClarity: number;
      emotionalTrigger: number;
      trendingRelevance: number;
      callToAction: number;
      thumbnailRating: number;
    };
    competitorNames: string[];
  };
  improvements:       string[];
  strengths:          string[];
  hookTimeline:       { time: string; label: string; impact: "Positive" | "Negative" | "Neutral" }[];
  predictedViews:     { min: number; max: number; confidence: "Low" | "Moderate" | "High" };
  predictedLikes:     { min: number; max: number; confidence: "Low" | "Moderate" | "High" };
  predictedComments:  { min: number; max: number; confidence: "Low" | "Moderate" | "High" };
  predictedShares:    { min: number; max: number; confidence: "Low" | "Moderate" | "High" };

  // New Rich Fields (populated by the upgraded contest-optimized prompt)
  scoreColor?:        "red" | "orange" | "yellow" | "lime" | "green";
  oneLiner?:          string;
  
  metricsNew?: {
    hookStrength: {
      score: number;
      label: string;
      first3SecondsAnalysis: string;
      improvedHook: string;
    };
    captionClarity: {
      score: number;
      label: string;
      analysis: string;
      rewrittenCaption: string;
    };
    thumbnailRating: {
      score: number;
      label: string;
      analysis: string;
      improvements: string[];
    };
    emotionalTrigger: {
      score: number;
      label: string;
      dominantEmotion: string;
      analysis: string;
      amplificationTip: string;
    };
    pacing: {
      score: number;
      label: string;
      analysis: string;
      recommendation: string;
    };
    callToAction: {
      score: number;
      label: string;
      analysis: string;
      improvedCta: string;
    };
    trendingRelevance: {
      score: number;
      label: string;
      analysis: string;
    };
  };

  hashtagsNew?: {
    primary: string[];
    secondary: string[];
    niche: string[];
    strategy: string;
  };

  trendingAudioNew?: {
    audioType: string;
    energyMatch: string;
    whyItWorks: string;
    platformTip: string;
    sampleSearchTerms: string[];
  };

  competitorBenchmarkNew?: {
    contentTier: string;
    percentileEstimate: number;
    howYouCompare: string;
    topPerformerTraits: string[];
    gapAnalysis: string;
  };

  top3Actions?: {
    priority: number;
    action: string;
    expectedImpact: string;
  }[];

  platformSpecificTips?: string[];

  postingStrategy?: {
    bestTime: string;
    contentFormat: string;
    crossPlatformPotential: string;
  };
};

// ── Params ────────────────────────────────────────────────────────────────────

type AnalyzeContentParams = {
  contentType: "caption" | "video_url" | "image_url";
  content:     string;
  platform:    "TikTok" | "Instagram" | "YouTube" | "LinkedIn" | "Twitter/X";
  context?:    string;
  fileData?:   string; // base64
};

// ── Engagement Predictor Helper ───────────────────────────────────────────────

function calculatePredictedEngagement(
  type: "views" | "likes" | "comments" | "shares",
  platform: string,
  score: number
) {
  let baseViews = 0;
  if (platform === "TikTok") baseViews = 5000;
  else if (platform === "YouTube") baseViews = 4000;
  else if (platform === "Instagram") baseViews = 3000;
  else if (platform === "Twitter/X") baseViews = 2000;
  else baseViews = 1200; // LinkedIn

  // Non-linear scaling for virality: higher scores get exponentially higher views!
  const multiplier = Math.pow(score / 70, 3.5);
  const viewsMin = Math.round(baseViews * multiplier * 0.6);
  const viewsMax = Math.round(baseViews * multiplier * 1.6);
  
  let min = 0;
  let max = 0;
  if (type === "views") {
    min = viewsMin;
    max = viewsMax;
  } else if (type === "likes") {
    let rate = 0.08;
    if (platform === "TikTok") rate = 0.15;
    else if (platform === "Instagram") rate = 0.10;
    else if (platform === "LinkedIn") rate = 0.05;
    min = Math.round(viewsMin * rate * 0.8);
    max = Math.round(viewsMax * rate * 1.2);
  } else if (type === "comments") {
    let rate = 0.008;
    if (platform === "TikTok") rate = 0.012;
    else if (platform === "LinkedIn") rate = 0.02;
    min = Math.round(viewsMin * rate * 0.7);
    max = Math.round(viewsMax * rate * 1.3);
  } else { // shares
    let rate = 0.015;
    if (platform === "TikTok") rate = 0.03;
    else if (platform === "Instagram") rate = 0.025;
    min = Math.round(viewsMin * rate * 0.7);
    max = Math.round(viewsMax * rate * 1.3);
  }

  min = Math.max(1, min);
  max = Math.max(min + 5, max);

  const confidence: "Low" | "Moderate" | "High" = score >= 85 ? "High" : score >= 60 ? "Moderate" : "Low";
  return { min, max, confidence };
}

// ── Validation guard ──────────────────────────────────────────────────────────

function validateApiResponse(obj: any): boolean {
  if (!obj || typeof obj !== "object") return false;
  
  // Basic structures check
  if (typeof obj.overall_score !== "number") return false;
  if (typeof obj.score_label !== "string") return false;
  if (typeof obj.metrics !== "object") return false;
  if (typeof obj.hashtags !== "object") return false;
  if (typeof obj.trending_audio !== "object") return false;
  if (typeof obj.competitor_benchmark !== "object") return false;
  if (!Array.isArray(obj.top_3_actions)) return false;

  return true;
}

// ── Core analyzeContent function ──────────────────────────────────────────────

export async function analyzeContent(
  params: AnalyzeContentParams
): Promise<ViralAnalysis> {
  const { contentType, content, platform, context, fileData } = params;

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured in environment variables.");
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // ── Setup the System Prompt ───────────────────────────────────────────────
  const systemInstruction = `You are ViralScore AI — a professional virality analyst trained on millions of high-performing posts across TikTok, Instagram Reels, YouTube Shorts, LinkedIn, and Twitter/X. You think like a top-1% growth strategist: precise, ruthless, specific.

Your job is to analyze the provided content and return a single valid JSON object — nothing else. No preamble, no markdown fences, no explanation outside the JSON.

---

SCORING RUBRIC (use this to calibrate every score 0–100):

HOOK STRENGTH — The first 3 seconds / opening line.
  90–100 : Pattern interrupt + emotional spike + clear promise. Impossible to scroll past.
  70–89  : Clear hook with tension or curiosity gap. Most viewers stay.
  50–69  : Functional but forgettable. Nothing makes the viewer commit.
  30–49  : No hook. Starts mid-thought, background noise, or weak opener.
  0–29   : Actively repels attention. Confusion, silence, or slow intro.

CAPTION CLARITY — Does the text communicate value instantly?
  90–100 : One read = clear what it is, why it matters, what to do.
  70–89  : Good message, slightly verbose or buried.
  50–69  : Meaning is there but takes effort to find.
  0–49   : Confusing, too long, jargon-heavy, or no message.

THUMBNAIL / VISUAL IMPACT — Static image or first frame.
  90–100 : High contrast, face/emotion visible, readable text if any, clear focal point.
  70–89  : Visually clean but lacks a differentiating element.
  50–69  : Generic composition. Won't stop the scroll.
  0–49   : Cluttered, dark, no focal point, or no visual context.

EMOTIONAL TRIGGER — Does it make people feel something shareable?
  90–100 : Strong single emotion (awe, rage, laughter, fear, envy). Feels personal.
  70–89  : Emotional resonance present but diluted.
  50–69  : Informational but flat. No feeling attached.
  0–49   : Neutral or confused emotional signal.

PACING — Rhythm, density, and momentum of the content.
  90–100 : Every second earns its place. No dead zones.
  70–89  : Good momentum with 1–2 slow patches.
  50–69  : Noticeable drag. Viewers likely tap out before the end.
  0–49   : Front-loaded info dump or meandering structure.

CALL TO ACTION — Does it direct behavior (save, share, comment, follow, click)?
  90–100 : Specific, emotionally framed CTA placed at peak engagement moment.
  70–89  : CTA present but generic ("follow for more").
  50–69  : Implied but not stated.
  0–49   : No CTA. Viewer has nowhere to go.

TRENDING RELEVANCE — Is this riding a current wave?
  90–100 : Uses a live trend (audio, format, challenge) with original spin.
  70–89  : Relevant topic but trend execution is generic.
  50–69  : Evergreen content — stable but no trend boost.
  0–49   : Off-trend, dated format, or tone-deaf to current platform culture.

OVERALL SCORE = weighted average:
  Hook: 25% | Emotional Trigger: 20% | Caption: 15% | Thumbnail: 15% |
  Pacing: 10% | CTA: 10% | Trending: 5%

---

PLATFORM CONTEXT (apply these norms):

TikTok      : Hook in frame 1. Trending audio is +40% reach. <150 char caption. 3–7 hashtags.
Instagram   : Hook in caption line 1 (before "more"). Aesthetic > raw. 5–10 hashtags.
YouTube     : Thumbnail = 70% of CTR. Title = hook. First 30s decide retention.
LinkedIn    : Hook in line 1 before fold. Storytelling > metrics. 0–3 hashtags. Vulnerable tone wins.
Twitter/X   : Hook = full tweet if short. Threads: first tweet must standalone. 0–2 hashtags.

---

COMPETITOR BENCHMARK METHODOLOGY:
Compare the submitted content against the top 10% of performing content in its category on the specified platform. Reference known performance patterns (not named creators). Position the user's content as: Viral Top 10% / Above Average Top 30% / Average / Below Average / Low Potential.

---

OUTPUT — Return ONLY this JSON object, populated with real analysis:

{
  "overall_score": <0–100 integer>,
  "score_label": <"Low Potential" | "Below Average" | "Average" | "Above Average" | "Viral Potential" | "Extremely Viral">,
  "score_color": <"red" | "orange" | "yellow" | "lime" | "green">,
  "one_liner": "<Single punchy sentence: what's working and what's the #1 kill. Max 18 words.>",

  "metrics": {
    "hook_strength": {
      "score": <0–100>,
      "label": "<Weak|Average|Good|Strong|Exceptional>",
      "first_3_seconds_analysis": "<What specifically happens in the opening. What viewer feels. What the gap is.>",
      "improved_hook": "<Rewritten opening line or frame description that would score 85+. Be specific.>"
    },
    "caption_clarity": {
      "score": <0–100>,
      "label": "<Weak|Average|Good|Strong|Exceptional>",
      "analysis": "<What the caption does well and what weakens it. Specific line callouts.>",
      "rewritten_caption": "<A full rewritten version of the caption optimized for this platform. Include line breaks as \\n.>"
    },
    "thumbnail_rating": {
      "score": <0–100>,
      "label": "<Weak|Average|Good|Strong|Exceptional>",
      "analysis": "<What's working or broken in the visual. Reference specific elements: contrast, text, face, composition.>",
      "improvements": [
        "<Concrete change 1>",
        "<Concrete change 2>",
        "<Concrete change 3>"
      ]
    },
    "emotional_trigger": {
      "score": <0–100>,
      "label": "<Weak|Average|Good|Strong|Exceptional>",
      "dominant_emotion": "<curiosity|awe|anger|laughter|fear|envy|inspiration|nostalgia|none>",
      "analysis": "<Why this emotion fires or doesn't. What specific word, visual, or moment triggers it.>",
      "amplification_tip": "<One specific change to intensify the emotional hit.>"
    },
    "pacing": {
      "score": <0–100>,
      "label": "<Weak|Average|Good|Strong|Exceptional>",
      "analysis": "<Where momentum builds and where it dies. Call out the specific dead zone if any.>",
      "recommendation": "<Specific structural change: cut X seconds, reorder Y, front-load Z.>"
    },
    "call_to_action": {
      "score": <0–100>,
      "label": "<Weak|Average|Good|Strong|Exceptional>",
      "analysis": "<What CTA exists, where it is, and why it works or fails.>",
      "improved_cta": "<Exact rewritten CTA text + recommended placement in the content.>"
    },
    "trending_relevance": {
      "score": <0–100>,
      "label": "<Weak|Average|Good|Strong|Exceptional>",
      "analysis": "<What trend or format this aligns with or misses. Platform-specific.>"
    }
  },

  "hashtags": {
    "primary": ["<3–5 high-volume hashtags for this platform and topic>"],
    "secondary": ["<4–6 mid-volume hashtags for discovery>"],
    "niche": ["<3–4 low-competition hashtags for community reach>"],
    "strategy": "<One sentence: how to order and deploy these hashtags for max reach on this platform.>"
  },

  "trending_audio": {
    "audio_type": "<e.g., 'Upbeat lo-fi' | 'Dramatic orchestral build' | 'Viral sound effect' | 'Spoken word trend'>",
    "energy_match": "<High/Medium/Low>",
    "why_it_works": "<Why this audio type fits the emotion and pacing of this content.>",
    "platform_tip": "<How to find trending audio of this type on the specified platform right now.>",
    "sample_search_terms": ["<search term 1>", "<search term 2>", "<search term 3>"]
  },

  "competitor_benchmark": {
    "content_tier": "<Viral Top 10% | Above Average Top 30% | Average | Below Average | Low Potential>",
    "percentile_estimate": <0–100>,
    "how_you_compare": "<2–3 sentences. What top performers in this niche do differently. Be specific.>",
    "top_performer_traits": [
      "<Trait viral content in this category consistently has #1>",
      "<Trait #2>",
      "<Trait #3>"
    ],
    "gap_analysis": "<The single biggest gap between this content and a top-10% post on this platform.>"
  },

  "top_3_actions": [
    {
      "priority": 1,
      "action": "<Specific, doable change — not 'improve your hook' but exactly HOW.>",
      "expected_impact": "<e.g., '+20–35% watch time' | 'Doubles share likelihood' | '+15% CTR on thumbnail'>"
    },
    {
      "priority": 2,
      "action": "<Second most impactful change>",
      "expected_impact": "<Expected result>"
    },
    {
      "priority": 3,
      "action": "<Third change>",
      "expected_impact": "<Expected result>"
    }
  ],

  "platform_specific_tips": [
    "<Tip 1 specific to the platform's current algorithm behavior>",
    "<Tip 2 — format, posting window, or engagement tactic>",
    "<Tip 3 — a counterintuitive or advanced insight most creators miss>"
  ],

  "posting_strategy": {
    "best_time": "<Day and time range for peak engagement on this platform for this content type>",
    "content_format": "<The ideal format variant: Reel vs Carousel vs Static vs Story vs Thread, etc.>",
    "cross_platform_potential": "<Which other platform this content could be repurposed for and how to adapt it.>"
  }
}

RULES:
- Return ONLY valid JSON. Zero text outside the object.
- Never use placeholder values. Every field must reflect real analysis of the actual input.
- If no visual is provided, score thumbnail_rating based on the described first frame or set to null.
- If no caption is provided, focus analysis on video/image context.
- Scores must feel calibrated — do not cluster everything in the 70s. Differentiate.
- improved_hook and rewritten_caption must be ready to copy-paste, not templates.`;

  // ── Format variables for User Prompt ──────────────────────────────────────
  const captionValue = contentType === "caption" ? content : (context || "Not provided");
  const videoUrlValue = contentType === "video_url" ? content : "Not provided";
  const imageUrlOrDescValue = contentType === "image_url" ? (fileData ? `Uploaded file: ${content}` : content) : "Not provided";
  const additionalContextValue = context || "None";

  const userPrompt = `
PLATFORM: ${platform}
CAPTION: ${captionValue}
VIDEO URL: ${videoUrlValue}
IMAGE URL / DESCRIPTION: ${imageUrlOrDescValue}
ADDITIONAL CONTEXT: ${additionalContextValue}

Analyze this content and return the JSON.
`.trim();

  let rawText = "";

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4, // low temp = consistent, calibrated scores
      max_tokens: 2000,
      response_format: { type: "json_object" } // force JSON mode
    });
    
    rawText = chatCompletion.choices[0]?.message?.content?.trim() || "";
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Groq API call failed.";
    console.error("[analyzeContent] groq create error:", msg);
    throw new Error(`Groq API Error: ${msg}`);
  }

  // ── JSON Parse ────────────────────────────────────────────────────────────
  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    // Strip possible markdown fences if they leaked through
    const cleaned = rawText
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim();
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("[analyzeContent] JSON parse failed. Raw text:", rawText.slice(0, 300));
      throw new Error("Failed to parse AI response as JSON.");
    }
  }

  // ── Validate API response shape ───────────────────────────────────────────
  if (!validateApiResponse(parsed)) {
    console.error("[analyzeContent] Schema validation failed. Object:", JSON.stringify(parsed).slice(0, 300));
    throw new Error("AI returned an unexpected response shape.");
  }

  // ── Translate snake_case keys into camelCase for Legacy compatibility ──
  const mappedResult: ViralAnalysis = {
    // Legacy mapping
    overallScore: parsed.overall_score ?? 0,
    scoreLabel: parsed.score_label ?? "Average",
    platform: platform,
    hookStrength: parsed.metrics?.hook_strength?.score ?? 0,
    captionClarity: parsed.metrics?.caption_clarity?.score ?? 0,
    emotionalTrigger: parsed.metrics?.emotional_trigger?.score ?? 0,
    trendingRelevance: parsed.metrics?.trending_relevance?.score ?? 0,
    callToAction: parsed.metrics?.call_to_action?.score ?? 0,
    thumbnailRating: parsed.metrics?.thumbnail_rating?.score ?? 0,
    hookAnalysis: parsed.metrics?.hook_strength?.first_3_seconds_analysis ?? "No hook analysis.",
    captionSuggestions: [parsed.metrics?.caption_clarity?.analysis ?? "No caption suggestions."],
    captionRewrites: [
      parsed.metrics?.caption_clarity?.rewritten_caption ?? "",
      parsed.metrics?.hook_strength?.improved_hook ?? "",
      parsed.metrics?.call_to_action?.improved_cta ?? ""
    ].filter(Boolean),
    hashtags: [
      ...(parsed.hashtags?.primary || []),
      ...(parsed.hashtags?.secondary || []),
      ...(parsed.hashtags?.niche || [])
    ],
    competitorInsight: {
      summary: parsed.competitor_benchmark?.how_you_compare ?? "",
      competitorMetrics: {
        hookStrength: Math.min(100, Math.max(0, (parsed.metrics?.hook_strength?.score ?? 70) + 12)),
        captionClarity: Math.min(100, Math.max(0, (parsed.metrics?.caption_clarity?.score ?? 70) + 8)),
        emotionalTrigger: Math.min(100, Math.max(0, (parsed.metrics?.emotional_trigger?.score ?? 70) + 10)),
        trendingRelevance: Math.min(100, Math.max(0, (parsed.metrics?.trending_relevance?.score ?? 70) + 5)),
        callToAction: Math.min(100, Math.max(0, (parsed.metrics?.call_to_action?.score ?? 70) + 15)),
        thumbnailRating: Math.min(100, Math.max(0, (parsed.metrics?.thumbnail_rating?.score ?? 70) + 8)),
      },
      competitorNames: parsed.competitor_benchmark?.top_performer_traits?.slice(0, 3) || ["Elite Creator A", "Elite Creator B", "Elite Creator C"]
    },
    improvements: parsed.metrics?.thumbnail_rating?.improvements || parsed.top_3_actions?.map((a: any) => a.action) || [],
    strengths: parsed.competitor_benchmark?.top_performer_traits || [],
    hookTimeline: [
      { 
        time: "0s", 
        label: `Opening hook: ${parsed.metrics?.hook_strength?.label || "Average"}`, 
        impact: (parsed.metrics?.hook_strength?.score ?? 0) >= 80 ? "Positive" : (parsed.metrics?.hook_strength?.score ?? 0) >= 50 ? "Neutral" : "Negative" 
      },
      { 
        time: "3s", 
        label: `Pacing tempo: ${parsed.metrics?.pacing?.label || "Average"}`, 
        impact: (parsed.metrics?.pacing?.score ?? 0) >= 80 ? "Positive" : (parsed.metrics?.pacing?.score ?? 0) >= 50 ? "Neutral" : "Negative" 
      },
      { 
        time: "10s", 
        label: `CTA transition: ${parsed.metrics?.call_to_action?.label || "Average"}`, 
        impact: (parsed.metrics?.call_to_action?.score ?? 0) >= 80 ? "Positive" : (parsed.metrics?.call_to_action?.score ?? 0) >= 50 ? "Neutral" : "Negative" 
      }
    ],
    predictedViews: calculatePredictedEngagement("views", platform, parsed.overall_score),
    predictedLikes: calculatePredictedEngagement("likes", platform, parsed.overall_score),
    predictedComments: calculatePredictedEngagement("comments", platform, parsed.overall_score),
    predictedShares: calculatePredictedEngagement("shares", platform, parsed.overall_score),

    // Enriched properties mapped directly from the AI response
    scoreColor: parsed.score_color ?? "yellow",
    oneLiner: parsed.one_liner ?? "",
    
    metricsNew: {
      hookStrength: {
        score: parsed.metrics?.hook_strength?.score ?? 0,
        label: parsed.metrics?.hook_strength?.label ?? "",
        first3SecondsAnalysis: parsed.metrics?.hook_strength?.first_3_seconds_analysis ?? "",
        improvedHook: parsed.metrics?.hook_strength?.improved_hook ?? ""
      },
      captionClarity: {
        score: parsed.metrics?.caption_clarity?.score ?? 0,
        label: parsed.metrics?.caption_clarity?.label ?? "",
        analysis: parsed.metrics?.caption_clarity?.analysis ?? "",
        rewrittenCaption: parsed.metrics?.caption_clarity?.rewritten_caption ?? ""
      },
      thumbnailRating: {
        score: parsed.metrics?.thumbnail_rating?.score ?? 0,
        label: parsed.metrics?.thumbnail_rating?.label ?? "",
        analysis: parsed.metrics?.thumbnail_rating?.analysis ?? "",
        improvements: parsed.metrics?.thumbnail_rating?.improvements ?? []
      },
      emotionalTrigger: {
        score: parsed.metrics?.emotional_trigger?.score ?? 0,
        label: parsed.metrics?.emotional_trigger?.label ?? "",
        dominantEmotion: parsed.metrics?.emotional_trigger?.dominant_emotion ?? "",
        analysis: parsed.metrics?.emotional_trigger?.analysis ?? "",
        amplificationTip: parsed.metrics?.emotional_trigger?.amplification_tip ?? ""
      },
      pacing: {
        score: parsed.metrics?.pacing?.score ?? 0,
        label: parsed.metrics?.pacing?.label ?? "",
        analysis: parsed.metrics?.pacing?.analysis ?? "",
        recommendation: parsed.metrics?.pacing?.recommendation ?? ""
      },
      callToAction: {
        score: parsed.metrics?.call_to_action?.score ?? 0,
        label: parsed.metrics?.call_to_action?.label ?? "",
        analysis: parsed.metrics?.call_to_action?.analysis ?? "",
        improvedCta: parsed.metrics?.call_to_action?.improved_cta ?? ""
      },
      trendingRelevance: {
        score: parsed.metrics?.trending_relevance?.score ?? 0,
        label: parsed.metrics?.trending_relevance?.label ?? "",
        analysis: parsed.metrics?.trending_relevance?.analysis ?? ""
      }
    },

    hashtagsNew: {
      primary: parsed.hashtags?.primary ?? [],
      secondary: parsed.hashtags?.secondary ?? [],
      niche: parsed.hashtags?.niche ?? [],
      strategy: parsed.hashtags?.strategy ?? ""
    },

    trendingAudioNew: {
      audioType: parsed.trending_audio?.audio_type ?? "",
      energyMatch: parsed.trending_audio?.energy_match ?? "",
      whyItWorks: parsed.trending_audio?.why_it_works ?? "",
      platformTip: parsed.trending_audio?.platform_tip ?? "",
      sampleSearchTerms: parsed.trending_audio?.sample_search_terms ?? []
    },

    competitorBenchmarkNew: {
      contentTier: parsed.competitor_benchmark?.content_tier ?? "",
      percentileEstimate: parsed.competitor_benchmark?.percentile_estimate ?? 0,
      howYouCompare: parsed.competitor_benchmark?.how_you_compare ?? "",
      topPerformerTraits: parsed.competitor_benchmark?.top_performer_traits ?? [],
      gapAnalysis: parsed.competitor_benchmark?.gap_analysis ?? ""
    },

    top3Actions: parsed.top_3_actions?.map((a: any) => ({
      priority: a.priority ?? 1,
      action: a.action ?? "",
      expectedImpact: a.expected_impact ?? ""
    })) ?? [],

    platformSpecificTips: parsed.platform_specific_tips ?? [],

    postingStrategy: {
      bestTime: parsed.posting_strategy?.best_time ?? "",
      contentFormat: parsed.posting_strategy?.content_format ?? "",
      crossPlatformPotential: parsed.posting_strategy?.cross_platform_potential ?? ""
    }
  };

  return mappedResult;
}
