import type { ThemeMode, ThemeStyle, WallpaperConfig } from '../types';
import { isProTheme } from '../types';
import { getLang } from './i18n.svelte';

/** 浅色专属主题：mode 强制 light */
const LIGHT_ONLY_STYLES: ThemeStyle[] = ['minimal', 'paper', 'neu'];
/** 暗色专属主题：mode 强制 dark */
const DARK_ONLY_STYLES: ThemeStyle[] = ['ocean', 'cyberpunk', 'retro'];

export function applyTheme(mode: ThemeMode, primaryColor: string, style: ThemeStyle = 'tech'): void {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', primaryColor);

  // 专属主题忽略传入的 mode，强制使用自身明暗
  let effectiveDark: boolean;
  if (LIGHT_ONLY_STYLES.includes(style)) {
    effectiveDark = false;
  } else if (DARK_ONLY_STYLES.includes(style)) {
    effectiveDark = true;
  } else {
    effectiveDark = mode === 'dark';
  }
  const effectiveMode: ThemeMode = effectiveDark ? 'dark' : 'light';

  root.setAttribute('data-theme', effectiveMode);
  root.setAttribute('data-theme-style', style);
  const isDark = effectiveDark;

  // 根据主题风格设置 CSS 变量
  let bgColor: string, textColor: string, cardBg: string, cardBorder: string;
  let hoverBg: string, inputBg: string, btnBg: string;

  if (style === 'minimal') {
    bgColor = '#f8fafc';
    textColor = '#1e293b';
    cardBg = '#ffffff';
    cardBorder = '#e2e8f0';
    hoverBg = 'rgba(0,0,0,0.03)';
    inputBg = '#f8fafc';
    btnBg = '#1e293b';
  } else if (style === 'paper') {
    bgColor = '#f5f0e8';
    textColor = '#3d3226';
    cardBg = '#fffdf7';
    cardBorder = '#d9cec3';
    hoverBg = 'rgba(0,0,0,0.03)';
    inputBg = '#f0ebe0';
    btnBg = '#8b6914';
  } else if (style === 'ocean') {
    bgColor = '#0a1628';
    textColor = '#c8d6e5';
    cardBg = 'rgba(15, 36, 64, 0.85)';
    cardBorder = 'rgba(74, 144, 226, 0.18)';
    hoverBg = 'rgba(74, 144, 226, 0.08)';
    inputBg = 'rgba(15, 36, 64, 0.85)';
    btnBg = '#4a90e2';
  } else if (style === 'cyberpunk') {
    bgColor = '#0a0a0f';
    textColor = '#e0d0ff';
    cardBg = 'rgba(20, 15, 35, 0.92)';
    cardBorder = 'rgba(200, 80, 255, 0.18)';
    hoverBg = 'rgba(200, 80, 255, 0.06)';
    inputBg = 'rgba(20, 15, 35, 0.85)';
    btnBg = '#c850ff';
  } else if (style === 'retro') {
    bgColor = '#0c0c0c';
    textColor = '#33ff33';
    cardBg = '#0c0c0c';
    cardBorder = '#1a4d1a';
    hoverBg = 'rgba(51, 255, 51, 0.05)';
    inputBg = '#0c0c0c';
    btnBg = '#33ff33';
  } else if (style === 'neu') {
    bgColor = '#e8edf2';
    textColor = '#1e293b';
    cardBg = '#e8edf2';
    cardBorder = 'transparent';
    hoverBg = '#dde2e7';
    inputBg = '#e8edf2';
    btnBg = '#e8edf2';
  } else if (style === 'glass') {
    bgColor = isDark ? '#0f172a' : '#f8fafc';
    textColor = isDark ? '#e2e8f0' : '#1e293b';
    cardBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.75)';
    cardBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
    hoverBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
    inputBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.02)';
    btnBg = isDark ? 'rgba(59,130,246,0.25)' : '#3b82f6';
  } else { // tech (default)
    bgColor = isDark ? '#0f172a' : '#f8fafc';
    textColor = isDark ? '#e2e8f0' : '#1e293b';
    cardBg = isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.85)';
    cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    hoverBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
    inputBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.02)';
    btnBg = isDark ? '#3b82f6' : '#3b82f6';
  }

  root.style.setProperty('--bg-color', bgColor);
  root.style.setProperty('--text-color', textColor);
  root.style.setProperty('--card-bg', cardBg);
  root.style.setProperty('--card-border', cardBorder);
  root.style.setProperty('--hover-bg', hoverBg);
  root.style.setProperty('--input-bg', inputBg);
  root.style.setProperty('--color-scheme', isDark ? 'dark' : 'light');

  document.body.style.backgroundColor = bgColor;
  document.body.style.color = textColor;

  localStorage.setItem('quick-dial-is-dark', isDark ? '1' : '0');
  localStorage.setItem('quick-dial-theme-style', style);
}

function isDarkOnlyStyle(): boolean {
  const style = document.documentElement.getAttribute('data-theme-style') as ThemeStyle || 'tech';
  return DARK_ONLY_STYLES.includes(style);
}

export function applyWallpaper(wallpaper: WallpaperConfig): void {
  const root = document.documentElement;
  const { type, value, blur, brightness } = wallpaper;
  const skipAdapt = isDarkOnlyStyle();

  if (type === 'solid') {
    root.style.setProperty('--wallpaper', value);
    root.style.setProperty('--wallpaper-filter', 'none');
    if (!skipAdapt) {
      root.style.setProperty('--bg-color', value);
      adaptTextColor(value);
    }
    // 暗色专属主题：只设 wallpaper 层，不覆盖主题变量
  } else if (type === 'gradient' || value.startsWith('linear-gradient') || value.startsWith('radial-gradient')) {
    root.style.setProperty('--wallpaper', value);
    root.style.setProperty('--wallpaper-filter', 'none');
    if (!skipAdapt) {
      root.style.setProperty('--bg-color', value);
      adaptTextColor(value);
    }
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
    root.style.setProperty('--card-bg', 'rgba(30, 41, 59, 0.85)');
    root.style.setProperty('--card-border', 'rgba(255,255,255,0.08)');
    root.style.setProperty('--hover-bg', 'rgba(255,255,255,0.08)');
    root.style.setProperty('--input-bg', 'rgba(255,255,255,0.08)');
    document.body.style.color = '#e2e8f0';
    localStorage.setItem('quick-dial-is-dark', '1');
  } else {
    root.setAttribute('data-theme', 'light');
    root.style.setProperty('--text-color', '#1e293b');
    root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.85)');
    root.style.setProperty('--card-border', 'rgba(0,0,0,0.06)');
    root.style.setProperty('--hover-bg', 'rgba(0,0,0,0.04)');
    root.style.setProperty('--input-bg', 'rgba(0,0,0,0.02)');
    document.body.style.color = '#1e293b';
    localStorage.setItem('quick-dial-is-dark', '0');
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

export function applyThemeStyle(style: ThemeStyle): void {
  const root = document.documentElement;
  root.setAttribute('data-theme-style', style);
  localStorage.setItem('quick-dial-theme-style', style);
  // 获取当前 dark/light 模式并重新应用完整主题
  const mode = root.getAttribute('data-theme') as ThemeMode || 'dark';
  const primaryColor = root.style.getPropertyValue('--primary-color') || '#3b82f6';
  applyTheme(mode, primaryColor, style);
}

export function getThemeStyleFromStorage(): ThemeStyle {
  const saved = localStorage.getItem('quick-dial-theme-style');
  const valid: ThemeStyle[] = ['tech', 'glass', 'minimal', 'neu', 'paper', 'ocean', 'cyberpunk', 'retro'];
  if (saved && valid.includes(saved as ThemeStyle)) return saved as ThemeStyle;
  return 'tech';
}
