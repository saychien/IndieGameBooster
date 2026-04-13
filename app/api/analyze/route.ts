import { NextRequest, NextResponse } from 'next/server'
import { callClaude, parseJson } from '@/lib/claude'
import { GameData, AnalysisReport, ImprovementTip } from '@/lib/types'

export async function POST(req: NextRequest) {
  const game: GameData = await req.json()

  const analysisPrompt = `You are a senior indie game publishing consultant.

Analyze this game and return ONLY a set of 5 to 7 tags that you deem best descibe the game. 
Tags could be of various nature. Examples including Genres, with particular attention to the most specific Genre or Sub-Genre
Visual properties, such as Dimensions: 2D, 2.5D, 3D Camera Perspective: Third-Person, First-Person, Top-Down, Isometric, Side-Scroller, etc.
Visual Style: Pixel Graphics, Realistic, Abstract, Anime, Cute, Stylized, Minimalist, etc.
Themes & Moods, such as Theme: Sci-Fi, Fantasy, Space, Zombies, Vampires, etc.
Mood: Relaxing, Funny, Atmospheric, etc. Features, such as Gameplay mechanics like Choices Matter, Resource Management, Trading, etc.
Design ingredients like Physics, Procedural Generation, etc.
Player activities such as Sailing, Mining, Hacking, etc. Note that these tags don't have priority and you
don't have to add a tag from each categories necessarily. Return the Tags as a valid JSON object.

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
