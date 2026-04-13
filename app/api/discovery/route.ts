/**
 * /api/discovery
 *
 * Stage 3: vector search + Claude annotation → returns to frontend.
 * Never does live crawling. Reads from PostgreSQL only.
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { callClaude, parseJson } from '@/lib/claude'
import { GameData } from '@/lib/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const TIMEOUT = 10_000

// ─── Types ───────────────────────────────────────────────────

export interface KOL {
  channelId: string
  channelName: string
  platform: string
  subscriberCount: number
  recentTitles: string[]
  channelUrl: string
  similarity: number
  relevanceReason: string
  relevanceScore: number
}

interface DiscoveryRequest {
  audienceProfile: string
  chineseKeywords?: string[]
  platforms: string[]
  gameData?: GameData
}

type DiscoveryResponse = Record<string, KOL[]>

// ─── Helpers ─────────────────────────────────────────────────

async function embedText(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return res.data[0].embedding
}

function vectorToSql(vec: number[]): string {
  return `[${vec.join(',')}]`
}

// ─── Step B: vector search ────────────────────────────────────

interface DbRow {
  id: number
  platform: string
  channel_id: string
  channel_name: string
  subscriber_count: string
  description: string | null
  recent_titles: string[] | null
  channel_url: string
  similarity: string
}

async function vectorSearch(
  platform: string,
  queryVector: number[]
): Promise<DbRow[]> {
  // Dynamic import to avoid crashes when DATABASE_URL is not set at build time
  const { query } = await import('@/lib/db')

  const vectorStr = vectorToSql(queryVector)
  return query<DbRow>(
    `SELECT id, platform, channel_id, channel_name, subscriber_count,
            description, recent_titles, channel_url,
            1 - (embedding <=> $1::vector) AS similarity
     FROM kol_cache
     WHERE platform = $2
       AND subscriber_count BETWEEN 10000 AND 2000000
       AND embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT 10`,
    [vectorStr, platform]
  )
}

// ─── Step C: Claude annotation ────────────────────────────────

interface CompressedChannel {
  id: string
  channelName: string
  subscriberCount: number
  recentTitles: string[]
  similarity: number
}

async function annotateWithClaude(
  rows: DbRow[],
  platform: string,
  audienceProfile: string
): Promise<Map<string, { relevanceReason: string; relevanceScore: number }>> {
  const compressed: CompressedChannel[] = rows.map(r => ({
    id: r.channel_id || String(r.id),
    channelName: r.channel_name,
    subscriberCount: parseInt(r.subscriber_count, 10),
    recentTitles: (r.recent_titles || []).slice(0, 2).map(t => t.slice(0, 60)),
    similarity: parseFloat(parseFloat(r.similarity).toFixed(2)),
  }))

  const prompt = `You are a game marketing analyst.

Game audience profile: ${audienceProfile}
Platform: ${platform}

For each channel below, add:
- "relevanceReason": one sentence, max 15 words, specific to this game's audience
- "relevanceScore": integer 0-100

Return ONLY a JSON array preserving all original fields plus the two new fields.
Sort by relevanceScore descending.

Channels: ${JSON.stringify(compressed)}`

  const raw = await callClaude(prompt, 2000)
  const annotated = parseJson<(CompressedChannel & { relevanceReason: string; relevanceScore: number })[]>(raw)

  const map = new Map<string, { relevanceReason: string; relevanceScore: number }>()
  for (const item of annotated) {
    map.set(item.id, {
      relevanceReason: item.relevanceReason ?? '',
      relevanceScore: item.relevanceScore ?? 0,
    })
  }
  return map
}

// ─── Route handler ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body: DiscoveryRequest = await req.json()
  const { audienceProfile, chineseKeywords, platforms } = body

  if (!audienceProfile || !platforms?.length) {
    return NextResponse.json({ error: 'audienceProfile and platforms required' }, { status: 400 })
  }

  if (!process.env.DATABASE_URL) {
    // Return empty arrays — no DB configured
    const empty: DiscoveryResponse = {}
    for (const p of platforms) empty[p] = []
    return NextResponse.json(empty)
  }

  const CN_PLATFORMS = new Set(['bilibili', 'xiaohongshu'])

  // Step A: embed query strings — one for global platforms, one for CN platforms
  const cnQuery = chineseKeywords?.length
    ? chineseKeywords.join(' ')
    : audienceProfile

  let globalVector: number[]
  let cnVector: number[]
  try {
    ;[globalVector, cnVector] = await Promise.all([
      embedText(audienceProfile),
      embedText(cnQuery),
    ])
  } catch (e) {
    return NextResponse.json(
      { error: `Embedding failed: ${(e as Error).message}` },
      { status: 500 }
    )
  }

  const result: DiscoveryResponse = {}

  await Promise.all(
    platforms.map(async (platform) => {
      const queryVector = CN_PLATFORMS.has(platform) ? cnVector : globalVector
      try {
        // Step B: vector search
        const rows = await vectorSearch(platform, queryVector)

        if (rows.length === 0) {
          result[platform] = []
          return
        }

        // Step C: Claude annotation
        const annotations = await annotateWithClaude(rows, platform, audienceProfile)

        // Step D: merge
        const kols: KOL[] = rows
          .map(r => {
            const channelId = r.channel_id || String(r.id)
            const ann = annotations.get(channelId)
            return {
              channelId,
              channelName: r.channel_name,
              platform,
              subscriberCount: parseInt(r.subscriber_count, 10),
              recentTitles: r.recent_titles || [],
              channelUrl: r.channel_url,
              similarity: parseFloat(parseFloat(r.similarity).toFixed(2)),
              relevanceReason: ann?.relevanceReason ?? '',
              relevanceScore: ann?.relevanceScore ?? 0,
            }
          })
          .sort((a, b) => b.relevanceScore - a.relevanceScore)

        result[platform] = kols
      } catch (e) {
        console.error(`[discovery] ${platform} failed:`, e)
        result[platform] = []
      }
    })
  )

  return NextResponse.json(result)
}
