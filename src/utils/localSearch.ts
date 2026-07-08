import type { DialItem, DialGroup } from '../types';

export interface LocalSearchResult {
  dial: DialItem;
  groupName: string;
  matchType: 'prefix' | 'contains' | 'url';
  matchIndex: number;
  score: number;
}

/**
 * 本地导航搜索：匹配 DialItem 的 title 和 url
 * - 前缀匹配 title → score 1000
 * - 包含匹配 title → score 500
 * - 包含匹配 url hostname → score 200
 */
export function searchLocalDials(
  keyword: string,
  items: DialItem[],
  groups: DialGroup[],
  maxResults: number = 8
): LocalSearchResult[] {
  if (!keyword.trim()) return [];

  const kw = keyword.trim().toLowerCase();
  const results: LocalSearchResult[] = [];

  // 预建分组名映射
  const groupMap = new Map<string, string>();
  for (const g of groups) {
    groupMap.set(g.id, g.name);
  }

  for (const dial of items) {
    const titleLower = dial.title.toLowerCase();

    // 1. 前缀匹配 title
    if (titleLower.startsWith(kw)) {
      results.push({
        dial,
        groupName: groupMap.get(dial.groupId) || '',
        matchType: 'prefix',
        matchIndex: 0,
        score: 1000 - titleLower.length, // 短标题优先
      });
      continue; // 前缀匹配是最佳结果，不再检查其他匹配类型
    }

    // 2. 包含匹配 title
    const titleIdx = titleLower.indexOf(kw);
    if (titleIdx !== -1) {
      results.push({
        dial,
        groupName: groupMap.get(dial.groupId) || '',
        matchType: 'contains',
        matchIndex: titleIdx,
        score: 500 - titleIdx, // 位置越前优先级越高
      });
      continue;
    }

    // 3. 包含匹配 url hostname
    try {
      const urlObj = new URL(dial.url);
      const hostname = urlObj.hostname.toLowerCase();
      const hostIdx = hostname.indexOf(kw);
      if (hostIdx !== -1) {
        results.push({
          dial,
          groupName: groupMap.get(dial.groupId) || '',
          matchType: 'url',
          matchIndex: hostIdx,
          score: 200 - hostIdx,
        });
      }
    } catch {
      // URL 解析失败，忽略
    }
  }

  // 按评分排序，同分按 sortOrder
  results.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return a.dial.sortOrder - b.dial.sortOrder;
  });

  return results.slice(0, maxResults);
}

/**
 * 高亮匹配关键词：将匹配部分包裹为 <strong>
 */
export function highlightTitle(title: string, keyword: string): string {
  if (!keyword.trim()) return title;

  const kw = keyword.trim().toLowerCase();
  const idx = title.toLowerCase().indexOf(kw);
  if (idx === -1) return title;

  const before = title.slice(0, idx);
  const match = title.slice(idx, idx + kw.length);
  const after = title.slice(idx + kw.length);
  return `${before}<strong class="local-match">${match}</strong>${after}`;
}

/**
 * 截断 URL 显示（仅显示 hostname + 部分路径）
 */
export function truncateUrl(url: string, maxLen: number = 40): string {
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname;
    const path = urlObj.pathname;
    if (path === '/' || path === '') return host;
    const display = host + path;
    if (display.length > maxLen) return display.slice(0, maxLen) + '…';
    return display;
  } catch {
    return url.length > maxLen ? url.slice(0, maxLen) + '…' : url;
  }
}
