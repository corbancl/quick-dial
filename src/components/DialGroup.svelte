<script lang="ts">
import { t } from '../utils/i18n.svelte';
  import type { DialItem, DialGroup as DialGroupType } from '../types';
  import DialCard from './DialCard.svelte';

  interface Props {
    group: DialGroupType;
    dials: DialItem[];
    hideHeader?: boolean;
    forceCollapsed?: boolean;
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
    group, dials, hideHeader = false, forceCollapsed, onedit, ondelete, onadd,
    ondragstart, ondragover, ondrop, ondragend,
    ongroupdrop, oncontextmenu, onkeydown
  }: Props = $props();

  // svelte-ignore state_referenced_locally
  let _isCollapsed = $state(group.isCollapsed);
  let isCollapsed = $derived(forceCollapsed !== undefined ? forceCollapsed : _isCollapsed);

  function toggleCollapse() {
    if (forceCollapsed === undefined) {
      _isCollapsed = !_isCollapsed;
    }
  }

  function handleGroupDrop(e: DragEvent) {
    ongroupdrop(e, group.id);
  }
</script>

<div class="dial-group">
  {#if !hideHeader}
    <div class="group-header">
      <button class="group-toggle" onclick={toggleCollapse} title={isCollapsed ? t('toolbar.expandGroup') : t('toolbar.collapseGroup')} aria-label={isCollapsed ? t('toolbar.expandGroup') : t('toolbar.collapseGroup')}>
        <span class="chevron" class:collapsed={isCollapsed}></span>
      </button>
      <span class="group-name">{t(group.name)}</span>
      <span class="group-count">{dials.length}</span>
      <div class="group-actions">
        <button class="btn-icon-sm" onclick={() => onadd(group.id)} title={t('dial.addToGroup')} aria-label={t('dial.add')}>
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    </div>
  {/if}

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
    padding: 10px 0 10px;
    margin-bottom: 8px;
    border-bottom: 1px solid var(--text-color, #1e293b);
    border-color: color-mix(in srgb, var(--text-color, #1e293b) 8%, transparent);
  }

  .group-toggle {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: var(--text-color, #1e293b);
    opacity: 0.5;
    transition: opacity 0.2s, transform 0.2s;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .group-toggle:hover {
    opacity: 0.9;
    background: var(--hover-bg, rgba(0,0,0,0.06));
  }

  .chevron {
    display: inline-block;
    font-size: 0;
    width: 8px;
    height: 8px;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(45deg);
    transition: transform 0.25s ease;
    margin-top: -2px;
  }

  .chevron.collapsed {
    transform: rotate(-45deg);
    margin-top: 2px;
  }

  .group-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-color, #1e293b);
    opacity: 0.85;
    letter-spacing: 0.01em;
  }

  .group-count {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-color, #1e293b);
    background: var(--hover-bg, rgba(0,0,0,0.05));
    padding: 2px 8px;
    border-radius: 10px;
    opacity: 0.6;
    line-height: 1.4;
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
    opacity: 0.45;
    cursor: pointer;
    border-radius: 6px;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .btn-icon-sm:hover {
    opacity: 0.85;
    background: var(--hover-bg, rgba(0,0,0,0.06));
  }

  .dial-wrapper {
    width: 100%;
  }

  .group-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;
    min-height: 40px;
    padding: 4px;
  }

  @media (max-width: 640px) {
    .group-grid {
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 10px;
    }
  }
</style>
