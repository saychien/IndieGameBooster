# CLAUDE.md — Indie Game Launch Copilot

## Project Overview

An AI-powered tool that helps indie game developers — who typically lack marketing or publishing backgrounds — find their audience, discover relevant KOLs and communities, and generate personalized outreach content. The goal is to give a solo indie studio the publishing power of a professional label.

**Core pitch:** "We replace a publisher with an AI agent."

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| AI | Claude API (`claude-sonnet-4-20250514`) |
| Steam data | Steam Store API + SteamSpy API |
| KOL discovery | YouTube Data API v3 (primary) + Tavily API (fallback/Reddit) |
| Web scraping | Firecrawl API (for SteamDB historical data) |
| Env | `.env.local` for all API keys |

---

## Project Structure

```
/app
  /page.tsx                  # Landing / input page
  /results/page.tsx          # Results dashboard
  /api
    /steam/route.ts          # Steam + SteamSpy data fetching
    /analyze/route.ts        # Claude audience analysis
    /kol/route.ts            # YouTube + Tavily KOL search
    /outreach/route.ts       # Claude outreach generation
/components
  /GameInput.tsx             # Steam URL or text description input
  /AudienceCard.tsx          # Audience profile display
  /KOLList.tsx               # KOL results with select interaction
  /OutreachPanel.tsx         # Generated email/post with copy button
  /ImprovementTips.tsx       # 3 steam page improvement suggestions
/lib
  /steam.ts                  # Steam API + SteamSpy helpers
  /claude.ts                 # Claude API call wrappers
  /youtube.ts                # YouTube Data API helpers
  /tavily.ts                 # Tavily search helpers
  /mockData.ts               # Pre-loaded demo data for 2 test games
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
**Output:** Audience profile + search keywords

**Claude prompt:**
```
You are a senior indie game publishing consultant.

Analyze this game and return ONLY a JSON object, no markdown:
{
  "audienceProfile": "2-3 sentence description of the ideal player",
  "coreGenreTags": ["tag1", "tag2", "tag3"],
  "youtubeKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "redditKeywords": ["subreddit1", "subreddit2", "subreddit3"],
  "whyTheyWillLoveIt": "One sentence on the emotional hook"
}

Game name: {name}
Description: {description}
Steam tags: {tags}
Similar games: {similarGames}
```

---

### Feature 3 — Steam Page Improvement Tips (Claude)
**Input:** `GameData` object + SteamSpy estimated owners
**Output:** Exactly 3 actionable improvement suggestions

**Claude prompt:**
```
You are a Steam page conversion specialist.

Based on this game's data, generate exactly 3 specific, actionable improvement suggestions for the Steam store page. Each suggestion must reference a concrete element (description, tags, screenshots, pricing, header image).

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

### Feature 4 — KOL & Community Discovery
**Input:** YouTube keywords + Reddit keywords from Feature 2
**Output:** List of KOLs and subreddits with metadata

**YouTube API call:**
```typescript
// Search videos by keyword, extract unique channels
GET https://www.googleapis.com/youtube/v3/search
  ?q={keyword}+indie+game+review
  &type=video
  &videoCategoryId=20
  &maxResults=10
  &key={YOUTUBE_API_KEY}

// Then batch-fetch channel details for subscriber count
GET https://www.googleapis.com/youtube/v3/channels
  ?id={channelIds}
  &part=snippet,statistics,contentDetails
  &key={YOUTUBE_API_KEY}
```

**Filtering rule:** Only show channels with 10,000–500,000 subscribers.

**For each channel, also fetch 3 most recent video titles:**
```typescript
GET https://www.googleapis.com/youtube/v3/search
  ?channelId={id}
  &order=date
  &maxResults=3
  &type=video
  &key={YOUTUBE_API_KEY}
```

**Tavily fallback (Reddit communities):**
```typescript
// Use Tavily to search Reddit communities
const result = await tavily.search({
  query: `${redditKeyword} indie game community site:reddit.com`,
  searchDepth: "basic",
  maxResults: 5
})
```

**Return type:**
```typescript
interface KOL {
  channelId: string
  channelName: string
  subscriberCount: number
  recentVideoTitles: string[]
  channelUrl: string
  relevanceReason: string   // Claude-generated, 1 sentence
}

interface Community {
  name: string              // e.g. "r/indiegaming"
  url: string
  description: string
  estimatedMembers?: number
}
```

**After fetching, run a second Claude call to rank and add relevanceReason:**
```
Given this game's audience profile: {audienceProfile}

Rank these YouTube channels by relevance and add a one-sentence reason for each.
Return ONLY JSON array preserving all original fields plus "relevanceReason".

Channels: {channelsJSON}
```

---

### Feature 5 — Outreach Content Generation (Claude)
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

### Feature 6 — Mock Data
Pre-load results for two games so demo works instantly if APIs are slow.

**Game 1:** A dark roguelike (e.g., similar to Dead Cells)
**Game 2:** A cozy farming sim (e.g., similar to Stardew Valley)

Store in `/lib/mockData.ts` as complete response objects matching the real API response shape. Add a `?demo=1` or `?demo=2` query param that bypasses all API calls and returns mock data instantly.

---

### Feature 7 — UI Design
**Aesthetic direction:** Dark, premium SaaS — like a tool a serious developer would pay for. Not playful, not corporate. Think Linear.app meets a game dashboard.

**Color palette:**
- Background: `#0a0a0f` (near black)
- Surface: `#12121a`
- Border: `#1e1e2e`
- Accent: `#6366f1` (indigo)
- Text primary: `#e2e8f0`
- Text muted: `#64748b`

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

[Results Page — 4 sections, appear sequentially]
  Section 1: Game Summary Card (name, tags, cover image if available)
  Section 2: Audience Profile + 3 Steam Tips
  Section 3: KOL List (YouTube channels) + Reddit Communities
  Section 4: Outreach Panel (appears after user selects a KOL)
```

---

## Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=
YOUTUBE_API_KEY=
TAVILY_API_KEY=
FIRECRAWL_API_KEY=
```

---

## Error Handling Rules

- If Steam API fails: fall back to text description only, skip Feature 3 tips
- If YouTube API quota exceeded: fall back to Tavily for KOL search
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

---

## Demo Script (for pitch)

1. Open app, paste Steam URL of a real indie game
2. Click "Find My Audience"
3. Point to audience profile card: *"In seconds, we've profiled exactly who plays this game"*
4. Point to Steam tips: *"We found 3 specific improvements to the store page"*
5. Point to KOL list: *"These are real YouTube channels whose audiences match — filtered to the sweet spot of 10K–500K subscribers"*
6. Click one KOL: *"Watch what happens when I select this one..."*
7. Show outreach email: *"A personalized email that references their actual recent video. Not a template."*
8. Show Estimated Reach number: *"This developer just got access to 2.3M potential players — with zero marketing budget."*
