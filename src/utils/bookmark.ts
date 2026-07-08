export interface BookmarkItem {
  title: string;
  url: string;
}

export interface BookmarkGroup {
  name: string;
  items: BookmarkItem[];
}

/**
 * 解析浏览器导出的书签 HTML，按文件夹分组
 */
export function parseBookmarkGroups(html: string): BookmarkGroup[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const groups: BookmarkGroup[] = [];
  const seen = new Set<string>();

  // 遍历所有 DT 节点
  const dtNodes = doc.querySelectorAll('dt');
  let currentGroup: BookmarkGroup = { name: '默认收藏', items: [] };

  dtNodes.forEach(dt => {
    const h3 = dt.querySelector(':scope > h3');
    const a = dt.querySelector(':scope > a[href]');

    if (h3) {
      // 新文件夹
      const name = h3.textContent?.trim() || '未命名';
      // 保存上一个分组（如果有内容）
      if (currentGroup.items.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = { name, items: [] };
    } else if (a) {
      const url = a.getAttribute('href')?.trim() || '';
      const title = a.textContent?.trim() || '';
      if (!url || url.startsWith('javascript:') || url.startsWith('about:')) return;
      if (!title) return;
      const key = url.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      currentGroup.items.push({ title, url });
    }
  });

  // 最后一个分组
  if (currentGroup.items.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}
