<script lang="ts">
import { t } from '../utils/i18n.svelte';
  import { getDialsState, addGroup, updateGroup, removeGroup, reorderGroups, FREE_GROUP_LIMIT } from '../stores/dials.svelte';
  import { getIsPro } from '../stores/subscription.svelte';

  interface Props {
    oncancel: () => void;
  }

  let { oncancel }: Props = $props();

  let overlayEl: HTMLDivElement | undefined = $state();
  let contentEl: HTMLDivElement | undefined = $state();

  $effect(() => {
    const o = overlayEl;
    const c = contentEl;
    if (!o) return;
    function handleClick(e: MouseEvent) {
      if (c && !c.contains(e.target as Node)) oncancel();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') oncancel();
    }
    o.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      o.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  });

  let newGroupName = $state('');
  let limitReached = $state(false);

  function handleAddGroup() {
    const name = newGroupName.trim();
    if (!name) return;
    limitReached = false;
    const result = addGroup(name);
    if (!result) {
      limitReached = true;
      return;
    }
    newGroupName = '';
  }

  function handleRename(id: string, name: string) {
    if (!name.trim()) return;
    updateGroup(id, { name: name.trim() });
  }

  function handleDeleteGroup(id: string) {
    const state = getDialsState();
    const group = state.groups.find(g => g.id === id);
    const dialCount = state.items.filter(d => d.groupId === id).length;
    const msg = group
      ? `${t('common.confirmDelete')}"${t(group.name)}"？${dialCount > 0 ? `${dialCount} 个导航也会被删除。` : ''}`
      : '确定删除该分组？';

    if (confirm(msg)) {
      removeGroup(id);
    }
  }

  let dragGroupId: string | null = null;

  function handleGroupDragStart(e: DragEvent, id: string) {
    dragGroupId = id;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
    }
  }

  function handleGroupDrop(e: DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragGroupId || dragGroupId === targetId) {
      dragGroupId = null;
      return;
    }
    
    const state = getDialsState();
    const ids = state.groups.map(g => g.id);
    const fromIdx = ids.indexOf(dragGroupId);
    const toIdx = ids.indexOf(targetId);
    
    if (fromIdx === -1 || toIdx === -1) {
      dragGroupId = null;
      return;
    }
    
    ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, dragGroupId);
    reorderGroups(ids);
    dragGroupId = null;
  }

  function handleGroupDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  }
</script>

<div class="modal-overlay" bind:this={overlayEl}>
  <div class="modal-content" bind:this={contentEl}>
    <h3 class="modal-title">{t('group.manage')}</h3>

    <!-- 添加新分组 -->
    <div class="add-group-row">
      <input
        class="form-input"
        type="text"
        bind:value={newGroupName}
        placeholder="输入分组名称"
        onkeydown={(e) => { if (e.key === 'Enter') handleAddGroup(); }}
      />
      <button class="btn btn-primary" onclick={handleAddGroup}>{t('group.addBtn')}</button>
    </div>

    <!-- 分组列表 -->
    <div class="group-list">
      {#each getDialsState().groups as group (group.id)}
        <div
          class="group-item"
          role="listitem"
          draggable="true"
          ondragstart={(e) => handleGroupDragStart(e, group.id)}
          ondragover={handleGroupDragOver}
          ondrop={(e) => handleGroupDrop(e, group.id)}
        >
          <span class="drag-handle" title="拖拽排序"><i class="fa-solid fa-grip-vertical"></i></span>
          <input
            class="group-name-input"
            type="text"
            value={group.name}
            onchange={(e) => handleRename(group.id, (e.target as HTMLInputElement).value)}
          />
          <span class="group-item-count">
            {getDialsState().items.filter(d => d.groupId === group.id).length} 项
          </span>
          <button class="btn-icon-sm danger" onclick={() => handleDeleteGroup(group.id)} title="删除分组" aria-label="删除分组">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      {/each}
    </div>

    <!-- 分组上限提示 -->
    {#if limitReached}
      <div class="limit-notice">
        ⚡ 免费版最多 {FREE_GROUP_LIMIT} 个分组，<span class="pro-link">Pro 无限</span>
      </div>
    {/if}

    <!-- 免费用户分组状态 -->
    {#if !getIsPro()}
      <div class="group-cap-info">
        {getDialsState().groups.length} / {FREE_GROUP_LIMIT} 个分组 · <span class="pro-link">{t('pro.title')} 无限</span>
      </div>
    {/if}

    <div class="form-actions">
      <button class="btn btn-secondary" onclick={oncancel}>{t('group.done')}</button>
    </div>
  </div>
</div>

<style>
  .add-group-row {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .add-group-row .form-input {
    flex: 1;
  }

  .group-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 300px;
    overflow-y: auto;
  }

  .group-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: var(--hover-bg, rgba(0,0,0,0.03));
    border-radius: 10px;
    transition: background 0.15s;
    cursor: default;
  }

  .group-item:hover {
    background: var(--hover-bg, rgba(0,0,0,0.06));
  }

  .drag-handle {
    cursor: grab;
    color: var(--text-color, #1e293b);
    opacity: 0.3;
    font-size: 16px;
    user-select: none;
  }

  .group-name-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 14px;
    color: var(--text-color, #1e293b);
    outline: none;
    padding: 2px 4px;
    border-radius: 4px;
  }

  .group-name-input:focus {
    background: var(--card-bg, rgba(255,255,255,0.5));
  }

  .group-item-count {
    font-size: 12px;
    opacity: 0.35;
    color: var(--text-color, #1e293b);
    white-space: nowrap;
  }

  .btn-icon-sm {
    width: 26px;
    height: 26px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: all 0.15s;
    color: var(--text-color, #1e293b);
  }

  .btn-icon-sm:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }

  .limit-notice {
    font-size: 12px;
    color: #ef4444;
    background: rgba(239, 68, 68, 0.08);
    padding: 8px 12px;
    border-radius: 8px;
    margin-top: 8px;
  }

  .group-cap-info {
    font-size: 12px;
    color: var(--text-color, #1e293b);
    opacity: 0.4;
    text-align: center;
    margin-top: 8px;
  }

  .pro-link {
    color: #3b82f6;
    font-weight: 600;
    cursor: default;
  }
</style>
