import type { AppSettings, ClockStyle, ThemeStyle, QuoteType, LayoutMode } from '../types';
import { DEFAULT_SETTINGS, isProTheme } from '../types';
import { getIsPro } from './subscription.svelte';

let settings = $state<AppSettings>({ ...DEFAULT_SETTINGS });

export function initSettings(data: AppSettings | undefined): void {
  settings = { ...DEFAULT_SETTINGS, ...data };
  // 非 Pro 用户回退 Pro 专属主题
  if (isProTheme(settings.themeStyle) && !getIsPro()) {
    settings.themeStyle = 'tech';
  }
  localStorage.setItem('quick-dial-theme-style', settings.themeStyle || 'tech');
}

/**
 * 获取设置快照，防止外部直接修改
 */
export function getSettings(): Readonly<AppSettings> {
  return { ...settings };
}

export function setSearchEngine(id: string): void {
  settings.searchEngine = id;
}

export function setThemeStyle(style: ThemeStyle): void {
  settings.themeStyle = style;
  localStorage.setItem('quick-dial-theme-style', style);
}

export function setClockStyle(style: ClockStyle): void {
  settings.clockStyle = style;
}

export function setShowDate(show: boolean): void {
  settings.showDate = show;
}

export function setShowWeekday(show: boolean): void {
  settings.showWeekday = show;
}

export function setShowRecentSites(show: boolean): void {
  settings.showRecentSites = show;
}

export function setRecentSitesCount(count: number): void {
  settings.recentSitesCount = count;
}

export function setOpenInNewTab(open: boolean): void {
  settings.openInNewTab = open;
}

export function setShowAI(show: boolean): void {
  settings.showAI = show;
}

export function setShowQuote(show: boolean): void {
  settings.showQuote = show;
}

export function setQuoteType(type: QuoteType): void {
  settings.quoteType = type;
}

export function setShowRss(show: boolean): void {
  settings.showRss = show;
}

export function setLayout(mode: LayoutMode): void {
  settings.layout = mode;
}

export function setHideBranding(hide: boolean): void {
  settings.hideBranding = hide;
}

export function setWallpaperAutoSwitch(auto: boolean): void {
  settings.wallpaperAutoSwitch = auto;
}

export function setWallpaperSwitchInterval(interval: 'hourly' | 'daily'): void {
  settings.wallpaperSwitchInterval = interval;
}
