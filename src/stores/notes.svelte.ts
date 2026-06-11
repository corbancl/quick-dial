import type { NoteItem, NoteColor, NoteStatus } from '../types';
import { NOTE_COLOR_CYCLE, generateId } from '../types';

let items = $state<NoteItem[]>([]);

export function initNotes(data: NoteItem[] | undefined): void {
  items = (data || []).map((n) => ({
    ...n,
    color: n.color || 'yellow',
    status: n.status || 'normal',
    pinned: n.pinned || false,
    updatedAt: n.updatedAt || n.createdAt,
  }));
}

export function getNotes(): NoteItem[] {
  return items;
}

export function getNoteCount(): number {
  return items.length;
}

export function addNote(text: string): NoteItem {
  // 自动轮换颜色
  const lastColor = items.length > 0 ? items[0].color : 'purple';
  const idx = NOTE_COLOR_CYCLE.indexOf(lastColor);
  const color = NOTE_COLOR_CYCLE[(idx + 1) % NOTE_COLOR_CYCLE.length];
  const now = Date.now();
  const item: NoteItem = {
    id: generateId(),
    text: text.trim(),
    color,
    status: 'normal',
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };
  items = [item, ...items];
  return item;
}

export function updateNote(id: string, text: string): void {
  items = items.map((n) =>
    n.id === id ? { ...n, text: text.trim(), updatedAt: Date.now() } : n
  );
}

export function setNoteColor(id: string, color: NoteColor): void {
  items = items.map((n) =>
    n.id === id ? { ...n, color, updatedAt: Date.now() } : n
  );
}

export function setNoteStatus(id: string, status: NoteStatus): void {
  items = items.map((n) =>
    n.id === id ? { ...n, status, updatedAt: Date.now() } : n
  );
}

export function toggleNotePin(id: string): void {
  items = items.map((n) =>
    n.id === id ? { ...n, pinned: !n.pinned } : n
  );
}

export function deleteNote(id: string): void {
  items = items.filter((n) => n.id !== id);
}

// 排序：置顶优先，按更新时间倒序
export function getSortedNotes(): NoteItem[] {
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}
