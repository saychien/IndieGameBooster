'use client'
import { useState } from 'react'
import { OutreachContent, Channel, GameData } from '@/lib/types'
import { downloadOutreachZip } from '@/lib/export'

interface Props {
  outreach: OutreachContent[]
  channels: Channel[]
  game: GameData
}

const S = {
  row: { display: 'flex', gap: '1rem', flexWrap: 'wrap' as const },
  option: (active: boolean) => ({
    flex: 1,
    minWidth: '200px',
    background: active ? 'rgba(99,102,241,0.1)' : '#12121a',
    border: `1px solid ${active ? '#6366f1' : '#1e1e2e'}`,
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left' as const,
  }),
  optTitle: { fontWeight: 700, color: '#e2e8f0', marginBottom: '0.4rem', fontSize: '0.95rem' },
  optDesc: { color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5 },
  badge: { display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', marginTop: '0.75rem' },
  actionBtn: (loading: boolean) => ({
    marginTop: '1.5rem',
    padding: '0.85rem 2.5rem',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'all 0.2s',
  }),
  statusList: { marginTop: '1.5rem', display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' },
  statusItem: { background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', marginRight: '0.75rem', flexShrink: 0 },
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
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload() {
    setLoading(true)
    try {
      await downloadOutreachZip(outreach, channels, game)
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={S.row}>
        <button style={S.option(mode === 'hosted')} onClick={() => setMode('hosted')}>
          <div style={S.optTitle}>Publish via Indie Game Booster</div>
          <div style={S.optDesc}>We queue and manage outreach on your behalf. Track delivery status in your dashboard.</div>
          <div style={S.badge}>Coming soon</div>
        </button>
        <button style={S.option(mode === 'download')} onClick={() => setMode('download')}>
          <div style={S.optTitle}>Download as ZIP</div>
          <div style={S.optDesc}>Export all generated content as text files. Publish manually at your own pace.</div>
          <div style={S.badge}>Available now</div>
        </button>
      </div>

      {mode && !done && (
        <button
          style={S.actionBtn(loading)}
          onClick={mode === 'hosted' ? handleHosted : handleDownload}
          disabled={loading}
        >
          {loading
            ? mode === 'download' ? 'Preparing ZIP...' : 'Submitting...'
            : mode === 'download' ? 'Download ZIP →' : 'Submit for Publishing →'}
        </button>
      )}

      {done && mode === 'download' && (
        <div style={{ marginTop: '1.5rem', color: '#22c55e', fontWeight: 600 }}>
          ✓ Downloaded successfully
        </div>
      )}

      {done && mode === 'hosted' && statuses.length > 0 && (
        <div style={S.statusList}>
          {statuses.map((s, i) => (
            <div key={i} style={S.statusItem}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={S.statusDot} />
                <span style={{ color: '#e2e8f0', fontSize: '0.88rem' }}>{s.channelName}</span>
              </div>
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{s.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
