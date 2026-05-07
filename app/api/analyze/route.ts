import { NextRequest, NextResponse } from "next/server";
import { analyzeContent } from "@/lib/groq";

// ── Request body type ─────────────────────────────────────────────────────────

type AnalyzeRequestBody = {
  contentType: "caption" | "video_url" | "image_url";
  content: string;
  platform: "TikTok" | "Instagram" | "YouTube" | "LinkedIn" | "Twitter/X";
  context?: string;
  fileData?: string; // base64
};

// ── Valid option sets for validation ─────────────────────────────────────────

const VALID_CONTENT_TYPES: AnalyzeRequestBody["contentType"][] = [
  "caption",
  "video_url",
  "image_url",
];

const VALID_PLATFORMS: AnalyzeRequestBody["platform"][] = [
  "TikTok",
  "Instagram",
  "YouTube",
  "LinkedIn",
  "Twitter/X",
];

// ── POST /api/analyze ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: Partial<AnalyzeRequestBody>;

  // ── Parse JSON body ──────────────────────────────────────────────────────
  try {
    body = (await request.json()) as Partial<AnalyzeRequestBody>;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { contentType, content, platform, context, fileData } = body;

  // ── Validate required fields ─────────────────────────────────────────────
  if (!contentType || !VALID_CONTENT_TYPES.includes(contentType as any)) {
    return NextResponse.json(
      {
        error: `Missing or invalid 'contentType'. Must be one of: ${VALID_CONTENT_TYPES.join(", ")}.`,
      },
      { status: 400 }
    );
  }

  if (!platform || !VALID_PLATFORMS.includes(platform as any)) {
    return NextResponse.json(
      {
        error: `Missing or invalid 'platform'. Must be one of: ${VALID_PLATFORMS.join(", ")}.`,
      },
      { status: 400 }
    );
  }

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json(
      { error: "'content' is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  // ── Call Groq helper ───────────────────────────────────────────────────
  try {
    const result = await analyzeContent({
      contentType: contentType as any,
      content: content.trim(),
      platform: platform as any,
      context: typeof context === "string" ? context.trim() : undefined,
      fileData,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";

    console.error("[/api/analyze] Error:", message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
