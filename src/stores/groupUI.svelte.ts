// 分组 UI 共享状态：让 SpeedDial 的分组折叠/高亮联动。
// 用普通对象 + $state 实现跨组件响应式（避免 Set 代理坑）。

export const groupUI = $state({
  collapsed: {} as Record<string, boolean>,
  activeGroupId: null as string | null,
});

export function isGroupCollapsed(id: string): boolean {
  return !!groupUI.collapsed[id];
}

export function toggleGroupCollapse(id: string): void {
  groupUI.collapsed[id] = !groupUI.collapsed[id];
}

export function getActiveGroup(): string | null {
  return groupUI.activeGroupId;
}

export function setActiveGroup(id: string | null): void {
  groupUI.activeGroupId = id;
}
