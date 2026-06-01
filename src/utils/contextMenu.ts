/**
 * 右键菜单集成 — 监听 Chrome context menu 添加的页面
 */
interface ContextAddData {
  title: string;
  url: string;
}

/**
 * 检查并获取右键菜单添加的页面数据（消费后自动清除）
 */
export async function getContextAdd(): Promise<ContextAddData | null> {
  if (typeof chrome === 'undefined' || !chrome.storage) return null;
  try {
    const result = await chrome.storage.local.get('qd-context-add');
    const data = result['qd-context-add'] as ContextAddData | undefined;
    if (data?.url) {
      // 消费后清除，防止重复添加
      await chrome.storage.local.remove('qd-context-add');
      return data;
    }
  } catch { /* 非扩展环境静默 */ }
  return null;
}
