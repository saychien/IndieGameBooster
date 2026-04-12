import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/claude'
import { searchYouTubeChannels } from '@/lib/youtube'
import {
  searchRedditCommunities,
  searchBilibiliCreators,
  searchXiaohongshuCreators,
  searchGamingMedia,
} from '@/lib/tavily'
import { AnalysisReport, Channel } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { analysis, gameName }: { analysis: AnalysisReport; gameName: string } = await req.json()

  try {
    // Parallel platform searches
    const [ytChannels, redditCommunities, bilibiliCreators, xiaohongshuCreators, mediaOutlets] =
      await Promise.allSettled([
        searchYouTubeChannels(analysis.youtubeKeywords),
        searchRedditCommunities(analysis.redditKeywords),
        searchBilibiliCreators(analysis.bilibiliKeywords),
        searchXiaohongshuCreators(analysis.xiaohongshuKeywords),
        searchGamingMedia(analysis.gamingMediaAngles),
      ])

    const allChannels: Channel[] = [
      ...(ytChannels.status === 'fulfilled' ? ytChannels.value : []),
      ...(redditCommunities.status === 'fulfilled' ? redditCommunities.value : []),
      ...(bilibiliCreators.status === 'fulfilled' ? bilibiliCreators.value : []),
      ...(xiaohongshuCreators.status === 'fulfilled' ? xiaohongshuCreators.value : []),
      ...(mediaOutlets.status === 'fulfilled' ? mediaOutlets.value : []),
    ]

    if (allChannels.length === 0) {
      return NextResponse.json({ channels: [] })
    }

    // Rank and add relevanceReason via Claude
    const rankPrompt = `You are a game marketing strategist.

Given this game's audience profile:
"${analysis.audienceProfile}"

Game: ${gameName}

For each of the following channels/communities, add a concise one-sentence "relevanceReason" explaining why this channel is a good marketing target for this game.

Return ONLY a JSON array with the exact same objects plus the relevanceReason field added. Do not change any other fields.

Channels:
${JSON.stringify(allChannels.map(c => ({ id: c.id, platform: c.platform, name: c.name, followerCount: c.followerCount, recentContent: c.recentContent, description: c.description })), null, 2)}`

    const ranked = await callClaude(rankPrompt, 1000)
    const rankedPartial: { id: string; relevanceReason: string }[] = JSON.parse(ranked)

    const reasonMap = new Map(rankedPartial.map(r => [r.id, r.relevanceReason]))
    const finalChannels = allChannels.map(c => ({
      ...c,
      relevanceReason: reasonMap.get(c.id) || c.relevanceReason,
    }))

    return NextResponse.json({ channels: finalChannels })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Discovery failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
