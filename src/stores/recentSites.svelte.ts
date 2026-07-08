import type { RecentSite } from '../types';

const MAX_SITES = 50;

let sites = $state<RecentSite[]>([]);
let clickCounts = $state<Record<string, number>>({});

function loadClickCounts() {
  try {
    const raw = localStorage.getItem('quick-dial-clicks');
    if (raw) clickCounts = JSON.parse(raw);
  } catch { clickCounts = {}; }
}
function saveClickCounts() {
  try { localStorage.setItem('quick-dial-clicks', JSON.stringify(clickCounts)); } catch {}
}
loadClickCounts();

export function initRecentSites(data: RecentSite[]): void {
  sites = (data || []).map(site => ({ ...site }));
}

export function getRecentSites(): Readonly<RecentSite[]> {
  return sites.map(site => ({ ...site }));
}

export function getClickCounts(): Readonly<Record<string, number>> {
  return { ...clickCounts };
}

export function getTotalClicks(): number {
  return Object.values(clickCounts).reduce((a, b) => a + b, 0);
}

export function addRecentSite(url: string, title: string): void {
  clickCounts[url] = (clickCounts[url] || 0) + 1;
  saveClickCounts();
  incrementDailyClick();

  sites = sites.filter(s => s.url !== url);
  sites = [{ url, title, lastVisit: Date.now() }, ...sites];
  if (sites.length > MAX_SITES) sites = sites.slice(0, MAX_SITES);
}

export function clearRecentSites(): void {
  sites = [];
}

export function clearClickCounts(): void {
  clickCounts = {};
  saveClickCounts();
}

export function getDisplaySites(count: number): RecentSite[] {
  return sites.slice(0, count).map(site => ({ ...site }));
}

// 每日点击统计
const DAILY_KEY = 'quick-dial-daily-clicks';

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function incrementDailyClick(): void {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    const daily: Record<string, number> = raw ? JSON.parse(raw) : {};
    const today = getTodayKey();
    daily[today] = (daily[today] || 0) + 1;
    // 只保留最近 14 天
    const keys = Object.keys(daily).sort();
    if (keys.length > 14) {
      for (const k of keys.slice(0, keys.length - 14)) delete daily[k];
    }
    localStorage.setItem(DAILY_KEY, JSON.stringify(daily));
  } catch {}
}

export function getDailyClicks(): Record<string, number> {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function getWeekDates(): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return dates;
}

export function clearDailyClicks(): void {
  try { localStorage.removeItem(DAILY_KEY); } catch {}
}
