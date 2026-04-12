'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { GameData, AnalysisReport, ImprovementTip, Channel, OutreachContent } from '@/lib/types'
import { MOCK_GAMES } from '@/lib/mockData'
import AnalysisEditor from '@/components/AnalysisEditor'
import ChannelDiscovery from '@/components/ChannelDiscovery'
import OutreachWorkspace from '@/components/OutreachWorkspace'
import PublishPanel from '@/components/PublishPanel'

const S = {
  page: { minHeight: '100vh', background: '#0a0a0f', paddingBottom: '6rem' },
  nav: {
    borderBottom: '1px solid #1e1e2e',
    padding: '1rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(10,10,15,0.9)',
    backdropFilter: 'blur(8px)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  logo: { color: '#6366f1', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: 'pointer' },
  container: { maxWidth: '960px', margin: '0 auto', padding: '0 2rem' },
  gameCard: {
    display: 'flex',
    gap: '1.5rem',
    background: '#12121a',
    border: '1px solid #1e1e2e',
    borderRadius: '16px',
    padding: '1.5rem',
    marginTop: '2.5rem',
    marginBottom: '2.5rem',
  },
  gameImg: { width: '200px', height: '94px', objectFit: 'cover' as const, borderRadius: '8px', flexShrink: 0 },
  gameImgPlaceholder: { width: '200px', height: '94px', background: '#1e1e2e', borderRadius: '8px', flexShrink: 0 },
  gameName: { fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '0.4rem' },
  gameMeta: { color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' },
  tagRow: { display: 'flex', flexWrap: 'wrap' as const, gap: '0.4rem' },
  tag: { background: '#1e1e2e', color: '#94a3b8', borderRadius: '6px', padding: '0.2rem 0.55rem', fontSize: '0.75rem' },
  section: { marginBottom: '3.5rem' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  stepNum: {
    width: '28px', height: '28px', borderRadius: '50%', background: '#6366f1',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0,
  },
  sectionTitle: { fontSize: '1.15rem', fontWeight: 700, color: '#e2e8f0' },
  skeleton: { background: 'linear-gradient(90deg, #12121a 25%, #1e1e2e 50%, #12121a 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '10px' },
  errorBox: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '1rem 1.25rem', color: '#ef4444', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  retryBtn: { padding: '0.35rem 0.85rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 },
}

function Skeleton({ h = 120 }: { h?: number }) {
  return <div style={{ ...S.skeleton, height: `${h}px`, marginBottom: '1rem' }} />
}

type Stage = 'steam' | 'analysis' | 'edit' | 'discovery' | 'outreach' | 'publish'

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const demoKey = searchParams.get('demo')
  const steamUrl = searchParams.get('url') || ''

  const [stage, setStage] = useState<Stage>('steam')
  const [game, setGame] = useState<GameData | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisReport | null>(null)
  const [tips, setTips] = useState<ImprovementTip[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [outreach, setOutreach] = useState<OutreachContent[]>([])
  const [errors, setErrors] = useState<Partial<Record<Stage, string>>>({})

  useEffect(() => {
    if (demoKey && MOCK_GAMES[demoKey]) {
      const mock = MOCK_GAMES[demoKey]
      setGame(mock.game)
      setAnalysis(mock.analysis)
      setTips(mock.tips)
      setChannels(mock.channels)
      setStage('edit')
      return
    }
    if (steamUrl) fetchSteam()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchSteam() {
    setStage('steam')
    setErrors({})
    try {
      const res = await fetch('/api/steam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steamUrl }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setGame(data)
      fetchAnalysis(data)
    } catch (e) {
      setErrors(prev => ({ ...prev, steam: (e as Error).message }))
    }
  }

  async function fetchAnalysis(gameData: GameData) {
    setStage('analysis')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAnalysis(data.analysis)
      setTips(data.tips || [])
      setStage('edit')
    } catch (e) {
      setErrors(prev => ({ ...prev, analysis: (e as Error).message }))
    }
  }

  async function handleAnalysisConfirm(confirmed: AnalysisReport) {
    setAnalysis(confirmed)
    setStage('discovery')
    fetchDiscovery(confirmed)
  }

  async function fetchDiscovery(confirmed: AnalysisReport) {
    try {
      const res = await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: confirmed, gameName: game?.name }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setChannels(data.channels || [])
    } catch (e) {
      setErrors(prev => ({ ...prev, discovery: (e as Error).message }))
    }
  }

  function toggleChannel(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function generateOutreach() {
    if (!game || !analysis) return
    setStage('outreach')
    setErrors({})
    const selected = channels.filter(c => selectedIds.includes(c.id))
    try {
      const res = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channels: selected, game, analysis }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setOutreach(data.outreach || [])
      setStage('publish')
    } catch (e) {
      setErrors(prev => ({ ...prev, outreach: (e as Error).message }))
      setStage('discovery')
    }
  }

  const selectedChannels = channels.filter(c => selectedIds.includes(c.id))

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.logo} onClick={() => router.push('/')}>Indie Game Booster</div>
        {game && <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{game.name}</div>}
      </nav>

      <div style={S.container}>
        {/* Game card */}
        {game ? (
          <div style={S.gameCard}>
            {game.headerImageUrl
              ? <img src={game.headerImageUrl} alt={game.name} style={S.gameImg} />
              : <div style={S.gameImgPlaceholder} />
            }
            <div>
              <div style={S.gameName}>{game.name}</div>
              <div style={S.gameMeta}>
                {game.price != null && `$${game.price}`}
                {game.estimatedOwners && ` · ~${game.estimatedOwners} owners`}
              </div>
              <div style={S.tagRow}>
                {game.tags.slice(0, 8).map((t, i) => <span key={i} style={S.tag}>{t}</span>)}
              </div>
            </div>
          </div>
        ) : stage === 'steam' ? (
          <div style={{ marginTop: '2.5rem', marginBottom: '2.5rem' }}>
            <Skeleton h={110} />
          </div>
        ) : null}

        {errors.steam && (
          <div style={S.errorBox}>
            <span>Steam error: {errors.steam}</span>
            <button style={S.retryBtn} onClick={fetchSteam}>Retry</button>
          </div>
        )}

        {/* Section 2 — Analysis */}
        <div style={S.section}>
          <div style={S.sectionHeader}>
            <div style={S.stepNum}>2</div>
            <div style={S.sectionTitle}>Audience Analysis & Keywords</div>
          </div>

          {stage === 'analysis' && <><Skeleton h={90} /><Skeleton h={130} /></>}
          {errors.analysis && (
            <div style={S.errorBox}>
              <span>Analysis error: {errors.analysis}</span>
              <button style={S.retryBtn} onClick={() => game && fetchAnalysis(game)}>Retry</button>
            </div>
          )}
          {analysis && (stage === 'edit' || stage === 'discovery' || stage === 'outreach' || stage === 'publish') && (
            <AnalysisEditor
              analysis={analysis}
              tips={tips}
              onConfirm={handleAnalysisConfirm}
            />
          )}
        </div>

        {/* Section 3 — Discovery */}
        {(stage === 'discovery' || stage === 'outreach' || stage === 'publish') && (
          <div style={S.section}>
            <div style={S.sectionHeader}>
              <div style={S.stepNum}>3</div>
              <div style={S.sectionTitle}>Channel & Community Discovery</div>
            </div>

            {channels.length === 0 && !errors.discovery && (
              <><Skeleton h={120} /><Skeleton h={120} /><Skeleton h={120} /></>
            )}
            {errors.discovery && (
              <div style={S.errorBox}>
                <span>Discovery error: {errors.discovery}</span>
              </div>
            )}
            {channels.length > 0 && (
              <ChannelDiscovery
                channels={channels}
                selected={selectedIds}
                onToggle={toggleChannel}
                onGenerate={generateOutreach}
                generating={stage === 'outreach'}
              />
            )}
          </div>
        )}

        {/* Section 4 — Outreach */}
        {(stage === 'publish') && outreach.length > 0 && (
          <div style={S.section}>
            <div style={S.sectionHeader}>
              <div style={S.stepNum}>4</div>
              <div style={S.sectionTitle}>Generated Outreach Content</div>
            </div>
            <OutreachWorkspace outreach={outreach} channels={selectedChannels} />
          </div>
        )}

        {/* Section 5 — Publish */}
        {stage === 'publish' && outreach.length > 0 && game && (
          <div style={S.section}>
            <div style={S.sectionHeader}>
              <div style={S.stepNum}>5</div>
              <div style={S.sectionTitle}>Publish or Download</div>
            </div>
            <PublishPanel outreach={outreach} channels={selectedChannels} game={game} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        Loading...
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
