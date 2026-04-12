import { NextRequest, NextResponse } from 'next/server'
import { OutreachContent, Channel } from '@/lib/types'

// Stub — future: integrate with platform APIs for hosted publishing
export async function POST(req: NextRequest) {
  const { outreach, channels }: { outreach: OutreachContent[]; channels: Channel[] } = await req.json()

  // Simulate async publish with a delay
  await new Promise(resolve => setTimeout(resolve, 800))

  const results = outreach.map(item => {
    const ch = channels.find(c => c.id === item.channelId)
    return {
      channelId: item.channelId,
      channelName: ch?.name || item.channelId,
      platform: ch?.platform,
      status: 'queued',
      message: 'Queued for review — hosted publishing coming soon.',
    }
  })

  return NextResponse.json({ results })
}
