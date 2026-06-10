import type { NoteItem } from '../types';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

let items = $state<NoteItem[]>([]);

export function initNotes(data: NoteItem[] | undefined): void {
  items = data || [];
}

export function getNotes(): NoteItem[] {
  return items;
}

export function getNoteCount(): number {
  return items.length;
}

export function addNote(text: string): NoteItem {
  const item: NoteItem = { id: uid(), text: text.trim(), createdAt: Date.now() };
  items = [...items, item];
  return item;
}

export function updateNote(id: string, text: string): void {
  items = items.map((n) => (n.id === id ? { ...n, text: text.trim() } : n));
}

export function deleteNote(id: string): void {
  items = items.filter((n) => n.id !== id);
}
