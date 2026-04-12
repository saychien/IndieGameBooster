'use client'
import { useState } from 'react'
import { OutreachContent, Channel, GameData } from '@/lib/types'
import { downloadOutreachZip } from '@/lib/export'

const C = {
  pine700: '#2D6A4F', pine800: '#1E4D38', pine100: '#D8EFE4', pine200: '#B2DACC',
  bgSurface: '#FFFFFF', bgSubtle: '#EEF6F1',
  border: '#C8DFD4',
  textPrimary: '#1A2E25', textSecondary: '#3D6B52', textMuted: '#7A9E8A',
  green: '#16A34A',
}

interface Props {
  outreach: OutreachContent[]
  channels: Channel[]
  game: GameData
}

export default function PublishPanel({ outreach, channels, game }: Props) {
  const [mode, setMode] = useState<'hosted' | 'download' | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [statuses, setStatuses] = useState<{ channelName: string; status: string }[]>([])

  async function handleHosted() {
    setLoading(true)
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outreach, channels }),
      })
      const data = await res.json()
      setStatuses(data.results || [])
      setDone(true)
    } finally { setLoading(false) }
  }

  async function handleDownload() {
    setLoading(true)
    try {
      await downloadOutreachZip(outreach, channels, game)
      setDone(true)
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[
          { key: 'hosted' as const, title: 'Publish via Indie Game Booster', desc: 'We queue and manage outreach on your behalf.', badge: 'Coming soon' },
          { key: 'download' as const, title: 'Download as ZIP', desc: 'Export all content as text files and publish at your own pace.', badge: 'Available now' },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => setMode(opt.key)}
            style={{
              flex: 1, minWidth: 200, textAlign: 'left', padding: '1.25rem',
              background: mode === opt.key ? C.pine100 : C.bgSurface,
              border: `1.5px solid ${mode === opt.key ? C.pine700 : C.border}`,
              borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <div style={{ fontWeight: 700, color: C.textPrimary, marginBottom: '0.35rem' }}>{opt.title}</div>
            <div style={{ color: C.textMuted, fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>{opt.desc}</div>
            <span style={{ padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, background: C.pine100, color: C.pine700 }}>
              {opt.badge}
            </span>
          </button>
        ))}
      </div>

      {mode && !done && (
        <button
          onClick={mode === 'hosted' ? handleHosted : handleDownload}
          disabled={loading}
          style={{
            marginTop: '1.25rem', padding: '0.85rem 2.5rem',
            background: loading ? C.pine100 : C.pine700,
            color: loading ? C.textMuted : '#fff',
            border: 'none', borderRadius: 10, fontSize: '0.95rem', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
          }}
        >
          {loading
            ? (mode === 'download' ? 'Preparing ZIP...' : 'Submitting...')
            : (mode === 'download' ? 'Download ZIP →' : 'Submit for Publishing →')}
        </button>
      )}

      {done && mode === 'download' && (
        <div style={{ marginTop: '1.25rem', color: C.green, fontWeight: 600, fontSize: '0.9rem' }}>✓ Downloaded successfully</div>
      )}

      {done && mode === 'hosted' && statuses.length > 0 && (
        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {statuses.map((s, i) => (
            <div key={i} style={{ background: C.bgSubtle, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} />
                <span style={{ color: C.textPrimary, fontSize: '0.875rem' }}>{s.channelName}</span>
              </div>
              <span style={{ color: C.textMuted, fontSize: '0.78rem' }}>{s.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
