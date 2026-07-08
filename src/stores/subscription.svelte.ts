import type { SearchEngine } from '../types';
import { generateId, DEFAULT_SEARCH_ENGINES } from '../types';

const STORAGE_KEY = 'quick-dial-subscription';

let isPro = $state(false);
let customEngines = $state<SearchEngine[]>([]);

// 响应式 token 追踪，登录/退出时自动触发 Pro 同步（export getter 方式避免 Svelte state_invalid_export）
// 兼容官网 token（qd-website-token）和扩展端 token（quick-dial-token）
let _authToken = $state<string | null>(
  localStorage.getItem('quick-dial-token') || localStorage.getItem('qd-website-token')
);
export function getAuthToken() { return _authToken; }

/**
 * 检查响应中的新 token，自动更新本地存储
 * 后端在 token 快过期时会在响应头 X-New-Token 或响应体 new_token 中返回新 token
 * 
 * 使用方法：在每次 API 请求后调用此函数
 *   const res = await fetch(...);
 *   const result = await res.json();
 *   updateTokenIfNew(res, result);
 */
export function updateTokenIfNew(res: Response, result?: any) {
  // 优先检查响应头
  const newTokenFromHeader = res.headers.get('X-New-Token');
  if (newTokenFromHeader && newTokenFromHeader !== _authToken) {
    setAuthToken(newTokenFromHeader);
    return;
  }
  // 其次检查响应体
  if (result?.new_token && result.new_token !== _authToken) {
    setAuthToken(result.new_token);
  }
}

function init() {
  // 页面加载时不预设 isPro（保持 false 默认），由 syncProStatus 异步验证
  // 不缓存 isPro 到 localStorage —— 防止管理后台取消 Pro 后本地仍显示 Pro
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      customEngines = data.customEngines || [];
    }
  } catch { /* ignore */ }

  // 页面加载时，token 存在性由 App.svelte 的 $effect 触发 syncProStatus，无需在此重复调用
  // 移除旧代码中的直接调用，避免与 $effect 并发执行造成的竞态条件

  // 监听官网支付成功事件（通过 localStorage 跨页面通信）
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === 'qd-pay-success' && e.newValue) {
      // 官网支付成功，刷新 Pro 状态
      syncProStatus();
      // 清除标记
      localStorage.removeItem('qd-pay-success');
    }
  });
}
init();

function persist() {
  // 只持久化 customEngines；isPro 由 syncProStatus 每次实时验证
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ customEngines }));
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

  // 6. 回退 Pro 专属主题为 tech
  try {
    const appData = localStorage.getItem('quick-dial-storage');
    if (appData) {
      const data = JSON.parse(appData);
      const style = data.settings?.themeStyle;
      const PRO_THEMES = ['glass', 'neu', 'cyberpunk', 'retro'];
      if (style && PRO_THEMES.includes(style)) {
        data.settings.themeStyle = 'tech';
        localStorage.setItem('quick-dial-storage', JSON.stringify(data));
        localStorage.setItem('quick-dial-theme-style', 'tech');
        document.documentElement.setAttribute('data-theme-style', 'tech');
      }
    }
  } catch { /* ignore */ }

  // 7. 回退 Pro 专属便签模式
  try {
    const appData = localStorage.getItem('quick-dial-storage');
    if (appData) {
      const data = JSON.parse(appData);
      if (data.settings?.notesDisplayMode === 'colorful') {
        data.settings.notesDisplayMode = 'structured';
        localStorage.setItem('quick-dial-storage', JSON.stringify(data));
      }
    }
  } catch { /* ignore */ }

  // 8. 回退 Pro 专属待办模式
  try {
    const appData = localStorage.getItem('quick-dial-storage');
    if (appData) {
      const data = JSON.parse(appData);
      if (data.settings?.todoDisplayMode === 'kanban') {
        data.settings.todoDisplayMode = 'list';
        localStorage.setItem('quick-dial-storage', JSON.stringify(data));
      }
    }
  } catch { /* ignore */ }
  
  persist();
}

/** 登录/退出时更新响应式 token，触发 $effect 重新同步 */
export function setAuthToken(token: string | null) {
  if (token) {
    // 同时保存到扩展端和官网 token key
    localStorage.setItem('quick-dial-token', token);
    localStorage.setItem('qd-website-token', token);
  } else {
    // 同时清除两个 token key
    localStorage.removeItem('quick-dial-token');
    localStorage.removeItem('qd-website-token');
    // 退出登录立即清除 Pro 状态
    if (isPro) { isPro = false; cleanupProFeatures(); }
  }
  _authToken = token;
}

/**
 * 从支付 API 同步 Pro 状态（登录或打开页面时调用）
 * 
 * 带指数退避重试（最多 3 次），解决 web 端刷新时网络抖动导致误判为免费的问题。
 * 只有服务器明确返回"不是 Pro"才设为 false；网络错误/超时不改变当前状态。
 * 
 * Token 自动刷新：后端在 token 快过期时会在响应头 X-New-Token 或响应体 new_token 中返回新 token
 */
export async function syncProStatus() {
  const token = _authToken;
  if (!token) {
    if (isPro) { isPro = false; cleanupProFeatures(); }
    return;
  }

  const MAX_RETRIES = 3;
  const BASE_DELAY = 1000; // ms

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const ctrl = new AbortController();
      const timeoutId = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch('https://sync.ruseo.cn/api/pay.php?action=status', {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: ctrl.signal,
      });
      clearTimeout(timeoutId);

      // 检查是否有新 token（自动刷新）
      const result = await res.json();
      updateTokenIfNew(res, result);

      if (res.status === 401) {
        // Token 无效，但先检查是否已通过响应头刷新了 token
        // 如果 updateTokenIfNew 已更新了 token，则 _authToken 已是新值，无需退出
        if (!_authToken) {
          // 确实没有新 token，才强制退出
          isPro = false;
          setAuthToken(null);
        }
        return;
      }

      if (result.code === 200) {
        const serverPro = result.data?.is_pro || false;
        isPro = serverPro;

        if (!serverPro) {
          cleanupProFeatures();
        }
        return; // 成功，退出重试循环
      }
      // code !== 200 但 HTTP 200 → 服务器返回异常，继续重试
    } catch {
      // 网络错误/超时 → 不改变 isPro，等下一次重试
    }

    // 还有重试机会则等待
    if (attempt < MAX_RETRIES - 1) {
      await new Promise(r => setTimeout(r, BASE_DELAY * Math.pow(2, attempt)));
    }
  }

  // 全部重试耗尽 → 静默降级，保持当前 isPro 不变
  // 用户看到的仍是上次验证成功时的状态，而非误判免费
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
