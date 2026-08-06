import type { RecentSite } from '../types';

const MAX_SITES = 50;

let sites = $state<RecentSite[]>([]);
let clickCounts = $state<Record<string, number>>({});
let categoryClicks = $state<Record<string, number>>({});
let hourlyClicks = $state<Record<number, number>>({});

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

// 分类（分组）点击统计
const CAT_KEY = 'quick-dial-category-clicks';
function loadCategoryClicks() {
  try {
    const raw = localStorage.getItem(CAT_KEY);
    if (raw) categoryClicks = JSON.parse(raw);
  } catch { categoryClicks = {}; }
}
function saveCategoryClicks() {
  try { localStorage.setItem(CAT_KEY, JSON.stringify(categoryClicks)); } catch {}
}
loadCategoryClicks();

// 时段（24 小时）点击分布
const HOUR_KEY = 'quick-dial-hourly-clicks';
function loadHourlyClicks() {
  try {
    const raw = localStorage.getItem(HOUR_KEY);
    if (raw) hourlyClicks = JSON.parse(raw);
  } catch { hourlyClicks = {}; }
}
function saveHourlyClicks() {
  try { localStorage.setItem(HOUR_KEY, JSON.stringify(hourlyClicks)); } catch {}
}
loadHourlyClicks();

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

export function addRecentSite(url: string, title: string, group?: string): void {
  clickCounts[url] = (clickCounts[url] || 0) + 1;
  saveClickCounts();

  if (group) {
    categoryClicks[group] = (categoryClicks[group] || 0) + 1;
    saveCategoryClicks();
  }

  const h = new Date().getHours();
  hourlyClicks[h] = (hourlyClicks[h] || 0) + 1;
  saveHourlyClicks();

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
  categoryClicks = {};
  saveCategoryClicks();
  hourlyClicks = {};
  saveHourlyClicks();
  clearDailyClicks();
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
    // 只保留最近 30 天
    const keys = Object.keys(daily).sort();
    if (keys.length > 30) {
      for (const k of keys.slice(0, keys.length - 30)) delete daily[k];
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

export function getCategoryClicks(): Readonly<Record<string, number>> {
  return { ...categoryClicks };
}

export function getHourlyClicks(): Readonly<Record<number, number>> {
  return { ...hourlyClicks };
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
