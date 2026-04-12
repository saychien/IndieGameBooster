'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const S = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: '#0a0a0f',
  },
  logo: {
    fontSize: '1.1rem',
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: '#6366f1',
    marginBottom: '1rem',
    textTransform: 'uppercase' as const,
  },
  headline: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: 800,
    color: '#e2e8f0',
    textAlign: 'center' as const,
    lineHeight: 1.15,
    marginBottom: '1rem',
    maxWidth: '700px',
  },
  sub: {
    color: '#64748b',
    textAlign: 'center' as const,
    fontSize: '1.05rem',
    marginBottom: '3rem',
    maxWidth: '480px',
  },
  card: {
    background: '#12121a',
    border: '1px solid #1e1e2e',
    borderRadius: '16px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '540px',
  },
  label: {
    display: 'block',
    color: '#64748b',
    fontSize: '0.8rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    marginBottom: '0.6rem',
    fontWeight: 600,
  },
  input: {
    width: '100%',
    background: '#0a0a0f',
    border: '1px solid #1e1e2e',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    color: '#e2e8f0',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
  },
  inputFocus: {
    borderColor: '#6366f1',
  },
  btn: {
    width: '100%',
    marginTop: '1.5rem',
    padding: '0.9rem',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.2s',
    letterSpacing: '0.02em',
  },
  demoRow: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.25rem',
  },
  demoBtn: {
    flex: 1,
    padding: '0.55rem',
    background: 'transparent',
    color: '#64748b',
    border: '1px solid #1e1e2e',
    borderRadius: '8px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  error: {
    color: '#ef4444',
    fontSize: '0.85rem',
    marginTop: '0.75rem',
  },
}

export default function GameInput() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!url.trim()) { setError('Please enter a Steam URL'); return }
    if (!url.includes('store.steampowered.com/app/')) {
      setError('Please enter a valid Steam store URL (e.g. https://store.steampowered.com/app/1234567)')
      return
    }
    setLoading(true)
    router.push(`/results?url=${encodeURIComponent(url.trim())}`)
  }

  return (
    <div style={S.wrap}>
      <div style={S.logo}>Indie Game Booster</div>
      <h1 style={S.headline}>
        We replace a publisher<br />
        with an <span style={{ color: '#6366f1' }}>AI agent.</span>
      </h1>
      <p style={S.sub}>
        Paste your Steam URL. We'll profile your audience, find the right KOLs across every platform, and write the outreach for you.
      </p>

      <div style={S.card}>
        <form onSubmit={handleSubmit}>
          <label style={S.label}>Steam Store URL</label>
          <input
            style={{ ...S.input, ...(focused ? S.inputFocus : {}) }}
            type="url"
            placeholder="https://store.steampowered.com/app/1234567/Your_Game/"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={loading}
          />
          {error && <div style={S.error}>{error}</div>}
          <button
            type="submit"
            style={{ ...S.btn, ...(loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Find My Audience →'}
          </button>
        </form>

        <div style={S.demoRow}>
          <button
            style={S.demoBtn}
            onClick={() => router.push('/results?demo=1')}
          >
            Demo: Dark Roguelike
          </button>
          <button
            style={S.demoBtn}
            onClick={() => router.push('/results?demo=2')}
          >
            Demo: Cozy Farming
          </button>
        </div>
      </div>
    </div>
  )
}
