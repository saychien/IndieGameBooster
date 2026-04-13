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
  onKeywordAdd?: (kw: string) => void
}

export default function AnalysisEditor({ analysis, onChange, onKeywordAdd }: Props) {
  function set<K extends keyof AnalysisReport>(key: K, val: AnalysisReport[K]) {
    onChange({ ...analysis, [key]: val })
  }

  function handleAdd(kw: string) {
    set('keywords', [...(analysis.keywords ?? []), kw])
    onKeywordAdd?.(kw)
  }

  return (
    <div>
      <div style={{ color: C.textSecondary, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '1rem' }}>
        Discovery Keywords
        <span style={{ marginLeft: '0.6rem', color: C.textMuted, fontSize: '0.7rem', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
          Click a keyword to remove · Press Enter to add
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
        {(analysis.keywords ?? []).map((t, i) => (
          <span
            key={i}
            onClick={() => onChange({
              ...analysis,
              keywords: (analysis.keywords ?? []).filter((_, j) => j !== i),
              chineseKeywords: (analysis.chineseKeywords ?? []).filter((_, j) => j !== i),
            })}
            title="Click to remove"
            style={{
              background: C.pine100, color: C.pine800, border: `1.5px solid ${C.pine200}`,
              borderRadius: 8, padding: '0.45rem 1rem', fontSize: '1rem', fontWeight: 700,
              cursor: 'pointer', userSelect: 'none', letterSpacing: '0.01em',
            }}
          >
            {t} ×
          </span>
        ))}
        <AddKeyword onAdd={handleAdd} />
      </div>
    </div>
  )
}

function AddKeyword({ onAdd }: { onAdd: (kw: string) => void }) {
  const [input, setInput] = useState('')
  const C2 = { border: '#C8DFD4', textMuted: '#7A9E8A' }
  return (
    <input
      value={input}
      onChange={e => setInput(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter' && input.trim()) {
          onAdd(input.trim())
          setInput('')
          e.preventDefault()
        }
      }}
      placeholder="+ add keyword"
      style={{
        background: 'transparent', border: `1.5px dashed ${C2.border}`, borderRadius: 8,
        padding: '0.45rem 1rem', color: C2.textMuted, fontSize: '1rem',
        outline: 'none', fontFamily: 'inherit', minWidth: 140,
      }}
    />
  )
}
