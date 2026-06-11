import type { SearchEngine } from '../types';
import { generateId, DEFAULT_SEARCH_ENGINES } from '../types';

const STORAGE_KEY = 'quick-dial-subscription';

let isPro = $state(false);
let customEngines = $state<SearchEngine[]>([]);

// 响应式 token 追踪，登录/退出时自动触发 Pro 同步（export getter 方式避免 Svelte state_invalid_export）
let _authToken = $state<string | null>(localStorage.getItem('quick-dial-token'));
export function getAuthToken() { return _authToken; }

function init() {
  // 不再从 localStorage 恢复 isPro — 始终从服务端重新验证。
  // 防止管理后台取消 Pro 后本地缓存仍为 Pro。
  // customEngines 仍从 localStorage 恢复，syncProStatus 会决定是否清除。
  isPro = false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      customEngines = data.customEngines || [];
    }
  } catch { /* ignore */ }

  // 页面加载时立即同步 Pro 状态（不依赖组件的 $effect）
  if (_authToken) {
    syncProStatus();
  }
}
init();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ isPro, customEngines }));
  } catch { /* ignore */ }
}

export function getIsPro() { return isPro; }
export function getCustomEngines() { return customEngines; }

/** Pro 被取消时清理 Pro 专属功能 */
export function cleanupProFeatures() {
  // 1. 清除自定义搜索引擎
  customEngines = [];
  
  // 2. 重置文档标题
  try {
    localStorage.removeItem('quick-dial-custom-title');
    const lang = localStorage.getItem('qd-lang') || 'zh-CN';
    document.title = lang === 'zh-CN'
      ? '呲啦起始页 - 极简无广告浏览器新标签页'
      : 'Quick Dial - Clean, Ad-Free Browser New Tab';
  } catch { /* ignore */ }

  // 3. 清除自定义 CSS
  try {
    localStorage.removeItem('quick-dial-custom-css');
    const styleEl = document.getElementById('quick-dial-custom-css');
    if (styleEl) styleEl.remove();
  } catch { /* ignore */ }

  // 4. 清除自定义页脚
  try {
    localStorage.removeItem('quick-dial-custom-footer');
  } catch { /* ignore */ }

  // 5. 重置 proOnly 搜索引擎为 google
  try {
    const appData = localStorage.getItem('quick-dial-storage');
    if (appData) {
      const data = JSON.parse(appData);
      const currentEngine = data.settings?.searchEngine;
      if (currentEngine) {
        const isProOnly = DEFAULT_SEARCH_ENGINES.some(
          e => e.id === currentEngine && e.proOnly
        );
        if (isProOnly && data.settings) {
          data.settings.searchEngine = 'google';
          localStorage.setItem('quick-dial-storage', JSON.stringify(data));
        }
      }
    }
  } catch { /* ignore */ }
  
  persist();
}

/** 登录/退出时更新响应式 token，触发 $effect 重新同步 */
export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('quick-dial-token', token);
  } else {
    localStorage.removeItem('quick-dial-token');
    // 退出登录立即清除 Pro 状态
    if (isPro) { isPro = false; cleanupProFeatures(); }
  }
  _authToken = token;
}

/**
 * 从支付 API 同步 Pro 状态（登录或打开页面时调用）
 */
export async function syncProStatus() {
  const token = _authToken;
  if (!token) {
    if (isPro) { isPro = false; cleanupProFeatures(); }
    return;
  }

  try {
    const res = await fetch('https://sync.ruseo.cn/api/pay.php?action=status', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await res.json();
    if (result.code === 200) {
      const serverPro = result.data?.is_pro || false;
      const wasPro = isPro;
      isPro = serverPro;
      
      if (!serverPro) {
        // 非 Pro → 清理所有 Pro 专属功能和缓存
        cleanupProFeatures();
      }
      
      // 始终持久化，确保 localStorage 与服务器一致
      if (wasPro !== serverPro || !serverPro) {
        persist();
      }
    }
  } catch {
    // 网络错误保留本地状态，避免离线时误降级
  }
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
