/**
 * RSS 订阅工具：通过 rss2json API 拉取并解析 RSS 源
 */
import type { RssFeed, RssArticle } from '../types';

const API_BASE = 'https://api.rss2json.com/v1/api.json';

interface Rss2JsonItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

interface Rss2JsonResponse {
  status: string;
  feed: { title: string };
  items: Rss2JsonItem[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}

/**
 * 获取 RSS 源的文章列表
 */
export async function fetchArticles(feed: RssFeed, count = 10): Promise<RssArticle[]> {
  const url = `${API_BASE}?rss_url=${encodeURIComponent(feed.url)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`RSS fetch failed: ${res.status}`);
  }

  const data: Rss2JsonResponse = await res.json();

  if (data.status !== 'ok' || !data.items) {
    throw new Error('RSS feed returned invalid data');
  }

  return data.items.map((item) => ({
    feedUrl: feed.url,
    title: item.title || '',
    link: item.link || '',
    pubDate: item.pubDate || '',
    snippet: stripHtml(item.description || '').slice(0, 200),
    read: false,
  }));
}

/**
 * 格式化发布时间为可读字符串
 */
export function formatPubDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  return date.toLocaleDateString('zh-CN');
}
