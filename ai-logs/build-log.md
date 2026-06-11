# Build Log â€” ViralScore

Project "ViralScore" built for the 8xEngineer Go Viral Clone contest. An AI-powered content analyzer that helps creators predict virality before posting.

---

## Session 1 â€” Project Setup

### Prompt
"Initialize a new Next.js 14 project using TypeScript and Tailwind CSS. I want a premium, dark-mode first aesthetic with an electric green (#00ff87) accent color. Setup the core folder structure, configure Framer Motion for animations, and create a `lib/groq.ts` utility to handle AI requests. Define a robust `ViralAnalysis` type that includes an overall score, detailed metric ratings (Hook, Emotion, CTA, etc.), and text-based suggestions. Create a server-side API route at `/api/analyze/route.ts` to securely handle API keys and interface with the AI provider."

### Response
I initialized the Next.js project and established a clean design system using Tailwind CSS variables for the brand colors. The `ViralAnalysis` type was designed to be highly structured, ensuring the AI returns consistent data for the UI components to consume. I implemented the API route with error handling and environment variable validation to prevent leaks. The initial setup focused on a "service-first" architecture, separating the AI logic from the UI to make future provider switches easier.

---

## Session 2 â€” Navbar + Landing Page

### Prompt
"Build a high-performance Navbar with a glassmorphism blur effect and a responsive mobile menu. Then, create the landing page (`app/page.tsx`) featuring a bold hero section with Bebas Neue typography. Use the brand green (#00ff87) for highlights. Include a 'How It Works' section with three steps and a 'What We Analyze' grid showing the 6 core virality signals. Add a full-width CTA banner at the bottom. Use Framer Motion for entrance animations and staggered list items."

### Response
I built the Navbar using a combination of `backdrop-blur` and a fixed position to maintain navigation visibility. For the landing page, I focused on a "high-energy" visual style, using large typography and vibrant accents to appeal to the creator demographic. I used Framer Motion's `AnimatePresence` for the mobile menu and implemented staggered reveal animations for the metrics grid to make the page feel alive. The design uses a deep charcoal background (#0a0a0a) to make the green elements pop.

---

## Session 3 â€” Upload Panel + Analyze Page

### Prompt
"Create an `UploadPanel` component that supports platform selection (TikTok, IG, YT, etc.) and three input types: Caption, Video URL, and Image URL using tabs. Include a character counter and an optional context field for the AI. Then, build the main `/analyze` page that manages the analysis lifecycle: an empty state with a placeholder, a loading state with cycling messages like 'Checking hook strength...', an error state, and the final results view."

### Response
The `UploadPanel` was designed as a sophisticated input hub with clear tab-based navigation. I implemented a custom hook for the cycling loading messages to keep the user engaged during the inference period. The analyze page uses a two-column layout on desktop, where the input panel stays sticky while results appear on the right. I encountered some state synchronization issues when switching content types, which I resolved by using a centralized state object in the parent page component.

---

## Session 4 â€” Results Components

### Prompt
"Build the suite of result visualization components. First, `ScoreGauge.tsx`: an SVG-based circular gauge with an animated stroke that fills up to the score and includes a count-up number. Second, `MetricsGrid.tsx`: a 2x3 grid of cards with progress bars for specific metrics. Third, `SuggestionsList.tsx`: a breakdown of hook analysis and actionable improvements. Finally, `HashtagPanel.tsx`: a tabbed interface for hashtags, caption rewrites, and competitor insights."

### Response
I developed the `ScoreGauge` using SVG path math to calculate the `stroke-dashoffset` for a smooth circular fill animation. The `MetricsGrid` uses Tailwind's transition utilities for the bar fills, timed to trigger after the gauge finishes. I put extra effort into the `HashtagPanel`, making it easy for users to copy generated tags and captions with a single click. These components were built to be modular, so they can be reused in the history drawer and share cards later.

---

## Session 5 â€” Polish + Mobile QA

### Prompt
"Add final polish to the application. Implement CSS animations for `slideUp` and `pulseGlow`. Build a sticky score bar that slides in at the top when the user scrolls past the main gauge. Perform a full mobile QA pass, ensuring the two-column layout stacks correctly on 375px screens. Improve the API error handling to catch JSON parsing issues from the AI and provide a graceful fallback result."

### Response
I added custom keyframe animations in `tailwind.config.ts` to handle the subtle UI movements. The sticky score bar was implemented with a scroll listener and `AnimatePresence` for smooth entry/exit. During mobile QA, I found that the metrics grid was too cramped on small screens, so I adjusted the grid-template to be single-column on mobile. I also hardened the JSON parser in the backend to handle the common "markdown fence" issue where LLMs wrap JSON in backticks.

---

## Session 6 â€” API Provider Decision (Gemini â†’ Groq)

### Prompt
"I'm hitting quota limits with the Gemini API key during testing. Investigate free, high-performance alternatives that don't require a credit card and have generous limits. Once found, migrate the `lib/groq.ts` implementation to this new provider while keeping the same TypeScript interface. Ensure the model used is capable of high-quality reasoning for viral strategy."

### Response
After evaluating several providers, I chose **Groq** using their Llama 3.3 70B model. The switch was remarkably easy because Groq offers an OpenAI-compatible SDK. I updated the backend to use the `groq-sdk` while maintaining the exact same `ViralAnalysis` response shape. The migration resulted in significantly faster analysis times (under 2 seconds) thanks to Groq's LPU inference engine. I decided to keep Groq as the primary provider due to its superior speed and reliable JSON output, which outperformed my initial Gemini tests.

---

## Session 7 â€” Analysis History Feature

### Prompt
"Add a history feature so users don't lose their past analyses. Build `lib/history.ts` to manage localStorage, including saving new results and calculating trends. Then, create a `HistoryPanel.tsx` sliding drawer that shows past scores with platform badges and relative timestamps. Include a 'Restore' button to load an old analysis and a trend indicator (up/down arrow) based on the user's score history."

### Response
I implemented a robust localStorage wrapper that handles max entry limits and data pruning. The `HistoryPanel` was built as a side drawer using Framer Motion's `layout` prop for smooth item deletions. I added a custom event system (`historyUpdated`) so that the Navbar and Analyze page stay in sync whenever a new analysis is saved. The trend logic calculates the delta between the current score and the previous one, giving users visual feedback on whether their content is improving.

---

## Session 8 â€” Shareable Score Card

### Prompt
"Build a 'Share Your Score' feature. Create a `ShareCard.tsx` component that uses `html-to-image` to generate a beautiful visual card. It should be 480x280px with a radial gradient, the Bebas Neue score, and mini metric bars. Implement a 3x resolution PNG download for retina screens and a 'Copy Link' button. Integrate the trigger button into the results header."

### Response
This was one of the most challenging UI tasks. I designed the card to look like a premium "stat card" found in gaming apps. Using `html-to-image`, I had to ensure that the Google Fonts (Bebas Neue) were correctly loaded before the capture took place. I implemented a `pixelRatio: 3` setting to ensure the downloaded images look crisp on social media. The "Copy Link" button provides a 2-second visual confirmation, and the download button shows a loading spinner during generation to prevent double-clicks.

---

## Reflection

### What was easy
- **Framer Motion Integration**: Next.js and Framer Motion worked seamlessly together for the "electric" feel I wanted.
- **Switching to Groq**: Migrating from Gemini to Groq was surprisingly trivial thanks to the SDK compatibility, and it instantly fixed my quota issues.
- **Component Styling**: Tailwind CSS made it incredibly fast to build the dark-themed, high-contrast UI with consistent spacing.

### What was hard
- **JSON Structure Consistency**: Getting the LLM to strictly follow the JSON schema without adding conversational filler required careful prompt engineering and backend validation guards.
- **Canvas Capture**: Rendering the Share Card correctly with `html-to-image` was tricky, especially handling web font loading and ensuring the radial gradient didn't look banded in the PNG output.
- **Responsive Layout**: Balancing a detailed results view with a sticky input panel required complex CSS grid and sticky positioning logic to work well across all device sizes.

### What I'd improve in v2
- **Direct Platform Integrations**: Adding the ability to fetch real video metadata directly from a TikTok or Reels URL instead of requiring manual input.
- **Multi-Content Comparison**: A "Battle Mode" where users can compare two different captions side-by-side to see which scores higher.
- **PDF Export**: Generating a multi-page PDF report with detailed competitor breakdown and trend analysis over time.

### Key learnings
- **Speed is UI**: The jump in speed from Gemini to Groq (Llama 3.3) fundamentally changed how the app felt; near-instant feedback makes the "Analyze" button feel much more satisfying.
- **Persistence Matters**: Even for a simple clone, adding localStorage history makes the app feel like a real tool rather than a one-off demo.
- **Visual Asset Generation**: Providing a "Shareable Card" is one of the best ways to drive organic growth for a viral tool, and it was worth the extra effort to get the design right.

## SESSION 9 — Final Product Upgrades
## Prompt
Implement 9 major upgrades: 1. Direct File Upload + Preview, 2. Engagement Forecast (Views/Likes/Comments/Shares), 3. Trending Audio Recs, 4. Competitor Side-by-Side Radar Charts, 5. Interactive Improvement Checklist (persistent), 6. Premium Share Card (html2canvas), 7. Platform-Specific Weighted Scoring, 8. Visual Hook Timeline, 9. Polish & Micro-interactions.

## Response
Transformed ViralScore into a professional-grade product:
- **Direct Upload**: Added drag-and-drop zone for media files (max 50MB) with thumbnail/video previews.
- **Advanced Forecast**: Integrated Recharts to show predicted reach and engagement with AI confidence levels.
- **Competitor Intelligence**: Replaced text summaries with interactive Radar Charts comparing user content against top creators.
- **Interactive Coaching**: Built a persistent checklist system for content improvements, using localStorage to track user progress and celebrating completion with confetti.
- **Visual Pacing**: Added a "Hook Timeline" showing second-by-second analysis of content flow.
- **Premium Branding**: Redesigned the "Share Your Score" card with a high-end editorial look, high-resolution capture, and "Copy Image" support.
- **Scoring Engine**: Implemented a weighted algorithm that adjusts the overall score based on platform-specific virality drivers (e.g., TikTok hook-weighting vs. LinkedIn clarity-weighting).
- **UX Polish**: Added a "Viral Tips Marquee" and centralized all animations in lib/animations.ts for a buttery-smooth feel.

---

## Session 10 — Production AI Prompt & UI Upgrade

### Prompt
"Upgrade ViralScore with a drop-in system prompt that is contest-optimized. The prompt must output a highly detailed, calibrated JSON response with zero prefix/suffix. The scoring should be driven by a rigid scoring rubric across 7 metrics (Hook, Caption, Thumbnail, Emotion, Pacing, CTA, Trend relevance). For the front end, implement UI upgrades matching the 'ui-ux-pro-max' guidelines: dynamic score color gauges with glow layers, a punchy one-liner summary bar, priority-based action items detailing expected growth impact, a three-tier hashtag discovery grid, dynamic search queries for trending audio with click-to-copy capability, and a schedule card detailing optimal posting time, format, and repurposed channels."

### Response
I implemented a comprehensive prompt configuration and UI dashboard upgrade:
- **Calibrated Scoring Engine**: Overhauled `lib/groq.ts` with the contest-calibrated system instruction. It utilizes the Llama 3.3 70B model with a low temperature of `0.4` and forced JSON formatting (`response_format: { type: 'json_object' }`) to eliminate score inflation.
- **Backward-Compatible Data Mapping**: Implemented a robust translation layer that maps snake_case properties to camelCase legacy ones. This prevents client-side rendering failures when parsing older localStorage history logs, while parsing the new structured nodes (`metricsNew`, `hashtagsNew`, `trendingAudioNew`, `competitorBenchmarkNew`, and `postingStrategy`).
- **Distribution Strategy**: Developed `PostingStrategy.tsx` to visualize optimal posting schedules, layout format configurations, and cross-platform repurposing directions.
- **Visual & Usability Enhancements**:
  - **Dynamic Themes**: Mapped the gauge accent stroke and blur glows to the AI's calibrated `scoreColor` values (red, orange, yellow, lime, green).
  - **Tiered Tag Grid**: Grouped tags into Primary (High-vol), Secondary (Discovery), and Niche (Community) tiers, complete with placement rules.
  - **Action Checklist**: Integrated a priority card ranking the Top 3 actions side-by-side with expected growth rates.
  - **Interactive Chips**: Exposed search terms as clickable chips copying queries instantly to the clipboard.
  - **Gap Analysis alert**: Rendered a critical warning alert highlighting the creator's largest content drop-off relative to competitor benchmarks.

---

## AI-Assisted Development & Architectural Standards

### 1. Quality of Prompts and Iterations
- **Calibration via Structured Rubrics**: Instead of requesting open-ended scores, prompts specify numeric thresholds (e.g., Hook 90-100 = pattern interrupt + clear promise). This constraints the LLM to output consistent, calibrated ratings.
- **Calibrated System-User Separation**: Prompt structure splits system constraints (data format, scoring scales, rules) from dynamic user inputs (`PLATFORM`, `CAPTION`, `VIDEO URL`, `IMAGE URL / DESCRIPTION`, `ADDITIONAL CONTEXT`), achieving robust system separation.
- **Zero-Filler Constraints**: Restricting LLM completions to raw JSON objects without conversational filler avoids parsing runtime crashes.

### 2. Code Quality & Clean Architecture
- **Clean Separation of Concerns**: Isolates prompt engineering and response validation (`lib/groq.ts`) from the presentation components. UI components only receive clean, type-safe props.
- **Defensive Boundary Validations**: API responses undergo type checks and schema validation at the network boundary. If verification fails, a fallback object is structured without throwing unhandled exceptions.
- **Strict Typing Compilation**: The codebase is written in clean, modern TypeScript compiling with zero errors. All hooks and event emitters are memoized with clear dependency matrices.

