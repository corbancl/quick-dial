/**
 * 飞牛NAS 应用自动发现
 * 
 * 首次加载时检测是否为飞牛环境，自动导入已安装应用的导航链接。
 * 仅运行一次，由 localStorage 标记控制。
 */
import { addGroup, addDial, getDialsState } from '../stores/dials.svelte';
import { generateId } from '../types';

const FNOS_IMPORTED_KEY = 'quick-dial-fnos-imported';

interface FnosApp {
  name: string;
  port: number;
}

/**
 * 检测并导入飞牛NAS上的应用
 * 应在 initDials 之后、首次渲染之前调用
 * @returns true 表示发现并导入了飞牛应用
 */
export async function discoverFnosApps(): Promise<boolean> {
  // 只运行一次
  if (localStorage.getItem(FNOS_IMPORTED_KEY)) return false;

  try {
    const res = await fetch('/api/apps');
    if (!res.ok) return false;

    const apps: FnosApp[] = await res.json();
    if (!Array.isArray(apps) || apps.length === 0) return false;

    // 标记已完成
    localStorage.setItem(FNOS_IMPORTED_KEY, '1');

    // 创建"飞牛应用"分组
    const state = getDialsState();
    const existingGroup = state.groups.find(g => g.name === '飞牛应用');
    let groupId: string;

    if (existingGroup) {
      groupId = existingGroup.id;
    } else {
      const newGroup = addGroup('飞牛应用');
      if (!newGroup) return false; // 超出免费分组限制
      groupId = newGroup.id;
    }

    // 添加应用卡片
    const host = window.location.hostname;
    for (const app of apps) {
      const url = `http://${host}:${app.port}`;
      // 检查是否已存在相同 URL 的卡片
      const exists = state.items.some(d => d.url === url);
      if (exists) continue;

      addDial({
        title: app.name,
        url,
        groupId,
        icon: '', // 使用默认图标，后续可能从应用自身提取 favicon
        sortOrder: state.items.length,
      });
    }

    return true;
  } catch {
    // 非飞牛环境或网络错误，静默忽略
    return false;
  }
}

/**
 * 重置飞牛导入标记（用于测试或重新导入）
 */
export function resetFnosImport(): void {
  localStorage.removeItem(FNOS_IMPORTED_KEY);
}
