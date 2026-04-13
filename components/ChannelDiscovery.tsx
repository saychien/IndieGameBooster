'use client'
import { useState } from 'react'
import { Channel, ChannelPlatform } from '@/lib/types'
import ChannelCard from './ChannelCard'

const C = {
  pine700: '#2D6A4F', pine100: '#D8EFE4', pine200: '#B2DACC',
  bgSubtle: '#EEF6F1', border: '#C8DFD4',
  textPrimary: '#1A2E25', textSecondary: '#3D6B52', textMuted: '#7A9E8A',
}

const FILTERS: { key: ChannelPlatform | 'all'; label: string }[] = [
  { key: 'all',             label: 'All' },
  { key: 'youtube_creator', label: 'YouTube' },
  { key: 'gaming_media',    label: 'Media' },
  { key: 'reddit',          label: 'Reddit' },
  { key: 'bilibili',        label: 'Bilibili' },
  { key: 'xiaohongshu',     label: 'Rednote' },
]

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n > 0 ? n.toString() : '—'
}

interface Props {
  channels: Channel[]
  selected: string[]
  onToggle: (id: string) => void
  onGenerate: () => void
  generating: boolean
}

export default function ChannelDiscovery({ channels, selected, onToggle, onGenerate, generating }: Props) {
  const [filter, setFilter] = useState<ChannelPlatform | 'all'>('all')

  const filtered = filter === 'all' ? channels : channels.filter(c => c.platform === filter)
  const totalReach = channels
    .filter(c => selected.includes(c.id))
    .reduce((s, c) => s + c.followerCount, 0)

  return (
    <div>
      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {FILTERS.map(f => {
          const count = f.key === 'all' ? channels.length : channels.filter(c => c.platform === f.key).length
          if (f.key !== 'all' && count === 0) return null
          const active = filter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '0.35rem 0.85rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                background: active ? C.pine100 : 'transparent',
                color: active ? C.pine700 : C.textMuted,
                border: `1px solid ${active ? C.pine200 : C.border}`,
                transition: 'all 0.15s',
              }}
            >
              {f.label} <span style={{ opacity: 0.6, marginLeft: 3 }}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ color: C.textMuted, textAlign: 'center', padding: '3rem 0', fontSize: '0.875rem' }}>
          No channels found for this platform.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem', marginBottom: '1.75rem' }}>
          {filtered.map(ch => (
            <ChannelCard key={ch.id} channel={ch} selected={selected.includes(ch.id)} onToggle={() => onToggle(ch.id)} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: `1px solid ${C.border}` }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: C.pine700, lineHeight: 1 }}>{fmt(totalReach)}</div>
          <div style={{ color: C.textMuted, fontSize: '0.8rem', marginTop: '0.15rem' }}>
            estimated reach · {selected.length} selected
          </div>
        </div>
        <button
          onClick={onGenerate}
          disabled={selected.length === 0 || generating}
          style={{
            padding: '0.8rem 2rem', borderRadius: 10, border: 'none', fontSize: '0.95rem', fontWeight: 700,
            background: selected.length === 0 || generating ? C.pine100 : C.pine700,
            color: selected.length === 0 || generating ? C.textMuted : '#fff',
            cursor: selected.length === 0 || generating ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {generating ? 'Generating...' : `Generate Outreach (${selected.length}) →`}
        </button>
      </div>
    </div>
  )
}
