import type { CurrencyData } from '../types';

const API_KEY = 'be4385f8-e5a2-49a4-b3ad-c6f23d1f38a1';
const CACHE_KEY = 'qd-currency-cache';
const TARGETS = ['USD', 'EUR', 'JPY', 'GBP', 'HKD', 'KRW', 'AUD', 'CAD'];

let data = $state<CurrencyData | null>(null);
let loading = $state(false);
let baseCurrency = $state('CNY');
let amount = $state(100);
let error = $state('');

// Load cache
try {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) data = JSON.parse(cached);
} catch {}

export function getCurrencyData() { return data; }
export function getCurrencyLoading() { return loading; }
export function getBaseCurrency() { return baseCurrency; }
export function getAmount() { return amount; }
export function getError() { return error; }
export function getTargets() { return [...TARGETS]; }

export function setBaseCurrency(c: string) { baseCurrency = c; }
export function setAmount(a: number) { amount = a; }

export async function fetchRates() {
  loading = true;
  error = '';
  try {
    const res = await fetch(
      `https://api.ruseo.cn/api/currency_rate?key=${API_KEY}&from=${baseCurrency}&to=${TARGETS.join(',')}&amount=${amount}`,
      { signal: AbortSignal.timeout(10000) }
    );
    const result = await res.json();
    // API returns nested: result.data.data
    const inner = result?.data?.data || result?.data;
    if (inner && inner.rates) {
      data = {
        base: inner.base || baseCurrency,
        rates: inner.rates,
        converted: inner.converted || null,
        data_updated: inner.data_updated || '',
        amount: inner.amount || amount,
      };
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
    } else {
      error = '获取汇率失败';
    }
  } catch (e: any) {
    error = e?.name === 'TimeoutError' ? '请求超时' : '网络错误';
  } finally {
    loading = false;
  }
}

export function initCurrency() {
  if (!data) fetchRates();
}
