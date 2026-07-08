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
  const IMG_EXT = /\.(png|jpg|jpeg|gif|svg|ico|webp|bmp)(\?|$)/i;
  function getIconType(icon: string): 'fa' | 'image' | 'emoji' | 'fallback' {
    if (!icon) return 'fallback';
    if (icon.startsWith('fa-')) return 'fa';
    if (icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('.')) return 'image';
    // 纯文件名（如 "icon.png"）也当作图片
    if (IMG_EXT.test(icon)) return 'image';
    return 'emoji';
  }

  const iconType = $derived(getIconType(dial.icon));

  function handleIconError() {
    iconError = true;
  }

  function handleClick() {
    addRecentSite(dial.url, dial.title);
    if (getSettings().openInNewTab) {
      window.open(dial.url, '_blank', 'noopener,noreferrer');
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
  style={dial.bgColor ? `--dial-bg: ${dial.bgColor}` : ''}
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
    gap: 10px;
    padding: 20px 16px 16px;
    background: var(--dial-bg, var(--card-bg, rgba(255,255,255,0.85)));
    border: 1px solid var(--card-border, rgba(0,0,0,0.06));
    border-radius: 18px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
    backdrop-filter: blur(12px);
    min-width: 0;
    width: 100%;
    position: relative;
  }

  .dial-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 18px;
    background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.06), transparent 70%);
    pointer-events: none;
  }

  .dial-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 36px rgba(0,0,0,0.1), 0 0 0 1px var(--primary-color, #3b82f6) inset;
    border-color: var(--primary-color, #3b82f6);
  }

  .dial-card:active {
    transform: scale(0.97);
  }

  .dial-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    overflow: hidden;
    flex-shrink: 0;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .dial-card:hover .dial-icon {
    transform: scale(1.08);
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
    font-size: 24px;
    font-weight: 600;
    border-radius: 14px;
  }

  .dial-emoji {
    font-size: 32px;
    line-height: 1;
  }

  .dial-fa {
    font-size: 30px;
    color: var(--text-color, #1e293b);
    opacity: 0.7;
  }

  .dial-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-color, #1e293b);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100px;
    opacity: 0.85;
  }
</style>
