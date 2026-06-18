import type { QuoteData, QuoteType } from '../types';
import { getSettings } from './settings.svelte';

const API_KEY = 'be4385f8-e5a2-49a4-b3ad-c6f23d1f38a1';

let content = $state('');
let source = $state('');
let loading = $state(false);
let error = $state('');

export function getQuoteContent(): string { return content; }
export function getQuoteSource(): string { return source; }
export function getQuoteLoading(): boolean { return loading; }
export function getQuoteError(): string { return error; }

export async function fetchQuote(forceType?: QuoteType): Promise<QuoteData | null> {
  const type = forceType || getSettings().quoteType;

  // 类型 -> API 路由映射
  const routeMap: Record<string, string> = {
    hitokoto: 'hitokoto',
    qinggan: 'qinggan',
    love: 'love',
    saylove: 'saylove',
    dog: 'dog',
    wanan: 'wanan',
    zaoan: 'zaoan',
    saohua: 'saohua',
    poison_soup: 'poison_soup',
  };
  const route = routeMap[type] || 'hitokoto';

  loading = true;
  error = '';

  try {
    const res = await fetch(`https://api.ruseo.cn/api/${route}?key=${API_KEY}`,
      { signal: AbortSignal.timeout(15000) });
    const result = await res.json();

    if (result.code === 0 && result.data) {
      const data: QuoteData = {
        content: result.data.content || result.data.msg || '',
        source: result.data.source || '',
      };
      content = data.content;
      source = data.source;
      return data;
    }
    error = 'API 返回异常';
    return null;
  } catch (e: any) {
    error = e?.name === 'TimeoutError' ? '请求超时' : '网络错误';
    return null;
  } finally {
    loading = false;
  }
}

// 初始化：页面加载时获取一句
export function initQuote() {
  fetchQuote();
}
