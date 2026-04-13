import { NextRequest, NextResponse } from 'next/server'
import { callClaude, parseJson } from '@/lib/claude'

export async function POST(req: NextRequest) {
  const { keywords }: { keywords: string[] } = await req.json()

  if (!keywords?.length) {
    return NextResponse.json({ chineseKeywords: [] })
  }

  const prompt = `Translate the following English gaming keywords into Chinese search terms suitable for Bilibili and 小红书. For each keyword, provide the most commonly used Chinese equivalent in Chinese gaming communities.

Return ONLY a JSON array of strings, no markdown, no explanation:
["中文1", "中文2", ...]

Keywords: ${keywords.join(', ')}`

  try {
    const raw = await callClaude(prompt, 200)
    const chineseKeywords = parseJson<string[]>(raw)
    return NextResponse.json({ chineseKeywords })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Translation failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
