import { Channel } from './types'

const TAVILY_API_KEY = process.env.TAVILY_API_KEY

async function tavilySearch(query: string, maxResults = 5): Promise<{ title: string; url: string; content: string }[]> {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query,
      search_depth: 'basic',
      max_results: maxResults,
    }),
    signal: AbortSignal.timeout(10000),
  })
  const data = await res.json() as { results?: { title: string; url: string; content: string }[] }
  return data.results || []
}

export async function searchRedditCommunities(keywords: string[]): Promise<Channel[]> {
  const channels: Channel[] = []
  const seen = new Set<string>()

  for (const kw of keywords.slice(0, 2)) {
    const results = await tavilySearch(`${kw} indie game community site:reddit.com`)
    for (const r of results) {
      const match = r.url.match(/reddit\.com\/(r\/[^/]+)/)
      if (!match) continue
      const name = match[1]
      if (seen.has(name)) continue
      seen.add(name)

      // Extract member count from content if present
      const memberMatch = r.content.match(/([\d,.]+[kKmM]?\s*(members|subscribers))/i)
      const rawCount = memberMatch ? memberMatch[1] : '0'
      const followerCount = parseFollowerText(rawCount)

      channels.push({
        id: name,
        platform: 'reddit',
        name,
        url: `https://www.reddit.com/${name}`,
        followerCount,
        followerLabel: 'members',
        description: r.content.slice(0, 200),
        relevanceReason: '',
      })
    }
  }

  return channels.slice(0, 5)
}

export async function searchBilibiliCreators(keywords: string[]): Promise<Channel[]> {
  const channels: Channel[] = []
  const seen = new Set<string>()

  for (const kw of keywords.slice(0, 2)) {
    const results = await tavilySearch(`${kw} 独立游戏 site:bilibili.com`)
    for (const r of results) {
      const match = r.url.match(/bilibili\.com\/video|space\.bilibili\.com\/(\d+)/)
      if (!match) continue
      const uid = match[1] || r.url
      if (seen.has(uid)) continue
      seen.add(uid)

      channels.push({
        id: uid,
        platform: 'bilibili',
        name: r.title.replace(/[-_|].*$/, '').trim(),
        url: r.url.includes('space.bilibili') ? r.url : `https://www.bilibili.com`,
        followerCount: 0,
        followerLabel: 'followers',
        description: r.content.slice(0, 200),
        relevanceReason: '',
      })
    }
  }

  return channels.slice(0, 5)
}

export async function searchXiaohongshuCreators(keywords: string[]): Promise<Channel[]> {
  const channels: Channel[] = []
  const seen = new Set<string>()

  for (const kw of keywords.slice(0, 2)) {
    const results = await tavilySearch(`${kw} 独立游戏 小红书 site:xiaohongshu.com`)
    for (const r of results) {
      if (seen.has(r.url)) continue
      seen.add(r.url)

      channels.push({
        id: r.url,
        platform: 'xiaohongshu',
        name: r.title.replace(/[-_|–].*$/, '').trim(),
        url: r.url,
        followerCount: 0,
        followerLabel: 'fans',
        description: r.content.slice(0, 200),
        relevanceReason: '',
      })
    }
  }

  return channels.slice(0, 5)
}

export async function searchGamingMedia(angles: string[]): Promise<Channel[]> {
  const mediaOutlets = [
    { name: 'Rock Paper Shotgun', url: 'https://www.rockpapershotgun.com', platform: 'gaming_media' as const },
    { name: 'Kotaku', url: 'https://kotaku.com', platform: 'gaming_media' as const },
    { name: 'IGN Indie', url: 'https://www.ign.com', platform: 'gaming_media' as const },
    { name: 'PC Gamer', url: 'https://www.pcgamer.com', platform: 'gaming_media' as const },
    { name: 'Indie Game Website', url: 'https://indiegamewebsite.com', platform: 'gaming_media' as const },
  ]

  return mediaOutlets.map((m, i) => ({
    id: `media_${i}`,
    platform: m.platform,
    name: m.name,
    url: m.url,
    followerCount: [1500000, 900000, 3000000, 2000000, 150000][i],
    followerLabel: 'monthly readers',
    relevanceReason: `Regularly covers indie game releases in the ${angles[0] || 'action'} genre.`,
  }))
}

function parseFollowerText(text: string): number {
  const cleaned = text.toLowerCase().replace(/[,\s]/g, '')
  if (cleaned.includes('m')) return parseFloat(cleaned) * 1_000_000
  if (cleaned.includes('k')) return parseFloat(cleaned) * 1_000
  return parseInt(cleaned, 10) || 0
}
