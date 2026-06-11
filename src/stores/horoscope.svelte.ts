import type { ZodiacSign, HoroscopeTime, HoroscopeData } from '../types';

const API_KEY = 'be4385f8-e5a2-49a4-b3ad-c6f23d1f38a1';
const API_URL = 'https://api.ruseo.cn/api/horoscope';

interface CacheEntry {
  data: HoroscopeData;
  fetchedAt: number;
}

// 30 分钟缓存
const CACHE_TTL = 30 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

let loading = $state(false);
let error = $state<string | null>(null);
let currentData = $state<HoroscopeData | null>(null);

export function getHoroscopeLoading() { return loading; }
export function getHoroscopeError() { return error; }
export function getHoroscopeData() { return currentData; }

function cacheKey(sign: ZodiacSign, time: HoroscopeTime): string {
  return `${sign}:${time}`;
}

export async function fetchHoroscope(sign: ZodiacSign, time: HoroscopeTime): Promise<HoroscopeData | null> {
  const key = cacheKey(sign, time);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    currentData = cached.data;
    error = null;
    return cached.data;
  }

  loading = true;
  error = null;

  try {
    const url = `${API_URL}?key=${API_KEY}&type=${sign}&time=${time}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.code !== 0) throw new Error(json.msg || 'API error');

    const data = json.data as HoroscopeData;
    cache.set(key, { data, fetchedAt: Date.now() });
    currentData = data;
    return data;
  } catch (e: any) {
    error = e.message || 'Request failed';
    // 过期缓存兜底
    if (cached) {
      currentData = cached.data;
      return cached.data;
    }
    return null;
  } finally {
    loading = false;
  }
}

export function clearHoroscopeCache() {
  cache.clear();
}
