/**
 * 键盘快捷键管理器
 * 仅在无 input/textarea 聚焦时触发
 */
type ShortcutHandler = (e: KeyboardEvent) => void;

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: ShortcutHandler;
  description: string;
}

const shortcuts: Shortcut[] = [];
let registered = false;

function isEditing(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

function handleKeydown(e: KeyboardEvent) {
  if (isEditing()) return;

  for (const s of shortcuts) {
    const ctrlOk = s.ctrl ? (e.ctrlKey || e.metaKey) : true;
    const shiftOk = s.shift ? e.shiftKey : true;
    const altOk = s.alt ? e.altKey : true;

    if (e.key.toUpperCase() === s.key.toUpperCase() && ctrlOk && shiftOk && altOk) {
      e.preventDefault();
      s.handler(e);
      return;
    }
  }
}

export function registerShortcut(
  key: string,
  handler: ShortcutHandler,
  description: string,
  modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}
) {
  shortcuts.push({ key, handler, description, ...modifiers });

  if (!registered) {
    document.addEventListener('keydown', handleKeydown);
    registered = true;
  }
}

/**
 * 获取所有快捷键列表（用于帮助面板）
 */
export function getShortcuts(): { key: string; description: string }[] {
  return shortcuts.map(s => ({
    key: [
      s.ctrl ? 'Ctrl+' : '',
      s.shift ? 'Shift+' : '',
      s.alt ? 'Alt+' : '',
      s.key,
    ].join(''),
    description: s.description,
  }));
}

/**
 * 聚焦搜索框
 */
export function focusSearch() {
  const el = document.querySelector<HTMLInputElement>('.search-input');
  if (el) {
    el.focus();
    el.select();
  }
}
