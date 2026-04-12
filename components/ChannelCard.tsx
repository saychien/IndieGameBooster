'use client'
import { Channel, ChannelPlatform } from '@/lib/types'

const PLATFORM_META: Record<ChannelPlatform, { label: string; color: string; bg: string }> = {
  youtube_creator: { label: 'YouTube Creator', color: '#ff4d4d', bg: 'rgba(255,77,77,0.12)' },
  youtube_media:   { label: 'YouTube Media',   color: '#ff4d4d', bg: 'rgba(255,77,77,0.12)' },
  gaming_media:    { label: 'Gaming Media',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  reddit:          { label: 'Reddit',           color: '#ff6314', bg: 'rgba(255,99,20,0.12)' },
  bilibili:        { label: 'Bilibili',         color: '#23ade5', bg: 'rgba(35,173,229,0.12)' },
  xiaohongshu:     { label: '小红书',            color: '#ff2742', bg: 'rgba(255,39,66,0.12)' },
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

interface Props {
  channel: Channel
  selected: boolean
  onToggle: () => void
}

const S = {
  card: (selected: boolean) => ({
    background: selected ? 'rgba(99,102,241,0.08)' : '#12121a',
    border: `1px solid ${selected ? '#6366f1' : '#1e1e2e'}`,
    borderRadius: '12px',
    padding: '1.25rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative' as const,
  }),
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.6rem' },
  name: { fontWeight: 700, color: '#e2e8f0', fontSize: '0.95rem', marginBottom: '0.25rem' },
  platformBadge: (p: ChannelPlatform) => ({
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 700,
    background: PLATFORM_META[p].bg,
    color: PLATFORM_META[p].color,
  }),
  metric: { textAlign: 'right' as const },
  count: { fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0', lineHeight: 1 },
  countLabel: { fontSize: '0.7rem', color: '#64748b', letterSpacing: '0.05em' },
  reason: { color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '0.75rem' },
  recentRow: { display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' },
  recentItem: { color: '#64748b', fontSize: '0.75rem', borderLeft: '2px solid #1e1e2e', paddingLeft: '0.5rem' },
  checkbox: (selected: boolean) => ({
    position: 'absolute' as const,
    top: '1rem',
    right: '1rem',
    width: '20px',
    height: '20px',
    borderRadius: '6px',
    border: `2px solid ${selected ? '#6366f1' : '#1e1e2e'}`,
    background: selected ? '#6366f1' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 800,
    flexShrink: 0,
  }),
}

export default function ChannelCard({ channel, selected, onToggle }: Props) {
  return (
    <div style={S.card(selected)} onClick={onToggle}>
      <div style={S.checkbox(selected)}>{selected ? '✓' : ''}</div>

      <div style={S.header}>
        <div>
          <div style={S.name}>{channel.name}</div>
          <span style={S.platformBadge(channel.platform)}>
            {PLATFORM_META[channel.platform].label}
          </span>
        </div>
        {channel.followerCount > 0 && (
          <div style={S.metric}>
            <div style={S.count}>{formatCount(channel.followerCount)}</div>
            <div style={S.countLabel}>{channel.followerLabel}</div>
          </div>
        )}
      </div>

      <div style={S.reason}>{channel.relevanceReason}</div>

      {channel.recentContent && channel.recentContent.length > 0 && (
        <div style={S.recentRow}>
          {channel.recentContent.slice(0, 3).map((t, i) => (
            <div key={i} style={S.recentItem}>{t}</div>
          ))}
        </div>
      )}
    </div>
  )
}
