'use client'
import { Channel, ChannelPlatform } from '@/lib/types'

const C = {
  pine700: '#2D6A4F', pine500: '#40916C', pine100: '#D8EFE4', pine200: '#B2DACC',
  bgSurface: '#FFFFFF', bgSubtle: '#EEF6F1',
  border: '#C8DFD4', borderStrong: '#95C4AE',
  textPrimary: '#1A2E25', textSecondary: '#3D6B52', textMuted: '#7A9E8A',
}

const PLATFORM_META: Record<ChannelPlatform, { label: string; color: string; bg: string }> = {
  youtube_creator: { label: 'YouTube',      color: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
  youtube_media:   { label: 'YouTube',      color: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
  gaming_media:    { label: 'Gaming Media', color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
  reddit:          { label: 'Reddit',       color: '#EA580C', bg: 'rgba(234,88,12,0.08)' },
  bilibili:        { label: 'Bilibili',     color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
  xiaohongshu:     { label: '小红书',        color: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n > 0 ? n.toLocaleString() : '—'
}

interface Props {
  channel: Channel
  selected: boolean
  onToggle: () => void
}

export default function ChannelCard({ channel, selected, onToggle }: Props) {
  const meta = PLATFORM_META[channel.platform]
  const score = channel.influenceWeight

  return (
    <div
      onClick={onToggle}
      style={{
        background: selected ? C.pine100 : C.bgSurface,
        border: `1.5px solid ${selected ? C.pine500 : C.border}`,
        borderRadius: 12, padding: '1.1rem', cursor: 'pointer',
        transition: 'all 0.15s', position: 'relative',
      }}
    >
      {/* Checkbox */}
      <div style={{
        position: 'absolute', top: '1rem', right: '1rem',
        width: 20, height: 20, borderRadius: 6,
        border: `2px solid ${selected ? C.pine700 : C.border}`,
        background: selected ? C.pine700 : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '0.65rem', fontWeight: 800, flexShrink: 0,
      }}>
        {selected ? '✓' : ''}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.6rem', paddingRight: '1.5rem' }}>
        <div>
          <div style={{ fontWeight: 700, color: C.textPrimary, fontSize: '0.92rem', marginBottom: '0.3rem' }}>
            {channel.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ padding: '0.12rem 0.45rem', borderRadius: 4, fontSize: '0.68rem', fontWeight: 700, background: meta.bg, color: meta.color }}>
              {meta.label}
            </span>
            {score != null && score > 0 && (
              <span style={{ padding: '0.12rem 0.45rem', borderRadius: 4, fontSize: '0.68rem', fontWeight: 700, background: C.pine100, color: C.pine700 }}>
                {score}/100
              </span>
            )}
          </div>
        </div>
        {channel.followerCount > 0 && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: C.textPrimary, lineHeight: 1 }}>
              {fmt(channel.followerCount)}
            </div>
            <div style={{ fontSize: '0.68rem', color: C.textMuted, letterSpacing: '0.04em' }}>
              {channel.followerLabel}
            </div>
          </div>
        )}
      </div>

      {/* Relevance reason */}
      {channel.relevanceReason && (
        <div style={{ color: C.textSecondary, fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '0.65rem' }}>
          {channel.relevanceReason}
        </div>
      )}

      {/* Recent content */}
      {channel.recentContent && channel.recentContent.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {channel.recentContent.slice(0, 3).map((t, i) => (
            <div key={i} style={{ color: C.textMuted, fontSize: '0.73rem', borderLeft: `2px solid ${C.border}`, paddingLeft: '0.5rem' }}>
              {t}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
