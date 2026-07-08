<script lang="ts">
import { t } from '../utils/i18n.svelte';
  import { getShortcuts } from '../utils/keyboard';

  interface Props {
    onclose: () => void;
  }

  let { onclose }: Props = $props();

  let overlayEl: HTMLDivElement | undefined = $state();
  let contentEl: HTMLDivElement | undefined = $state();
  const shortcuts = getShortcuts();

  $effect(() => {
    const o = overlayEl;
    const c = contentEl;
    if (!o) return;
    function handleClick(e: MouseEvent) {
      if (c && !c.contains(e.target as Node)) onclose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === '?') onclose();
    }
    o.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      o.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  });
</script>

<div class="modal-overlay" bind:this={overlayEl}>
  <div class="modal-content" bind:this={contentEl}>
    <h3 class="modal-title">⌨️ {t('help.title')}</h3>
    <div class="shortcut-list">
      {#each shortcuts as s}
        <div class="shortcut-row">
          <kbd class="shortcut-key">{s.key}</kbd>
          <span class="shortcut-desc">{t(s.description)}</span>
        </div>
      {/each}
    </div>
    <p class="help-tip">{t('help.tip')}</p>
  </div>
</div>

<style>
  .shortcut-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
  .shortcut-row { display: flex; align-items: center; gap: 12px; }
  .shortcut-key {
    display: inline-block;
    padding: 4px 10px;
    font-size: 12px;
    font-family: monospace;
    font-weight: 600;
    background: var(--hover-bg, rgba(0,0,0,0.04));
    border: 1px solid var(--card-border);
    border-radius: 6px;
    color: var(--text-color);
    min-width: 120px;
    text-align: center;
  }
  .shortcut-desc { font-size: 14px; color: var(--text-color); opacity: 0.7; }
  .help-tip { text-align: center; font-size: 12px; opacity: 0.35; margin-top: 8px; }
</style>
