'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const C = {
  pine700: '#2D6A4F', pine800: '#1E4D38', pine100: '#D8EFE4',
  bgPage: '#F7FBF9', bgSurface: '#FFFFFF', bgSubtle: '#EEF6F1',
  border: '#C8DFD4', borderStrong: '#95C4AE',
  textPrimary: '#1A2E25', textSecondary: '#3D6B52', textMuted: '#7A9E8A',
  red: '#DC2626',
}

export default function GameInput() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!url.trim()) { setError('Please enter a Steam URL'); return }
    if (!url.includes('store.steampowered.com/app/')) {
      setError('Please enter a valid Steam store URL')
      return
    }
    setLoading(true)
    router.push(`/results?url=${encodeURIComponent(url.trim())}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bgPage, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 36, height: 36, background: C.pine700, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem' }}>
          IG
        </div>
        <span style={{ fontWeight: 800, color: C.pine700, fontSize: '1rem', letterSpacing: '0.05em' }}>
          Indie Game Booster
        </span>
      </div>

      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, color: C.textPrimary, textAlign: 'center', lineHeight: 1.15, marginBottom: '1rem', maxWidth: '640px' }}>
        We replace a publisher<br />
        with an <span style={{ color: C.pine700 }}>AI agent.</span>
      </h1>
      <p style={{ color: C.textMuted, textAlign: 'center', fontSize: '1.05rem', marginBottom: '3rem', maxWidth: '460px', lineHeight: 1.6 }}>
        Paste your Steam URL. We'll profile your audience, find the right KOLs across every platform, and write the outreach for you.
      </p>

      <div style={{ background: C.bgSurface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 520, boxShadow: '0 2px 16px rgba(45,106,79,0.07)' }}>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', color: C.textSecondary, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            Steam Store URL
          </label>
          <input
            style={{
              width: '100%', background: C.bgSubtle, border: `1.5px solid ${focused ? C.borderStrong : C.border}`,
              borderRadius: 10, padding: '0.85rem 1rem', color: C.textPrimary, fontSize: '0.95rem',
              outline: 'none', boxShadow: focused ? `0 0 0 3px rgba(64,145,108,0.15)` : 'none',
              transition: 'all 0.2s',
            }}
            type="url"
            placeholder="https://store.steampowered.com/app/1234567/..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={loading}
          />
          {error && <div style={{ color: C.red, fontSize: '0.83rem', marginTop: '0.5rem' }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', marginTop: '1.25rem', padding: '0.9rem',
              background: loading ? C.pine100 : C.pine700, color: loading ? C.textMuted : '#fff',
              border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
            }}
          >
            {loading ? 'Loading...' : 'Find My Audience →'}
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          {[{ label: 'Demo: Dark Roguelike', key: '1' }, { label: 'Demo: Cozy Farm', key: '2' }].map(d => (
            <button
              key={d.key}
              onClick={() => router.push(`/results?demo=${d.key}`)}
              style={{
                flex: 1, padding: '0.55rem', background: 'transparent', color: C.textMuted,
                border: `1px solid ${C.border}`, borderRadius: 8, fontSize: '0.8rem', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
