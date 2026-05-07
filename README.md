# ViralScore 🎯

> AI-powered content virality analyzer. Score your posts before you post them.

![ViralScore Banner](./public/og-image.png)

---

## 🚀 What It Does

Paste a caption, drop a video URL, or share an image link — ViralScore's
AI analyzes your content across 6 key virality signals and returns:

- **Overall Virality Score** (0–100) with animated gauge
- **6 Metric Scores**: Hook Strength, Caption Clarity, Emotional Trigger, Trending Relevance, CTA, Thumbnail Rating
- **3 Rewritten Captions** optimized for your platform
- **10 Trending Hashtags** — click to copy individually or all at once
- **5 Specific Improvements** — not generic tips, real actions
- **Competitor Insight** — what top creators in your niche do differently

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS 3.4 |
| AI | Groq Llama 3.3 70B via `groq-sdk` |
| Animations | Framer Motion 11 |
| Icons | Lucide React |
| Charts | Recharts |
| Fonts | Bebas Neue + DM Sans (Google Fonts) |
| Language | TypeScript 5 (strict mode) |

---

## ⚡ Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/go-viral-clone.git
cd go-viral-clone

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.local.example .env.local
# Open .env.local and add your Gemini API key

# 4. Get your free Groq API key
# → https://console.groq.com/keys
# Paste it as: GROQ_API_KEY=gsk_...

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Your Groq API key (required) |
| `NEXT_PUBLIC_APP_URL` | App base URL (default: `http://localhost:3000`) |

> ⚠️ Never commit `.env.local` — it's in `.gitignore`.

---

## ✨ Features

- [x] **Multi-platform support** — TikTok, Instagram, YouTube, LinkedIn, Twitter/X
- [x] **3 input types** — Caption text, Video URL, Image URL (with live preview)
- [x] **Animated SVG score gauge** with count-up animation
- [x] **6 metric breakdown** with gradient progress bars
- [x] **One-click hashtag copy** — individual or all 10 at once
- [x] **3 AI-rewritten captions** with per-card copy button
- [x] **Competitor intelligence** tab
- [x] **Mobile responsive** — works on iPhone SE and up
- [x] **Dark editorial design** — Bloomberg terminal meets Gen-Z creator tool
- [x] **Graceful error handling** — fallback on AI parse failures

---

## 📁 Project Structure

```
├── app/
│   ├── api/analyze/route.ts   # POST endpoint → Gemini
│   ├── analyze/page.tsx       # Main analyzer UI
│   ├── globals.css            # Design tokens + animations
│   ├── layout.tsx             # Root layout + fonts
│   └── page.tsx               # Landing / hero page
├── components/
│   ├── Navbar.tsx
│   ├── UploadPanel.tsx        # Input: platform, content, context
│   ├── ScoreGauge.tsx         # SVG arc score circle
│   ├── MetricsGrid.tsx        # 6-metric cards with progress bars
│   ├── SuggestionsList.tsx    # Hook analysis + strengths + improvements
│   └── HashtagPanel.tsx       # Hashtags / Captions / Competitor tabs
├── lib/
│   └── groq.ts                # ViralAnalysis type + analyzeContent()
├── ai-logs/
│   └── build-log.md           # Prompt-by-prompt build documentation
└── .env.local.example
```

---

## 🏆 Contest

**Built for: [8xEngineer — Go Viral Clone Contest](https://8xengineer.com)**  
Built entirely with **Antigravity IDE** (Claude Sonnet 4.6 Thinking) in one session.

---

## 🌐 Deploy to Vercel

The easiest way to deploy this Next.js app is using the [Vercel Platform](https://vercel.com/new).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to a GitHub repository.
2. Go to Vercel and **Import** the repository.
3. In the Environment Variables section, add:
   - `GROQ_API_KEY` = `gsk_your_groq_key`
   - `NEXT_PUBLIC_APP_URL` = `https://your-domain.vercel.app`
4. Click **Deploy**.

> **Note:** The app uses Next.js App Router and Edge-compatible API routes, making it perfectly optimized for Vercel's edge network.

---

## 📄 License

MIT — use it, fork it, go viral with it.
