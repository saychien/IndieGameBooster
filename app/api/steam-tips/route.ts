import { NextRequest, NextResponse } from 'next/server'
import { callClaude, parseJson } from '@/lib/claude'
import { GameData, ImprovementTip } from '@/lib/types'

export async function POST(req: NextRequest) {
  const game: GameData = await req.json()

  const prompt = `You are a Steam page conversion specialist.

Based on this game's data, generate exactly 3 specific, actionable improvement suggestions for the Steam store page. Each suggestion must reference a concrete element (description, tags, screenshots, pricing, header image).

Return ONLY a JSON array, no markdown:
[
  { "title": "...", "suggestion": "...", "impact": "high" },
  { "title": "...", "suggestion": "...", "impact": "high" },
  { "title": "...", "suggestion": "...", "impact": "medium" }
]

Game: ${game.name}
Tags: ${game.tags.join(', ')}
Description: ${game.description.slice(0, 400)}
Market context: estimated ${game.estimatedOwners || 'unknown'} owners, priced at $${game.price}`

  try {
    const raw = await callClaude(prompt, 400)
    const tips = parseJson<ImprovementTip[]>(raw)
    return NextResponse.json({ tips })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Tips generation failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
