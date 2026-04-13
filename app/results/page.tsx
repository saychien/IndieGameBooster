'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { GameData, AnalysisReport, Channel, ChannelPlatform, OutreachContent, SelectablePlatform } from '@/lib/types'
import type { KOL } from '@/app/api/discovery/route'
import { MOCK_GAMES } from '@/lib/mockData'
import AnalysisEditor from '@/components/AnalysisEditor'
import SteamTipsPanel from '@/components/SteamTipsPanel'
import PlatformSelector from '@/components/PlatformSelector'
import ChannelDiscovery from '@/components/ChannelDiscovery'
import OutreachWorkspace from '@/components/OutreachWorkspace'
import PublishPanel from '@/components/PublishPanel'

const C = {
  pine700: '#2D6A4F', pine500: '#40916C', pine100: '#D8EFE4', pine200: '#B2DACC',
  bgPage: '#F7FBF9', bgSurface: '#FFFFFF', bgSubtle: '#EEF6F1',
  border: '#C8DFD4',
  textPrimary: '#1A2E25', textSecondary: '#3D6B52', textMuted: '#7A9E8A',
  red: '#DC2626',
}

type Stage = 'steam' | 'analysis' | 'ready' | 'crawling' | 'discovery' | 'outreach' | 'publish'

function Skeleton({ h = 80 }: { h?: number }) {
  return <div className="skeleton" style={{ height: h, marginBottom: '0.75rem' }} />
}

function SectionHeader({ step, title }: { step: number; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '0.875rem', borderBottom: `1px solid ${C.pine200}` }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.pine700, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.78rem', flexShrink: 0 }}>
        {step}
      </div>
      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: C.pine700 }}>{title}</h2>
    </div>
  )
}

function ErrorRow({ msg, onRetry }: { msg: string; onRetry?: () => void }) {
  return (
    <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '0.875rem 1.1rem', color: C.red, fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{msg}</span>
      {onRetry && <button onClick={onRetry} style={{ color: C.red, background: 'none', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6, padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>Retry</button>}
    </div>
  )
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const demoKey = searchParams.get('demo')
  const steamUrl = searchParams.get('url') || ''

  const [stage, setStage] = useState<Stage>('steam')
  const [game, setGame] = useState<GameData | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisReport | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [outreach, setOutreach] = useState<OutreachContent[]>([])
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

  async function handleKeywordAdd(kw: string) {
    try {
      const res = await fetch('/api/translate-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: [kw] }),
      })
      const data = await res.json()
      if (data.chineseKeywords?.[0]) {
        setAnalysis(prev => prev ? { ...prev, chineseKeywords: [...prev.chineseKeywords, data.chineseKeywords[0]] } : prev)
      }
    } catch {
      // silently ignore — stale Chinese keywords are non-critical
    }
  }

  useEffect(() => {
    if (demoKey && MOCK_GAMES[demoKey]) {
      const mock = MOCK_GAMES[demoKey]
      setGame(mock.game)
      setAnalysis(mock.analysis)
      setChannels(mock.channels)
      setStage('ready')
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
      setErrors(p => ({ ...p, steam: (e as Error).message }))
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
      setStage('ready')
    } catch (e) {
      setErrors(p => ({ ...p, analysis: (e as Error).message }))
    }
  }

  async function handleStartDiscovery(platforms: SelectablePlatform[]) {
    if (!analysis || !game) return
    setStage('crawling')
    setErrors({})
    try {
      const res = await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audienceProfile: analysis.audienceProfile, chineseKeywords: analysis.chineseKeywords, platforms, gameData: game }),
      })
      const data: Record<string, KOL[]> = await res.json()

      // Map per-platform KOL arrays → flat Channel[]
      const flat: Channel[] = []
      const platformChannelMap: Record<string, ChannelPlatform> = {
        youtube: 'youtube_creator',
        reddit: 'reddit',
        bilibili: 'bilibili',
        xiaohongshu: 'xiaohongshu',
        gaming_media: 'gaming_media',
      }
      for (const [platform, kols] of Object.entries(data)) {
        for (const kol of kols) {
          flat.push({
            id: kol.channelId,
            platform: (platformChannelMap[platform] ?? 'youtube_creator') as ChannelPlatform,
            name: kol.channelName,
            url: kol.channelUrl,
            followerCount: kol.subscriberCount,
            followerLabel: platform === 'reddit' ? 'members' : 'subscribers',
            recentContent: kol.recentTitles,
            relevanceReason: kol.relevanceReason,
            influenceWeight: kol.relevanceScore,
          })
        }
      }

      // Show "no data" message per platform if empty
      const emptyPlatforms = platforms.filter(p => !data[p] || data[p].length === 0)
      if (emptyPlatforms.length > 0 && flat.length === 0) {
        setErrors(p => ({ ...p, discovery: `No data in database yet for: ${emptyPlatforms.join(', ')}. Run the crawl script first.` }))
      }

      setChannels(flat)
      setStage('discovery')
    } catch (e) {
      setErrors(p => ({ ...p, discovery: (e as Error).message }))
      setStage('ready')
    }
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
      setErrors(p => ({ ...p, outreach: (e as Error).message }))
      setStage('discovery')
    }
  }

  const selectedChannels = channels.filter(c => selectedIds.includes(c.id))
  const showDiscovery = stage === 'discovery' || stage === 'outreach' || stage === 'publish'
  const showOutreach = stage === 'publish' && outreach.length > 0
  const showPlatformSelector = (stage === 'ready' || stage === 'crawling') && analysis !== null
  const showAnalysis = stage !== 'steam' && stage !== 'analysis' && analysis !== null

  return (
    <div style={{ minHeight: '100vh', background: C.bgPage, paddingBottom: '6rem' }}>
      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${C.border}`, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.bgSurface, position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 4px rgba(45,106,79,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: 30, height: 30, background: C.pine700, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>IG</div>
          <span style={{ fontWeight: 800, color: C.pine700, fontSize: '0.9rem', letterSpacing: '0.04em' }}>Indie Game Booster</span>
        </div>
        {game && <div style={{ color: C.textMuted, fontSize: '0.85rem' }}>{game.name}</div>}
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Game card */}
        {stage === 'steam' && <div style={{ marginTop: '2rem' }}><Skeleton h={110} /></div>}
        {game && (
          <div style={{ display: 'flex', gap: '1.25rem', background: C.bgSurface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1.25rem', marginTop: '2rem', marginBottom: '2rem' }}>
            {game.headerImageUrl
              ? <img src={game.headerImageUrl} alt={game.name} style={{ width: 200, height: 94, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
              : <div style={{ width: 200, height: 94, background: C.bgSubtle, borderRadius: 8, flexShrink: 0 }} />
            }
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: C.textPrimary, marginBottom: '0.3rem' }}>{game.name}</div>
              <div style={{ color: C.textMuted, fontSize: '0.83rem', marginBottom: '0.65rem' }}>
                {game.price != null && `$${game.price}`}{game.estimatedOwners && ` · ~${game.estimatedOwners} owners`}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {game.tags.slice(0, 8).map((t, i) => (
                  <span key={i} style={{ background: C.bgSubtle, color: C.textSecondary, borderRadius: 6, padding: '0.18rem 0.5rem', fontSize: '0.73rem', fontWeight: 600, border: `1px solid ${C.border}` }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {errors.steam && <ErrorRow msg={`Steam: ${errors.steam}`} onRetry={fetchSteam} />}

        {/* Section 2: Analysis */}
        <div style={{ background: C.bgSurface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1.5rem', marginBottom: '1.25rem' }}>
          <SectionHeader step={2} title="Game Keywords" />
          {stage === 'analysis' && <><Skeleton h={90} /><Skeleton h={120} /></>}
          {errors.analysis && <ErrorRow msg={`Analysis: ${errors.analysis}`} onRetry={() => game && fetchAnalysis(game)} />}
          {showAnalysis && (
            <>
              <AnalysisEditor analysis={analysis!} onChange={setAnalysis} onKeywordAdd={handleKeywordAdd} />
              {game && <div style={{ marginTop: '1.25rem' }}><SteamTipsPanel game={game} /></div>}
            </>
          )}
        </div>

        {/* Section 3: Platform selector */}
        {showPlatformSelector && (
          <div style={{ background: C.bgSurface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1.5rem', marginBottom: '1.25rem' }}>
            <SectionHeader step={3} title="Select Platforms to Search" />
            {errors.discovery && <ErrorRow msg={`Discovery: ${errors.discovery}`} />}
            <PlatformSelector
              analysis={analysis!}
              onStart={handleStartDiscovery}
              loading={stage === 'crawling'}
            />
          </div>
        )}

        {/* Section 4: Channel discovery */}
        {showDiscovery && (
          <div style={{ background: C.bgSurface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1.5rem', marginBottom: '1.25rem' }}>
            <SectionHeader step={4} title="Channels & Communities" />
            {channels.length === 0 && (
              <><Skeleton h={130} /><Skeleton h={130} /><Skeleton h={130} /></>
            )}
            <ChannelDiscovery
              channels={channels}
              selected={selectedIds}
              onToggle={id => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
              onGenerate={generateOutreach}
              generating={stage === 'outreach'}
            />
          </div>
        )}

        {/* Section 5: Outreach */}
        {showOutreach && (
          <div style={{ background: C.bgSurface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1.5rem', marginBottom: '1.25rem' }}>
            <SectionHeader step={5} title="Generated Outreach Content" />
            <OutreachWorkspace outreach={outreach} channels={selectedChannels} />
          </div>
        )}

        {/* Section 6: Publish */}
        {showOutreach && game && (
          <div style={{ background: C.bgSurface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1.5rem' }}>
            <SectionHeader step={6} title="Publish or Download" />
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
      <div style={{ minHeight: '100vh', background: '#F7FBF9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A9E8A' }}>
        Loading...
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
