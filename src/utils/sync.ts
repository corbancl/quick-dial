import type { AppData } from '../types';
import { getDialsState } from '../stores/dials.svelte';
import { getTheme } from '../stores/theme.svelte';
import { getSettings } from '../stores/settings.svelte';
import { getRecentSites } from '../stores/recentSites.svelte';
import { getChatMessages, getChatConfig } from '../stores/chat.svelte';
import { getIsPro, setAuthToken, getAuthToken } from '../stores/subscription.svelte';

const API_BASE = 'https://sync.ruseo.cn/api/sync.php';

function getToken(): string | null {
  return getAuthToken();
}

function getLocalVersion(): number {
  return parseInt(localStorage.getItem('quick-dial-version') || '0', 10);
}

function setLocalVersion(v: number) {
  localStorage.setItem('quick-dial-version', String(v));
}

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

function getLocalSnapshot(): AppData {
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

// ====== 上传 ======

export async function uploadSync(): Promise<{ ok: boolean; msg: string }> {
  const token = getToken();
  if (!token) return { ok: false, msg: '未登录' };

  const data = getLocalSnapshot();
  const localVersion = getLocalVersion();

  try {
    const res = await fetch(`${API_BASE}?action=upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ data, version: localVersion }),
    });
    const result = await res.json();

    if (result.code === 200) {
      setLocalVersion(result.data.version);
      setLastSyncTime();
      return { ok: true, msg: '同步成功' };
    }
    if (result.code === 409) {
      // 云端版本更新，自动下载
      const dl = await downloadSync();
      if (dl.ok) {
        setLocalVersion(result.data.server_version);
        setLastSyncTime();
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

export async function downloadSync(): Promise<{ ok: boolean; msg: string; data?: AppData }> {
  const token = getToken();
  if (!token) return { ok: false, msg: '未登录' };

  try {
    const res = await fetch(`${API_BASE}?action=download`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await res.json();

    if (result.code === 200) {
      setLocalVersion(result.data.version);
      setLastSyncTime();
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
