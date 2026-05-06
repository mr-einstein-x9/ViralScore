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
  hashtags:           string[];
  competitorInsight:  string;
  improvements:       string[];
  strengths:          string[];
};

// ── Params ────────────────────────────────────────────────────────────────────

type AnalyzeContentParams = {
  contentType: "caption" | "video_url" | "image_url";
  content:     string;
  platform:    "TikTok" | "Instagram" | "YouTube" | "LinkedIn" | "Twitter/X";
  context?:    string;
};

// ── Schema reference (inlined into prompt) ────────────────────────────────────

const SCHEMA_REFERENCE = `
{
  "overallScore": number,
  "scoreLabel": "Low" | "Moderate" | "High" | "Viral Ready",
  "platform": string,
  "hookStrength": number,
  "captionClarity": number,
  "emotionalTrigger": number,
  "trendingRelevance": number,
  "callToAction": number,
  "thumbnailRating": number,
  "hookAnalysis": string,
  "captionSuggestions": [string, string, string],
  "hashtags": [10 strings each starting with #],
  "competitorInsight": string,
  "improvements": [string x5],
  "strengths": [string x3]
}
`.trim();

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
    hashtags:           Array(10).fill("#error"),
    competitorInsight:  "Unable to retrieve competitor insight.",
    improvements:       Array(5).fill("Unable to generate improvement."),
    strengths:          Array(3).fill("Unable to detect strength."),
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
    if (typeof o[field] !== "number") return false;
  }

  const stringFields: (keyof ViralAnalysis)[] = [
    "scoreLabel","platform","hookAnalysis","competitorInsight",
  ];
  for (const field of stringFields) {
    if (typeof o[field] !== "string") return false;
  }

  const arrayFields: { key: keyof ViralAnalysis; minLen: number }[] = [
    { key: "captionSuggestions", minLen: 3  },
    { key: "hashtags",           minLen: 10 },
    { key: "improvements",       minLen: 5  },
    { key: "strengths",          minLen: 3  },
  ];
  for (const { key, minLen } of arrayFields) {
    if (!Array.isArray(o[key]) || (o[key] as unknown[]).length < minLen) return false;
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

  const systemInstruction = 
    "You are a world-class viral content strategist who has analyzed 10M+ " +
    "social media posts. You understand platform algorithms, human psychology, " +
    "and what makes content spread. Analyze the given content and return ONLY " +
    "a valid JSON object matching the exact schema provided. No markdown. " +
    "No explanation. Raw JSON only.";

  const userPrompt = `
Platform: ${platform}
Content Type: ${contentTypeLabel[contentType]}
${context ? `Additional Context: ${context}` : ""}

Content to Analyze:
${content}

Return your analysis as a raw JSON object that EXACTLY matches this schema:

${SCHEMA_REFERENCE}

Rules:
- captionSuggestions must have exactly 3 strings.
- hashtags must have exactly 10 strings, each beginning with #.
- improvements must have exactly 5 strings.
- strengths must have exactly 3 strings.
- All numeric scores must be integers between 0 and 100.
- scoreLabel must be one of: "Low", "Moderate", "High", "Viral Ready".
- Do NOT wrap the JSON in markdown code fences.
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

  return parsed;
}
