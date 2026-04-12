# CLAUDE.md — Indie Game Launch Copilot

## Project Overview

An AI-powered tool that helps indie game developers — who typically lack marketing or publishing backgrounds — analyze their game, discover relevant KOLs and communities across global platforms, and generate platform-native outreach content. The goal is to give a solo indie studio the publishing power of a professional label.

**Core pitch:** "We replace a publisher with an AI agent."

**User flow (revised):**
1. Developer pastes a Steam URL
2. App generates a game analysis report (audience profile, keywords, genre tags) — developer can edit it inline before proceeding
3. **[NEW]** Developer selects which platform channels to search (YouTube, Reddit, Bilibili, 小红书, game media) — search only triggers after confirmation
4. App searches selected platforms, raw results are crawled (100–200 per keyword) and cached in PostgreSQL; rule-based filtering reduces to ~20–50 candidates; Claude ranks and annotates this shortlist only
5. Developer selects the specific creators/communities they want to target
6. App generates platform-appropriate marketing content for each selected target
7. Developer chooses: have us publish directly (hosted), or download all content as files

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| AI | Claude API (`claude-sonnet-4-20250514`) |
| Steam data | Steam Store API + SteamSpy API |
| KOL discovery | YouTube Data API v3 + Tavily API (Reddit/Bilibili/Xiaohongshu/game media) |
| Web scraping | Firecrawl API (for SteamDB historical data) |
| Database | PostgreSQL (via Supabase free tier) |
| File export | `jszip` + `file-saver` (client-side ZIP download) |
| Env | `.env.local` for all API keys |

---

## Project Structure

```
/app
  /page.tsx                      # Landing / input page (Steam URL only)
  /results/page.tsx              # Results dashboard (multi-step flow)
  /api
    /steam/route.ts              # Steam + SteamSpy data fetching
    /analyze/route.ts            # Claude audience analysis
    /steam-tips/route.ts         # Claude Steam page tips (opt-in, separate route)
    /crawl/route.ts              # Raw KOL data crawl → PostgreSQL cache
    /discovery/route.ts          # Filter + Claude ranking of cached KOL data
    /outreach/route.ts           # Claude outreach content generation (all formats)
    /publish/route.ts            # Hosted publish stub (future integration)
/components
  /GameInput.tsx                 # Steam URL input
  /AnalysisEditor.tsx            # Editable audience profile + keyword cards
  /SteamTipsPanel.tsx            # [NEW] Opt-in Steam improvement tips (collapsed by default)
  /PlatformSelector.tsx          # [NEW] Channel type selector before discovery runs
  /ChannelDiscovery.tsx          # Multi-platform channel/creator results with filters
  /ChannelCard.tsx               # Individual channel card with influence badge + select
  /OutreachWorkspace.tsx         # Generated content per selected channel, with tabs
  /PublishPanel.tsx              # "Publish" vs "Download" choice + status
/lib
  /steam.ts                      # Steam API + SteamSpy helpers
  /claude.ts                     # Claude API call wrappers
  /youtube.ts                    # YouTube Data API helpers
  /tavily.ts                     # Tavily search (Reddit / Bilibili / Xiaohongshu / media)
  /db.ts                         # PostgreSQL client + KOL cache helpers
  /mockData.ts                   # Pre-loaded demo data for 2 test games
  /export.ts                     # ZIP export helper (jszip + file-saver)
/db
  /schema.sql                    # PostgreSQL table definitions
```

---

## Feature Breakdown

### Feature 1 — Game Data Ingestion
**Input:** Steam URL or plain text game description
**Output:** Structured game object with name, description, tags, similar games

**Implementation:**
- Parse AppID from Steam URL using regex: `/app\/(\d+)/`
- Call Steam Store API:
  ```
  https://store.steampowered.com/api/appdetails?appids={APPID}&cc=us&l=en
  ```
- Call SteamSpy API for estimated sales + similar games:
  ```
  https://steamspy.com/api.php?request=appdetails&appid={APPID}
  ```
- If no Steam URL: pass raw description text directly to Feature 2
- Return unified `GameData` object:
  ```typescript
  interface GameData {
    name: string
    description: string
    tags: string[]
    similarGames: string[]
    estimatedOwners?: string   // from SteamSpy
    price?: number
    steamAppId?: string
  }
  ```

---

### Feature 2 — Audience Analysis (Claude)
**Input:** `GameData` object
**Output:** Audience profile + per-platform search keywords

**Claude prompt:**
```
You are a senior indie game publishing consultant.

Analyze this game and return ONLY a JSON object, no markdown:
{
  "audienceProfile": "2-3 sentence description of the ideal player",
  "coreGenreTags": ["tag1", "tag2", "tag3"],
  "youtubeKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "redditKeywords": ["subreddit1", "subreddit2", "subreddit3"],
  "bilibiliKeywords": ["中文关键词1", "中文关键词2", "中文关键词3"],
  "xiaohongshuKeywords": ["中文关键词1", "中文关键词2", "中文关键词3"],
  "gamingMediaAngles": ["angle1", "angle2", "angle3"],
  "whyTheyWillLoveIt": "One sentence on the emotional hook"
}

Game name: {name}
Description: {description}
Steam tags: {tags}
Similar games: {similarGames}
```

---

### Feature 3 — Steam Page Improvement Tips (Claude) — OPT-IN
**Trigger:** User explicitly clicks "Analyze My Steam Page" button in `SteamTipsPanel.tsx`
**Default state:** Collapsed, not auto-generated
**Input:** `GameData` object + SteamSpy estimated owners
**Output:** Exactly 3 actionable improvement suggestions

**UI behaviour:**
- After Audience Analysis is shown, display a collapsed `SteamTipsPanel` with a CTA button: *"Analyze My Steam Page →"*
- Only call `/api/steam-tips` when user clicks; show skeleton loader while generating
- If Steam API failed (no `steamAppId`), hide this panel entirely

**Claude prompt:**
```
You are a Steam page conversion specialist.

Based on this game's data, generate exactly 3 specific, actionable improvement suggestions
for the Steam store page. Each suggestion must reference a concrete element
(description, tags, screenshots, pricing, header image).

Return ONLY a JSON array:
[
  { "title": "...", "suggestion": "...", "impact": "high|medium" },
  { "title": "...", "suggestion": "...", "impact": "high|medium" },
  { "title": "...", "suggestion": "...", "impact": "high|medium" }
]

Game data:
{gameData}

Market context: estimated {estimatedOwners} owners, priced at {price}
```

---

### Feature 4 — Platform Channel Selection (NEW STEP)
**Trigger:** Shown immediately after Audience Analysis completes, before any crawl begins
**Component:** `PlatformSelector.tsx`

**UI design:**
- Display a grid of platform toggle cards (similar to the Discovery Keywords panel in the screenshot):
  - YouTube (English)
  - Reddit
  - Bilibili
  - 小红书 (Xiaohongshu)
  - Gaming Media (Kotaku, IGN, indie press)
- Each card shows the platform icon, name, and the relevant keywords Claude generated for it
- User can deselect any platform they don't care about
- A "Start Discovery →" confirm button triggers the crawl only for selected platforms
- Unselected platforms are skipped entirely — no API calls, no token spend

**Data flow:**
```
AudienceAnalysis result
  → PlatformSelector (user picks platforms)
    → /api/crawl   (raw data fetch for selected platforms only)
      → /api/discovery  (filter + Claude ranking)
        → ChannelDiscovery (display results)
```

---

### Feature 5 — KOL & Community Discovery (3-Layer Architecture)

Discovery is split into three stages to minimise token usage and API quota waste:

#### Layer 1 — Raw Crawl (no AI) → `/api/crawl`

Fetch raw channel/community data and persist to PostgreSQL. This layer never calls Claude.

**Cache check first:** Before crawling, query the DB for existing entries matching `(keyword, platform)` with `fetched_at > NOW() - INTERVAL '7 days'`. If fresh cache exists, skip crawl for that keyword.

**YouTube:**
```typescript
// Per keyword: search videos → extract unique channel IDs → batch fetch channel stats
GET /youtube/v3/search?q={keyword}+indie+game+review&type=video&videoCategoryId=20&maxResults=20
GET /youtube/v3/channels?id={channelIds}&part=snippet,statistics
GET /youtube/v3/search?channelId={id}&order=date&maxResults=3&type=video
// Store up to 100–200 raw channel rows per keyword
```

**Tavily (Reddit / Bilibili / Xiaohongshu / media):**
```typescript
const result = await tavily.search({
  query: `${keyword} indie game community site:reddit.com`,
  searchDepth: "basic",
  maxResults: 10
})
// Store raw Tavily results (title, url, snippet) — 100–200 rows per keyword
```

**PostgreSQL schema** (`/db/schema.sql`):
```sql
CREATE TABLE kol_cache (
  id              SERIAL PRIMARY KEY,
  platform        TEXT NOT NULL,          -- 'youtube' | 'reddit' | 'bilibili' | 'xiaohongshu' | 'media'
  keyword         TEXT NOT NULL,
  channel_id      TEXT,                   -- platform-native ID (null for community results)
  channel_name    TEXT NOT NULL,
  subscriber_count BIGINT,
  description     TEXT,
  recent_titles   TEXT[],                 -- last 3 video/post titles
  channel_url     TEXT NOT NULL,
  fetched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (platform, channel_id)           -- dedup on upsert
);

CREATE INDEX idx_kol_cache_keyword ON kol_cache(platform, keyword, fetched_at);
```

**Upsert on conflict** (update `fetched_at` and `recent_titles` if channel already exists):
```typescript
INSERT INTO kol_cache (...) VALUES (...)
ON CONFLICT (platform, channel_id) DO UPDATE
  SET recent_titles = EXCLUDED.recent_titles,
      subscriber_count = EXCLUDED.subscriber_count,
      fetched_at = NOW();
```

---

#### Layer 2 — Rule-Based Filtering (no AI) → inside `/api/discovery`

Query PostgreSQL and apply hard filters before touching Claude:

```typescript
const candidates = await db.query(`
  SELECT * FROM kol_cache
  WHERE platform = $1
    AND keyword = ANY($2)
    AND subscriber_count BETWEEN 10000 AND 500000
    AND fetched_at > NOW() - INTERVAL '7 days'
  ORDER BY subscriber_count DESC
  LIMIT 50
`, [platform, keywords])
```

Additional rule filters (applied in code, not SQL):
- Remove channels with no recent titles (inactive)
- Deduplicate by `channel_id` across keywords
- Cap at 50 candidates per platform before sending to Claude

---

#### Layer 3 — AI Ranking (Claude) → inside `/api/discovery`

Only the filtered shortlist (~20–50 rows) is sent to Claude. Each row is compressed to a minimal summary to keep token count low.

**Input to Claude per channel:**
```typescript
// Strip to minimum — no full descriptions
{
  channelName: string,
  subscriberCount: number,
  recentTitles: string[],   // max 3 items
  description: string       // truncated to 80 chars
}
```

**Claude prompt:**
```
You are a game marketing analyst.

Given this game's audience profile:
{audienceProfile}

Rank these {platform} channels by relevance to this game's audience.
For each, add a "relevanceReason" (one sentence, max 15 words) and a
"relevanceScore" (0–100).

Return ONLY a JSON array preserving all original fields plus
"relevanceReason" and "relevanceScore". Sort by relevanceScore descending.

Channels:
{compressedChannelsJSON}
```

**Token budget:** ~1,000–1,500 tokens per platform call (50 channels × ~20 tokens each + prompt overhead).

**Return type:**
```typescript
interface KOL {
  channelId: string
  channelName: string
  platform: 'youtube' | 'reddit' | 'bilibili' | 'xiaohongshu' | 'media'
  subscriberCount: number
  recentVideoTitles: string[]
  channelUrl: string
  relevanceReason: string   // Claude-generated, ≤15 words
  relevanceScore: number    // 0–100
}
```

---

### Feature 6 — Outreach Content Generation (Claude)
**Input:** Selected KOL or community + GameData + audience profile
**Output:** Personalized email or Reddit post

**Email prompt (for YouTuber):**
```
You are an indie game developer writing a cold outreach email to a YouTuber.

Rules:
- Under 150 words
- First sentence must naturally reference one of their recent videos by name
- Tone: genuine indie dev, NOT a marketing agency
- Never use "I hope this email finds you well" or similar filler openers
- End with: game name, Steam link, offer of a free key
- Do not use bullet points in the email body

Game: {gameName}
Steam link: {steamUrl}
Why this YouTuber's audience will love it: {whyTheyWillLoveIt}
YouTuber channel: {channelName}
Their recent videos: {recentVideoTitles}

Output only the email body, no subject line.
```

**Reddit post prompt:**
```
You are an indie game developer posting in {subredditName}.

Write a Reddit post that:
- Feels authentic, not promotional
- Opens with something relatable to that community
- Describes the game in 2-3 sentences using the community's language
- Ends with a soft call to action (wishlisting or trying a demo)
- Under 200 words

Game: {gameName}
Description: {description}
Audience profile: {audienceProfile}

Output the post body only, no title.
```

---

### Feature 7 — Mock Data
Pre-load results for two games so demo works instantly if APIs are slow.

**Game 1:** A dark roguelike (e.g., similar to Dead Cells)
**Game 2:** A cozy farming sim (e.g., similar to Stardew Valley)

Store in `/lib/mockData.ts` as complete response objects matching the real API response shape. Add a `?demo=1` or `?demo=2` query param that bypasses all API calls and returns mock data instantly.

---

### Feature 8 — UI Design
**Aesthetic direction:** Clean, nature-forward SaaS with a premium feel. Pine green as the dominant brand color, white as the canvas. Think Notion meets a boutique indie studio tool — calm, confident, not corporate.

**Color palette:**

| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Brand primary | `--pine-700` | `#2D6A4F` | Buttons, active states, logo |
| Brand hover | `--pine-800` | `#1E4D38` | Button hover, pressed states |
| Brand light | `--pine-100` | `#D8EFE4` | Tag backgrounds, selected card fill |
| Brand muted | `--pine-200` | `#B2DACC` | Borders on selected elements |
| Accent | `--pine-500` | `#40916C` | Links, icons, badge highlights |
| Background | `--bg-page` | `#F7FBF9` | Page background (very light pine wash) |
| Surface | `--bg-surface` | `#FFFFFF` | Cards, panels, modals |
| Surface alt | `--bg-subtle` | `#EEF6F1` | Section backgrounds, keyword chip fill |
| Border | `--border-base` | `#C8DFD4` | Default borders and dividers |
| Border strong | `--border-strong` | `#95C4AE` | Focused inputs, active card outlines |
| Text primary | `--text-primary` | `#1A2E25` | Headings, body copy |
| Text secondary | `--text-secondary` | `#3D6B52` | Subheadings, labels |
| Text muted | `--text-muted` | `#7A9E8A` | Placeholders, captions, disabled |
| Text on pine | `--text-on-pine` | `#FFFFFF` | Text on pine-700/800 backgrounds |
| Destructive | `--red-500` | `#DC2626` | Error states only |

**Design notes:**
- All primary buttons: `bg-pine-700 text-white hover:bg-pine-800`
- Selected KOL cards: `border-pine-500 bg-pine-100`
- Keyword/tag chips: `bg-pine-100 text-pine-800 border border-pine-200`
- Section headers: `text-pine-700` with a `border-b border-pine-200` divider
- Loading skeletons: animate between `#EEF6F1` and `#D8EFE4`
- Input focus ring: `ring-2 ring-pine-500`

**Key UI behaviors:**
- Claude responses stream in (use `stream: true` and render progressively)
- KOL cards are selectable — clicking one triggers outreach generation
- "Estimated Reach" shown as a large number on results page (sum of selected KOL subscriber counts)
- Copy button on outreach panel with visual confirmation ("Copied!")
- Loading skeleton states for all async sections
- Each section appears after the previous one completes (progressive reveal)

**Page layout:**
```
[Input Page]
  Logo + tagline
  Input: Steam URL field  OR  "Describe your game" textarea
  Toggle between the two input modes
  Submit button: "Find My Audience →"

[Results Page — 5 sections, appear sequentially]
  Section 1: Game Summary Card (name, tags, cover image if available)
  Section 2: Audience Profile + keyword cards (editable)
             └─ SteamTipsPanel (collapsed, opt-in CTA)
  Section 3: PlatformSelector — user picks platforms, clicks "Start Discovery →"
  Section 4: KOL List per selected platform + Communities (after discovery completes)
  Section 5: Outreach Panel (appears after user selects a KOL)
```

---

## Database Setup

```bash
# Install Supabase JS client
npm install @supabase/supabase-js

# Run schema
psql $DATABASE_URL -f db/schema.sql
```

Add to `.env.local`:
```bash
DATABASE_URL=postgresql://...   # Supabase connection string
```

`/lib/db.ts` should export a single shared `pg` or Supabase client instance, used only from API routes (never from client components).

---

## Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=
YOUTUBE_API_KEY=
TAVILY_API_KEY=
FIRECRAWL_API_KEY=
DATABASE_URL=           # PostgreSQL (Supabase)
```

---

## Error Handling Rules

- If Steam API fails: fall back to text description only, hide SteamTipsPanel entirely
- If YouTube API quota exceeded: fall back to Tavily for YouTube KOL search
- If crawl returns 0 results for a platform: show "No results found for this platform" inline, do not call Claude for that platform
- If any Claude call fails: show error inline, offer "Retry" button
- Never show a blank page — always show partial results with clear loading states
- All API calls should have a 10-second timeout

---

## Important Constraints

- Do NOT use LangChain or any agent framework — call Claude API directly
- Do NOT build real-time scraping of SteamDB — use Firecrawl only if time permits, otherwise skip historical data
- Do NOT add authentication — this is a demo, no login required
- All API calls go through Next.js API routes, never call external APIs from the client directly (CORS issues)
- Keep each Claude response under 500 tokens for speed
- Claude is only called for: (1) audience analysis, (2) Steam tips (opt-in), (3) KOL ranking of pre-filtered shortlist, (4) outreach content. Claude is never used for raw data fetching or filtering.

---

## Demo Script (for pitch)

1. Open app, paste Steam URL of a real indie game
2. Click "Find My Audience"
3. Point to audience profile card: *"In seconds, we've profiled exactly who plays this game"*
4. Point to platform selector: *"The developer picks which markets they want to reach — YouTube, Reddit, Bilibili, wherever their players are"*
5. Click "Start Discovery →": *"Now we crawl in real-time and filter down to the exact right creators"*
6. Point to KOL list: *"These are real channels whose audiences match — filtered to the sweet spot of 10K–500K subscribers"*
7. Click one KOL: *"Watch what happens when I select this one..."*
8. Show outreach email: *"A personalized email that references their actual recent video. Not a template."*
9. Show Estimated Reach number: *"This developer just got access to 2.3M potential players — with zero marketing budget."*
10. (Optional) Click "Analyze My Steam Page" to demo the opt-in tips feature