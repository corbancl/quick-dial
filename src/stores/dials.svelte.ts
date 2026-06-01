import type { DialItem, DialGroup } from '../types';
import { generateId } from '../types';
import { getIsPro } from './subscription.svelte';

export const FREE_GROUP_LIMIT = 3;

interface DialsState {
  items: DialItem[];
  groups: DialGroup[];
}

let state = $state<DialsState>({ items: [], groups: [] });

export function initDials(data: { dials: DialItem[]; groups: DialGroup[] }): void {
  state.items = data.dials || [];
  state.groups = data.groups || [];
}

/**
 * 获取状态快照，防止外部直接修改
 */
export function getDialsState(): Readonly<DialsState> {
  return {
    items: state.items.map(item => ({ ...item })),
    groups: state.groups.map(group => ({ ...group }))
  };
}

/**
 * 获取内部状态引用（仅限内部使用）
 */
export function getDialsStateInternal(): DialsState {
  return state;
}

// ====== 分组操作 ======
export function addGroup(name: string): DialGroup | null {
  if (!getIsPro() && state.groups.length >= FREE_GROUP_LIMIT) {
    return null;
  }
  const newGroup: DialGroup = {
    id: generateId(),
    name,
    sortOrder: state.groups.length,
    isCollapsed: false,
  };
  state.groups = [...state.groups, newGroup];
  return newGroup;
}

export function updateGroup(id: string, updates: Partial<DialGroup>): void {
  state.groups = state.groups.map(g => (g.id === id ? { ...g, ...updates } : g));
}

export function removeGroup(id: string): void {
  state.groups = state.groups.filter(g => g.id !== id);
  // 移除组内所有卡片
  state.items = state.items.filter(d => d.groupId !== id);
}

export function reorderGroups(groupIds: string[]): void {
  state.groups = groupIds.map((id, i) => {
    const g = state.groups.find(gg => gg.id === id);
    if (!g) {
      console.warn(`[reorderGroups] Group not found: ${id}`);
      return null;
    }
    return { ...g, sortOrder: i };
  }).filter((g): g is DialGroup => g !== null);
}

// ====== 卡片操作 ======
export function addDial(dial: Omit<DialItem, 'id' | 'createdAt'>): DialItem {
  const newDial: DialItem = {
    ...dial,
    id: generateId(),
    createdAt: Date.now(),
  };
  state.items = [...state.items, newDial];
  return newDial;
}

export function updateDial(id: string, updates: Partial<DialItem>): void {
  state.items = state.items.map(d => (d.id === id ? { ...d, ...updates } : d));
}

export function removeDial(id: string): void {
  state.items = state.items.filter(d => d.id !== id);
}

/**
 * 重新排序卡片，同时更新 sortOrder 字段
 */
export function reorderDials(dialIds: string[]): void {
  state.items = dialIds.map((id, i) => {
    const d = state.items.find(dd => dd.id === id);
    if (!d) {
      console.warn(`[reorderDials] Dial not found: ${id}`);
      return null;
    }
    return { ...d, sortOrder: i };
  }).filter((d): d is DialItem => d !== null);
}

export function moveDialToGroup(dialId: string, targetGroupId: string): void {
  const dial = state.items.find(d => d.id === dialId);
  if (!dial) return;
  
  // 移动到目标组末尾
  const groupItems = state.items.filter(d => d.groupId === targetGroupId);
  const maxSortOrder = groupItems.length > 0 
    ? Math.max(...groupItems.map(d => d.sortOrder)) 
    : -1;
  
  state.items = state.items.map(d =>
    d.id === dialId ? { ...d, groupId: targetGroupId, sortOrder: maxSortOrder + 1 } : d
  );
}

// ====== 默认分组 ======
export function ensureDefaultGroup(): string {
  let defaultGroup = state.groups.find(g => g.name === '常用');
  if (!defaultGroup) {
    defaultGroup = addGroup('常用');
  }
  return defaultGroup.id;
}
