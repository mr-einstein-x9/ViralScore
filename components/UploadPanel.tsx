"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Platform = "TikTok" | "Instagram" | "YouTube" | "LinkedIn" | "Twitter/X";
type ContentType = "caption" | "video_url" | "image_url";

interface AnalyzeData {
  contentType: ContentType;
  content: string;
  platform: Platform;
  context: string;
}

interface UploadPanelProps {
  onAnalyze: (data: AnalyzeData) => void;
  isLoading: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PLATFORMS: Platform[] = [
  "TikTok",
  "Instagram",
  "YouTube",
  "LinkedIn",
  "Twitter/X",
];

const CONTENT_TABS: { label: string; value: ContentType }[] = [
  { label: "Caption / Text", value: "caption" },
  { label: "Video URL", value: "video_url" },
  { label: "Image URL", value: "image_url" },
];

const MAX_CAPTION_CHARS = 2000;

// ── Shake animation keyframe injected once ────────────────────────────────────

const SHAKE_STYLE = `
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%      { transform: translateX(-6px); }
  40%      { transform: translateX(6px); }
  60%      { transform: translateX(-4px); }
  80%      { transform: translateX(4px); }
}
.shake { animation: shake 0.45s ease; }
`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function UploadPanel({ onAnalyze, isLoading }: UploadPanelProps) {
  const [platform, setPlatform] = useState<Platform>("TikTok");
  const [activeTab, setActiveTab] = useState<ContentType>("caption");
  const [caption, setCaption] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [context, setContext] = useState("");
  const [validationError, setValidationError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  // Inject shake keyframes once
  useEffect(() => {
    if (document.getElementById("shake-style")) return;
    const tag = document.createElement("style");
    tag.id = "shake-style";
    tag.textContent = SHAKE_STYLE;
    document.head.appendChild(tag);
  }, []);

  // Current content value based on active tab
  const currentContent = (() => {
    if (activeTab === "caption") return caption;
    if (activeTab === "video_url") return videoUrl;
    return imageUrl;
  })();

  const isEmpty = currentContent.trim().length === 0;
  const overLimit = activeTab === "caption" && caption.length > MAX_CAPTION_CHARS;

  // ── Image preview validity ────────────────────────────────────────────────
  const imagePreviewValid =
    activeTab === "image_url" &&
    (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"));

  // ── Shake trigger ─────────────────────────────────────────────────────────
  function triggerShake() {
    setShaking(true);
    setValidationError(true);
    setTimeout(() => setShaking(false), 500);
  }

  // ── Handle submit ─────────────────────────────────────────────────────────
  function handleSubmit() {
    if (isEmpty) {
      triggerShake();
      return;
    }
    if (overLimit) return;
    setValidationError(false);
    onAnalyze({
      contentType: activeTab,
      content: currentContent.trim(),
      platform,
      context: context.trim(),
    });
  }

  // Reset validation on content change
  useEffect(() => {
    if (currentContent.trim().length > 0) setValidationError(false);
  }, [currentContent]);

  // ── Input border classes ──────────────────────────────────────────────────
  const inputBase =
    "w-full bg-[#111] border rounded-xl text-[#f0f0f0] placeholder-[#444] " +
    "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00ff87]/10 " +
    "resize-none";

  const inputBorderClass = validationError
    ? "border-[#ff3d00]"
    : "border-[#222] focus:border-[#00ff87]";

  return (
    <div className="flex flex-col gap-6">
      {/* ── Platform Selector ──────────────────────────────────────────── */}
      <div>
        <p className="text-[#555] text-xs uppercase tracking-widest mb-3 font-medium">
          Platform
        </p>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                platform === p
                  ? "bg-[#00ff87] text-black font-bold"
                  : "border border-[#333] text-[#888] hover:border-[#00ff87] hover:text-[#00ff87]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content Type Tabs ──────────────────────────────────────────── */}
      <div>
        <div className="flex border-b border-[#222] mb-4">
          {CONTENT_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                setValidationError(false);
                setShaking(false);
              }}
              className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 -mb-px ${
                activeTab === tab.value
                  ? "text-[#00ff87] border-b-2 border-[#00ff87]"
                  : "text-[#888] hover:text-white border-b-2 border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Caption Tab ───────────────────────────────────────────────── */}
        {activeTab === "caption" && (
          <div className="relative">
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={`Paste your caption, script, hook, or post idea here...\n\nTip: Include your first line — that's the most important part.`}
              rows={7}
              className={`${inputBase} ${inputBorderClass} p-4 text-sm leading-relaxed ${shaking ? "shake" : ""}`}
              style={{ minHeight: 180 }}
            />
            {/* Character count */}
            <span
              className={`absolute bottom-3 right-4 text-xs ${
                overLimit ? "text-[#ff3d00]" : "text-[#555]"
              }`}
            >
              {caption.length} / {MAX_CAPTION_CHARS}
            </span>
          </div>
        )}

        {/* ── Video URL Tab ──────────────────────────────────────────────── */}
        {activeTab === "video_url" && (
          <div className="flex flex-col gap-2">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@username/video/..."
              className={`${inputBase} ${inputBorderClass} ${shaking ? "shake" : ""} px-4 py-3 text-sm`}
            />
            <p className="text-[#555] text-xs leading-relaxed">
              Paste a public TikTok, YouTube, Reel, or Shorts URL. We analyze
              the URL context and extract insights.
            </p>
          </div>
        )}

        {/* ── Image URL Tab ──────────────────────────────────────────────── */}
        {activeTab === "image_url" && (
          <div className="flex flex-col gap-3">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/my-thumbnail.jpg"
              className={`${inputBase} ${inputBorderClass} ${shaking ? "shake" : ""} px-4 py-3 text-sm`}
            />
            {/* Image preview */}
            {imagePreviewValid && (
              <div className="w-full rounded-xl overflow-hidden border border-[#222] bg-[#111]" style={{ maxHeight: 220 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                  style={{ maxHeight: 220 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            {!imagePreviewValid && (
              <p className="text-[#555] text-xs">
                Paste a direct image URL. A preview will appear here.
              </p>
            )}
          </div>
        )}

        {/* ── Validation error ──────────────────────────────────────────── */}
        {validationError && (
          <p className="mt-2 text-[#ff3d00] text-xs font-medium">
            Please add your content first
          </p>
        )}
      </div>

      {/* ── Context / Optional Input ───────────────────────────────────── */}
      <div>
        <p className="text-[#555] text-xs uppercase tracking-widest mb-2 font-medium">
          Additional context (optional)
        </p>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="E.g. This is for fitness niche. Target: women 25-34. Goal: sell my online course."
          rows={3}
          className={`${inputBase} border-[#222] focus:border-[#00ff87] p-3 text-sm`}
          style={{ minHeight: 80 }}
        />
      </div>

      {/* ── Analyze Button ─────────────────────────────────────────────── */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || overLimit}
        className={`w-full font-display text-2xl py-4 rounded-xl tracking-widest uppercase transition-all duration-200 ${
          isLoading
            ? "bg-[#00ff87]/20 text-[#00ff87]/50 cursor-not-allowed"
            : isEmpty || overLimit
            ? "bg-[#1a1a1a] text-[#444] cursor-not-allowed"
            : "bg-[#00ff87] text-black hover:bg-white hover:scale-[1.02] cursor-pointer"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-3 text-base font-body font-semibold normal-case tracking-normal">
            <Loader2 size={18} className="animate-spin" />
            Analyzing your content...
          </span>
        ) : (
          "Analyze →"
        )}
      </button>
    </div>
  );
}
