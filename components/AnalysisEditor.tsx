'use client'
import { useState } from 'react'
import { AnalysisReport, ImprovementTip } from '@/lib/types'

interface Props {
  analysis: AnalysisReport
  tips: ImprovementTip[]
  onConfirm: (analysis: AnalysisReport) => void
}

const S = {
  section: { marginBottom: '2rem' },
  title: { color: '#64748b', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontWeight: 700, marginBottom: '1rem' },
  card: { background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '1.5rem' },
  textarea: {
    width: '100%',
    background: '#0a0a0f',
    border: '1px solid #1e1e2e',
    borderRadius: '8px',
    padding: '0.75rem',
    color: '#e2e8f0',
    fontSize: '0.9rem',
    lineHeight: 1.6,
    resize: 'vertical' as const,
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
    minHeight: '90px',
  },
  tagRow: { display: 'flex', flexWrap: 'wrap' as const, gap: '0.5rem', marginBottom: '0.75rem' },
  tag: {
    background: '#1e1e2e',
    color: '#a5b4fc',
    borderRadius: '6px',
    padding: '0.25rem 0.65rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid #6366f1',
    transition: 'all 0.15s',
  },
  tagInput: {
    background: 'transparent',
    border: '1px dashed #1e1e2e',
    borderRadius: '6px',
    padding: '0.25rem 0.65rem',
    color: '#64748b',
    fontSize: '0.8rem',
    outline: 'none',
    width: '120px',
    fontFamily: 'inherit',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
  fieldLabel: { color: '#64748b', fontSize: '0.75rem', marginBottom: '0.4rem', display: 'block' },
  tipCard: {
    background: '#0a0a0f',
    border: '1px solid #1e1e2e',
    borderRadius: '10px',
    padding: '1rem',
    marginBottom: '0.75rem',
  },
  impactBadge: (impact: string) => ({
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    background: impact === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
    color: impact === 'high' ? '#ef4444' : '#f59e0b',
    marginLeft: '0.5rem',
  }),
  btn: {
    padding: '0.85rem 2rem',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.02em',
  },
  editNote: { color: '#64748b', fontSize: '0.8rem', marginBottom: '1.5rem' },
}

function TagEditor({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [newTag, setNewTag] = useState('')
  return (
    <div style={S.tagRow}>
      {tags.map((t, i) => (
        <span
          key={i}
          style={S.tag}
          title="Click to remove"
          onClick={() => onChange(tags.filter((_, j) => j !== i))}
        >
          {t} ×
        </span>
      ))}
      <input
        style={S.tagInput}
        placeholder="+ add tag"
        value={newTag}
        onChange={e => setNewTag(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && newTag.trim()) {
            onChange([...tags, newTag.trim()])
            setNewTag('')
          }
        }}
      />
    </div>
  )
}

export default function AnalysisEditor({ analysis, tips, onConfirm }: Props) {
  const [draft, setDraft] = useState<AnalysisReport>(analysis)

  function set<K extends keyof AnalysisReport>(key: K, val: AnalysisReport[K]) {
    setDraft(d => ({ ...d, [key]: val }))
  }

  return (
    <div>
      <p style={S.editNote}>Review and edit the analysis below. Changes will be used to customize your marketing outreach.</p>

      {/* Audience Profile */}
      <div style={S.section}>
        <div style={S.title}>Audience Profile</div>
        <div style={S.card}>
          <textarea
            style={S.textarea}
            value={draft.audienceProfile}
            onChange={e => set('audienceProfile', e.target.value)}
          />
          <label style={{ ...S.fieldLabel, marginTop: '1rem' }}>Emotional Hook</label>
          <textarea
            style={{ ...S.textarea, minHeight: '60px' }}
            value={draft.whyTheyWillLoveIt}
            onChange={e => set('whyTheyWillLoveIt', e.target.value)}
          />
        </div>
      </div>

      {/* Keywords */}
      <div style={S.section}>
        <div style={S.title}>Discovery Keywords</div>
        <div style={S.card}>
          <div style={S.row}>
            <div>
              <label style={S.fieldLabel}>Core Genre Tags</label>
              <TagEditor tags={draft.coreGenreTags} onChange={v => set('coreGenreTags', v)} />
            </div>
            <div>
              <label style={S.fieldLabel}>YouTube Keywords</label>
              <TagEditor tags={draft.youtubeKeywords} onChange={v => set('youtubeKeywords', v)} />
            </div>
            <div>
              <label style={S.fieldLabel}>Reddit Subreddits</label>
              <TagEditor tags={draft.redditKeywords} onChange={v => set('redditKeywords', v)} />
            </div>
            <div>
              <label style={S.fieldLabel}>Bilibili Keywords (中文)</label>
              <TagEditor tags={draft.bilibiliKeywords} onChange={v => set('bilibiliKeywords', v)} />
            </div>
            <div>
              <label style={S.fieldLabel}>小红书 Keywords</label>
              <TagEditor tags={draft.xiaohongshuKeywords} onChange={v => set('xiaohongshuKeywords', v)} />
            </div>
            <div>
              <label style={S.fieldLabel}>Gaming Media Angles</label>
              <TagEditor tags={draft.gamingMediaAngles} onChange={v => set('gamingMediaAngles', v)} />
            </div>
          </div>
        </div>
      </div>

      {/* Steam Tips */}
      {tips.length > 0 && (
        <div style={S.section}>
          <div style={S.title}>Steam Page Improvement Tips</div>
          {tips.map((tip, i) => (
            <div key={i} style={S.tipCard}>
              <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '0.4rem' }}>
                {tip.title}
                <span style={S.impactBadge(tip.impact)}>{tip.impact.toUpperCase()}</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{tip.suggestion}</div>
            </div>
          ))}
        </div>
      )}

      <button style={S.btn} onClick={() => onConfirm(draft)}>
        Confirm & Find Channels →
      </button>
    </div>
  )
}
