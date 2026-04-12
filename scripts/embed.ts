/**
 * Offline embed script — writes vector embeddings to PostgreSQL (pgvector).
 *
 * Usage:
 *   npx ts-node --project tsconfig.scripts.json scripts/embed.ts
 *
 * Prerequisites:
 *   - pgvector extension enabled
 *   - kol_cache rows exist (run crawl.ts first)
 *   - OPENAI_API_KEY set in .env.local
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import OpenAI from 'openai'
import { getPool } from '../lib/db'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const BATCH = 50

interface KolRow {
  id: number
  platform: string
  channel_name: string
  description: string | null
  recent_titles: string[] | null
}

function buildEmbedText(row: KolRow): string {
  return [
    `Platform: ${row.platform}.`,
    `Channel: ${row.channel_name}.`,
    `Description: ${row.description ?? ''}.`,
    `Recent content: ${row.recent_titles?.join(', ') ?? ''}.`,
  ].join(' ')
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function main() {
  const pool = getPool()

  // Count total to embed
  const countRes = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM kol_cache WHERE embedding IS NULL`
  )
  const total = parseInt(countRes.rows[0].count, 10)
  console.log(`Rows to embed: ${total}`)

  if (total === 0) {
    console.log('Nothing to embed.')
    await pool.end()
    return
  }

  let embedded = 0

  while (true) {
    // Always fetch from offset 0 — embedded rows drop out of WHERE embedding IS NULL
    const rows = await pool.query<KolRow>(
      `SELECT id, platform, channel_name, description, recent_titles
       FROM kol_cache
       WHERE embedding IS NULL
       ORDER BY id
       LIMIT $1`,
      [BATCH]
    )

    if (rows.rows.length === 0) break

    const texts = rows.rows.map(buildEmbedText)

    // Batch embed call
    const embRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    })

    // Write each embedding back
    for (let i = 0; i < rows.rows.length; i++) {
      const row = rows.rows[i]
      const vector = embRes.data[i].embedding
      // pgvector expects '[0.1,0.2,...]' string format
      const vectorStr = `[${vector.join(',')}]`
      try {
        await pool.query(
          `UPDATE kol_cache SET embedding = $1::vector WHERE id = $2`,
          [vectorStr, row.id]
        )
      } catch (err) {
        console.error(`[embed] UPDATE failed for id ${row.id}:`, err)
      }
    }

    embedded += rows.rows.length
    console.log(`Embedded ${embedded} / ${total}`)

    await sleep(200)
  }

  console.log('Embedding complete.')
  await pool.end()
}

main().catch(err => {
  console.error('[embed] Fatal:', err)
  process.exit(1)
})
