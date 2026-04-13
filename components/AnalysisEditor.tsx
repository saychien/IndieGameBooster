'use client'
import { useState } from 'react'
import { AnalysisReport, SimilarGame } from '@/lib/types'

const C = {
  cyan: '#00f2ff', cyanBg: 'rgba(0,242,255,0.08)', cyanBorder: 'rgba(0,242,255,0.2)',
  magenta: '#ff00cc', magentaBg: 'rgba(255,0,204,0.08)', magentaBorder: 'rgba(255,0,204,0.25)',
  surface: '#0d1117', surfaceAlt: '#0f172a',
  border: '#1e293b',
  textPrimary: '#e2e8f0', textSecondary: '#94a3b8', textMuted: '#64748b',
}

interface Props {
  analysis: AnalysisReport
  onChange: (a: AnalysisReport) => void
  onKeywordAdd?: (kw: string) => void
}

export default function AnalysisEditor({ analysis, onChange, onKeywordAdd }: Props) {
  const mode = analysis.activeKeywordMode ?? 'game'
  const isGame = mode === 'game'

  function set<K extends keyof AnalysisReport>(key: K, val: AnalysisReport[K]) {
    onChange({ ...analysis, [key]: val })
  }

  function setMode(m: 'game' | 'vibe') {
    onChange({ ...analysis, activeKeywordMode: m })
  }

  const activeColor  = isGame ? C.cyan    : C.magenta
  const activeBg     = isGame ? C.cyanBg  : C.magentaBg
  const activeBorder = isGame ? C.cyanBorder : C.magentaBorder
  const chips        = isGame ? (analysis.keywords ?? [])     : (analysis.vibeKeywords ?? [])

  function removeChip(i: number) {
    if (isGame) {
      onChange({
        ...analysis,
        keywords: (analysis.keywords ?? []).filter((_, j) => j !== i),
        chineseKeywords: (analysis.chineseKeywords ?? []).filter((_, j) => j !== i),
      })
    } else {
      onChange({
        ...analysis,
        vibeKeywords: (analysis.vibeKeywords ?? []).filter((_, j) => j !== i),
        chineseVibeKeywords: (analysis.chineseVibeKeywords ?? []).filter((_, j) => j !== i),
      })
    }
  }

  function addChip(kw: string) {
    if (isGame) {
      set('keywords', [...(analysis.keywords ?? []), kw])
      onKeywordAdd?.(kw)
    } else {
      set('vibeKeywords', [...(analysis.vibeKeywords ?? []), kw])
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Keywords ── */}
      <div>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ color: C.textSecondary, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
            Discovery Keywords
          </div>
          {/* Toggle pills */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {(['game', 'vibe'] as const).map(m => {
              const active = mode === m
              const color  = m === 'game' ? C.cyan    : C.magenta
              const bg     = m === 'game' ? C.cyanBg  : C.magentaBg
              const border = m === 'game' ? C.cyanBorder : C.magentaBorder
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    padding: '0.2rem 0.7rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
                    cursor: 'pointer', border: `1px solid ${active ? border : C.border}`,
                    background: active ? bg : 'transparent',
                    color: active ? color : C.textMuted,
                    transition: 'all 0.15s',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {m === 'game' ? 'Early Access (Niche)' : 'Full Release (Broad)'}
                </button>
              )
            })}
          </div>
          <span style={{ color: C.textMuted, fontSize: '0.7rem' }}>
            click to remove · Enter to add
          </span>
        </div>

        {/* Active chip set */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {chips.map((t, i) => (
            <span
              key={i}
              onClick={() => removeChip(i)}
              title="Click to remove"
              style={{
                background: activeBg, color: activeColor, border: `1.5px solid ${activeBorder}`,
                borderRadius: 8, padding: '0.4rem 0.9rem', fontSize: '0.88rem', fontWeight: 700,
                cursor: 'pointer', userSelect: 'none', transition: 'opacity 0.15s',
              }}
            >
              {t} ×
            </span>
          ))}
          <AddKeyword onAdd={addChip} borderColor={activeBorder} />
        </div>

        {/* Vibe hint */}
        {!isGame && (
          <div style={{ marginTop: '0.6rem', color: C.textMuted, fontSize: '0.75rem', lineHeight: 1.5 }}>
            Mood &amp; aesthetic terms — matches non-game content (music, film, art) that evokes the same feeling.
          </div>
        )}
      </div>

      {/* ── Similar Games ── */}
      {(analysis.similarGames ?? []).length > 0 && (
        <div>
          <div style={{ color: C.textSecondary, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", marginBottom: '0.75rem' }}>
            Similar Games
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {(analysis.similarGames ?? []).map((g, i) => (
              <SimilarGameCard key={i} game={g} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────

function SimilarGameCard({ game }: { game: SimilarGame }) {
  const [imgError, setImgError] = useState(false)
  const steamUrl = game.steamAppId
    ? `https://store.steampowered.com/app/${game.steamAppId}`
    : `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`
  const imgUrl = game.steamAppId && !imgError
    ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.steamAppId}/capsule_sm_120.jpg`
    : null

  return (
    <a href={steamUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', width: 150, transition: 'border-color 0.15s', cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = C.cyanBorder)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
      >
        {imgUrl ? (
          <img src={imgUrl} alt={game.name} onError={() => setImgError(true)} style={{ width: '100%', height: 56, objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: 56, background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: C.textMuted, fontSize: '0.65rem' }}>No image</span>
          </div>
        )}
        <div style={{ padding: '0.4rem 0.6rem' }}>
          <div style={{ color: C.textSecondary, fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {game.name}
          </div>
        </div>
      </div>
    </a>
  )
}

function AddKeyword({ onAdd, borderColor }: { onAdd: (kw: string) => void; borderColor: string }) {
  const [input, setInput] = useState('')
  return (
    <input
      value={input}
      onChange={e => setInput(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter' && input.trim()) {
          onAdd(input.trim())
          setInput('')
          e.preventDefault()
        }
      }}
      placeholder="+ add keyword"
      style={{
        background: 'transparent', border: `1.5px dashed ${borderColor}`, borderRadius: 8,
        padding: '0.4rem 0.9rem', color: C.textMuted, fontSize: '0.88rem',
        outline: 'none', fontFamily: 'inherit', minWidth: 140,
      }}
    />
  )
}
