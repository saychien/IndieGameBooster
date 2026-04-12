/**
 * /api/xiaohongshu-tags
 *
 * Stage 4: LLM-only tag generation for 小红书. No database, no crawling.
 */

import { NextRequest, NextResponse } from 'next/server'
import { callClaude, parseJson } from '@/lib/claude'
import { GameData } from '@/lib/types'

interface RequestBody {
  gameData: GameData
  audienceProfile: string
}

interface XhsTags {
  genreTags: string[]
  moodTags: string[]
  playerTags: string[]
  trendingTags: string[]
}

export async function POST(req: NextRequest) {
  const { gameData, audienceProfile }: RequestBody = await req.json()

  const prompt = `You are a 小红书 (Xiaohongshu) marketing specialist for indie games.

Generate exactly 12 recommended hashtags for this game on 小红书.
Mix of: genre tags, mood/aesthetic tags, player identity tags, and trending gaming tags.
All tags must be in Chinese. Format each with # prefix.

Return ONLY a JSON object:
{
  "genreTags": ["#tag1", "#tag2", "#tag3"],
  "moodTags": ["#tag1", "#tag2", "#tag3"],
  "playerTags": ["#tag1", "#tag2", "#tag3"],
  "trendingTags": ["#tag1", "#tag2", "#tag3"]
}

Game name: ${gameData.name}
Description: ${gameData.description.slice(0, 400)}
Core genre tags: ${gameData.tags.join(', ')}
Audience profile: ${audienceProfile}`

  try {
    const raw = await callClaude(prompt, 300)
    const tags = parseJson<XhsTags>(raw)
    return NextResponse.json(tags)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Tag generation failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
