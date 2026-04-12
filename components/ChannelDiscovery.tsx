'use client'
import { useState } from 'react'
import { Channel, ChannelPlatform } from '@/lib/types'
import ChannelCard from './ChannelCard'

const PLATFORMS: { key: ChannelPlatform | 'all'; label: string }[] = [
  { key: 'all', label: 'All Platforms' },
  { key: 'youtube_creator', label: 'YouTube' },
  { key: 'gaming_media', label: 'Media' },
  { key: 'reddit', label: 'Reddit' },
  { key: 'bilibili', label: 'Bilibili' },
  { key: 'xiaohongshu', label: '小红书' },
]

interface Props {
  channels: Channel[]
  selected: string[]
  onToggle: (id: string) => void
  onGenerate: () => void
  generating: boolean
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n > 0 ? n.toString() : '—'
}

const S = {
  filterRow: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' as const },
  filterBtn: (active: boolean) => ({
    padding: '0.4rem 0.9rem',
    borderRadius: '8px',
    border: `1px solid ${active ? '#6366f1' : '#1e1e2e'}`,
    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
    color: active ? '#a5b4fc' : '#64748b',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  footer: { marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  reach: { color: '#64748b', fontSize: '0.85rem' },
  reachNum: { color: '#6366f1', fontWeight: 800, fontSize: '1.4rem' },
  genBtn: (disabled: boolean) => ({
    padding: '0.85rem 2rem',
    background: disabled ? '#1e1e2e' : '#6366f1',
    color: disabled ? '#64748b' : '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
  }),
}

export default function ChannelDiscovery({ channels, selected, onToggle, onGenerate, generating }: Props) {
  const [platform, setPlatform] = useState<ChannelPlatform | 'all'>('all')

  const filtered = platform === 'all' ? channels : channels.filter(c => c.platform === platform)
  const selectedChannels = channels.filter(c => selected.includes(c.id))
  const totalReach = selectedChannels.reduce((sum, c) => sum + c.followerCount, 0)

  return (
    <div>
      <div style={S.filterRow}>
        {PLATFORMS.map(p => (
          <button
            key={p.key}
            style={S.filterBtn(platform === p.key)}
            onClick={() => setPlatform(p.key)}
          >
            {p.label}
            {p.key !== 'all' && (
              <span style={{ marginLeft: '0.35rem', opacity: 0.6 }}>
                ({channels.filter(c => c.platform === p.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '3rem 0' }}>
          No channels found for this platform yet.
        </div>
      ) : (
        <div style={S.grid}>
          {filtered.map(ch => (
            <ChannelCard
              key={ch.id}
              channel={ch}
              selected={selected.includes(ch.id)}
              onToggle={() => onToggle(ch.id)}
            />
          ))}
        </div>
      )}

      <div style={S.footer}>
        <div style={S.reach}>
          <div style={S.reachNum}>{formatCount(totalReach)}</div>
          Estimated total reach · {selected.length} channel{selected.length !== 1 ? 's' : ''} selected
        </div>
        <button
          style={S.genBtn(selected.length === 0 || generating)}
          onClick={onGenerate}
          disabled={selected.length === 0 || generating}
        >
          {generating ? 'Generating...' : `Generate Outreach (${selected.length}) →`}
        </button>
      </div>
    </div>
  )
}
