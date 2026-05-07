import Groq from "groq-sdk";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ViralAnalysis = {
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
};

// ── Params ────────────────────────────────────────────────────────────────────

type AnalyzeContentParams = {
  contentType: "caption" | "video_url" | "image_url";
  content:     string;
  platform:    "TikTok" | "Instagram" | "YouTube" | "LinkedIn" | "Twitter/X";
  context?:    string;
  fileData?:   string; // base64
};

// ── Schema reference (inlined into prompt) ────────────────────────────────────

const SCHEMA_REFERENCE = `
{
  "overallScore": number,
  "scoreLabel": string,
  "platform": string,
  "hookStrength": number,
  "captionClarity": number,
  "emotionalTrigger": number,
  "trendingRelevance": number,
  "callToAction": number,
  "thumbnailRating": number,
  "hookAnalysis": string,
  "captionSuggestions": [string, string, string],
  "captionRewrites": [string, string, string],
  "hashtags": [10 strings each starting with #],
  "competitorInsight": {
    "summary": string,
    "competitorMetrics": {
      "hookStrength": number,
      "captionClarity": number,
      "emotionalTrigger": number,
      "trendingRelevance": number,
      "callToAction": number,
      "thumbnailRating": number
    },
    "competitorNames": [string, string, string]
  },
  "improvements": [string x5],
  "strengths": [string x3],
  "hookTimeline": [
    { "time": "0s", "label": "The Hook", "impact": "Positive" },
    { "time": "3s", "label": "The Transition", "impact": "Neutral" },
    { "time": "10s", "label": "The Value Drop", "impact": "Positive" }
  ],
  "predictedViews": { "min": number, "max": number, "confidence": "Low" | "Moderate" | "High" },
  "predictedLikes": { "min": number, "max": number, "confidence": "Low" | "Moderate" | "High" },
  "predictedComments": { "min": number, "max": number, "confidence": "Low" | "Moderate" | "High" },
  "predictedShares": { "min": number, "max": number, "confidence": "Low" | "Moderate" | "High" }
}
`.trim();

const PLATFORM_WEIGHTS: Record<string, Record<string, number>> = {
  TikTok:      { hook: 0.40, trend: 0.40, emotion: 0.10, caption: 0.05, cta: 0.05 },
  Instagram:   { hook: 0.30, trend: 0.30, emotion: 0.20, caption: 0.10, cta: 0.10 },
  YouTube:     { hook: 0.35, visual: 0.25, emotion: 0.20, trend: 0.10, cta: 0.10 },
  LinkedIn:    { caption: 0.30, cta: 0.30, emotion: 0.20, hook: 0.15, trend: 0.05 },
  "Twitter/X": { hook: 0.30, caption: 0.30, trend: 0.20, emotion: 0.10, cta: 0.10 },
};

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Viral Rocket";
  if (score >= 75) return "High Potential";
  if (score >= 60) return "Solid Content";
  if (score >= 40) return "Needs Polishing";
  return "Underperform";
}

// ── Graceful fallback ─────────────────────────────────────────────────────────

function fallbackAnalysis(message: string): ViralAnalysis {
  return {
    overallScore:       0,
    scoreLabel:         "Low",
    platform:           "Unknown",
    hookStrength:       0,
    captionClarity:     0,
    emotionalTrigger:   0,
    trendingRelevance:  0,
    callToAction:       0,
    thumbnailRating:    0,
    hookAnalysis:       `Analysis error: ${message}`,
    captionSuggestions: ["", "", ""],
    captionRewrites:    ["", "", ""],
    hashtags:           Array(10).fill("#error"),
    competitorInsight:  {
      summary: "Unable to retrieve competitor insight.",
      competitorMetrics: {
        hookStrength: 0,
        captionClarity: 0,
        emotionalTrigger: 0,
        trendingRelevance: 0,
        callToAction: 0,
        thumbnailRating: 0,
      },
      competitorNames: ["Comp A", "Comp B", "Comp C"],
    },
    improvements:       Array(5).fill("Unable to generate improvement."),
    strengths:          Array(3).fill("Unable to detect strength."),
    hookTimeline:       [],
    predictedViews:     { min: 0, max: 0, confidence: "Low" },
    predictedLikes:     { min: 0, max: 0, confidence: "Low" },
    predictedComments:  { min: 0, max: 0, confidence: "Low" },
    predictedShares:    { min: 0, max: 0, confidence: "Low" },
  };
}

// ── Validation guard ──────────────────────────────────────────────────────────

function validateAnalysis(obj: unknown): obj is ViralAnalysis {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;

  const numericFields: (keyof ViralAnalysis)[] = [
    "overallScore","hookStrength","captionClarity",
    "emotionalTrigger","trendingRelevance","callToAction","thumbnailRating",
  ];
  for (const field of numericFields) {
    if (typeof o[field] !== "number" || o[field] < 0 || o[field] > 100) {
       console.error(`Validation failed: ${field} must be 0-100`);
       return false;
    }
  }

  const stringFields: (keyof ViralAnalysis)[] = [
    "scoreLabel","platform","hookAnalysis",
  ];
  for (const field of stringFields) {
    if (typeof o[field] !== "string" || (o[field] as string).length < 10) {
       console.error(`Validation failed: ${field} too short or missing`);
       return false;
    }
  }

  const arrayFields: { key: keyof ViralAnalysis; minLen: number; minStrLen?: number }[] = [
    { key: "captionSuggestions", minLen: 3  },
    { key: "captionRewrites",    minLen: 3, minStrLen: 30 },
    { key: "hashtags",           minLen: 5  },
    { key: "improvements",       minLen: 5, minStrLen: 20 },
    { key: "strengths",          minLen: 3  },
  ];
  for (const { key, minLen, minStrLen } of arrayFields) {
    const arr = o[key] as unknown[];
    if (!Array.isArray(arr) || arr.length < minLen) {
       console.error(`Validation failed: ${key} must have ${minLen} items`);
       return false;
    }
    if (minStrLen) {
      for (const s of arr) {
        if (typeof s !== "string" || s.length < minStrLen) {
           console.error(`Validation failed: item in ${key} too short`);
           return false;
        }
      }
    }
  }

  // Competitor name validation
  const ci = o.competitorInsight as any;
  if (!ci || typeof ci !== "object") return false;
  if (!Array.isArray(ci.competitorNames) || ci.competitorNames.length < 3) return false;
  const genericNames = ["top creator a", "top creator b", "top creator c", "creator a", "creator b", "creator c"];
  for (const name of ci.competitorNames) {
    if (genericNames.includes(name.toLowerCase())) {
       console.error(`Validation failed: Generic competitor name detected: ${name}`);
       return false;
    }
  }

  // Predicted values validation
  const engagementFields: (keyof ViralAnalysis)[] = [
    "predictedViews", "predictedLikes", "predictedComments", "predictedShares"
  ];
  for (const field of engagementFields) {
    const ef = o[field] as any;
    if (!ef || typeof ef !== "object") return false;
    if (typeof ef.min !== "number" || typeof ef.max !== "number" || ef.min > ef.max) return false;
  }

  return true;
}

// ── Strip markdown fences util ────────────────────────────────────────────────

function stripFences(text: string): string {
  return text
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/g, "")
    .trim();
}

// ── Core analyzeContent function ──────────────────────────────────────────────

export async function analyzeContent(
  params: AnalyzeContentParams
): Promise<ViralAnalysis> {
  const { contentType, content, platform, context } = params;

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured in environment variables.");
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const contentTypeLabel: Record<AnalyzeContentParams["contentType"], string> = {
    caption:   "Text Caption",
    video_url: "Video URL",
    image_url: "Image URL",
  };

  const systemInstruction = `You are an expert social media virality analyst. You analyze SPECIFIC content provided by users. You NEVER give generic advice. Every observation, score, and recommendation must reference the exact words, themes, and structure of the user's content.

CRITICAL RULE: If you cannot derive something from the user's content, use realistic, varied data based on the detected niche/industry. Never repeat the same values across different analyses.

STEP 1: First, identify the niche/topic from the content (e.g., fitness, cooking, tech review, comedy, motivation, fashion, etc.)

STEP 2: Generate the analysis with these rules:

hookStrength (0-100): Score based on the FIRST sentence or opening. Quote the exact opening words in the explanation. If the hook creates curiosity, urgency, or emotion, score higher.

captionClarity (0-100): Score based on how clearly the caption communicates its message. Reference specific phrasing.

emotionalTrigger (0-100): Score based on emotional appeal. Identify which emotion (humor, inspiration, fear, curiosity, etc.) and reference specific words.

trendingRelevance (0-100): Score based on whether the content aligns with current trends in the detected niche.

callToAction (0-100): Score based on how well the content prompts engagement. Quote the CTA if present.

thumbnailRating (0-100): Score based on the described visual elements (if image_url/video_url) or imagined thumbnail based on text.

overallScore (0-100): Calculate using platform weights (see below). The overallScore must be REASONABLE and VARIED across different inputs, not always 70-85.

captionRewrites (EXACTLY 3 strings): Each MUST be a complete, copy-paste-ready caption that improves on the original. Do NOT write "Make it shorter" — write the actual shorter caption. Each rewrite must be significantly different from the others.
Rewrite 1: Focus on stronger hook
Rewrite 2: Focus on emotional appeal
Rewrite 3: Focus on clarity/brevity

hookAnalysis (string): Analyze the first 3 seconds or opening line SPECIFICALLY. Quote the exact hook. Say what works and what doesn't. Never write "The hook is engaging." Instead write "The opening line 'X' creates curiosity because..."

hashtags (EXACTLY 5 strings): Generate hashtags RELEVANT TO THE CONTENT'S SPECIFIC TOPIC. Include 2 niche-specific, 2 trending/broad, 1 branded/community tag. NEVER use the same set across analyses.

improvements (EXACTLY 5 strings): Each must be a SPECIFIC, actionable suggestion referencing the user's content. "Improve the hook" is not specific. "Replace the opening question with a bold statement like '...'" is specific.

competitorInsight: MUST vary per niche.
summary: Compare the user's content to what top creators in THIS SPECIFIC NICHE do differently.
competitorNames: Generate 3 realistic-sounding creator names (not "Top Creator A"). Vary them per analysis.
competitorMetrics: Must be DIFFERENT from the user's scores (difference of at least 5-15 points in each metric).

predictedViews, predictedLikes, predictedComments, predictedShares: Vary the ranges significantly per analysis. Do NOT always return 5K-12K views. Match the quality of content: poor content gets lower ranges (e.g., 200-800 views), great content gets higher ranges (e.g., 50K-200K views).

Platform weights for overallScore calculation:
TikTok: hookStrength 30%, emotionalTrigger 25%, trendingRelevance 20%, thumbnailRating 10%, captionClarity 10%, callToAction 5%
Instagram: thumbnailRating 25%, captionClarity 20%, emotionalTrigger 20%, hookStrength 15%, trendingRelevance 10%, callToAction 10%
YouTube: hookStrength 25%, captionClarity 20%, thumbnailRating 20%, callToAction 15%, trendingRelevance 10%, emotionalTrigger 10%
LinkedIn: captionClarity 30%, callToAction 25%, emotionalTrigger 15%, hookStrength 15%, trendingRelevance 10%, thumbnailRating 5%
Twitter/X: hookStrength 30%, captionClarity 25%, emotionalTrigger 20%, callToAction 15%, trendingRelevance 10%, thumbnailRating 0%

Return ONLY valid JSON matching the ViralAnalysis schema. No extra text.`;

  const userPrompt = `
Analyze this content for ${platform}: ${content}
${context ? `Additional Context: ${context}` : ""}
${contentType === "video_url" || contentType === "image_url" ? `Analyze this as a ${contentType.split("_")[0]} post on ${platform}. URL: ${content}` : ""}

Return your analysis as a raw JSON object that EXACTLY matches this schema:
${SCHEMA_REFERENCE}
`.trim();

  let rawText = "";

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      response_format: { type: "json_object" }
    });
    
    rawText = chatCompletion.choices[0]?.message?.content?.trim() || "";
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Groq API call failed.";
    console.error("[analyzeContent] groq create error:", msg);
    throw new Error(`Groq API Error: ${msg}`);
  }

  // ── Attempt 1: parse as-is ────────────────────────────────────────────────
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    // ── Attempt 2: strip fences then parse ───────────────────────────────
    const cleaned = stripFences(rawText);
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("[analyzeContent] JSON parse failed. Raw:", rawText.slice(0, 300));
      return fallbackAnalysis("Failed to parse AI response as JSON.");
    }
  }

  // ── Validate shape ────────────────────────────────────────────────────────
  if (!validateAnalysis(parsed)) {
    console.error("[analyzeContent] Validation failed. Object:", JSON.stringify(parsed).slice(0, 300));
    return fallbackAnalysis("AI returned an unexpected response shape.");
  }

  const result = parsed as ViralAnalysis;

  // ── Apply Platform-Specific Weights ─────────────────────────────────────
  const weights = PLATFORM_WEIGHTS[params.platform] || PLATFORM_WEIGHTS.TikTok;
  let weightedScore = 0;

  if (params.platform === "YouTube") {
    weightedScore = 
      (result.hookStrength * (weights.hook || 0.35)) +
      (result.thumbnailRating * (weights.visual || 0.25)) +
      (result.emotionalTrigger * (weights.emotion || 0.20)) +
      (result.trendingRelevance * (weights.trend || 0.10)) +
      (result.callToAction * (weights.cta || 0.10));
  } else {
    weightedScore = 
      (result.hookStrength * (weights.hook || 0.20)) +
      (result.trendingRelevance * (weights.trend || 0.20)) +
      (result.emotionalTrigger * (weights.emotion || 0.20)) +
      (result.captionClarity * (weights.caption || 0.20)) +
      (result.callToAction * (weights.cta || 0.20));
  }

  result.overallScore = Math.round(weightedScore);
  result.scoreLabel = getScoreLabel(result.overallScore);
  result.platform = params.platform;

  return result;
}
