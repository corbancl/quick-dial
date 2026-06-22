<script lang="ts">
import { t } from '../utils/i18n.svelte';
  import type { DialItem } from '../types';
  import { getDialsState, addDial, updateDial, removeDial, addGroup, moveDialToGroup, reorderDials, ensureDefaultGroup } from '../stores/dials.svelte';
  import { tick } from 'svelte';
  import DialGroup from './DialGroup.svelte';
  import AddDialModal from './AddDialModal.svelte';
  import GroupManage from './GroupManage.svelte';

  let showAddModal = $state(false);
  let showGroupManage = $state(false);
  let editingDialId = $state<string | null>(null);
  let addingToGroup = $state<string | null>(null);
  let contextMenu = $state<{ x: number; y: number; dial: DialItem } | null>(null);
  let modalRef: AddDialModal | undefined = $state();

  // 拖拽状态
  let dragId = $state<string | null>(null);

  function handleDragStart(e: DragEvent, id: string) {
    dragId = id;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e: DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragId || dragId === targetId) {
      dragId = null;
      return;
    }
    
    const state = getDialsState();
    const items = state.items;
    const dragIdx = items.findIndex(d => d.id === dragId);
    const targetIdx = items.findIndex(d => d.id === targetId);
    
    if (dragIdx === -1 || targetIdx === -1) {
      dragId = null;
      return;
    }

    // 重新排序
    const newItems = [...items];
    const [moved] = newItems.splice(dragIdx, 1);
    newItems.splice(targetIdx, 0, moved);
    reorderDials(newItems.map(d => d.id));
    dragId = null;
  }

  function handleGroupDrop(e: DragEvent, groupId: string) {
    e.preventDefault();
    if (!dragId) return;
    moveDialToGroup(dragId, groupId);
    dragId = null;
  }

  function handleDragEnd() {
    dragId = null;
  }

  function openAddDial(groupId?: string) {
    addingToGroup = groupId || null;
    editingDialId = null;
    showAddModal = true;
    tick().then(() => modalRef?.resetForm());
  }

  function openEditDial(dial: DialItem) {
    editingDialId = dial.id;
    showAddModal = true;
    tick().then(() => {
      modalRef?.fillEditData({
        title: dial.title,
        url: dial.url,
        icon: dial.icon,
        groupId: dial.groupId,
        bgColor: dial.bgColor,
      });
    });
  }

  function handleSaveDial(data: { title: string; url: string; icon: string; groupId: string; bgColor?: string }) {
    if (editingDialId) {
      updateDial(editingDialId, data);
    } else {
      const gid = data.groupId || ensureDefaultGroup();
      const state = getDialsState();
      addDial({
        title: data.title,
        url: data.url,
        icon: data.icon,
        bgColor: data.bgColor,
        groupId: gid,
        sortOrder: state.items.length,
      });
    }
    showAddModal = false;
    editingDialId = null;
  }

  function handleCancelDial() {
    showAddModal = false;
    editingDialId = null;
    tick().then(() => modalRef?.resetForm());
  }

  function handleDeleteDial(id: string) {
    removeDial(id);
  }

  function handleContextMenu(e: MouseEvent, dial: DialItem) {
    e.preventDefault();
    contextMenu = { x: e.clientX, y: e.clientY, dial };
  }

  function closeContextMenu() {
    contextMenu = null;
  }

  // 键盘快捷键支持
  function handleKeydown(e: KeyboardEvent, dial: DialItem) {
    if (e.key === 'Delete') {
      handleDeleteDial(dial.id);
    } else if (e.key === 'e' || e.key === 'E') {
      openEditDial(dial);
    }
  }

  // 获取按分组排序的数据
  let grouped = $derived.by(() => {
    const state = getDialsState();
    const sortedGroups = [...state.groups].sort((a, b) => a.sortOrder - b.sortOrder);
    return sortedGroups.map(group => ({
      group,
      dials: state.items
        .filter(d => d.groupId === group.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    }));
  });

  // 分组折叠状态（Tab 模式下控制）
  let collapsedGroups = $state(new Set<string>());

  function toggleGroupCollapse(groupId: string) {
    const next = new Set(collapsedGroups);
    if (next.has(groupId)) {
      next.delete(groupId);
    } else {
      next.add(groupId);
    }
    collapsedGroups = next;
  }

  const hasGroups = $derived(grouped.length > 0);
</script>

<svelte:window onkeydown={(e) => {
  if (contextMenu && e.key === 'Escape') closeContextMenu();
}} />

<div class="speed-dial">
  <!-- 水平分组标签栏 -->
  {#if hasGroups}
    <div class="group-tabs" role="tablist" aria-label={t('group.manage')}>
      {#each grouped as { group, dials } (group.id)}
        {@const collapsed = collapsedGroups.has(group.id)}
        <button
          class="group-tab"
          class:collapsed
          role="tab"
          aria-selected={!collapsed}
          onclick={() => toggleGroupCollapse(group.id)}
        >
          <span class="tab-chevron" class:collapsed></span>
          <span class="tab-name">{t(group.name)}</span>
          <span class="tab-count">{dials.length}</span>
        </button>
      {/each}
    </div>
  {/if}

  <!-- 下方内容区 -->
  {#if hasGroups}
    {#each grouped as { group, dials } (group.id)}
      <DialGroup
        {group}
        {dials}
        hideHeader={true}
        forceCollapsed={collapsedGroups.has(group.id)}
        onedit={(dial) => openEditDial(dial)}
        ondelete={(id) => handleDeleteDial(id)}
        onadd={(groupId) => openAddDial(groupId)}
        ondragstart={handleDragStart}
        ondragover={handleDragOver}
        ondrop={handleDrop}
        ondragend={handleDragEnd}
        ongroupdrop={handleGroupDrop}
        oncontextmenu={handleContextMenu}
        onkeydown={handleKeydown}
      />
    {/each}
  {:else}
    <div class="empty-state">
      <div class="empty-icon"><i class="fa-regular fa-rectangle-list"></i></div>
      <p class="empty-text">{t('speedDial.empty')}</p>
      <button class="btn btn-primary" onclick={() => openAddDial()}><i class="fa-solid fa-plus"></i> {t('dial.add')}</button>
    </div>
  {/if}

  <!-- 添加导航按钮 -->
  <div class="add-dial-row">
    <button class="btn btn-secondary" onclick={() => openAddDial()}>
      <i class="fa-solid fa-plus"></i> {t('dial.add')}
    </button>
    <button class="btn btn-secondary" onclick={() => showGroupManage = true}>
      <i class="fa-solid fa-folder-tree"></i> {t('group.manage')}
    </button>
  </div>
</div>

<!-- 右键菜单 -->
{#if contextMenu}
  <div class="context-backdrop" onclick={closeContextMenu} onkeydown={(e) => e.key === 'Escape' && closeContextMenu()} role="button" tabindex="-1"></div>
  <div
    class="context-menu"
    style="left: {contextMenu.x}px; top: {contextMenu.y}px"
    role="menu"
  >
    <button class="context-item" onclick={() => { openEditDial(contextMenu!.dial); closeContextMenu(); }} role="menuitem">
      <i class="fa-solid fa-pen-to-square"></i> {t('speedDial.edit')}
    </button>
    <button class="context-item danger" onclick={() => { handleDeleteDial(contextMenu!.dial.id); closeContextMenu(); }} role="menuitem">
      <i class="fa-solid fa-trash-can"></i> {t('speedDial.delete')}
    </button>
  </div>
{/if}

<!-- 添加/编辑弹窗 -->
<div class="modal-wrapper" class:visible={showAddModal}>
  <AddDialModal bind:this={modalRef} onsave={handleSaveDial} oncancel={handleCancelDial} />
</div>

<!-- 分组管理弹窗 -->
{#if showGroupManage}
  <GroupManage
    oncancel={() => showGroupManage = false}
  />
{/if}

<style>
  .speed-dial {
    width: 100%;
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  :global(html[data-layout="wide"]) .speed-dial {
    max-width: 1280px;
  }
  :global(html[data-layout="sidebar"]) .speed-dial {
    max-width: 100%;
  }

  /* ── 水平分组标签栏 ── */
  .group-tabs {
    display: flex;
    gap: 4px;
    padding: 0 0 8px;
    border-bottom: 1px solid;
    border-color: color-mix(in srgb, var(--text-color, #1e293b) 10%, transparent);
    overflow-x: auto;
    scrollbar-width: none;
  }
  .group-tabs::-webkit-scrollbar { display: none; }

  .group-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--text-color, #1e293b);
    opacity: 0.55;
    cursor: pointer;
    font-size: 13px;
    white-space: nowrap;
    transition: all 0.2s;
    flex-shrink: 0;
    user-select: none;
  }

  .group-tab:hover {
    opacity: 0.8;
    background: var(--hover-bg, rgba(0,0,0,0.04));
  }

  .group-tab:not(.collapsed) {
    opacity: 0.9;
    background: var(--primary-color, #3b82f6);
    background: color-mix(in srgb, var(--primary-color, #3b82f6) 12%, transparent);
    color: var(--primary-color, #3b82f6);
  }

  .tab-chevron {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(45deg);
    transition: transform 0.25s ease;
    margin-top: -2px;
  }

  .tab-chevron.collapsed {
    transform: rotate(-45deg);
    margin-top: 2px;
  }

  .tab-name {
    font-weight: 600;
  }

  .tab-count {
    font-size: 10px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 8px;
    background: var(--hover-bg, rgba(0,0,0,0.06));
    opacity: 0.7;
    line-height: 1.5;
  }

  .group-tab:not(.collapsed) .tab-count {
    opacity: 1;
    background: var(--primary-color, #3b82f6);
    background: color-mix(in srgb, var(--primary-color, #3b82f6) 18%, transparent);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 40px 20px;
    text-align: center;
  }

  .empty-icon {
    font-size: 48px;
    opacity: 0.5;
  }

  .empty-text {
    color: var(--text-color, #1e293b);
    opacity: 0.5;
    font-size: 14px;
  }

  .add-dial-row {
    display: flex;
    justify-content: center;
    gap: 12px;
    padding: 16px 0;
  }

  .context-backdrop {
    position: fixed;
    inset: 0;
    z-index: 999;
  }

  .context-menu {
    position: fixed;
    z-index: 1000;
    background: var(--card-bg, #fff);
    border: 1px solid var(--card-border, rgba(0,0,0,0.08));
    border-radius: 12px;
    padding: 4px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    min-width: 120px;
  }

  .context-item {
    display: block;
    width: 100%;
    padding: 8px 16px;
    border: none;
    background: transparent;
    color: var(--text-color, #1e293b);
    font-size: 13px;
    cursor: pointer;
    border-radius: 8px;
    text-align: left;
    transition: background 0.15s;
  }

  .context-item:hover {
    background: var(--hover-bg, rgba(0,0,0,0.04));
  }

  .context-item.danger {
    color: #ef4444;
  }

  .modal-wrapper {
    display: none;
  }

  .modal-wrapper.visible {
    display: block;
  }
</style>
