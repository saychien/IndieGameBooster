'use client'
import { useState } from 'react'
import { AnalysisReport } from '@/lib/types'

const C = {
  pine700: '#2D6A4F', pine800: '#1E4D38', pine500: '#40916C',
  pine100: '#D8EFE4', pine200: '#B2DACC',
  bgSurface: '#FFFFFF', bgSubtle: '#EEF6F1',
  border: '#C8DFD4', borderStrong: '#95C4AE',
  textPrimary: '#1A2E25', textSecondary: '#3D6B52', textMuted: '#7A9E8A',
}

interface Props {
  analysis: AnalysisReport
  onChange: (a: AnalysisReport) => void
}

const KEYWORD_GROUPS: { key: keyof AnalysisReport; label: string }[] = [
  { key: 'coreGenreTags',       label: 'Genre Tags' },
  { key: 'youtubeKeywords',     label: 'YouTube' },
  { key: 'redditKeywords',      label: 'Reddit' },
  { key: 'bilibiliKeywords',    label: 'Bilibili' },
  { key: 'xiaohongshuKeywords', label: '小红书' },
  { key: 'gamingMediaAngles',   label: 'Media Angles' },
]

function TagEditor({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState('')
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
      {tags.map((t, i) => (
        <span
          key={i}
          onClick={() => onChange(tags.filter((_, j) => j !== i))}
          title="Click to remove"
          style={{
            background: C.pine100, color: C.pine800, border: `1px solid ${C.pine200}`,
            borderRadius: 6, padding: '0.2rem 0.6rem', fontSize: '0.78rem', fontWeight: 600,
            cursor: 'pointer', userSelect: 'none',
          }}
        >
          {t} ×
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && input.trim()) {
            onChange([...tags, input.trim()])
            setInput('')
            e.preventDefault()
          }
        }}
        placeholder="+ add"
        style={{
          background: 'transparent', border: `1px dashed ${C.border}`, borderRadius: 6,
          padding: '0.2rem 0.55rem', color: C.textMuted, fontSize: '0.78rem',
          outline: 'none', width: 80, fontFamily: 'inherit',
        }}
      />
    </div>
  )
}

export default function AnalysisEditor({ analysis, onChange }: Props) {
  function set<K extends keyof AnalysisReport>(key: K, val: AnalysisReport[K]) {
    onChange({ ...analysis, [key]: val })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Audience profile */}
      <div style={{ background: C.bgSurface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '1.25rem' }}>
        <label style={{ display: 'block', color: C.textSecondary, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
          Audience Profile
        </label>
        <textarea
          value={analysis.audienceProfile}
          onChange={e => set('audienceProfile', e.target.value)}
          rows={3}
          style={{
            width: '100%', background: C.bgSubtle, border: `1.5px solid ${C.border}`,
            borderRadius: 8, padding: '0.7rem', color: C.textPrimary, fontSize: '0.9rem',
            lineHeight: 1.6, resize: 'vertical', outline: 'none', fontFamily: 'inherit',
          }}
        />
        <label style={{ display: 'block', color: C.textSecondary, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0.9rem 0 0.5rem' }}>
          Emotional Hook
        </label>
        <textarea
          value={analysis.whyTheyWillLoveIt}
          onChange={e => set('whyTheyWillLoveIt', e.target.value)}
          rows={2}
          style={{
            width: '100%', background: C.bgSubtle, border: `1.5px solid ${C.border}`,
            borderRadius: 8, padding: '0.7rem', color: C.textPrimary, fontSize: '0.9rem',
            lineHeight: 1.6, resize: 'vertical', outline: 'none', fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Keyword groups */}
      <div style={{ background: C.bgSurface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '1.25rem' }}>
        <div style={{ color: C.textSecondary, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Discovery Keywords
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {KEYWORD_GROUPS.map(({ key, label }) => (
            <div key={key}>
              <div style={{ color: C.textMuted, fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem' }}>{label}</div>
              <TagEditor
                tags={analysis[key] as string[]}
                onChange={v => set(key, v as AnalysisReport[typeof key])}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
