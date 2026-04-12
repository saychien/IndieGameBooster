import { NextRequest, NextResponse } from 'next/server'
import { parseAppId, fetchGameData } from '@/lib/steam'

export async function POST(req: NextRequest) {
  const { steamUrl } = await req.json()
  if (!steamUrl) return NextResponse.json({ error: 'steamUrl required' }, { status: 400 })

  const appId = parseAppId(steamUrl)
  if (!appId) return NextResponse.json({ error: 'Invalid Steam URL' }, { status: 400 })

  try {
    const game = await fetchGameData(appId)
    return NextResponse.json(game)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch game data'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
