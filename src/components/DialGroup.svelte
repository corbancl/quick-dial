<script lang="ts">
import { t } from '../utils/i18n.svelte';
  import type { DialItem, DialGroup as DialGroupType } from '../types';
  import DialCard from './DialCard.svelte';

  interface Props {
    group: DialGroupType;
    dials: DialItem[];
    onedit: (dial: DialItem) => void;
    ondelete: (id: string) => void;
    onadd: (groupId: string) => void;
    ondragstart: (e: DragEvent, id: string) => void;
    ondragover: (e: DragEvent) => void;
    ondrop: (e: DragEvent, id: string) => void;
    ondragend: () => void;
    ongroupdrop: (e: DragEvent, groupId: string) => void;
    oncontextmenu: (e: MouseEvent, dial: DialItem) => void;
    onkeydown: (e: KeyboardEvent, dial: DialItem) => void;
  }

  let {
    group, dials, onedit, ondelete, onadd,
    ondragstart, ondragover, ondrop, ondragend,
    ongroupdrop, oncontextmenu, onkeydown
  }: Props = $props();

  // svelte-ignore state_referenced_locally
  let isCollapsed = $state(group.isCollapsed);

  function toggleCollapse() {
    isCollapsed = !isCollapsed;
  }

  function handleGroupDrop(e: DragEvent) {
    ongroupdrop(e, group.id);
  }
</script>

<div class="dial-group">
  <div class="group-header">
    <button class="group-toggle" onclick={toggleCollapse} title={isCollapsed ? '展开' : '折叠'} aria-label={isCollapsed ? '展开分组' : '折叠分组'}>
      <span class="chevron" class:collapsed={isCollapsed}>▼</span>
    </button>
    <span class="group-name">{group.name}</span>
    <span class="group-count">{dials.length}</span>
    <div class="group-actions">
      <button class="btn-icon-sm" onclick={() => onadd(group.id)} title="添加到本组" aria-label="添加导航">
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
  </div>

  {#if !isCollapsed}
    <div
      class="group-grid"
      role="list"
      ondragover={(e) => { e.preventDefault(); }}
      ondrop={handleGroupDrop}
    >
      {#each dials as dial (dial.id)}
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div
          class="dial-wrapper"
          role="listitem"
          oncontextmenu={(e) => oncontextmenu(e, dial)}
          onkeydown={(e) => onkeydown(e, dial)}
        >
          <DialCard
            {dial}
            onedit={() => onedit(dial)}
            ondelete={() => ondelete(dial.id)}
            {ondragstart}
            {ondragover}
            {ondrop}
            {ondragend}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .dial-group {
    width: 100%;
  }

  .group-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 4px;
    margin-bottom: 8px;
  }

  .group-toggle {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    color: var(--text-color, #1e293b);
    opacity: 0.4;
    transition: opacity 0.2s;
  }

  .group-toggle:hover {
    opacity: 0.8;
  }

  .chevron {
    display: inline-block;
    font-size: 10px;
    transition: transform 0.2s;
  }

  .chevron.collapsed {
    transform: rotate(-90deg);
  }

  .group-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-color, #1e293b);
    opacity: 0.7;
  }

  .group-count {
    font-size: 12px;
    color: var(--text-color, #1e293b);
    opacity: 0.35;
  }

  .group-actions {
    margin-left: auto;
    display: flex;
    gap: 4px;
  }

  .btn-icon-sm {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: var(--text-color, #1e293b);
    opacity: 0.4;
    cursor: pointer;
    border-radius: 6px;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }

  .btn-icon-sm:hover {
    opacity: 0.8;
    background: var(--hover-bg, rgba(0,0,0,0.04));
  }

  .dial-wrapper {
    width: 100%;
  }

  .group-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: 12px;
    min-height: 40px;
    padding: 4px;
  }

  @media (max-width: 640px) {
    .group-grid {
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 8px;
    }
  }
</style>
