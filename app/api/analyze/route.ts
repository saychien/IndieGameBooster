import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/claude'
import { GameData, AnalysisReport, ImprovementTip } from '@/lib/types'

export async function POST(req: NextRequest) {
  const game: GameData = await req.json()

  const analysisPrompt = `You are a senior indie game publishing consultant.

Analyze this game and return ONLY a valid JSON object, no markdown, no explanation:
{
  "audienceProfile": "2-3 sentence description of the ideal player persona",
  "coreGenreTags": ["tag1", "tag2", "tag3"],
  "youtubeKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "redditKeywords": ["subreddit1", "subreddit2", "subreddit3"],
  "bilibiliKeywords": ["中文关键词1", "中文关键词2", "中文关键词3"],
  "xiaohongshuKeywords": ["中文关键词1", "中文关键词2", "中文关键词3"],
  "gamingMediaAngles": ["angle1", "angle2", "angle3"],
  "whyTheyWillLoveIt": "One sentence emotional hook"
}

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

    const analysis: AnalysisReport = JSON.parse(analysisRaw)
    const tips: ImprovementTip[] = JSON.parse(tipsRaw)

    return NextResponse.json({ analysis, tips })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Analysis failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
