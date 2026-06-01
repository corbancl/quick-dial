import type { SearchEngine } from '../types';
import { DEFAULT_SEARCH_ENGINES, FREE_ENGINE_LIMIT } from '../types';
import { getIsPro, getCustomEngines } from '../stores/subscription.svelte';

export function getEngineById(id: string): SearchEngine | undefined {
  const all = getAllEngines();
  return all.find(e => e.id === id);
}

export function buildSearchUrl(engineId: string, keyword: string): string {
  const engine = getEngineById(engineId);
  if (!engine) {
    return `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;
  }
  return engine.url.replace('{keyword}', encodeURIComponent(keyword));
}

/** 可用引擎（免费6种，Pro全部+自定义） */
export function getAvailableEngines(): SearchEngine[] {
  const pro = getIsPro();
  const builtin = pro
    ? DEFAULT_SEARCH_ENGINES
    : DEFAULT_SEARCH_ENGINES.filter(e => !e.proOnly).slice(0, FREE_ENGINE_LIMIT);

  if (pro) {
    const custom = getCustomEngines();
    if (custom.length > 0) return [...builtin, ...custom];
  }
  return builtin;
}

/** 全部引擎（含 Pro 专属，用于展示锁定状态） */
export function getAllEngines(): SearchEngine[] {
  const pro = getIsPro();
  const builtin = pro
    ? DEFAULT_SEARCH_ENGINES
    : DEFAULT_SEARCH_ENGINES.filter(e => !e.proOnly);

  if (pro) {
    const custom = getCustomEngines();
    if (custom.length > 0) return [...builtin, ...custom];
  }
  return builtin;
}

/** 被锁定的引擎列表 */
export function getLockedEngines(): SearchEngine[] {
  if (getIsPro()) return [];
  return DEFAULT_SEARCH_ENGINES.filter(e => e.proOnly);
}
