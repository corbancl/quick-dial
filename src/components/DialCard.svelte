<script lang="ts">
  import type { DialItem } from '../types';
  import { getSettings } from '../stores/settings.svelte';
  import { addRecentSite } from '../stores/recentSites.svelte';

  interface Props {
    dial: DialItem;
    onedit: (dial: DialItem) => void;
    ondelete: (id: string) => void;
    ondragstart: (e: DragEvent, id: string) => void;
    ondragover: (e: DragEvent) => void;
    ondrop: (e: DragEvent, id: string) => void;
    ondragend: () => void;
  }

  let { dial, onedit, ondelete, ondragstart, ondragover, ondrop, ondragend }: Props = $props();

  let iconError = $state(false);

  // 判断图标类型
  function getIconType(icon: string): 'fa' | 'image' | 'emoji' | 'fallback' {
    if (!icon) return 'fallback';
    if (icon.startsWith('fa-')) return 'fa';
    if (icon.startsWith('http')) return 'image';
    return 'emoji';
  }

  const iconType = $derived(getIconType(dial.icon));

  function handleIconError() {
    iconError = true;
  }

  function handleClick() {
    addRecentSite(dial.url, dial.title);
    if (getSettings().openInNewTab) {
      window.open(dial.url, '_blank');
    } else {
      window.location.href = dial.url;
    }
  }

  function handleDragStart(e: DragEvent) {
    ondragstart(e, dial.id);
  }

  function handleDrop(e: DragEvent) {
    ondrop(e, dial.id);
  }

  function getInitial(): string {
    return dial.title.charAt(0).toUpperCase();
  }
</script>

<div
  class="dial-card"
  draggable="true"
  ondragstart={handleDragStart}
  ondragover={ondragover}
  ondrop={handleDrop}
  ondragend={ondragend}
  onclick={handleClick}
  role="button"
  tabindex="0"
  onkeydown={(e) => { if (e.key === 'Enter') handleClick(); }}
>
  <div class="dial-icon">
    {#if iconType === 'fallback'}
      <span class="dial-fallback" style="background: var(--primary-color, #4f46e5)">
        {getInitial()}
      </span>
    {:else if iconType === 'fa'}
      <i class="{dial.icon} dial-fa"></i>
    {:else if iconType === 'image'}
      {#if iconError}
        <span class="dial-fallback" style="background: var(--primary-color, #4f46e5)">
          {getInitial()}
        </span>
      {:else}
        <img src={dial.icon} alt={dial.title} onerror={handleIconError} />
      {/if}
    {:else}
      <span class="dial-emoji">{dial.icon}</span>
    {/if}
  </div>
  <div class="dial-title">{dial.title}</div>
</div>

<style>
  .dial-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 12px 12px;
    background: var(--card-bg, rgba(255,255,255,0.85));
    border: 1px solid var(--card-border, rgba(0,0,0,0.06));
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
    backdrop-filter: blur(8px);
    min-width: 0;
    width: 100%;
  }

  .dial-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    border-color: var(--primary-color, #4f46e5);
  }

  .dial-card:active {
    transform: scale(0.96);
  }

  .dial-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .dial-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .dial-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    font-weight: 600;
    border-radius: 12px;
  }

  .dial-emoji {
    font-size: 28px;
    line-height: 1;
  }

  .dial-fa {
    font-size: 26px;
    color: var(--text-color, #1e293b);
    opacity: 0.7;
  }

  .dial-title {
    font-size: 12px;
    color: var(--text-color, #1e293b);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 80px;
    opacity: 0.8;
  }
</style>
