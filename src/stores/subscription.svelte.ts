import type { SearchEngine } from '../types';
import { generateId } from '../types';

const STORAGE_KEY = 'quick-dial-subscription';

let isPro = $state(false);
let customEngines = $state<SearchEngine[]>([]);

function init() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      // 未登录时清除旧的开发模式 Pro 残留
      if (!localStorage.getItem('quick-dial-token')) {
        isPro = false;
      } else {
        isPro = data.isPro || false;
      }
      customEngines = data.customEngines || [];
    }
  } catch { /* ignore */ }
}
init();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ isPro, customEngines }));
  } catch { /* ignore */ }
}

export function getIsPro() { return isPro; }
export function getCustomEngines() { return customEngines; }

/**
 * 从支付 API 同步 Pro 状态（用户登录后调用）
 */
export async function syncProStatus() {
  const token = localStorage.getItem('quick-dial-token');
  if (!token) return;

  try {
    const res = await fetch('https://sync.ruseo.cn/api/pay.php?action=status', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await res.json();
    if (result.code === 200 && result.data?.is_pro) {
      if (!isPro) {
        isPro = true;
        persist();
      }
    }
  } catch { /* 网络不可用时保持本地状态 */ }
}

export function addCustomEngine(name: string, url: string): SearchEngine {
  const engine: SearchEngine = {
    id: generateId(),
    name,
    url,
    isCustom: true,
  };
  customEngines = [...customEngines, engine];
  persist();
  return engine;
}

export function removeCustomEngine(id: string) {
  customEngines = customEngines.filter(e => e.id !== id);
  persist();
}
