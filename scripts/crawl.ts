/**
 * Offline crawl script — writes raw KOL data to PostgreSQL.
 *
 * Usage:
 *   npx ts-node --project tsconfig.scripts.json scripts/crawl.ts --all
 *   npx ts-node --project tsconfig.scripts.json scripts/crawl.ts --platform youtube
 *   npx ts-node --project tsconfig.scripts.json scripts/crawl.ts --platform reddit
 *   npx ts-node --project tsconfig.scripts.json scripts/crawl.ts --platform bilibili
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { getPool } from '../lib/db'

const YT_KEY = process.env.YOUTUBE_API_KEY!
const FC_KEY = process.env.FIRECRAWL_API_KEY!
const USER_AGENT = process.env.REDDIT_USER_AGENT || 'indiegame-tool/1.0'

const TIMEOUT = 10_000

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function apiFetch(url: string, opts: RequestInit = {}): Promise<unknown> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} — ${url}`)
    return res.json()
  } finally {
    clearTimeout(timer)
  }
}

// ─────────────────────────── UPSERT ───────────────────────────

interface KolRow {
  platform: string
  keyword: string
  channel_id: string
  channel_name: string
  subscriber_count: number
  description: string
  recent_titles: string[]
  channel_url: string
}

async function upsert(rows: KolRow[]) {
  const pool = getPool()
  for (const r of rows) {
    try {
      await pool.query(
        `INSERT INTO kol_cache
           (platform, keyword, channel_id, channel_name, subscriber_count,
            description, recent_titles, channel_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (platform, channel_id) DO UPDATE SET
           channel_name     = EXCLUDED.channel_name,
           subscriber_count = EXCLUDED.subscriber_count,
           description      = EXCLUDED.description,
           recent_titles    = EXCLUDED.recent_titles,
           fetched_at       = NOW()`,
        [r.platform, r.keyword, r.channel_id, r.channel_name,
         r.subscriber_count, r.description, r.recent_titles, r.channel_url]
      )
    } catch (err) {
      console.error(`[upsert] failed for ${r.channel_name}:`, err)
    }
  }
}

async function markCrawled(seedId: number) {
  const pool = getPool()
  await pool.query(
    `UPDATE crawl_seeds SET last_crawled_at = NOW() WHERE id = $1`,
    [seedId]
  )
}

// ─────────────────────────── YOUTUBE ───────────────────────────

async function crawlYouTube(seedId: number, keyword: string) {
  console.log(`[youtube] keyword: "${keyword}"`)

  // 1. Search videos
  const searchData = await apiFetch(
    `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(keyword + ' indie game')}&type=video&videoCategoryId=20&maxResults=20&part=snippet&key=${YT_KEY}`
  ) as { items?: { snippet: { channelId: string } }[] }

  const channelIds = [...new Set(
    (searchData.items || []).map(i => i.snippet.channelId).filter(Boolean)
  )]
  if (channelIds.length === 0) { console.log('[youtube] no channels found'); return }

  // 2. Batch fetch channel stats
  const detailData = await apiFetch(
    `https://www.googleapis.com/youtube/v3/channels?id=${channelIds.join(',')}&part=snippet,statistics&key=${YT_KEY}`
  ) as { items?: { id: string; snippet: { title: string; description: string; customUrl?: string }; statistics: { subscriberCount?: string } }[] }

  const rows: KolRow[] = []

  for (const ch of detailData.items || []) {
    const subs = parseInt(ch.statistics.subscriberCount || '0', 10)
    if (subs < 10_000 || subs > 2_000_000) continue

    // 3. Fetch 3 recent video titles
    let recentTitles: string[] = []
    try {
      const recent = await apiFetch(
        `https://www.googleapis.com/youtube/v3/search?channelId=${ch.id}&order=date&maxResults=3&type=video&part=snippet&key=${YT_KEY}`
      ) as { items?: { snippet: { title: string } }[] }
      recentTitles = (recent.items || []).map(v => v.snippet.title)
    } catch (err) {
      console.error(`[youtube] recent videos fetch failed for ${ch.id}:`, err)
    }

    rows.push({
      platform: 'youtube',
      keyword,
      channel_id: ch.id,
      channel_name: ch.snippet.title,
      subscriber_count: subs,
      description: ch.snippet.description.slice(0, 500),
      recent_titles: recentTitles,
      channel_url: ch.snippet.customUrl
        ? `https://youtube.com/${ch.snippet.customUrl}`
        : `https://youtube.com/channel/${ch.id}`,
    })

    await sleep(200) // be gentle with quota
  }

  await upsert(rows)
  await markCrawled(seedId)
  console.log(`[youtube] upserted ${rows.length} channels`)
}

// ─────────────────────────── REDDIT ───────────────────────────

async function crawlReddit(seedId: number, keyword: string) {
  console.log(`[reddit] keyword: "${keyword}"`)

  const headers = { 'User-Agent': USER_AGENT }

  // 1. Search subreddits
  const searchData = await apiFetch(
    `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&type=sr&limit=10`,
    { headers }
  ) as { data?: { children?: { data: { display_name: string; subscribers?: number } }[] } }

  const names = (searchData.data?.children || [])
    .map(c => c.data.display_name)
    .filter(Boolean)

  const rows: KolRow[] = []

  for (const name of names) {
    try {
      // 2. Fetch subreddit details
      const about = await apiFetch(
        `https://www.reddit.com/r/${name}/about.json`,
        { headers }
      ) as { data?: { display_name_prefixed?: string; subscribers?: number; public_description?: string } }

      const subs = about.data?.subscribers || 0
      if (subs < 1_000) continue

      // 3. Fetch top 3 post titles
      let recentTitles: string[] = []
      try {
        const hot = await apiFetch(
          `https://www.reddit.com/r/${name}/hot.json?limit=3`,
          { headers }
        ) as { data?: { children?: { data: { title: string } }[] } }
        recentTitles = (hot.data?.children || []).map(p => p.data.title)
      } catch {}

      rows.push({
        platform: 'reddit',
        keyword,
        channel_id: name,
        channel_name: about.data?.display_name_prefixed || `r/${name}`,
        subscriber_count: subs,
        description: (about.data?.public_description || '').slice(0, 500),
        recent_titles: recentTitles,
        channel_url: `https://www.reddit.com/r/${name}`,
      })

      await sleep(2_000) // Reddit rate limit
    } catch (err) {
      console.error(`[reddit] failed for r/${name}:`, err)
    }
  }

  await upsert(rows)
  await markCrawled(seedId)
  console.log(`[reddit] upserted ${rows.length} subreddits`)
}

// ─────────────────────────── BILIBILI ───────────────────────────

function parseBilibiliMarkdown(markdown: string, keyword: string): KolRow[] {
  const rows: KolRow[] = []
  const seen = new Set<string>()

  // Firecrawl returns Bilibili search results in this format:
  // [**video title**](https://www.bilibili.com/video/BVxxx)
  // [UP主name · date](https://space.bilibili.com/UID)
  // play_count弹幕count  (e.g. "44.6万711")

  const lines = markdown.split('\n')
  let currentTitle = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Extract video title from bold links
    const titleMatch = line.match(/\[(?:\*\*)?([^\]]+?)(?:\*\*)?\]\(https:\/\/www\.bilibili\.com\/video\//)
    if (titleMatch) {
      currentTitle = titleMatch[1].replace(/_/g, '').trim()
      continue
    }

    // Match UP主 line: [name · date](https://space.bilibili.com/UID)
    const upMatch = line.match(/\[([^\]]+?)\s*[··]\s*[^\]]+?\]\(https:\/\/space\.bilibili\.com\/(\d+)\)/)
    if (upMatch) {
      const upName = upMatch[1].trim()
      const uid = upMatch[2]

      if (seen.has(uid)) continue
      seen.add(uid)

      // Look ahead for play count on the same or adjacent lines
      let playCount = 0
      for (let j = i - 2; j <= i + 2; j++) {
        if (j < 0 || j >= lines.length) continue
        const ctx = lines[j]
        // Patterns: "44.6万711" or "27万1449" — the first number is play count
        const playMatch = ctx.match(/([\d.]+)万/)
        if (playMatch) {
          playCount = Math.round(parseFloat(playMatch[1]) * 10_000)
          break
        }
        const rawMatch = ctx.match(/^(\d{4,})\d{2,}$/)
        if (rawMatch) {
          playCount = parseInt(rawMatch[1], 10)
          break
        }
      }

      rows.push({
        platform: 'bilibili',
        keyword,
        channel_id: uid,
        channel_name: upName,
        subscriber_count: playCount > 0 ? Math.min(playCount, 2_000_000) : 1_000,
        description: '',
        recent_titles: currentTitle ? [currentTitle] : [],
        channel_url: `https://space.bilibili.com/${uid}`,
      })

      currentTitle = ''

      if (rows.length >= 20) break
    }
  }

  return rows
}

async function crawlBilibili(seedId: number, keyword: string) {
  console.log(`[bilibili] keyword: "${keyword}"`)

  const fcRes = await apiFetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FC_KEY}`,
    },
    body: JSON.stringify({
      url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(keyword)}&search_type=video`,
      formats: ['markdown'],
    }),
  }) as { success?: boolean; data?: { markdown?: string } }

  if (!fcRes.success || !fcRes.data?.markdown) {
    console.error('[bilibili] Firecrawl returned no markdown')
    return
  }

  const rows = parseBilibiliMarkdown(fcRes.data.markdown, keyword)
  await upsert(rows)
  await markCrawled(seedId)
  console.log(`[bilibili] upserted ${rows.length} creators`)
}

// ─────────────────────────── MAIN ───────────────────────────

const CRAWLERS: Record<string, (id: number, kw: string) => Promise<void>> = {
  youtube: crawlYouTube,
  reddit: crawlReddit,
  bilibili: crawlBilibili,
}

async function main() {
  const args = process.argv.slice(2)
  const platformIdx = args.indexOf('--platform')
  const specificPlatform = platformIdx !== -1 ? args[platformIdx + 1] : null
  const crawlAll = args.includes('--all') || (!specificPlatform)

  const platformFilter = crawlAll ? null : specificPlatform

  const pool = getPool()

  const seeds = await pool.query<{
    id: number; keyword: string; platform: string
  }>(
    `SELECT id, keyword, platform FROM crawl_seeds
     WHERE (last_crawled_at IS NULL OR last_crawled_at < NOW() - INTERVAL '7 days')
     ${platformFilter ? `AND platform = '${platformFilter}'` : ''}
     ORDER BY platform, id`
  )

  console.log(`Found ${seeds.rows.length} seeds to crawl`)

  for (const seed of seeds.rows) {
    const crawler = CRAWLERS[seed.platform]
    if (!crawler) {
      console.warn(`[main] No crawler for platform: ${seed.platform}`)
      continue
    }
    try {
      await crawler(seed.id, seed.keyword)
    } catch (err) {
      console.error(`[main] Crawler failed for seed ${seed.id}:`, err)
    }
    await sleep(3_000)
  }

  console.log('Crawl complete.')
  await pool.end()
}

main().catch(err => {
  console.error('[main] Fatal:', err)
  process.exit(1)
})
