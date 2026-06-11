import type { AppSettings, ClockStyle } from '../types';
import { DEFAULT_SETTINGS } from '../types';

let settings = $state<AppSettings>({ ...DEFAULT_SETTINGS });

export function initSettings(data: AppSettings | undefined): void {
  settings = { ...DEFAULT_SETTINGS, ...data };
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

export function setRecentSitesCount(count: number): void {
  settings.recentSitesCount = count;
}

export function setOpenInNewTab(open: boolean): void {
  settings.openInNewTab = open;
}

export function setShowAI(show: boolean): void {
  settings.showAI = show;
}

export function setHideBranding(hide: boolean): void {
  settings.hideBranding = hide;
}
