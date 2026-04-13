import { NextRequest, NextResponse } from 'next/server'
import { callClaude, parseJson } from '@/lib/claude'
import { GameData, AnalysisReport, ImprovementTip } from '@/lib/types'

export async function POST(req: NextRequest) {
  const game: GameData = await req.json()

  const analysisPrompt = `You are a senior indie game publishing consultant.

Analyze this game and return ONLY a JSON object, no markdown:
{
  "audienceProfile": "2-3 sentence description of the ideal player",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "chineseKeywords": ["中文关键词1", "中文关键词2", "中文关键词3", "中文关键词4", "中文关键词5"],
  "whyTheyWillLoveIt": "One sentence on the emotional hook"
}

Rules:
- keywords: 5 English search terms for YouTube, Reddit, and gaming media discovery
- chineseKeywords: 5 Mandarin Chinese terms for Bilibili and Xiaohongshu discovery
- audienceProfile: who plays this, their habits, where they hang out online
- whyTheyWillLoveIt: the core emotional reason this game resonates

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

    const analysis = parseJson<AnalysisReport>(analysisRaw)
    const tips = parseJson<ImprovementTip[]>(tipsRaw)

    return NextResponse.json({ analysis, tips })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Analysis failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
