'use client'
import { useState } from 'react'
import { GameData, ImprovementTip } from '@/lib/types'

const C = {
  pine700: '#2D6A4F', pine100: '#D8EFE4', pine200: '#B2DACC',
  bgSurface: '#FFFFFF', bgSubtle: '#EEF6F1',
  border: '#C8DFD4',
  textPrimary: '#1A2E25', textSecondary: '#3D6B52', textMuted: '#7A9E8A',
  red: '#DC2626', amber: '#D97706',
}

interface Props {
  game: GameData
}

export default function SteamTipsPanel({ game }: Props) {
  const [open, setOpen] = useState(false)
  const [tips, setTips] = useState<ImprovementTip[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!game.steamAppId) return null

  async function fetchTips() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/steam-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(game),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setTips(data.tips)
      setOpen(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: C.bgSurface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <div
        style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => tips ? setOpen(o => !o) : fetchTips()}
      >
        <div>
          <div style={{ fontWeight: 700, color: C.textPrimary, fontSize: '0.95rem' }}>Steam Page Analyzer</div>
          <div style={{ color: C.textMuted, fontSize: '0.8rem', marginTop: '0.1rem' }}>Get 3 actionable improvement suggestions for your store page</div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); tips ? setOpen(o => !o) : fetchTips() }}
          disabled={loading}
          style={{
            padding: '0.5rem 1.1rem', background: tips ? C.pine100 : C.pine700,
            color: tips ? C.pine700 : '#fff', border: 'none', borderRadius: 8,
            fontSize: '0.83rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '1rem',
          }}
        >
          {loading ? 'Analyzing...' : tips ? (open ? 'Hide ▲' : 'Show ▼') : 'Analyze My Steam Page →'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '0 1.25rem 1rem', color: C.red, fontSize: '0.83rem' }}>
          {error} <button onClick={fetchTips} style={{ color: C.red, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
        </div>
      )}

      {open && tips && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tips.map((tip, i) => (
            <div key={i} style={{ background: C.bgSubtle, borderRadius: 10, padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 700, color: C.textPrimary, fontSize: '0.9rem' }}>{tip.title}</span>
                <span style={{
                  padding: '0.12rem 0.45rem', borderRadius: 4, fontSize: '0.68rem', fontWeight: 700,
                  background: tip.impact === 'high' ? 'rgba(220,38,38,0.1)' : 'rgba(217,119,6,0.1)',
                  color: tip.impact === 'high' ? C.red : C.amber,
                }}>
                  {tip.impact.toUpperCase()}
                </span>
              </div>
              <div style={{ color: C.textSecondary, fontSize: '0.85rem', lineHeight: 1.55 }}>{tip.suggestion}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
