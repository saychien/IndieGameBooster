export interface GameData {
  name: string
  description: string
  tags: string[]
  similarGames: string[]
  estimatedOwners?: string
  price?: number
  steamAppId: string
  headerImageUrl?: string
  steamUrl: string
}

export interface AnalysisReport {
  audienceProfile: string
  coreGenreTags: string[]
  youtubeKeywords: string[]
  redditKeywords: string[]
  bilibiliKeywords: string[]
  xiaohongshuKeywords: string[]
  gamingMediaAngles: string[]
  whyTheyWillLoveIt: string
}

export interface ImprovementTip {
  title: string
  suggestion: string
  impact: 'high' | 'medium'
}

export type ChannelPlatform =
  | 'youtube_creator'
  | 'youtube_media'
  | 'reddit'
  | 'bilibili'
  | 'xiaohongshu'
  | 'gaming_media'

export interface Channel {
  id: string
  platform: ChannelPlatform
  name: string
  url: string
  followerCount: number          // subscribers / members / fans
  followerLabel: string          // "subscribers" | "members" | "followers"
  recentContent?: string[]       // recent video/post titles
  description?: string
  relevanceReason: string        // Claude-generated, 1 sentence
  influenceWeight?: number       // Claude relevanceScore 0–100
}

export type SelectablePlatform = 'youtube' | 'reddit' | 'bilibili' | 'xiaohongshu' | 'gaming_media'

export type OutreachType =
  | 'press_kit'         // game media
  | 'creator_email'     // YouTube / Bilibili creator
  | 'reddit_post'       // Reddit community
  | 'xiaohongshu_post'  // Xiaohongshu

export interface OutreachContent {
  channelId: string
  type: OutreachType
  content: string
  attachments?: string[]  // e.g. game keys
}

export type PublishMode = 'hosted' | 'download'
