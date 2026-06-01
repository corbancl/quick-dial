import type { ThemeConfig, ThemeMode, WallpaperConfig } from '../types';
import { DEFAULT_THEME } from '../types';
import { applyTheme, applyWallpaper } from '../utils/theme';

let theme = $state<ThemeConfig>({ ...DEFAULT_THEME });
let userChoseWallpaper = $state(false);

function isDefaultWallpaper(wp: WallpaperConfig): boolean {
  const d = DEFAULT_THEME.wallpaper;
  return wp.type === d.type && wp.value === d.value;
}

export function initTheme(data: ThemeConfig | undefined): void {
  theme = { ...DEFAULT_THEME, ...data };
  userChoseWallpaper = data?.wallpaper ? !isDefaultWallpaper(data.wallpaper) : false;

  applyTheme(theme.mode, theme.primaryColor);
  applyAdaptiveWallpaper(theme.mode);
}

export function getTheme(): ThemeConfig {
  return {
    mode: theme.mode,
    primaryColor: theme.primaryColor,
    wallpaper: { ...theme.wallpaper }
  };
}

export function setThemeMode(mode: ThemeMode): void {
  theme.mode = mode;
  applyTheme(mode, theme.primaryColor);
  applyAdaptiveWallpaper(mode);
}

/** 自适应壁纸：默认壁纸跟随暗/亮模式，用户自选壁纸不干预 */
function applyAdaptiveWallpaper(mode: ThemeMode) {
  if (!userChoseWallpaper && theme.wallpaper.type === 'solid') {
    const v = mode === 'dark' ? '#0f172a' : '#f8fafc';
    applyWallpaper({ type: 'solid', value: v, blur: 0, brightness: 100 });
  } else {
    applyWallpaper(theme.wallpaper);
  }
}

export function setPrimaryColor(color: string): void {
  theme.primaryColor = color;
  applyTheme(theme.mode, color);
}

export function setWallpaper(wallpaper: WallpaperConfig): void {
  theme.wallpaper = { ...wallpaper };
  userChoseWallpaper = true;
  applyWallpaper(wallpaper);
}

export function getWallpaperConfig(): WallpaperConfig {
  return { ...theme.wallpaper };
}
