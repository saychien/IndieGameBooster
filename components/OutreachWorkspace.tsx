'use client'
import { useState } from 'react'
import { OutreachContent, Channel } from '@/lib/types'

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

const S = {
  tabRow: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' as const, borderBottom: '1px solid #1e1e2e', paddingBottom: '1rem' },
  tab: (active: boolean) => ({
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: `1px solid ${active ? '#6366f1' : 'transparent'}`,
    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
    color: active ? '#a5b4fc' : '#64748b',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
  }),
  contentBox: {
    background: '#0a0a0f',
    border: '1px solid #1e1e2e',
    borderRadius: '12px',
    padding: '1.5rem',
    position: 'relative' as const,
  },
  pre: {
    color: '#e2e8f0',
    fontSize: '0.9rem',
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap' as const,
    fontFamily: 'inherit',
    margin: 0,
  },
  copyBtn: (copied: boolean) => ({
    position: 'absolute' as const,
    top: '1rem',
    right: '1rem',
    padding: '0.4rem 0.9rem',
    background: copied ? 'rgba(34,197,94,0.15)' : '#1e1e2e',
    color: copied ? '#22c55e' : '#94a3b8',
    border: `1px solid ${copied ? '#22c55e' : '#1e1e2e'}`,
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  typeBadge: {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.72rem',
    fontWeight: 700,
    background: 'rgba(99,102,241,0.12)',
    color: '#a5b4fc',
    marginBottom: '1rem',
  },
}

export default function OutreachWorkspace({ outreach, channels }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [copied, setCopied] = useState(false)

  const active = outreach[activeIdx]
  const activeChannel = channels.find(c => c.id === active?.channelId)

  function copy() {
    if (active) {
      navigator.clipboard.writeText(active.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (outreach.length === 0) return null

  return (
    <div>
      <div style={S.tabRow}>
        {outreach.map((item, i) => {
          const ch = channels.find(c => c.id === item.channelId)
          return (
            <button key={i} style={S.tab(i === activeIdx)} onClick={() => { setActiveIdx(i); setCopied(false) }}>
              {ch?.name || item.channelId}
            </button>
          )
        })}
      </div>

      {active && (
        <div style={S.contentBox}>
          <div style={S.typeBadge}>{TYPE_LABELS[active.type] || active.type}</div>
          {activeChannel && (
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1rem' }}>
              {activeChannel.name}
              {activeChannel.followerCount > 0 && (
                <span style={{ marginLeft: '0.5rem' }}>
                  · {activeChannel.followerCount.toLocaleString()} {activeChannel.followerLabel}
                </span>
              )}
            </div>
          )}
          <button style={S.copyBtn(copied)} onClick={copy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <pre style={S.pre}>{active.content}</pre>
        </div>
      )}
    </div>
  )
}
