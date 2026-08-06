// 自建极简线性 SVG 分组图标集（24x24 viewBox, stroke 描边风格）
// 值为 <path> 的 d 属性；GroupIcon 组件负责包裹 <svg>。
// 风格统一：无填充、currentColor 描边，自动适配明暗主题。

export const GROUP_ICONS: Record<string, string> = {
  star: 'M12 2l2.5 6.5L21 9l-5 4.5L17.5 21 12 17l-5.5 4L8 13.5 3 9l6.5-.5z',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  briefcase: 'M3 7h18v13H3zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  pencil: 'M12 19l7-7-4-4-7 7v4zM18 8l2 2',
  gamepad: 'M5 11h14a2 2 0 0 1 2 2v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a2 2 0 0 1 2-2zM8 12h.01M14 12h.01M6 9l2 2M16 9l2 2',
  home: 'M3 10.5L12 3l9 7.5M5 9.5V21h14V9.5',
  bolt: 'M13 2L4 14h6l-1 8 9-12h-6z',
  heart: 'M12 21s-7-4.5-9.5-9C1 9 2.5 5 6 5c2 0 3 1 4 2 1-1 2-2 4-2 3.5 0 5 4 3.5 7-2.5 4.5-9.5 9-9.5 9z',
  book: 'M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2zM4 5v14',
  music: 'M9 18V5l10-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM19 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  code: 'M8 8l-4 4 4 4M16 8l4 4-4 4',
  image: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6',
  video: 'M3 6h13v12H3zM16 10l5-3v10l-5-3z',
  shopping: 'M6 6h12l-1 13H7zM9 6a3 3 0 0 1 6 0',
  cloud: 'M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.5A3.5 3.5 0 0 1 18 18z',
  flame: 'M12 22c4 0 7-3 7-7 0-4-3-6-3-10-3 2-4 4-4 7-2-1-3-3-3-6-3 4-1 9-3 16z',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18',
  chat: 'M4 5h16v11H9l-4 4v-4H4z',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  calendar: 'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  tool: 'M14 6l4 4-7 7-4-4zM3 21l4-1 1-4-3-3-3 3z',
  link: 'M9 15l6-6M10 7l1-1a4 4 0 0 1 6 6l-1 1M14 17l-1 1a4 4 0 0 1-6-6l1-1',
  heart2: 'M12 21s-7-4.5-9.5-9C1 9 2.5 5 6 5c2 0 3 1 4 2 1-1 2-2 4-2 3.5 0 5 4 3.5 7-2.5 4.5-9.5 9-9.5 9z',
};

export const DEFAULT_GROUP_ICON = 'star';

export const GROUP_ICON_IDS: string[] = Object.keys(GROUP_ICONS);
