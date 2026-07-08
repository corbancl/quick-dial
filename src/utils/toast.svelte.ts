type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let toasts = $state<ToastItem[]>([]);
let nextId = 0;

export function getToasts(): Readonly<ToastItem[]> {
  return toasts;
}

export function showToast(message: string, type: ToastType = 'info', duration = 2500) {
  const id = nextId++;
  toasts = [...toasts, { id, message, type }];

  if (duration > 0) {
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, duration);
  }
}

export function dismissToast(id: number) {
  toasts = toasts.filter(t => t.id !== id);
}
