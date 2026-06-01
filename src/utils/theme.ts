import type { ThemeMode, WallpaperConfig } from '../types';
import { getLang } from './i18n.svelte';

export function applyTheme(mode: ThemeMode, primaryColor: string): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', mode);
  root.style.setProperty('--primary-color', primaryColor);

  const bgColor = mode === 'dark' ? '#0f172a' : '#f8fafc';
  const textColor = mode === 'dark' ? '#e2e8f0' : '#1e293b';
  const cardBg = mode === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.85)';
  const cardBorder = mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const hoverBg = mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const inputBg = mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.02)';

  root.style.setProperty('--bg-color', bgColor);
  root.style.setProperty('--text-color', textColor);
  root.style.setProperty('--card-bg', cardBg);
  root.style.setProperty('--card-border', cardBorder);
  root.style.setProperty('--hover-bg', hoverBg);
  root.style.setProperty('--input-bg', inputBg);
  root.style.setProperty('--color-scheme', mode === 'dark' ? 'dark' : 'light');

  // 直接设置 body 背景色，确保暗色模式生效
  document.body.style.backgroundColor = bgColor;
  document.body.style.color = textColor;
}

export function applyWallpaper(wallpaper: WallpaperConfig): void {
  const root = document.documentElement;
  const { type, value, blur, brightness } = wallpaper;

  if (type === 'solid') {
    root.style.setProperty('--wallpaper', value);
    root.style.setProperty('--wallpaper-filter', 'none');
    root.style.setProperty('--bg-color', value);
    adaptTextColor(value);
  } else if (type === 'gradient' || value.startsWith('linear-gradient') || value.startsWith('radial-gradient')) {
    root.style.setProperty('--wallpaper', value);
    root.style.setProperty('--wallpaper-filter', 'none');
    root.style.setProperty('--bg-color', value);
    adaptTextColor(value);
  } else if (type === 'image' || type === 'builtin') {
    root.style.setProperty('--wallpaper', `url(${value})`);
    root.style.setProperty('--wallpaper-filter', `blur(${blur}px) brightness(${brightness}%)`);
    root.style.setProperty('--bg-color', 'transparent');
  }
}

/** 从 CSS 值中提取第一个 hex 颜色，判断亮度并调整全部主题变量 */
function adaptTextColor(cssValue: string) {
  const match = cssValue.match(/#([0-9a-fA-F]{6})/);
  if (!match) return;
  const hex = match[1];
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const root = document.documentElement;

  if (lum < 0.5) {
    root.setAttribute('data-theme', 'dark');
    root.style.setProperty('--text-color', '#e2e8f0');
    root.style.setProperty('--card-bg', 'rgba(30, 41, 59, 0.9)');
    root.style.setProperty('--card-border', 'rgba(255,255,255,0.06)');
    root.style.setProperty('--hover-bg', 'rgba(255,255,255,0.06)');
    root.style.setProperty('--input-bg', 'rgba(255,255,255,0.06)');
    document.body.style.color = '#e2e8f0';
  } else {
    root.setAttribute('data-theme', 'light');
    root.style.setProperty('--text-color', '#1e293b');
    root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.85)');
    root.style.setProperty('--card-border', 'rgba(0,0,0,0.06)');
    root.style.setProperty('--hover-bg', 'rgba(0,0,0,0.04)');
    root.style.setProperty('--input-bg', 'rgba(0,0,0,0.02)');
    document.body.style.color = '#1e293b';
  }
}

export function formatDate(date: Date): string {
  const lang = getLang();
  if (lang === 'zh-CN') {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}年${m}月${d}日`;
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatWeekday(date: Date): string {
  const lang = getLang();
  const weekdays: Record<string, string[]> = {
    'zh-CN': ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    'en': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  };
  return (weekdays[lang] || weekdays['zh-CN'])[date.getDay()];
}
