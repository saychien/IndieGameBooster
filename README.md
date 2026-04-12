# Indie Game Booster

AI-powered marketing copilot for indie game developers. Paste a Steam URL and get audience analysis, multi-platform KOL discovery, and personalized outreach content — in minutes.

## Prerequisites

- Node.js 18+
- npm

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Configure API keys**

Copy the example and fill in your keys:

```bash
cp .env.local.example .env.local
```

| Variable | Where to get it |
|----------|----------------|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `YOUTUBE_API_KEY` | [Google Cloud Console](https://console.cloud.google.com) → YouTube Data API v3 |
| `TAVILY_API_KEY` | [app.tavily.com](https://app.tavily.com) |
| `FIRECRAWL_API_KEY` | [firecrawl.dev](https://firecrawl.dev) (optional) |

**3. Run the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Paste a Steam store URL (e.g. `https://store.steampowered.com/app/367520/Hollow_Knight/`)
2. Review and edit the AI-generated audience analysis
3. Browse discovered channels across YouTube, Reddit, Bilibili, and Xiaohongshu
4. Select your targets and generate platform-native outreach content
5. Download as ZIP or publish via hosted mode

**Try without API keys** — click the Demo buttons on the landing page to load pre-built examples instantly.

## Project Structure

```
app/
  page.tsx              # Landing page
  results/page.tsx      # Main results flow
  api/
    steam/              # Steam + SteamSpy data
    analyze/            # Claude audience analysis
    discovery/          # Multi-platform KOL search
    outreach/           # Content generation
    publish/            # Hosted publish (stub)
components/
  GameInput.tsx         # URL input
  AnalysisEditor.tsx    # Editable analysis report
  ChannelDiscovery.tsx  # Channel browser with filters
  ChannelCard.tsx       # Individual channel card
  OutreachWorkspace.tsx # Generated content viewer
  PublishPanel.tsx      # Download / publish selector
lib/
  types.ts              # Shared TypeScript types
  steam.ts              # Steam API helpers
  claude.ts             # Anthropic SDK wrapper
  youtube.ts            # YouTube Data API helpers
  tavily.ts             # Tavily search (Reddit/Bilibili/Xiaohongshu)
  mockData.ts           # Demo data for 2 games
  export.ts             # ZIP download utility
```

## Build for Production

```bash
npm run build
npm start
```
