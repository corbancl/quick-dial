import type { TodoItem, TodoStatus, TodoPriority } from '../types';
import { generateId } from '../types';

let items = $state<TodoItem[]>([]);

/** 迁移旧数据：done boolean → status field */
function migrate(item: TodoItem): TodoItem {
  if (!item.status) {
    item.status = item.done ? 'done' : 'todo';
  }
  if (!item.priority) {
    item.priority = 'normal';
  }
  if (item.dueDate === undefined) {
    item.dueDate = null;
  }
  return item;
}

export function initTodos(data: TodoItem[] | undefined): void {
  items = (data || []).map(migrate);
}

export function getTodos(): TodoItem[] {
  return items;
}

export function getTodoCount(): number {
  return items.length;
}

export function getActiveCount(): number {
  return items.filter((t) => t.status !== 'done').length;
}

export function addTodo(text: string): TodoItem {
  const item: TodoItem = {
    id: generateId(),
    text: text.trim(),
    done: false,
    status: 'todo',
    priority: 'normal',
    dueDate: null,
    createdAt: Date.now(),
  };
  items = [...items, item];
  return item;
}

export function toggleTodo(id: string): void {
  items = items.map((t) => {
    if (t.id !== id) return t;
    const next: TodoStatus = t.status === 'done' ? 'todo' : 'done';
    return { ...t, status: next, done: next === 'done' };
  });
}

export function setTodoStatus(id: string, status: TodoStatus): void {
  items = items.map((t) => {
    if (t.id !== id) return t;
    return { ...t, status, done: status === 'done' };
  });
}

export function setTodoPriority(id: string, priority: TodoPriority): void {
  items = items.map((t) => t.id === id ? { ...t, priority } : t);
}

export function setTodoDueDate(id: string, dueDate: number | null): void {
  items = items.map((t) => t.id === id ? { ...t, dueDate } : t);
}

export function cycleTodoStatus(id: string): void {
  items = items.map((t) => {
    if (t.id !== id) return t;
    const cycle: TodoStatus[] = ['todo', 'in_progress', 'done'];
    const idx = cycle.indexOf(t.status);
    const next = cycle[(idx + 1) % 3];
    return { ...t, status: next, done: next === 'done' };
  });
}

export function deleteTodo(id: string): void {
  items = items.filter((t) => t.id !== id);
}

export function clearDone(): void {
  items = items.filter((t) => t.status !== 'done');
}

/** 排序：未完成优先 → 优先级高优先 → 截止近优先 → 创建新优先 */
export function getSortedTodos(filter: 'all' | 'active' | 'done'): TodoItem[] {
  const now = Date.now();
  let filtered = items;
  if (filter === 'active') filtered = items.filter((t) => t.status !== 'done');
  else if (filter === 'done') filtered = items.filter((t) => t.status === 'done');

  return [...filtered].sort((a, b) => {
    // 已完成排最后
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    // 优先级高排前面
    const priOrder: Record<string, number> = { high: 0, normal: 1, low: 2 };
    const pa = priOrder[a.priority] ?? 1;
    const pb = priOrder[b.priority] ?? 1;
    if (pa !== pb) return pa - pb;
    // 截止日期近排前面
    if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    // 创建时间新排前面
    return b.createdAt - a.createdAt;
  });
}

/** 按状态分组 (kanban 用) */
export function getTodosByStatus(): Record<TodoStatus, TodoItem[]> {
  return {
    todo: items.filter((t) => t.status === 'todo'),
    in_progress: items.filter((t) => t.status === 'in_progress'),
    done: items.filter((t) => t.status === 'done'),
  };
}
