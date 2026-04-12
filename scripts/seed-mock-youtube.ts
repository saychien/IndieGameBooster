/**
 * Seed mock YouTube channel data into kol_cache.
 * Use this when YouTube Data API quota is unavailable.
 *
 * Usage:
 *   npx ts-node --project tsconfig.scripts.json scripts/seed-mock-youtube.ts
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { getPool } from '../lib/db'

interface MockChannel {
  channel_id: string
  channel_name: string
  subscriber_count: number
  description: string
  recent_titles: string[]
  channel_url: string
  keywords: string[]   // which crawl_seeds keywords this channel maps to
}

const MOCK_CHANNELS: MockChannel[] = [
  // ── Metroidvania / Platformer ──────────────────────────────
  {
    channel_id: 'UCls_vBtHOcFRQMk-pJaQeGA',
    channel_name: 'Wanderbots',
    subscriber_count: 312_000,
    description: 'Let\'s plays and reviews focused on metroidvania and indie platformers. Known for deep-dives into hidden mechanics and lore.',
    recent_titles: ['Top 10 Metroidvanias You Must Play in 2025', 'Hollow Knight Silksong – Everything We Know', 'Dead Cells: Ixth Experiment Full Run'],
    channel_url: 'https://youtube.com/channel/UCls_vBtHOcFRQMk-pJaQeGA',
    keywords: ['metroidvania indie', 'pixel art platformer'],
  },
  {
    channel_id: 'UC2CxEBWZNBMDV5evJvFWkpQ',
    channel_name: 'Hollow Knight Nation',
    subscriber_count: 87_000,
    description: 'Deep coverage of Hollow Knight, Silksong and the wider metroidvania genre. Lore theories, speedruns and new release reviews.',
    recent_titles: ['Every Secret in Hollow Knight You Missed', 'Axiom Verge 2 Hidden Bosses Guide', 'Best Metroidvanias Under $10 on Steam'],
    channel_url: 'https://youtube.com/channel/UC2CxEBWZNBMDV5evJvFWkpQ',
    keywords: ['metroidvania indie', 'pixel art platformer'],
  },
  {
    channel_id: 'UCXaNjez7JyJ_JDFEKrC8JmQ',
    channel_name: 'Indie Game Enthusiast',
    subscriber_count: 156_000,
    description: 'Weekly indie game reviews across all genres. Metroidvanias, roguelikes, narrative games and hidden gems.',
    recent_titles: ['10 Indie Games You Slept On in 2024', 'Ultros Review – Psychedelic Metroidvania', 'Nine Sols – Best Action Metroidvania of the Year'],
    channel_url: 'https://youtube.com/channel/UCXaNjez7JyJ_JDFEKrC8JmQ',
    keywords: ['metroidvania indie', 'pixel art platformer', 'narrative adventure indie game'],
  },

  // ── Roguelike ──────────────────────────────────────────────
  {
    channel_id: 'UC7pMfwybE4M2Z_QAfrwiaEg',
    channel_name: 'Retromation',
    subscriber_count: 490_000,
    description: 'Daily roguelike and roguelite content. Deckbuilders, action roguelikes, and indie strategy games.',
    recent_titles: ['Balatro: How To Build A Broken Deck', 'Hades 2 – Weapon Tier List', 'Every Roguelike Coming in 2025'],
    channel_url: 'https://youtube.com/channel/UC7pMfwybE4M2Z_QAfrwiaEg',
    keywords: ['roguelike indie game', 'deckbuilder card game indie', 'auto battler indie'],
  },
  {
    channel_id: 'UCfgMquZI1Kd8p9218qd72Qg',
    channel_name: 'SplatterCatGaming',
    subscriber_count: 740_000,
    description: 'Indie game first-looks and let\'s plays, specializing in roguelikes, survival, and strategy games.',
    recent_titles: ['Dungeons of Hinterberg – First Look', 'Gunfire Reborn 2 Gameplay Preview', 'Best Roguelikes on Game Pass Right Now'],
    channel_url: 'https://youtube.com/channel/UCfgMquZI1Kd8p9218qd72Qg',
    keywords: ['roguelike indie game', 'survival crafting indie'],
  },
  {
    channel_id: 'UCa5w_DcHdRWRIWKBqfLhbTw',
    channel_name: 'Aliensrock',
    subscriber_count: 1_230_000,
    description: 'Strategy, puzzle, and roguelike games. Known for clever analysis and "can it be beaten" challenge runs.',
    recent_titles: ['I Beat Slay the Spire With Only Curses', 'Balatro Perfect Run – No Commentary', 'Monster Train vs Slay the Spire'],
    channel_url: 'https://youtube.com/channel/UCa5w_DcHdRWRIWKBqfLhbTw',
    keywords: ['roguelike indie game', 'deckbuilder card game indie', 'puzzle platformer indie'],
  },
  {
    channel_id: 'UCvC8i1UxMWzyAXv9e0sVBWA',
    channel_name: 'FuryForged',
    subscriber_count: 228_000,
    description: 'Roguelike and deckbuilder specialist. Reviews, tier lists, and high-level gameplay breakdowns.',
    recent_titles: ['Cobalt Core – Complete Card Review', 'Best Synergies in Balatro Season 2', 'Wildfrost Hidden Mechanics Guide'],
    channel_url: 'https://youtube.com/channel/UCvC8i1UxMWzyAXv9e0sVBWA',
    keywords: ['deckbuilder card game indie', 'roguelike indie game'],
  },

  // ── Cozy / Farming ────────────────────────────────────────
  {
    channel_id: 'UC5c_HB7bFwFkHIizmNEq7Ew',
    channel_name: 'LaurenZSide',
    subscriber_count: 870_000,
    description: 'Cozy gaming channel covering farming sims, life sims, and wholesome indie games.',
    recent_titles: ['Palia 2025 Full Review – Worth Playing?', '10 Cozy Games Perfect for Autumn', 'Coral Island vs Stardew Valley Comparison'],
    channel_url: 'https://youtube.com/channel/UC5c_HB7bFwFkHIizmNEq7Ew',
    keywords: ['cozy farming sim'],
  },
  {
    channel_id: 'UCkZjsmAQnXfS-_5lwMiXKCQ',
    channel_name: 'Ambr',
    subscriber_count: 134_000,
    description: 'Cozy gaming content – farming sims, life RPGs and relaxing indie games. Known for aesthetic playthroughs.',
    recent_titles: ['Fields of Mistria – New Stardew Alternative', 'Most Cozy Games Coming in 2025', 'ECHOES of the Plum Grove Deep Dive'],
    channel_url: 'https://youtube.com/channel/UCkZjsmAQnXfS-_5lwMiXKCQ',
    keywords: ['cozy farming sim'],
  },
  {
    channel_id: 'UCL8WH1gozzmccblppDbysqQ',
    channel_name: 'VirtuallyVicki',
    subscriber_count: 62_000,
    description: 'Cozy and casual gaming focused on farming simulations, life sims, and indie RPGs.',
    recent_titles: ['My Favorite Farming Sims of All Time', 'Sun Haven – Is It Worth It In 2025?', 'Hidden Cozy Games on Steam You Need To Try'],
    channel_url: 'https://youtube.com/channel/UCL8WH1gozzmccblppDbysqQ',
    keywords: ['cozy farming sim'],
  },

  // ── Soulslike ─────────────────────────────────────────────
  {
    channel_id: 'UCo0sNMGeihsaB3_llpt22Wg',
    channel_name: 'Fextralife',
    subscriber_count: 1_800_000,
    description: 'Action RPG and soulslike games. Wikis, builds, reviews and first looks for hardcore action games.',
    recent_titles: ['Lies of P DLC Complete Walkthrough', 'Elden Ring Shadow of the Erdtree Build Guide', 'Best Soulslikes That Aren\'t Elden Ring'],
    channel_url: 'https://youtube.com/channel/UCo0sNMGeihsaB3_llpt22Wg',
    keywords: ['soulslike indie game'],
  },
  {
    channel_id: 'UCmVueDBU8E2iegCnbOTLqEw',
    channel_name: 'TheRandomMango',
    subscriber_count: 53_000,
    description: 'Indie soulslike and action platformer deep dives. First looks, reviews and challenge runs for challenging games.',
    recent_titles: ['Nine Sols Review – Better Than Hollow Knight?', 'Every Indie Soulslike Ranked 2024', 'Vigil: The Longest Night Hidden Secrets'],
    channel_url: 'https://youtube.com/channel/UCmVueDBU8E2iegCnbOTLqEw',
    keywords: ['soulslike indie game', 'metroidvania indie'],
  },

  // ── Horror ────────────────────────────────────────────────
  {
    channel_id: 'UCW9X2td2NprvAj1KdEtAog',
    channel_name: 'ScottTheWoz',
    subscriber_count: 1_740_000,
    description: 'Comedy gaming channel covering all genres including horror indie games and retro titles.',
    recent_titles: ['Indie Horror Games That Actually Scared Me', 'Dredge – The Ocean Is Terrifying', 'Pacific Drive First Impressions'],
    channel_url: 'https://youtube.com/channel/UCW9X2td2NprvAj1KdEtAog',
    keywords: ['horror indie game'],
  },
  {
    channel_id: 'UC31cKaxdwL4Pw2F7mEuWxmA',
    channel_name: 'Dread XP',
    subscriber_count: 145_000,
    description: 'Dedicated indie horror gaming channel. Reviews, first looks and deep dives into horror games on Steam.',
    recent_titles: ['Signalis Is A Masterpiece – Full Analysis', 'Best Indie Horror Games of 2024', 'Fears To Fathom – New Episode Review'],
    channel_url: 'https://youtube.com/channel/UC31cKaxdwL4Pw2F7mEuWxmA',
    keywords: ['horror indie game'],
  },

  // ── City Builder / Strategy ────────────────────────────────
  {
    channel_id: 'UCY0HqcJIWlD0xQ7hhZcA5Vw',
    channel_name: 'Skye Storme',
    subscriber_count: 203_000,
    description: 'City builder and management simulation game reviews. Covers everything from indie early access to major releases.',
    recent_titles: ['Manor Lords Review – Is It Worth $30?', 'Frostpunk 2 vs Frostpunk 1 Comparison', 'Best City Builders Coming in 2025'],
    channel_url: 'https://youtube.com/channel/UCY0HqcJIWlD0xQ7hhZcA5Vw',
    keywords: ['city builder indie', 'tower defense strategy indie'],
  },
  {
    channel_id: 'UCSw-7TaRS53dfBOHmav0HIQ',
    channel_name: 'GrayStillPlays',
    subscriber_count: 1_450_000,
    description: 'Chaotic playthroughs of city builders, simulators and strategy games. Known for stress-testing game mechanics.',
    recent_titles: ['I Built The Worst City in Manor Lords', 'Against The Storm – Impossible Difficulty', 'Making A City Out Of Pure Chaos'],
    channel_url: 'https://youtube.com/channel/UCSw-7TaRS53dfBOHmav0HIQ',
    keywords: ['city builder indie', 'survival crafting indie'],
  },

  // ── Survival / Crafting ────────────────────────────────────
  {
    channel_id: 'UC-RJu1qbaCSzKfoyoPyzr5A',
    channel_name: 'Neebs Gaming',
    subscriber_count: 1_100_000,
    description: 'Comedic playthroughs of survival and crafting games. Famous for Subnautica and Valheim series.',
    recent_titles: ['Enshrouded – Best Survival Game of 2024?', 'Valheim: Ashlands Complete Guide', 'V Rising Full Co-op Playthrough'],
    channel_url: 'https://youtube.com/channel/UC-RJu1qbaCSzKfoyoPyzr5A',
    keywords: ['survival crafting indie'],
  },
  {
    channel_id: 'UC5ib5bTflXtyIkoF_l7OCHw',
    channel_name: 'KhrazeGaming',
    subscriber_count: 387_000,
    description: 'Survival, crafting and open world indie game first looks and reviews. Early access specialist.',
    recent_titles: ['Nightingale Review – Worth The Wait?', 'Best Survival Games You Haven\'t Played', 'Abiotic Factor Deep Dive – Hidden Gem'],
    channel_url: 'https://youtube.com/channel/UC5ib5bTflXtyIkoF_l7OCHw',
    keywords: ['survival crafting indie', 'roguelike indie game'],
  },

  // ── Narrative / Puzzle ────────────────────────────────────
  {
    channel_id: 'UCCW9zW1r3hZFEqeaPmSxB-A',
    channel_name: 'GameTrailers',
    subscriber_count: 1_400_000,
    description: 'Gaming news, trailers and reviews. Covers indie narrative games, puzzle games and major releases.',
    recent_titles: ['Animal Well – A Masterclass in Mystery', 'Lorelei and the Laser Eyes Review', 'Botany Manor – Most Relaxing Puzzle Game Ever'],
    channel_url: 'https://youtube.com/channel/UCCW9zW1r3hZFEqeaPmSxB-A',
    keywords: ['narrative adventure indie game', 'puzzle platformer indie'],
  },
  {
    channel_id: 'UCfXBOQmNBOBM-h1D6DeRG2g',
    channel_name: 'SnomanGaming',
    subscriber_count: 178_000,
    description: 'Story-rich indie games, walking sims, and puzzle games. Thoughtful analysis and no-spoiler reviews.',
    recent_titles: ['Disco Elysium Why It\'s The Best Game Ever Made', 'In Stars And Time – Hidden Narrative Gem', 'Top 10 Story Games of 2024'],
    channel_url: 'https://youtube.com/channel/UCfXBOQmNBOBM-h1D6DeRG2g',
    keywords: ['narrative adventure indie game', 'puzzle platformer indie'],
  },

  // ── Auto Battler ──────────────────────────────────────────
  {
    channel_id: 'UCL11EiAkvmAiHvGiVQrCYnw',
    channel_name: 'SuperTeamGames',
    subscriber_count: 95_000,
    description: 'Auto battler and strategy game specialist. Covers Teamfight Tactics, Dota Auto Chess, and indie strategy.',
    recent_titles: ['Mechabellum Review – Best Auto Battler of 2024', 'Backpack Battles In-Depth Strategy Guide', 'Every Auto Battler Ranked by Depth'],
    channel_url: 'https://youtube.com/channel/UCL11EiAkvmAiHvGiVQrCYnw',
    keywords: ['auto battler indie', 'tower defense strategy indie'],
  },
]

async function main() {
  const pool = getPool()

  // Resolve keyword → seed id mapping
  const seeds = await pool.query<{ id: number; keyword: string; platform: string }>(
    `SELECT id, keyword, platform FROM crawl_seeds WHERE platform = 'youtube'`
  )
  const keywordToSeedId = new Map(seeds.rows.map(s => [s.keyword, s.id]))

  let inserted = 0
  let skipped = 0

  for (const ch of MOCK_CHANNELS) {
    // Insert one row per keyword the channel maps to
    const keywords = ch.keywords.filter(kw => keywordToSeedId.has(kw))
    if (keywords.length === 0) {
      console.warn(`[warn] No seed found for channel "${ch.channel_name}" keywords: ${ch.keywords.join(', ')}`)
      keywords.push(ch.keywords[0]) // insert with raw keyword anyway
    }

    const keyword = keywords[0] // use primary keyword for the row

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
        [
          'youtube',
          keyword,
          ch.channel_id,
          ch.channel_name,
          ch.subscriber_count,
          ch.description,
          ch.recent_titles,
          ch.channel_url,
        ]
      )
      console.log(`[ok] ${ch.channel_name} (${(ch.subscriber_count / 1000).toFixed(0)}K subs)`)
      inserted++
    } catch (err) {
      console.error(`[err] ${ch.channel_name}:`, (err as Error).message)
      skipped++
    }
  }

  console.log(`\nDone — inserted/updated: ${inserted}, skipped: ${skipped}`)
  await pool.end()
}

main().catch(err => {
  console.error('[fatal]', err)
  process.exit(1)
})
