/**
 * RSS 订阅状态管理
 */
import type { RssFeed, RssArticle, RssData } from '../types';
import { RSS_FEED_LIMIT } from '../types';
import { getIsPro } from './subscription.svelte';

let data = $state<RssData>({ feeds: [], articles: [], lastFetch: 0 });

export function initRss(saved?: RssData): void {
  if (saved) {
    data = {
      feeds: saved.feeds || [],
      articles: saved.articles || [],
      lastFetch: saved.lastFetch || 0,
    };
  }
}

export function getRssData(): Readonly<RssData> {
  return { ...data, feeds: [...data.feeds], articles: [...data.articles] };
}

export function addFeed(feed: RssFeed): boolean {
  if (!getIsPro() && data.feeds.length >= RSS_FEED_LIMIT) return false;
  if (data.feeds.some(f => f.url === feed.url)) return false;
  data.feeds = [...data.feeds, feed];
  return true;
}

export function removeFeed(url: string): void {
  data.feeds = data.feeds.filter(f => f.url !== url);
  data.articles = data.articles.filter(a => a.feedUrl !== url);
}

export function setArticles(feedUrl: string, articles: RssArticle[]): void {
  // Remove old articles from this feed
  data.articles = data.articles.filter(a => a.feedUrl !== feedUrl);
  // Add new articles
  data.articles = [...articles, ...data.articles];
  // Cap at 200
  if (data.articles.length > 200) {
    data.articles = data.articles.slice(0, 200);
  }
  data.lastFetch = Date.now();
}

export function markRead(link: string): void {
  data.articles = data.articles.map(a => a.link === link ? { ...a, read: true } : a);
}

export function markAllRead(feedUrl: string): void {
  data.articles = data.articles.map(a =>
    a.feedUrl === feedUrl ? { ...a, read: true } : a
  );
}
