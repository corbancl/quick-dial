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
