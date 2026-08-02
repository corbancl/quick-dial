import type { AppData } from '../types';
import { getDialsState } from '../stores/dials.svelte';
import { getTheme } from '../stores/theme.svelte';
import { getSettings } from '../stores/settings.svelte';
import { getRecentSites } from '../stores/recentSites.svelte';
import { getChatMessages, getChatConfig } from '../stores/chat.svelte';
import { getIsPro, setAuthToken, getAuthToken, updateTokenIfNew } from '../stores/subscription.svelte';
import { saveData } from '../utils/storage';
import { getDefaultTitle } from '../utils/i18n.svelte';

const API_BASE = 'https://sync.ruseo.cn/api/sync.php';

// 判定当前运行平台（飞牛/插件端由部署时注入 window.__QD_PLATFORM）
type Platform = 'web' | 'extension' | 'plugin' | 'fnos';
export function detectPlatform(): Platform {
  const injected = (window as any).__QD_PLATFORM as Platform | undefined;
  if (injected && ['web', 'extension', 'plugin', 'fnos'].includes(injected)) return injected;
  const rt = (window as any).chrome?.runtime;
  if (rt && rt.id) return 'extension';
  return 'web';
}

function getToken(): string | null {
  return getAuthToken();
}

function getLocalVersion(): number {
  return parseInt(localStorage.getItem('quick-dial-version') || '0', 10);
}

function setLocalVersion(v: number) {
  localStorage.setItem('quick-dial-version', String(v));
}

// 数据指纹：自动同步时用于判断本地是否变化，避免无谓上传与刷日志
function hashData(data: AppData): string {
  const json = JSON.stringify(data);
  let h = 5381;
  for (let i = 0; i < json.length; i++) {
    h = (((h << 5) + h) + json.charCodeAt(i)) & 0xffffffff;
  }
  return (h >>> 0).toString(36);
}
let lastUploadHash = localStorage.getItem('quick-dial-sync-hash') || '';

export function getLastSyncTime(): string | null {
  return localStorage.getItem('quick-dial-last-sync');
}

function setLastSyncTime() {
  localStorage.setItem('quick-dial-last-sync', new Date().toISOString());
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function getUsername(): string | null {
  return localStorage.getItem('quick-dial-username');
}

// ====== 认证 ======

export async function register(username: string, password: string): Promise<{ ok: boolean; msg: string }> {
  try {
    const res = await fetch(`${API_BASE}?action=register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const result = await res.json();
    if (result.code === 201) {
      setAuthToken(result.data.token);
      localStorage.setItem('quick-dial-username', result.data.username);
      return { ok: true, msg: '注册成功' };
    }
    return { ok: false, msg: result.msg || '注册失败' };
  } catch {
    return { ok: false, msg: '网络错误' };
  }
}

export async function login(username: string, password: string): Promise<{ ok: boolean; msg: string }> {
  try {
    const res = await fetch(`${API_BASE}?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const result = await res.json();
    if (result.code === 200) {
      setAuthToken(result.data.token);
      localStorage.setItem('quick-dial-username', result.data.username);
      return { ok: true, msg: '登录成功' };
    }
    return { ok: false, msg: result.msg || '登录失败' };
  } catch {
    return { ok: false, msg: '网络错误' };
  }
}

export function logout() {
  setAuthToken(null);
  localStorage.removeItem('quick-dial-username');
}

// ====== 获取当前本地数据快照 ======

export function getLocalSnapshot(): AppData {
  const dialsState = getDialsState();
  const isPro = getIsPro();
  return {
    version: 1,
    dials: dialsState.items,
    groups: dialsState.groups,
    searchEngines: [],
    theme: getTheme(),
    settings: getSettings(),
    recentSites: getRecentSites().map(s => ({ ...s })),
    // Pro 专属：同步 AI 对话历史
    chatMessages: isPro ? getChatMessages().map(m => ({ ...m })) : undefined,
    chatConfig: isPro ? { ...getChatConfig() } : undefined,
    customCss: isPro ? (localStorage.getItem('quick-dial-custom-css') || '') : '',
    customTitle: isPro ? (localStorage.getItem('quick-dial-custom-title') || '') : '',
    customFooter: isPro ? (localStorage.getItem('quick-dial-custom-footer') || '') : '',
  };
}

// ====== 应用远端数据到本地（云同步） ======
export function applyRemoteData(data: any) {
  saveData(data);
  if (data.customCss !== undefined) {
    localStorage.setItem('quick-dial-custom-css', data.customCss);
    let styleEl = document.getElementById('qd-custom-css') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'qd-custom-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = data.customCss;
  }
  if (data.customTitle !== undefined) {
    localStorage.setItem('quick-dial-custom-title', data.customTitle);
    // 自定义标题为空（未设置）时回退到默认标题，避免标题被清空导致标签页只显示域名
    document.title = data.customTitle ? data.customTitle : getDefaultTitle();
  }
  if (data.customFooter !== undefined) {
    localStorage.setItem('quick-dial-custom-footer', data.customFooter);
  }
}

// ====== 上传 ======
export async function uploadSync(force = false, source: 'manual' | 'auto' = 'manual'): Promise<{ ok: boolean; msg: string }> {
  const token = getToken();
  if (!token) return { ok: false, msg: '未登录' };

  const data = getLocalSnapshot();
  // 自动同步（非强制）：数据无变化时跳过，避免刷版本号与日志
  if (!force) {
    const h = hashData(data);
    if (h === lastUploadHash) return { ok: true, msg: '无变化' };
  }

  const localVersion = getLocalVersion();

  try {
    const res = await fetch(`${API_BASE}?action=upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ data, version: localVersion, source, platform: detectPlatform() }),
    });
    const result = await res.json();

    // Token 自动刷新
    updateTokenIfNew(res, result);

    if (result.code === 200) {
      setLocalVersion(result.data.version);
      setLastSyncTime();
      const h = hashData(data);
      lastUploadHash = h;
      localStorage.setItem('quick-dial-sync-hash', h);
      return { ok: true, msg: '同步成功' };
    }
    if (result.code === 409) {
      // 云端版本更新，自动拉取并合并
      const dl = await downloadSync('auto');
      if (dl.ok && dl.data) {
        applyRemoteData(dl.data);
        setLocalVersion(result.data.server_version);
        setLastSyncTime();
        const h = hashData(getLocalSnapshot());
        lastUploadHash = h;
        localStorage.setItem('quick-dial-sync-hash', h);
        return { ok: true, msg: '已合并云端数据' };
      }
      return { ok: false, msg: '服务器数据更新，请手动下载后再上传' };
    }
    return { ok: false, msg: result.msg || '上传失败' };
  } catch {
    return { ok: false, msg: '网络错误' };
  }
}

// ====== 下载 ======
export async function downloadSync(source: 'manual' | 'auto' = 'manual'): Promise<{ ok: boolean; msg: string; data?: AppData }> {
  const token = getToken();
  if (!token) return { ok: false, msg: '未登录' };

  try {
    const res = await fetch(`${API_BASE}?action=download&source=${source}&platform=${detectPlatform()}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await res.json();

    // Token 自动刷新
    updateTokenIfNew(res, result);

    if (result.code === 200) {
      setLocalVersion(result.data.version);
      setLastSyncTime();
      // 下载成功后本地=云端，更新指纹避免自动同步立即回传
      const h = hashData(result.data.data as AppData);
      lastUploadHash = h;
      localStorage.setItem('quick-dial-sync-hash', h);
      return { ok: true, msg: '下载成功', data: result.data.data as AppData };
    }
    if (result.code === 404) {
      return { ok: false, msg: '云端暂无数据，请先上传' };
    }
    return { ok: false, msg: result.msg || '下载失败' };
  } catch {
    return { ok: false, msg: '网络错误' };
  }
}
