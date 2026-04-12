import { Channel } from './types'

const BASE = 'https://www.googleapis.com/youtube/v3'
const KEY = process.env.YOUTUBE_API_KEY

async function ytFetch(path: string, params: Record<string, string>): Promise<unknown> {
  const url = new URL(`${BASE}${path}`)
  Object.entries({ ...params, key: KEY! }).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) })
  return res.json()
}

export async function searchYouTubeChannels(keywords: string[]): Promise<Channel[]> {
  const channelMap = new Map<string, { title: string; description: string }>()

  // Search videos for each keyword, collect channel IDs
  for (const kw of keywords.slice(0, 3)) {
    const data = await ytFetch('/search', {
      q: `${kw} indie game review`,
      type: 'video',
      videoCategoryId: '20',
      maxResults: '10',
      part: 'snippet',
    }) as { items?: { snippet: { channelId: string; channelTitle: string; description: string } }[] }

    for (const item of data.items || []) {
      const { channelId, channelTitle, description } = item.snippet
      if (!channelMap.has(channelId)) {
        channelMap.set(channelId, { title: channelTitle, description })
      }
    }
  }

  if (channelMap.size === 0) return []

  const ids = Array.from(channelMap.keys()).slice(0, 20).join(',')
  const detail = await ytFetch('/channels', {
    id: ids,
    part: 'snippet,statistics',
  }) as {
    items?: {
      id: string
      snippet: { title: string; description: string; customUrl?: string }
      statistics: { subscriberCount?: string }
    }[]
  }

  const channels: Channel[] = []
  for (const item of detail.items || []) {
    const subs = parseInt(item.statistics.subscriberCount || '0', 10)
    if (subs < 10000 || subs > 500000) continue

    // Fetch 3 recent videos
    const recent = await ytFetch('/search', {
      channelId: item.id,
      order: 'date',
      maxResults: '3',
      type: 'video',
      part: 'snippet',
    }) as { items?: { snippet: { title: string } }[] }

    const recentContent = (recent.items || []).map(v => v.snippet.title)

    channels.push({
      id: item.id,
      platform: 'youtube_creator',
      name: item.snippet.title,
      url: `https://youtube.com/channel/${item.id}`,
      followerCount: subs,
      followerLabel: 'subscribers',
      recentContent,
      description: item.snippet.description.slice(0, 200),
      relevanceReason: '',
    })
  }

  return channels
}
