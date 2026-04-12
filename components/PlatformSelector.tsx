'use client'
import { useState } from 'react'
import { AnalysisReport, SelectablePlatform } from '@/lib/types'

const C = {
  pine700: '#2D6A4F', pine800: '#1E4D38', pine500: '#40916C',
  pine100: '#D8EFE4', pine200: '#B2DACC',
  bgSurface: '#FFFFFF', bgSubtle: '#EEF6F1',
  border: '#C8DFD4', borderStrong: '#95C4AE',
  textPrimary: '#1A2E25', textSecondary: '#3D6B52', textMuted: '#7A9E8A',
}

interface PlatformConfig {
  id: SelectablePlatform
  label: string
  region: string
  emoji: string
  getKeywords: (a: AnalysisReport) => string[]
}

const PLATFORMS: PlatformConfig[] = [
  { id: 'youtube',      label: 'YouTube',      region: 'Global',  emoji: '▶',  getKeywords: a => a.youtubeKeywords },
  { id: 'reddit',       label: 'Reddit',       region: 'Global',  emoji: '◈',  getKeywords: a => a.redditKeywords },
  { id: 'bilibili',     label: 'Bilibili',     region: 'CN',      emoji: '⊞',  getKeywords: a => a.bilibiliKeywords },
  { id: 'xiaohongshu',  label: '小红书',        region: 'CN',      emoji: '✿',  getKeywords: a => a.xiaohongshuKeywords },
  { id: 'gaming_media', label: 'Gaming Media', region: 'Global',  emoji: '✦',  getKeywords: a => a.gamingMediaAngles },
]

interface Props {
  analysis: AnalysisReport
  onStart: (platforms: SelectablePlatform[]) => void
  loading: boolean
}

export default function PlatformSelector({ analysis, onStart, loading }: Props) {
  const [selected, setSelected] = useState<Set<SelectablePlatform>>(
    new Set(['youtube', 'reddit', 'bilibili', 'xiaohongshu', 'gaming_media'])
  )

  function toggle(p: SelectablePlatform) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(p) ? next.delete(p) : next.add(p)
      return next
    })
  }

  return (
    <div>
      <p style={{ color: C.textMuted, fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Select the platforms you want to target. We'll only search and spend API quota on your selected platforms.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {PLATFORMS.map(p => {
          const active = selected.has(p.id)
          const keywords = p.getKeywords(analysis).slice(0, 3)
          return (
            <div
              key={p.id}
              onClick={() => toggle(p.id)}
              style={{
                background: active ? C.pine100 : C.bgSurface,
                border: `1.5px solid ${active ? C.pine500 : C.border}`,
                borderRadius: 12, padding: '1rem', cursor: 'pointer',
                transition: 'all 0.15s', userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: active ? C.pine700 : '#E2E8F0', color: active ? '#fff' : '#64748b',
                    fontSize: '0.85rem', fontWeight: 700, flexShrink: 0,
                  }}>
                    {p.emoji}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, color: C.textPrimary, fontSize: '0.88rem' }}>{p.label}</div>
                    <div style={{ color: C.textMuted, fontSize: '0.72rem' }}>{p.region}</div>
                  </div>
                </div>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${active ? C.pine700 : C.border}`,
                  background: active ? C.pine700 : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '0.65rem', fontWeight: 800,
                }}>
                  {active ? '✓' : ''}
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {keywords.map((kw, i) => (
                  <span key={i} style={{
                    background: active ? C.pine200 : '#F1F5F9',
                    color: active ? C.pine800 : '#64748b',
                    borderRadius: 4, padding: '0.15rem 0.45rem', fontSize: '0.7rem', fontWeight: 600,
                  }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: C.textMuted, fontSize: '0.83rem' }}>
          {selected.size} platform{selected.size !== 1 ? 's' : ''} selected
        </span>
        <button
          onClick={() => onStart(Array.from(selected))}
          disabled={selected.size === 0 || loading}
          style={{
            padding: '0.8rem 2rem', background: selected.size === 0 || loading ? C.pine100 : C.pine700,
            color: selected.size === 0 || loading ? C.textMuted : '#fff',
            border: 'none', borderRadius: 10, fontSize: '0.95rem', fontWeight: 700,
            cursor: selected.size === 0 || loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
          }}
        >
          {loading ? 'Discovering...' : 'Start Discovery →'}
        </button>
      </div>
    </div>
  )
}
