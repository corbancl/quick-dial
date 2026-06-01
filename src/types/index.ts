// ====== 导航卡片 ======
export interface DialItem {
  id: string;
  title: string;
  url: string;
  icon: string;
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

// ====== 全局设置 ======
export interface AppSettings {
  searchEngine: string;
  clockStyle: ClockStyle;
  showDate: boolean;
  showWeekday: boolean;
  showRecentSites: boolean;
  recentSitesCount: number;
  openInNewTab: boolean;
}

// ====== 最近访问 ======
export interface RecentSite {
  url: string;
  title: string;
  lastVisit: number;
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
  customCss?: string;
}

// ====== 预设默认值 ======
export const DEFAULT_SEARCH_ENGINES: SearchEngine[] = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q={keyword}', icon: '' },
  { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd={keyword}', icon: '' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q={keyword}', icon: '' },
  { id: 'sogou', name: '搜狗', url: 'https://www.sogou.com/web?query={keyword}', icon: '' },
  { id: 'so', name: '360搜索', url: 'https://www.so.com/s?q={keyword}', icon: '' },
  { id: 'zhihu', name: '知乎', url: 'https://www.zhihu.com/search?type=content&q={keyword}', icon: '' },
  { id: 'weibo', name: '微博', url: 'https://s.weibo.com/weibo/{keyword}', icon: '', proOnly: true },
  { id: 'bilibili', name: '哔哩哔哩', url: 'https://search.bilibili.com/all?keyword={keyword}', icon: '', proOnly: true },
  { id: 'github', name: 'GitHub', url: 'https://github.com/search?q={keyword}', icon: '', proOnly: true },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={keyword}', icon: '', proOnly: true },
  { id: 'twitter', name: 'X (Twitter)', url: 'https://twitter.com/search?q={keyword}', icon: '', proOnly: true },
  { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/results?search_query={keyword}', icon: '', proOnly: true },
];

export const DEFAULT_SETTINGS: AppSettings = {
  searchEngine: 'google',
  clockStyle: 'digital',
  showDate: true,
  showWeekday: true,
  showRecentSites: true,
  recentSitesCount: 8,
  openInNewTab: true,
};

export const DEFAULT_THEME: ThemeConfig = {
  mode: 'light',
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

// ====== 订阅 ======
export interface SubscriptionState {
  isPro: boolean;
  customEngines: SearchEngine[];
}