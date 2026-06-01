import type { WallpaperConfig } from '../types';
import { DEFAULT_THEME } from '../types';
import { applyWallpaper } from '../utils/theme';
import { setWallpaper as setThemeWallpaper, getWallpaperConfig } from './theme.svelte';

// 壁纸 store 现在委托给 theme store，保持单一数据源
// 此文件保留以兼容现有代码

export function initWallpaper(data: WallpaperConfig | undefined): void {
  const config = data || DEFAULT_THEME.wallpaper;
  applyWallpaper(config);
}

export function getWallpaper(): WallpaperConfig {
  return getWallpaperConfig();
}

export function setWallpaper(config: WallpaperConfig): void {
  setThemeWallpaper(config);
}

export function uploadWallpaper(base64: string): void {
  const config: WallpaperConfig = {
    type: 'image',
    value: base64,
    blur: 0,
    brightness: 100,
  };
  setWallpaper(config);
}

export function setBlur(blur: number): void {
  const current = getWallpaper();
  const config: WallpaperConfig = { ...current, blur };
  setWallpaper(config);
}

export function setBrightness(brightness: number): void {
  const current = getWallpaper();
  const config: WallpaperConfig = { ...current, brightness };
  setWallpaper(config);
}
