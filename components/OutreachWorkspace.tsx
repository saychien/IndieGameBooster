'use client'
import { useState } from 'react'
import { OutreachContent, Channel } from '@/lib/types'

const C = {
  pine700: '#2D6A4F', pine100: '#D8EFE4', pine200: '#B2DACC',
  bgSurface: '#FFFFFF', bgSubtle: '#EEF6F1',
  border: '#C8DFD4',
  textPrimary: '#1A2E25', textSecondary: '#3D6B52', textMuted: '#7A9E8A',
  green: '#16A34A',
}

const TYPE_LABELS: Record<string, string> = {
  press_kit: 'Press Kit',
  creator_email: 'Collaboration Email',
  reddit_post: 'Reddit Post',
  xiaohongshu_post: '小红书 Post',
}

interface Props {
  outreach: OutreachContent[]
  channels: Channel[]
}

export default function OutreachWorkspace({ outreach, channels }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [copied, setCopied] = useState(false)

  if (outreach.length === 0) return null
  const active = outreach[activeIdx]
  const ch = channels.find(c => c.id === active?.channelId)

  function copy() {
    if (active) {
      navigator.clipboard.writeText(active.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div>
      {/* Channel tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: `1px solid ${C.border}`, paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        {outreach.map((item, i) => {
          const c = channels.find(x => x.id === item.channelId)
          const isActive = i === activeIdx
          return (
            <button
              key={i}
              onClick={() => { setActiveIdx(i); setCopied(false) }}
              style={{
                padding: '0.45rem 1rem', borderRadius: 8, fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer',
                background: isActive ? C.pine100 : 'transparent',
                color: isActive ? C.pine700 : C.textMuted,
                border: `1px solid ${isActive ? C.pine200 : C.border}`,
                transition: 'all 0.15s',
              }}
            >
              {c?.name || item.channelId}
            </button>
          )
        })}
      </div>

      {/* Content box */}
      {active && (
        <div style={{ background: C.bgSubtle, border: `1px solid ${C.border}`, borderRadius: 12, padding: '1.5rem', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ padding: '0.18rem 0.55rem', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, background: C.pine100, color: C.pine700 }}>
              {TYPE_LABELS[active.type] || active.type}
            </span>
            {ch && ch.followerCount > 0 && (
              <span style={{ color: C.textMuted, fontSize: '0.78rem' }}>
                {ch.followerCount.toLocaleString()} {ch.followerLabel}
              </span>
            )}
          </div>

          <button
            onClick={copy}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              padding: '0.35rem 0.85rem', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
              background: copied ? 'rgba(22,163,74,0.1)' : C.bgSurface,
              color: copied ? C.green : C.textMuted,
              border: `1px solid ${copied ? C.green : C.border}`,
              transition: 'all 0.2s',
            }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>

          <pre style={{ color: C.textPrimary, fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
            {active.content}
          </pre>
        </div>
      )}
    </div>
  )
}
