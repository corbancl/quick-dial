export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

let items = $state<TodoItem[]>([]);

export function initTodos(data: TodoItem[] | undefined): void {
  items = data || [];
}

export function getTodos(): TodoItem[] {
  return items;
}

export function getTodoCount(): number {
  return items.length;
}

export function getActiveCount(): number {
  return items.filter((t) => !t.done).length;
}

export function addTodo(text: string): TodoItem {
  const item: TodoItem = { id: uid(), text: text.trim(), done: false, createdAt: Date.now() };
  items = [...items, item];
  return item;
}

export function toggleTodo(id: string): void {
  items = items.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

export function deleteTodo(id: string): void {
  items = items.filter((t) => t.id !== id);
}

export function clearDone(): void {
  items = items.filter((t) => !t.done);
}
