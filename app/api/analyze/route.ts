import { NextRequest, NextResponse } from 'next/server'
import { callClaude, parseJson } from '@/lib/claude'
import { GameData, AnalysisReport, ImprovementTip, SimilarGame } from '@/lib/types'

export async function POST(req: NextRequest) {
  const game: GameData = await req.json()

  const analysisPrompt = `You are a senior indie game publishing consultant.

Analyze this game and return ONLY a JSON object, no markdown:
{
  "audienceProfile": "2-3 sentence description of the ideal player",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "chineseKeywords": ["中文关键词1", "中文关键词2", "中文关键词3", "中文关键词4", "中文关键词5"],
  "vibeKeywords": ["mood term 1", "mood term 2", "mood term 3", "mood term 4", "mood term 5"],
  "chineseVibeKeywords": ["氛围词1", "氛围词2", "氛围词3", "氛围词4", "氛围词5"],
  "whyTheyWillLoveIt": "One sentence on the emotional hook",
  "similarGames": [
    { "name": "Game Title 1", "steamAppId": "123456" },
    { "name": "Game Title 2", "steamAppId": "234567" },
    { "name": "Game Title 3", "steamAppId": "345678" },
    { "name": "Game Title 4", "steamAppId": "456789" },
    { "name": "Game Title 5", "steamAppId": "567890" }
  ]
}

Rules:
- keywords: 5 English search terms for YouTube, Reddit, and gaming media discovery — focused on game genre and mechanics
- chineseKeywords: 5 Mandarin Chinese terms for Bilibili and Xiaohongshu discovery — focused on game genre and mechanics
- vibeKeywords: 5 English mood/aesthetic terms that capture how this game FEELS, not what it IS. These should match non-gaming content — music, film, art, nature videos — that evokes the same emotional atmosphere. Think: "dark cave exploration", "melancholic orchestral", "hand-drawn gothic art", "lonely wilderness survival". These are used to find creators and channels outside the gaming niche whose audience resonates with the game's mood.
- chineseVibeKeywords: the same concept as vibeKeywords but in Mandarin Chinese, for Bilibili and Xiaohongshu discovery. Think: "暗黑系美学", "治愈系氛围", "孤独感", "地下洞穴探索". These should capture the emotional/aesthetic atmosphere, not game mechanics.
- audienceProfile: who plays this, their habits, where they hang out online
- whyTheyWillLoveIt: the core emotional reason this game resonates
- similarGames: 5 well-known games whose audience would enjoy this game, based on genre/mechanics/mood. Include games that fans of this game are also known to play. Do not repeat games already in the "Similar games" input below. For each game include its numeric Steam app ID (e.g. Hollow Knight is 367520, Dead Cells is 588650). If you are not confident of the app ID, omit the steamAppId field entirely rather than guessing.

Game name: ${game.name}
Description: ${game.description}
Steam tags: ${game.tags.join(', ')}
Similar games: ${game.similarGames.join(', ')}`

  const tipsPrompt = `You are a Steam page conversion specialist.

Generate exactly 3 specific, actionable improvement suggestions for this game's Steam store page. Each suggestion must reference a concrete element.

Return ONLY a JSON array, no markdown:
[
  { "title": "...", "suggestion": "...", "impact": "high" },
  { "title": "...", "suggestion": "...", "impact": "high" },
  { "title": "...", "suggestion": "...", "impact": "medium" }
]

Game: ${game.name}
Tags: ${game.tags.join(', ')}
Description: ${game.description.slice(0, 300)}
Market context: estimated ${game.estimatedOwners || 'unknown'} owners, priced at $${game.price}`

  try {
    const [analysisRaw, tipsRaw] = await Promise.all([
      callClaude(analysisPrompt, 600),
      callClaude(tipsPrompt, 400),
    ])

    const parsed = parseJson<AnalysisReport>(analysisRaw)
    const analysis: AnalysisReport = {
      ...parsed,
      chineseVibeKeywords: parsed.chineseVibeKeywords ?? [],
      activeKeywordMode: 'game',
    }
    const tips = parseJson<ImprovementTip[]>(tipsRaw)

    return NextResponse.json({ analysis, tips })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Analysis failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
