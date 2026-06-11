import type { AppSettings, ClockStyle, ThemeStyle, NotesDisplayMode, TodoDisplayMode, ZodiacSign, QuoteType } from '../types';
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

export function setShowTodo(show: boolean): void {
  settings.showTodo = show;
}

export function setShowNotes(show: boolean): void {
  settings.showNotes = show;
}

export function setNotesDisplayMode(mode: NotesDisplayMode): void {
  settings.notesDisplayMode = mode;
}

export function setTodoDisplayMode(mode: TodoDisplayMode): void {
  settings.todoDisplayMode = mode;
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

export function setShowHoroscope(show: boolean): void {
  settings.showHoroscope = show;
}

export function setZodiacSign(sign: ZodiacSign): void {
  settings.zodiacSign = sign;
}

export function setShowQuote(show: boolean): void {
  settings.showQuote = show;
}

export function setQuoteType(type: QuoteType): void {
  settings.quoteType = type;
}

export function setShowPomodoro(show: boolean): void {
  settings.showPomodoro = show;
}

export function setShowCurrency(show: boolean): void {
  settings.showCurrency = show;
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
