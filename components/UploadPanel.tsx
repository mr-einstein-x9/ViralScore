"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, Upload, X, FileVideo, FileImage, AlertCircle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────

type Platform = "TikTok" | "Instagram" | "YouTube" | "LinkedIn" | "Twitter/X";
type ContentType = "caption" | "video_url" | "image_url";

interface AnalyzeData {
  contentType: ContentType;
  content: string;
  platform: Platform;
  context: string;
  fileData?: string; // base64 string
}

interface UploadPanelProps {
  onAnalyze: (data: AnalyzeData) => void;
  isLoading: boolean;
  collapsed?: boolean;
  onExpand?: () => void;
  overallScore?: number;
  scoreColor?: "red" | "orange" | "yellow" | "lime" | "green";
}

const PLATFORM_EMOJI: Record<string, string> = {
  TikTok:     "🎵",
  Instagram:  "📸",
  YouTube:    "▶️",
  LinkedIn:   "💼",
  "Twitter/X": "𝕏",
};

const MINI_COLOR_THEMES: Record<string, string> = {
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  lime: "#84cc16",
  green: "#00ff87"
};

// ── Constants ─────────────────────────────────────────────────────────────────

const PLATFORMS: Platform[] = [
  "TikTok",
  "Instagram",
  "YouTube",
  "LinkedIn",
  "Twitter/X",
];

const CONTENT_TABS: { label: string; value: ContentType | "upload" }[] = [
  { label: "Direct Upload", value: "upload" },
  { label: "URL / Caption", value: "caption" },
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

export default function UploadPanel({ onAnalyze, isLoading, collapsed, onExpand, overallScore, scoreColor }: UploadPanelProps) {
  const [platform, setPlatform] = useState<Platform>("TikTok");
  const [activeTab, setActiveTab] = useState<ContentType | "upload">("upload");
  const [caption, setCaption] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [context, setContext] = useState("");
  const [validationError, setValidationError] = useState(false);
  const [shaking, setShaking] = useState(false);

  // File Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

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
    if (activeTab === "upload") return selectedFile?.name || "";
    if (activeTab === "caption") return caption;
    if (activeTab === "video_url") return videoUrl;
    return imageUrl;
  })();

  const isEmpty = activeTab === "upload" ? !selectedFile : currentContent.trim().length === 0;
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

  // ── File Handlers ─────────────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    setFileError(null);
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      setFileError("Please upload a video or an image file.");
      return;
    }

    const sizeLimit = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > sizeLimit) {
      setFileError(`File too large. Max ${isVideo ? "50MB" : "10MB"} for ${isVideo ? "videos" : "images"}.`);
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setFilePreview(url);
  }, []);

  const clearFile = () => {
    setSelectedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    setFileError(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // ── Handle submit ─────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (isEmpty) {
      triggerShake();
      return;
    }
    if (overLimit) return;
    setValidationError(false);

    let fileData: string | undefined;
    let finalContentType: ContentType = activeTab === "upload" ? "caption" : activeTab;

    if (activeTab === "upload" && selectedFile) {
      const isVideo = selectedFile.type.startsWith("video/");
      finalContentType = isVideo ? "video_url" : "image_url";
      
      // Convert to base64
      fileData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedFile);
      });
    }

    onAnalyze({
      contentType: finalContentType,
      content: activeTab === "upload" ? `Uploaded ${selectedFile?.type}: ${selectedFile?.name}` : currentContent.trim(),
      platform,
      context: context.trim(),
      fileData,
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

  if (collapsed) {
    const pEmoji = PLATFORM_EMOJI[platform] ?? "📊";
    const strokeColor = scoreColor ? MINI_COLOR_THEMES[scoreColor] : "#00ff87";

    return (
      <div className="flex flex-col items-center gap-6 py-4 w-full h-full min-h-[300px]">
        {/* Chevron Expand Button */}
        <button
          onClick={onExpand}
          className="p-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] hover:border-[#00ff87] text-[#888] hover:text-[#00ff87] rounded-xl transition-all duration-200"
          title="Expand Settings / Edit"
        >
          <ChevronRight size={18} />
        </button>

        {/* Mini Score Ring */}
        <div className="relative w-12 h-12 flex items-center justify-center my-2 select-none">
          <svg width={48} height={48} viewBox="0 0 48 48" className="-rotate-90">
            <circle cx={24} cy={24} r={18} fill="none" stroke="#222" strokeWidth={3} />
            <circle
              cx={24} cy={24} r={18} fill="none"
              stroke={strokeColor}
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 18}
              strokeDashoffset={2 * Math.PI * 18 * (1 - (overallScore || 0) / 100)}
            />
          </svg>
          <span className="absolute text-[10px] font-display font-bold text-white">
            {overallScore}
          </span>
        </div>

        {/* Platform Emoji */}
        <div 
          className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#222] flex items-center justify-center text-lg shadow-sm"
          title={`Platform: ${platform}`}
        >
          {pEmoji}
        </div>
      </div>
    );
  }

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
                setActiveTab(tab.value as any);
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

        <AnimatePresence mode="wait">
          {/* ── Direct Upload Tab ────────────────────────────────────────── */}
          {activeTab === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4"
            >
              {!selectedFile ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  className={`relative h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                    isDragging ? "border-[#00ff87] bg-[#00ff87]/5" : "border-[#222] hover:border-[#333]"
                  } ${shaking ? "shake" : ""}`}
                >
                  <motion.div
                    animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                    className="p-3 rounded-full bg-[#1a1a1a]"
                  >
                    <Upload className={isDragging ? "text-[#00ff87]" : "text-[#555]"} />
                  </motion.div>
                  <div className="text-center px-4">
                    <p className="text-sm font-medium text-white">Drag & drop your file here</p>
                    <p className="text-xs text-[#555] mt-1">Video (max 50MB) or Image (max 10MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="video/*,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              ) : (
                <div className="relative rounded-2xl border border-[#222] bg-[#111] overflow-hidden group">
                  <div className="aspect-video w-full flex items-center justify-center">
                    {selectedFile.type.startsWith("video/") ? (
                      <video
                        src={filePreview!}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={filePreview!}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={clearFile}
                      className="p-2 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="p-3 bg-[#1a1a1a] border-t border-[#222] flex items-center gap-3">
                    {selectedFile.type.startsWith("video/") ? (
                      <FileVideo size={18} className="text-[#00ff87]" />
                    ) : (
                      <FileImage size={18} className="text-[#00ff87]" />
                    )}
                    <span className="text-xs text-[#888] truncate flex-1">{selectedFile.name}</span>
                    <span className="text-[10px] text-[#555]">{(selectedFile.size / (1024 * 1024)).toFixed(1)}MB</span>
                  </div>
                </div>
              )}

              {fileError && (
                <div className="flex items-center gap-2 text-[#ff3d00] text-xs bg-red-950/20 p-3 rounded-xl border border-red-900/30">
                  <AlertCircle size={14} />
                  {fileError}
                </div>
              )}
            </motion.div>
          )}

          {/* ── URL / Caption Tabs (Secondary View) ───────────────────────── */}
          {activeTab !== "upload" && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4"
            >
              <div className="flex bg-[#1a1a1a] p-1 rounded-lg self-start">
                {[
                  { label: "Caption", value: "caption" },
                  { label: "Video URL", value: "video_url" },
                  { label: "Image URL", value: "image_url" },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setActiveTab(t.value as any)}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                      activeTab === t.value
                        ? "bg-[#333] text-[#00ff87]"
                        : "text-[#555] hover:text-[#888]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {activeTab === "caption" && (
                <div className="relative">
                  <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Paste your caption or script here..."
                    rows={5}
                    className={`${inputBase} ${inputBorderClass} p-4 text-sm leading-relaxed ${shaking ? "shake" : ""}`}
                    style={{ minHeight: 140 }}
                  />
                  <span className={`absolute bottom-3 right-4 text-xs ${overLimit ? "text-[#ff3d00]" : "text-[#555]"}`}>
                    {caption.length} / {MAX_CAPTION_CHARS}
                  </span>
                </div>
              )}

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
                </div>
              )}

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
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
