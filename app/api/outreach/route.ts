import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/claude'
import { Channel, GameData, AnalysisReport, OutreachContent, OutreachType } from '@/lib/types'

// ─── Xiaohongshu variant prompts ──────────────────────────────

function xhsPromptCasual(game: GameData, analysis: AnalysisReport): string {
  return `你是一个热爱独立游戏的普通玩家，刚发现了一款很好玩的游戏，想在小红书上分享给朋友。

写一篇小红书帖子，要求：
- 语气随意真实，像朋友之间的分享，而不是广告
- 使用小红书的语言风格（口语化，emoji适度）
- 用2-3句话描述你玩这款游戏的真实感受和体验
- 结尾自然带出Steam链接，让朋友也能找到
- 200字以内
- 附上3-5个相关话题标签（放在正文结尾）

游戏名称：${game.name}
游戏介绍：${game.description}
情感卖点：${analysis.whyTheyWillLoveIt}
Steam链接：${game.steamUrl}

只输出帖子正文，不要标题。`
}

function xhsPromptDev(game: GameData, analysis: AnalysisReport): string {
  return `你是这款独立游戏的开发者，想在小红书上向玩家介绍你自己做的游戏。

写一篇小红书帖子，要求：
- 以开发者身份真诚介绍游戏，可以分享一句创作初衷或幕后故事（1句）
- 使用小红书的语言风格（口语化，emoji适度）
- 用2-3句话描述游戏的核心体验和情感价值
- 结尾邀请玩家去Steam关注或添加愿望单
- 200字以内
- 附上3-5个相关话题标签（放在正文结尾）

游戏名称：${game.name}
游戏介绍：${game.description}
目标玩家画像：${analysis.audienceProfile}
情感卖点：${analysis.whyTheyWillLoveIt}
Steam链接：${game.steamUrl}

只输出帖子正文，不要标题。`
}

// ─────────────────────────────────────────────────────────────

function buildPrompt(channel: Channel, game: GameData, analysis: AnalysisReport): { type: OutreachType; prompt: string } {
  switch (channel.platform) {
    case 'gaming_media':
    case 'youtube_media':
      return {
        type: 'press_kit',
        prompt: `You are an indie game developer writing a press kit submission to a gaming media outlet.

Write a compelling game introduction that includes:
1. A punchy opening hook (1 sentence)
2. Core game description (2-3 sentences)
3. Key selling points as a short bulleted list (3 bullets)
4. A brief developer story (2 sentences, authentic indie dev voice)
5. Closing with Steam link and offer of a review build

Rules:
- Total length: under 250 words
- Tone: professional but genuine, not corporate PR
- Audience for ${channel.name}: ${analysis.audienceProfile}

Game: ${game.name}
Steam link: ${game.steamUrl}
Description: ${game.description}
Why players love it: ${analysis.whyTheyWillLoveIt}

Output only the press kit body.`,
      }

    case 'youtube_creator':
    case 'bilibili':
      return {
        type: 'creator_email',
        prompt: `You are an indie game developer writing a collaboration invitation to a content creator.

Rules:
- Under 180 words
- ${channel.recentContent?.length ? `First sentence must naturally reference one of their recent videos: ${channel.recentContent.join(' | ')}` : 'Open with something specific about their content style'}
- Platform: ${channel.platform === 'bilibili' ? 'Bilibili (write in Chinese)' : 'YouTube (write in English)'}
- Tone: genuine indie dev, NOT a marketing agency template
- Never use "I hope this email finds you well"
- Offer 3 free game keys for them and their team
- End with: game name, Steam link

Game: ${game.name}
Steam link: ${game.steamUrl}
Creator: ${channel.name} (${channel.followerCount.toLocaleString()} ${channel.followerLabel})
Why their audience will love it: ${analysis.whyTheyWillLoveIt}

Output only the email body.`,
      }

    case 'reddit':
      return {
        type: 'reddit_post',
        prompt: `You are an indie game developer posting in ${channel.name}.

Write a Reddit post that:
- Feels authentic, written by a real dev, not promotional
- Opens with something relatable to that community (not "Hey r/...")
- Describes the game in 2-3 sentences using this community's language
- Ends with a soft CTA (wishlisting or trying a free demo)
- Under 200 words
- Write in English

Game: ${game.name}
Description: ${game.description}
Audience profile: ${analysis.audienceProfile}
Steam link: ${game.steamUrl}

Output the post body only, no title.`,
      }

    case 'xiaohongshu':
      // Handled separately in the route — two variants generated in parallel
      return { type: 'xiaohongshu_post', prompt: '' }

    default:
      return {
        type: 'creator_email' as OutreachType,
        prompt: `Write a brief collaboration invitation for ${channel.name} about the game ${game.name}. Steam link: ${game.steamUrl}. Keep it under 150 words.`,
      }
  }
}

export async function POST(req: NextRequest) {
  const { channels, game, analysis }: { channels: Channel[]; game: GameData; analysis: AnalysisReport } = await req.json()

  try {
    const results: OutreachContent[] = await Promise.all(
      channels.map(async (channel): Promise<OutreachContent> => {
        if (channel.platform === 'xiaohongshu') {
          const prompt = channel.id.includes('dev')
            ? xhsPromptDev(game, analysis)
            : xhsPromptCasual(game, analysis)
          const content = await callClaude(prompt, 500)
          return { channelId: channel.id, type: 'xiaohongshu_post', content }
        }
        const { type, prompt } = buildPrompt(channel, game, analysis)
        const content = await callClaude(prompt, 500)
        return { channelId: channel.id, type, content }
      })
    )

    return NextResponse.json({ outreach: results })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Outreach generation failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
