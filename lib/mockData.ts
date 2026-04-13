import { GameData, AnalysisReport, ImprovementTip, Channel, SelectablePlatform } from './types'

// ─── Placeholder discovery results (used until real backend is wired up) ──────

const YOUTUBE_CHANNELS: Channel[] = [
  {
    id: 'yt_splattercat',
    platform: 'youtube_creator',
    name: 'SplatterCatGaming',
    url: 'https://youtube.com/@SplatterCatGaming',
    followerCount: 519000,
    followerLabel: 'subscribers',
    recentContent: [
      'This Indie Roguelike Surprised Me — Full Playthrough',
      'Top 10 Most Played Indie Games This Month',
      'When a $5 Game Has Better World Building Than AAA',
    ],
    relevanceReason: 'Specialises in discovering hidden indie gems with a proven roguelike-focused audience.',
    influenceWeight: 92,
  },
  {
    id: 'yt_wanderbots',
    platform: 'youtube_creator',
    name: 'Wanderbots',
    url: 'https://youtube.com/@Wanderbots',
    followerCount: 312000,
    followerLabel: 'subscribers',
    recentContent: [
      'Top 10 Metroidvanias You Missed in 2024',
      'Dead Cells: Return to Castlevania DLC — Full Run',
      'Hollow Knight Silksong: Everything We Know',
    ],
    relevanceReason: 'Covers metroidvania and action-platformer genres; audience actively seeks new releases.',
    influenceWeight: 88,
  },
  {
    id: 'yt_gmtk',
    platform: 'youtube_creator',
    name: "Game Maker's Toolkit",
    url: 'https://youtube.com/@GMTK',
    followerCount: 1140000,
    followerLabel: 'subscribers',
    recentContent: [
      'What Makes a Good Roguelike?',
      'How Indie Devs Design Tight Controls',
      'The Rise of the Cozy Game',
    ],
    relevanceReason: 'Highly engaged audience of indie enthusiasts who often convert to buyers after deep-dive coverage.',
    influenceWeight: 79,
  },
  {
    id: 'yt_indiemark',
    platform: 'youtube_creator',
    name: 'IndieMark',
    url: 'https://youtube.com/@IndieMark',
    followerCount: 87000,
    followerLabel: 'subscribers',
    recentContent: [
      '5 Indie Games That Deserve More Players',
      'Steam Next Fest Hidden Gems — My Picks',
      'Solo Dev Makes a Game in 30 Days',
    ],
    relevanceReason: 'Indie-only channel with high wishlist-to-purchase conversion rate among its community.',
    influenceWeight: 74,
  },
]

const BILIBILI_CHANNELS: Channel[] = [
  {
    id: 'bili_youxizhentan',
    platform: 'bilibili',
    name: '游戏侦探',
    url: 'https://space.bilibili.com/game_detective',
    followerCount: 284000,
    followerLabel: '关注者',
    recentContent: [
      '【独立游戏推荐】这款游戏玩了停不下来',
      '2024年最值得玩的10款独立游戏',
      '黑神话之后，独立游戏市场有什么变化？',
    ],
    relevanceReason: '专注挖掘高质量独立游戏，受众购买转化率高。',
    influenceWeight: 90,
  },
  {
    id: 'bili_indie_lab',
    platform: 'bilibili',
    name: '独立游戏研究室',
    url: 'https://space.bilibili.com/indie_lab',
    followerCount: 96000,
    followerLabel: '关注者',
    recentContent: [
      '小团队如何做出爆款独立游戏？',
      'Steam国区热销独立游戏盘点',
      '这款国产独立游戏登上了Steam全球热销榜',
    ],
    relevanceReason: '深度报道国内外独立游戏开发与发行，受众为核心独立游戏玩家。',
    influenceWeight: 85,
  },
  {
    id: 'bili_cozygame',
    platform: 'bilibili',
    name: '治愈游戏频道',
    url: 'https://space.bilibili.com/cozy_games_cn',
    followerCount: 152000,
    followerLabel: '关注者',
    recentContent: [
      '解压必备！10款治愈系独立游戏推荐',
      '星露谷5年后，这些农场游戏值得一玩',
      '国产治愈游戏推荐：比想象中好玩',
    ],
    relevanceReason: '治愈系与农场模拟类游戏的核心受众聚集地。',
    influenceWeight: 81,
  },
]

const REDDIT_CHANNELS: Channel[] = [
  {
    id: 'reddit_indiegaming',
    platform: 'reddit',
    name: 'r/indiegaming',
    url: 'https://reddit.com/r/indiegaming',
    followerCount: 2100000,
    followerLabel: 'members',
    recentContent: [
      'Just released my first game after 3 years of solo dev — AMA',
      'Hidden gems from Steam Next Fest you might have missed',
      'What indie game has given you the most hours this year?',
    ],
    relevanceReason: 'Largest indie game community; high visibility but broad audience — good for launch announcements.',
    influenceWeight: 78,
  },
  {
    id: 'reddit_patientgamers',
    platform: 'reddit',
    name: 'r/patientgamers',
    url: 'https://reddit.com/r/patientgamers',
    followerCount: 785000,
    followerLabel: 'members',
    recentContent: [
      'Finally played Hollow Knight — here\'s my honest take',
      'Backlog cleared: 50 indie games ranked after 2 years',
      'Games that aged perfectly — community list 2024',
    ],
    relevanceReason: 'Highly engaged buyers who research before purchasing; a strong post here drives long-tail sales.',
    influenceWeight: 85,
  },
  {
    id: 'reddit_metroidvania',
    platform: 'reddit',
    name: 'r/metroidvania',
    url: 'https://reddit.com/r/metroidvania',
    followerCount: 185000,
    followerLabel: 'members',
    recentContent: [
      'Genre newcomer recommendations for 2024',
      'What\'s the tightest movement system in the genre?',
      'Monthly discovery thread — share your recent finds',
    ],
    relevanceReason: 'Genre-specific community; very high purchase intent for new metroidvania releases.',
    influenceWeight: 93,
  },
  {
    id: 'reddit_gamedev',
    platform: 'reddit',
    name: 'r/gamedev',
    url: 'https://reddit.com/r/gamedev',
    followerCount: 1240000,
    followerLabel: 'members',
    recentContent: [
      'Postmortem: how I sold 10K copies as a solo dev',
      'What marketing actually worked for your indie game?',
      'Show off your game — weekly showcase thread',
    ],
    relevanceReason: 'Developer community that also plays and buys indie games; strong word-of-mouth amplification.',
    influenceWeight: 70,
  },
]

const XIAOHONGSHU_CHANNELS: Channel[] = [
  {
    id: 'xhs_style_casual',
    platform: 'xiaohongshu',
    name: 'Player Sharing Template',
    url: 'https://xiaohongshu.com',
    followerCount: 0,
    followerLabel: '',
    recentContent: [
      '以普通玩家身份分享游戏发现',
      '口语化、真实感强，像朋友推荐',
      '适合触达泛游戏兴趣用户',
    ],
    relevanceReason: 'Casual player voice — feels like an organic recommendation, not a marketing post.',
    influenceWeight: 0,
  },
  {
    id: 'xhs_style_dev',
    platform: 'xiaohongshu',
    name: 'Developer sharing Template',
    url: 'https://xiaohongshu.com',
    followerCount: 0,
    followerLabel: '',
    recentContent: [
      '以开发者身份分享创作故事',
      '真诚有温度，展现独立开发者精神',
      '适合建立品牌信任感',
    ],
    relevanceReason: 'Developer voice — authentic creator story that resonates with indie game fans.',
    influenceWeight: 0,
  },
]

export const MOCK_DISCOVERY: Record<SelectablePlatform, Channel[]> = {
  youtube: YOUTUBE_CHANNELS,
  bilibili: BILIBILI_CHANNELS,
  reddit: REDDIT_CHANNELS,
  xiaohongshu: XIAOHONGSHU_CHANNELS,
}

// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_GAMES: Record<string, { game: GameData; analysis: AnalysisReport; tips: ImprovementTip[]; channels: Channel[] }> = {
  '1': {
    game: {
      name: 'Hollow Knight',
      description: 'A challenging 2D action-adventure through a vast ruined kingdom of insects and heroes. Explore twisting caverns, ancient cities and deadly wastes; battle tainted creatures and befriend bizarre bugs; and uncover ancient history at the kingdom\'s heart.',
      tags: ['Metroidvania', 'Platformer', 'Action', 'Indie', '2D', 'Difficult', 'Dark Fantasy', 'Atmospheric'],
      similarGames: ['Ori and the Blind Forest', 'Dead Cells', 'Celeste', 'Salt and Sanctuary'],
      estimatedOwners: '5,000,000 .. 10,000,000',
      price: 14.99,
      steamAppId: '367520',
      headerImageUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg',
      steamUrl: 'https://store.steampowered.com/app/367520',
    },
    analysis: {
      audienceProfile: 'Core gamers aged 18–34 who thrive on punishing-but-fair challenges and love getting lost in hand-crafted, atmospheric worlds. They\'ve played Dark Souls and want that same feeling in a 2D format. They share speedruns, fan art, and hidden-lore discussions on Reddit and Discord.',
      keywords: ['metroidvania', 'hollow knight', 'soulslike 2d', 'indie platformer', 'dark fantasy', 'atmospheric platformer'],
      chineseKeywords: ['银河恶魔城', '空洞骑士', '类魂2D游戏', '独立平台游戏', '暗黑奇幻', '大气平台游戏'],
      whyTheyWillLoveIt: 'The same dopamine hit as defeating a Soulsborne boss, in an artistically stunning underground world that rewards curiosity.',
    },
    tips: [
      { title: 'Lead With Difficulty', suggestion: 'Add "For fans of Dark Souls" prominently in the first sentence of your description to attract the target audience immediately.', impact: 'high' },
      { title: 'Showcase the Art in Screenshots', suggestion: 'Replace 3 of your current screenshots with close-up boss fight moments that highlight the hand-drawn animation quality.', impact: 'high' },
      { title: 'Add "Metroidvania" as Primary Tag', suggestion: '"Metroidvania" is searched 4× more than "Platformer" by your target buyers — ensure it is your first tag.', impact: 'medium' },
    ],
    channels: [
      {
        id: 'UCls_vBtHOcFRQMk-pJaQeGA',
        platform: 'youtube_creator',
        name: 'Wanderbots',
        url: 'https://youtube.com/channel/UCls_vBtHOcFRQMk-pJaQeGA',
        followerCount: 312000,
        followerLabel: 'subscribers',
        recentContent: ['Hollow Knight: Silksong NEW Footage Reaction', 'Top 10 Metroidvanias 2024', 'Dead Cells Ascension DLC Review'],
        relevanceReason: 'Specializes in metroidvania and indie platformers; audience overlaps exactly with Hollow Knight fans.',
      },
      {
        id: 'reddit_metroidvania',
        platform: 'reddit',
        name: 'r/metroidvania',
        url: 'https://reddit.com/r/metroidvania',
        followerCount: 185000,
        followerLabel: 'members',
        relevanceReason: 'Dedicated community that actively seeks and reviews new metroidvania releases.',
      },
      {
        id: 'media_rps',
        platform: 'gaming_media',
        name: 'Rock Paper Shotgun',
        url: 'https://www.rockpapershotgun.com',
        followerCount: 1500000,
        followerLabel: 'monthly readers',
        relevanceReason: 'Consistently covers indie games of this type with long-form reviews that drive Steam sales.',
      },
    ],
  },
  '2': {
    game: {
      name: 'Stardew Valley',
      description: 'You\'ve inherited your grandfather\'s old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to begin your new life. Can you learn to live off the land and turn these overgrown fields into a thriving home?',
      tags: ['Farming Sim', 'RPG', 'Pixel Graphics', 'Relaxing', 'Singleplayer', 'Multiplayer', 'Cute', 'Casual'],
      similarGames: ['My Time At Portia', 'Slime Rancher', 'Spiritfarer', 'Graveyard Keeper'],
      estimatedOwners: '20,000,000 .. 50,000,000',
      price: 14.99,
      steamAppId: '413150',
      headerImageUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg',
      steamUrl: 'https://store.steampowered.com/app/413150',
    },
    analysis: {
      audienceProfile: 'Casual and mid-core players aged 16–40, leaning female, who want a relaxing escape from daily stress. They watch cozy gaming streams on Twitch, follow cottagecore aesthetics on TikTok and Xiaohongshu, and share farm layout screenshots in Discord servers.',
      keywords: ['cozy game', 'farming sim', 'stardew valley', 'relaxing game', 'life simulation', 'pixel art rpg'],
      chineseKeywords: ['治愈系游戏', '农场模拟', '星露谷物语', '放松游戏', '生活模拟', '像素RPG'],
      whyTheyWillLoveIt: 'A sun-drenched digital escape where every day ends with something to look forward to — no pressure, just peace.',
    },
    tips: [
      { title: 'Highlight Multiplayer in Header', suggestion: 'Your header image shows solo gameplay; use a co-op farm scene since multiplayer drives 30%+ of discovery for life sims.', impact: 'high' },
      { title: 'Target "Cozy Games" Tag', suggestion: 'Add "Cozy" as a tag — it\'s the fastest growing discovery keyword in the life sim category since 2022.', impact: 'high' },
      { title: 'Seasonal Pricing Events', suggestion: 'With 50M+ owners the game is mature; flash discounts during Steam events still spike wishlist conversions by 15%.', impact: 'medium' },
    ],
    channels: [
      {
        id: 'UC5c_HB7bFwFkHIizmNEq7Ew',
        platform: 'youtube_creator',
        name: 'GamingWithJen',
        url: 'https://youtube.com/channel/UC5c_HB7bFwFkHIizmNEq7Ew',
        followerCount: 220000,
        followerLabel: 'subscribers',
        recentContent: ['New Cozy Game Recommendations 2024', 'Stardew Valley 1.6 Farm Tour', '10 Farming Games Better Than Stardew'],
        relevanceReason: 'Cozy-gaming focused creator whose audience actively seeks new farming and life sim games.',
      },
      {
        id: 'reddit_cozygamers',
        platform: 'reddit',
        name: 'r/cozygamers',
        url: 'https://reddit.com/r/cozygamers',
        followerCount: 320000,
        followerLabel: 'members',
        relevanceReason: 'Community purpose-built for discovering new cozy and farming games.',
      },
    ],
  },
}
