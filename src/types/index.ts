declare const __VERSION__: string;

// ====== 导航卡片 ======
export interface DialItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  bgColor?: string;
  groupId: string;
  sortOrder: number;
  createdAt: number;
}

// ====== 分组 ======
export interface DialGroup {
  id: string;
  name: string;
  sortOrder: number;
  isCollapsed: boolean;
}

// ====== 搜索引擎 ======
export interface SearchEngine {
  id: string;
  name: string;
  url: string;
  icon?: string;
  isCustom?: boolean;  // Pro 用户自定义引擎
  proOnly?: boolean;   // 仅 Pro 可用
}

export const FREE_ENGINE_LIMIT = 6;

// ====== 壁纸配置 ======
export type WallpaperType = 'solid' | 'gradient' | 'image' | 'builtin';

export interface WallpaperConfig {
  type: WallpaperType;
  value: string;
  blur: number;
  brightness: number;
}

// ====== 主题配置 ======
export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  wallpaper: WallpaperConfig;
}

// ====== 时钟样式 ======
export type ClockStyle = 'digital' | 'minimal' | 'classic' | 'flip' | 'neon' | 'binary';

// ====== UI 主题风格 ======
export type ThemeStyle = 'tech' | 'glass' | 'minimal' | 'neu' | 'paper' | 'ocean' | 'cyberpunk' | 'retro';

// 免费主题：tech / minimal / paper / ocean
// Pro 主题：glass / neu / cyberpunk / retro
export const FREE_THEMES: ThemeStyle[] = ['tech', 'minimal', 'paper', 'ocean'];
export const PRO_THEMES: ThemeStyle[] = ['glass', 'neu', 'cyberpunk', 'retro'];

export function isProTheme(style: ThemeStyle): boolean {
  return PRO_THEMES.includes(style);
}

// ====== 布局模式 ======
export type LayoutMode = 'centered' | 'wide' | 'sidebar';

// ====== 全局设置 ======
export interface AppSettings {
  searchEngine: string;
  themeStyle: ThemeStyle;
  clockStyle: ClockStyle;
  showDate: boolean;
  showWeekday: boolean;
  showRecentSites: boolean;
  showQuote: boolean;
  quoteType: QuoteType;
  showAI: boolean;
  showRss: boolean;
  layout: LayoutMode;
  hideBranding: boolean;
  recentSitesCount: number;
  openInNewTab: boolean;
  wallpaperAutoSwitch: boolean;
  wallpaperSwitchInterval: 'hourly' | 'daily';
}

// ====== 最近访问 ======
export interface RecentSite {
  url: string;
  title: string;
  lastVisit: number;
}

// ====== AI 聊天 ======
export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  time: number;
}

export interface AIConfig {
  provider: string;
  apiKey: string;
  model: string;
  systemPrompt?: string;
}

// ====== 根数据 ======
export interface AppData {
  version: number;
  dials: DialItem[];
  groups: DialGroup[];
  searchEngines: SearchEngine[];
  theme: ThemeConfig;
  settings: AppSettings;
  recentSites: RecentSite[];
  chatMessages?: ChatMessage[];
  chatConfig?: AIConfig;
  rssData?: RssData;
  customCss?: string;
  customTitle?: string;
  customFooter?: string;
}

// ====== 预设默认值 ======
export const DEFAULT_SEARCH_ENGINES: SearchEngine[] = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q={keyword}', icon: '' },
  { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd={keyword}', icon: '' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q={keyword}', icon: '' },
  { id: 'sogou', name: '搜狗', url: 'https://www.sogou.com/web?query={keyword}', icon: '' },
  { id: 'so', name: '360搜索', url: 'https://www.so.com/s?q={keyword}', icon: '' },
  { id: 'zhihu', name: '知乎', url: 'https://www.zhihu.com/search?type=content&q={keyword}', icon: '', proOnly: true },
  { id: 'weibo', name: '微博', url: 'https://s.weibo.com/weibo/{keyword}', icon: '', proOnly: true },
  { id: 'bilibili', name: '哔哩哔哩', url: 'https://search.bilibili.com/all?keyword={keyword}', icon: '', proOnly: true },
  { id: 'github', name: 'GitHub', url: 'https://github.com/search?q={keyword}', icon: '', proOnly: true },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={keyword}', icon: '', proOnly: true },
  { id: 'twitter', name: 'X (Twitter)', url: 'https://twitter.com/search?q={keyword}', icon: '', proOnly: true },
  { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/results?search_query={keyword}', icon: '', proOnly: true },
  { id: 'taobao', name: '淘宝', url: 'https://s.taobao.com/search?q={keyword}&pid=mm_14822724_24216217_80956897', icon: '' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  searchEngine: 'google',
  themeStyle: 'tech',
  clockStyle: 'digital',
  showDate: true,
  showWeekday: true,
  showRecentSites: true,
  showQuote: true,
  quoteType: 'hitokoto',
  showAI: true,
  showRss: false,
  layout: 'centered',
  hideBranding: false,
  recentSitesCount: 8,
  openInNewTab: true,
  wallpaperAutoSwitch: false,
  wallpaperSwitchInterval: 'daily',
};

export const DEFAULT_THEME: ThemeConfig = {
  mode: 'dark',
  primaryColor: '#3b82f6',
  wallpaper: { type: 'solid', value: '#f8fafc', blur: 0, brightness: 100 },
};

export const DEFAULT_WALLPAPERS: { id: string; name: string; value: string }[] = [
  { id: 'light-blue', name: '淡蓝', value: '#f0f4ff' },
  { id: 'light-green', name: '淡绿', value: '#f0fdf4' },
  { id: 'light-purple', name: '淡紫', value: '#faf5ff' },
  { id: 'light-gray', name: '淡灰', value: '#f8fafc' },
  { id: 'dark-blue', name: '深蓝', value: '#0f172a' },
  { id: 'dark-gray', name: '深灰', value: '#1e293b' },
  { id: 'dark-slate', name: '深岩', value: '#0f0f0f' },
  { id: 'gradient-sunset', name: '日落渐变', value: 'linear-gradient(135deg, #f97316, #ec4899)' },
  { id: 'gradient-ocean', name: '海洋渐变', value: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  { id: 'gradient-forest', name: '森林渐变', value: 'linear-gradient(135deg, #22c55e, #06b6d4)' },
  { id: 'gradient-midnight', name: '午夜渐变', value: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { id: 'gradient-aurora', name: '极光渐变', value: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
];

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ====== 每日一言 ======
export type QuoteType = 'hitokoto' | 'qinggan' | 'love' | 'saylove' | 'dog' | 'wanan' | 'zaoan' | 'saohua' | 'poison_soup';

export interface QuoteData {
  content: string;
  source: string;
}

// ====== RSS 订阅 ======
export interface RssFeed {
  url: string;
  title: string;
  icon?: string;
}

export interface RssArticle {
  feedUrl: string;
  title: string;
  link: string;
  pubDate: string;
  snippet: string;
  read: boolean;
}

export interface RssData {
  feeds: RssFeed[];
  articles: RssArticle[];
  lastFetch: number;
}

export const RSS_FEED_LIMIT = 5;

// ====== 订阅 ======
export interface SubscriptionState {
  isPro: boolean;
  customEngines: SearchEngine[];
}