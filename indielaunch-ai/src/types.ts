export type Channel = 'YouTube' | 'Twitch' | 'Reddit' | 'Bilibili' | 'RedNote';

export interface GameInfo {
  title: string;
  description: string;
  tags: string[];
  keywords: string[];
}

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  channel: Channel;
  influenceScore: number;
  description: string;
  recentContent: string;
}

export interface MarketingSolution {
  type: 'EarlyAccess' | 'FullRelease';
  strategy: string;
  focus: string;
}
