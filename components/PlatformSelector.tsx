'use client'
import { useState } from 'react'
import { AnalysisReport, SelectablePlatform } from '@/lib/types'

const C = {
  pine700: '#2D6A4F', pine800: '#1E4D38', pine500: '#40916C',
  pine100: '#D8EFE4', pine200: '#B2DACC',
  bgSurface: '#FFFFFF',
  border: '#C8DFD4',
  textPrimary: '#1A2E25', textSecondary: '#3D6B52', textMuted: '#7A9E8A',
}

// ─── Small pieces ──────────────────────────────────────────────

function KeywordChips({ keywords, active }: { keywords: string[]; active: boolean }) {
  if (!keywords.length) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.45rem' }}>
      {keywords.slice(0, 4).map((kw, i) => (
        <span key={i} style={{
          background: active ? C.pine200 : '#F1F5F9',
          color: active ? C.pine800 : '#64748b',
          borderRadius: 4, padding: '0.12rem 0.4rem', fontSize: '0.68rem', fontWeight: 600,
        }}>
          {kw}
        </span>
      ))}
    </div>
  )
}

/** Toggleable card — YouTube / Bilibili */
function ToggleCard({ emoji, label, region, keywords, active, onToggle, disabled }: {
  emoji: string; label: string; region: string; keywords: string[]
  active: boolean; onToggle: () => void; disabled: boolean
}) {
  return (
    <div
      onClick={disabled ? undefined : onToggle}
      style={{
        flex: '1 1 150px', maxWidth: 240,
        background: active ? C.pine100 : C.bgSurface,
        border: `1.5px solid ${active ? C.pine500 : C.border}`,
        borderRadius: 12, padding: '0.85rem 1rem',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.15s', userSelect: 'none',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: 28, height: 28, borderRadius: 7, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: active ? C.pine700 : '#E2E8F0',
            color: active ? '#fff' : '#64748b',
            fontSize: '0.8rem', fontWeight: 700,
          }}>
            {emoji}
          </span>
          <div>
            <div style={{ fontWeight: 700, color: C.textPrimary, fontSize: '0.88rem', lineHeight: 1.2 }}>{label}</div>
            <div style={{ color: C.textMuted, fontSize: '0.7rem' }}>{region}</div>
          </div>
        </div>
        <div style={{
          width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${active ? C.pine700 : C.border}`,
          background: active ? C.pine700 : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '0.6rem', fontWeight: 800,
        }}>
          {active ? '✓' : ''}
        </div>
      </div>
      <KeywordChips keywords={keywords} active={active} />
    </div>
  )
}

/** Always-on card — Reddit / RedNote */
function FixedCard({ emoji, label, region, keywords, note }: {
  emoji: string; label: string; region: string; keywords: string[]; note: string
}) {
  return (
    <div style={{
      flex: '1 1 150px', maxWidth: 300,
      background: C.pine100,
      border: `1.5px solid ${C.pine500}`,
      borderRadius: 12, padding: '0.85rem 1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
        <span style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: C.pine700, color: '#fff', fontSize: '0.8rem', fontWeight: 700,
        }}>
          {emoji}
        </span>
        <div>
          <div style={{ fontWeight: 700, color: C.textPrimary, fontSize: '0.88rem', lineHeight: 1.2 }}>{label}</div>
          <div style={{ color: C.textMuted, fontSize: '0.7rem' }}>{region}</div>
        </div>
      </div>
      <div style={{ color: C.textSecondary, fontSize: '0.71rem', fontStyle: 'italic' }}>{note}</div>
      <KeywordChips keywords={keywords} active={true} />
    </div>
  )
}

/** Skeleton channel-card placeholders shown while a section is loading */
function LoadingCards({ count = 2 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ flex: '1 1 220px', height: 120, borderRadius: 12 }} />
      ))}
    </div>
  )
}

/** Section action button */
function ActionButton({ label, onClick, loading, disabled }: {
  label: string; onClick: () => void; loading: boolean; disabled: boolean
}) {
  const off = disabled || loading
  return (
    <button
      onClick={onClick}
      disabled={off}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.45rem',
        padding: '0.62rem 1.4rem',
        background: off ? C.pine100 : C.pine700,
        color: off ? C.textMuted : '#fff',
        border: 'none', borderRadius: 9, fontSize: '0.875rem', fontWeight: 700,
        cursor: off ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}
    >
      {loading && <span className="spinner" />}
      {loading ? 'Searching…' : label}
    </button>
  )
}

function SectionDivider() {
  return <div style={{ borderTop: `1px solid ${C.border}`, margin: '1.25rem 0' }} />
}

// ─── Main component ────────────────────────────────────────────

interface Props {
  analysis: AnalysisReport
  onStart: (platforms: SelectablePlatform[]) => Promise<void>
}

export default function PlatformSelector({ analysis, onStart }: Props) {
  const [ytOn, setYtOn]     = useState(true)
  const [biliOn, setBiliOn] = useState(true)

  const [creatorLoading, setCreatorLoading]  = useState(false)
  const [redditLoading, setRedditLoading]    = useState(false)
  const [rnLoading, setRnLoading]            = useState(false)

  const mode = analysis.activeKeywordMode ?? 'game'
  const kwEn = mode === 'vibe' ? (analysis.vibeKeywords ?? []) : (analysis.keywords ?? [])
  const kwCn = mode === 'vibe' ? (analysis.chineseVibeKeywords ?? []) : (analysis.chineseKeywords ?? [])

  async function run(platforms: SelectablePlatform[], setLoading: (v: boolean) => void) {
    setLoading(true)
    try { await onStart(platforms) } finally { setLoading(false) }
  }

  const creatorPlatforms: SelectablePlatform[] = [
    ...(ytOn   ? (['youtube']  as const) : []),
    ...(biliOn ? (['bilibili'] as const) : []),
  ]

  return (
    <div>

      {/* ── 1. Content Creators ─────────────────────────────── */}
      <div style={{ marginBottom: '0.25rem' }}>
        <div style={{ fontWeight: 700, color: C.textSecondary, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>
          Content Creator Discovery
        </div>
        <div style={{ color: C.textMuted, fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.8rem' }}>
          Find creators whose audience matches your game. Toggle the platforms you want, then run the search. We generate a personalised outreach email for each creator you select.
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <ToggleCard emoji="▶" label="YouTube"  region="Global" keywords={kwEn} active={ytOn}   onToggle={() => setYtOn(v => !v)}   disabled={creatorLoading} />
          <ToggleCard emoji="⊞" label="Bilibili" region="CN"     keywords={kwCn} active={biliOn} onToggle={() => setBiliOn(v => !v)} disabled={creatorLoading} />
          <ActionButton
            label="Find Creators →"
            onClick={() => run(creatorPlatforms, setCreatorLoading)}
            loading={creatorLoading}
            disabled={creatorPlatforms.length === 0}
          />
        </div>
        {creatorPlatforms.length === 0 && !creatorLoading && (
          <div style={{ color: C.textMuted, fontSize: '0.75rem', marginTop: '0.4rem' }}>Select at least one platform above.</div>
        )}
        {creatorLoading && <LoadingCards count={2} />}
      </div>

      <SectionDivider />

      {/* ── 2. Reddit ───────────────────────────────────────── */}
      <div style={{ marginBottom: '0.25rem' }}>
        <div style={{ fontWeight: 700, color: C.textSecondary, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>
          Community Targeting
        </div>
        <div style={{ color: C.textMuted, fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.8rem' }}>
          We find the most relevant subreddits — the more specific the match, the better. We draft a community post for each subreddit you select.
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FixedCard emoji="◈" label="Reddit" region="Global" keywords={kwEn} note="Targets exact subreddits — specificity is the goal" />
          <ActionButton
            label="Find Subreddits →"
            onClick={() => run(['reddit'], setRedditLoading)}
            loading={redditLoading}
            disabled={false}
          />
        </div>
        {redditLoading && <LoadingCards count={3} />}
      </div>

      <SectionDivider />

      {/* ── 3. RedNote ──────────────────────────────────────── */}
      <div>
        <div style={{ fontWeight: 700, color: C.textSecondary, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>
          Direct Publishing
        </div>
        <div style={{ color: C.textMuted, fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.8rem' }}>
          No search needed. We generate a RedNote-native post tailored to your game's aesthetic and audience — ready to copy and publish directly.
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FixedCard emoji="✿" label="RedNote" region="CN" keywords={kwCn} note="Generates a post directly — no channel search" />
          <ActionButton
            label="Generate Post →"
            onClick={() => run(['xiaohongshu'], setRnLoading)}
            loading={rnLoading}
            disabled={false}
          />
        </div>
        {rnLoading && <LoadingCards count={1} />}
      </div>

    </div>
  )
}
