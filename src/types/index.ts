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

// ====== 星座运势 ======
export type ZodiacSign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';
export type HoroscopeTime = 'today' | 'week' | 'month' | 'year';

export const ZODIAC_SIGNS: { id: ZodiacSign; emoji: string; zh: string; en: string; date: string }[] = [
  { id: 'aries',       emoji: '♈', zh: '白羊座', en: 'Aries',       date: '3.21-4.19' },
  { id: 'taurus',      emoji: '♉', zh: '金牛座', en: 'Taurus',      date: '4.20-5.20' },
  { id: 'gemini',      emoji: '♊', zh: '双子座', en: 'Gemini',      date: '5.21-6.21' },
  { id: 'cancer',      emoji: '♋', zh: '巨蟹座', en: 'Cancer',      date: '6.22-7.22' },
  { id: 'leo',         emoji: '♌', zh: '狮子座', en: 'Leo',         date: '7.23-8.22' },
  { id: 'virgo',       emoji: '♍', zh: '处女座', en: 'Virgo',       date: '8.23-9.22' },
  { id: 'libra',       emoji: '♎', zh: '天秤座', en: 'Libra',       date: '9.23-10.23' },
  { id: 'scorpio',     emoji: '♏', zh: '天蝎座', en: 'Scorpio',     date: '10.24-11.22' },
  { id: 'sagittarius', emoji: '♐', zh: '射手座', en: 'Sagittarius', date: '11.23-12.21' },
  { id: 'capricorn',   emoji: '♑', zh: '摩羯座', en: 'Capricorn',   date: '12.22-1.19' },
  { id: 'aquarius',    emoji: '♒', zh: '水瓶座', en: 'Aquarius',    date: '1.20-2.18' },
  { id: 'pisces',      emoji: '♓', zh: '双鱼座', en: 'Pisces',      date: '2.19-3.20' },
];

export interface HoroscopeData {
  name: string;
  title: string;
  type: string;
  time: string;
  shortcomment: string;
  fortune: { all: number; health: number; love: number; money: number; work: number };
  fortunetext: { all: string; health: string; love: string; money: string; work: string };
  index: { all: string; health: string; love: string; money: string; work: string };
  luckycolor: string;
  luckyconstellation: string;
  luckynumber: string;
  todo: { yi: string; ji: string };
}

// ====== 全局设置 ======
export interface AppSettings {
  searchEngine: string;
  themeStyle: ThemeStyle;
  clockStyle: ClockStyle;
  showDate: boolean;
  showWeekday: boolean;
  showRecentSites: boolean;
  showTodo: boolean;
  showNotes: boolean;
  notesDisplayMode: NotesDisplayMode;
  todoDisplayMode: TodoDisplayMode;
  showHoroscope: boolean;
  zodiacSign: ZodiacSign;
  showQuote: boolean;
  quoteType: QuoteType;
  showPomodoro: boolean;
  showCurrency: boolean;
  showAI: boolean;
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

// ====== 待办事项 ======
export type TodoStatus = 'todo' | 'in_progress' | 'done';
export type TodoPriority = 'low' | 'normal' | 'high';
export type TodoDisplayMode = 'list' | 'kanban';

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;          // 向后兼容，由 status === 'done' 派生
  status: TodoStatus;     // 'todo' | 'in_progress' | 'done'
  priority: TodoPriority; // 'low' | 'normal' | 'high'
  dueDate: number | null; // 截止时间戳，null = 无截止
  createdAt: number;
}

// ====== 便签/笔记 ======
export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple';
export type NoteStatus = 'normal' | 'important' | 'done';
export type NotesDisplayMode = 'colorful' | 'structured' | 'list';

export const NOTE_COLORS: NoteColor[] = ['yellow', 'pink', 'blue', 'green', 'purple'];
export const NOTE_COLOR_MAP: Record<NoteColor, { bg: string; border: string; text: string }> = {
  yellow: { bg: '#fff9c4', border: '#f9e076', text: '#5d4e37' },
  pink:   { bg: '#fce4ec', border: '#f8bbd0', text: '#5d3a4a' },
  blue:   { bg: '#e3f2fd', border: '#90caf9', text: '#2a4d69' },
  green:  { bg: '#e8f5e9', border: '#a5d6a7', text: '#2e4a2e' },
  purple: { bg: '#f3e5f5', border: '#ce93d8', text: '#4a2d5a' },
};

export const NOTE_COLOR_CYCLE: NoteColor[] = ['yellow', 'pink', 'blue', 'green', 'purple'];

export interface NoteItem {
  id: string;
  text: string;
  color: NoteColor;
  status: NoteStatus;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
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
  todos?: TodoItem[];
  notes?: NoteItem[];
  chatMessages?: ChatMessage[];
  chatConfig?: AIConfig;
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
  showTodo: true,
  showNotes: true,
  notesDisplayMode: 'structured',
  todoDisplayMode: 'list',
  showHoroscope: true,
  zodiacSign: 'aries',
  showQuote: true,
  quoteType: 'hitokoto',
  showPomodoro: true,
  showCurrency: true,
  showAI: true,
  hideBranding: false,
  recentSitesCount: 8,
  openInNewTab: true,
  wallpaperAutoSwitch: false,
  wallpaperSwitchInterval: 'daily',
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

// ====== 每日一言 ======
export type QuoteType = 'hitokoto' | 'qinggan' | 'love' | 'saylove' | 'dog' | 'wanan' | 'zaoan' | 'saohua' | 'poison_soup';

export interface QuoteData {
  content: string;
  source: string;
}

// ====== 汇率换算 ======
export interface CurrencyData {
  base: string;
  rates: Record<string, number>;
  converted: Record<string, number> | null;
  data_updated: string;
  amount: number;
}

// ====== 番茄钟 ======
export type PomodoroPhase = 'work' | 'break';
export interface PomodoroState {
  phase: PomodoroPhase;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isRunning: boolean;
}

// ====== 订阅 ======
export interface SubscriptionState {
  isPro: boolean;
  customEngines: SearchEngine[];
}