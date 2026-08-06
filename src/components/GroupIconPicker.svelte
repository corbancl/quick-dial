<script lang="ts">
  import { t } from '../utils/i18n.svelte';
  import { GROUP_ICON_IDS } from '../utils/groupIcons';
  import GroupIcon from './GroupIcon.svelte';

  interface Props {
    value: string;
    onselect: (icon: string) => void;
    onclose: () => void;
  }
  let { value, onselect, onclose }: Props = $props();

  let customUrl = $state('');

  const faIcons = [
    'fa-solid fa-star', 'fa-solid fa-briefcase', 'fa-solid fa-pencil', 'fa-solid fa-gamepad',
    'fa-solid fa-house', 'fa-solid fa-bolt', 'fa-solid fa-heart', 'fa-solid fa-book',
    'fa-solid fa-music', 'fa-solid fa-code', 'fa-solid fa-image', 'fa-solid fa-film',
    'fa-solid fa-cart-shopping', 'fa-solid fa-cloud', 'fa-solid fa-fire', 'fa-solid fa-globe',
    'fa-solid fa-comment', 'fa-solid fa-envelope', 'fa-solid fa-calendar', 'fa-solid fa-chart-line',
    'fa-solid fa-screwdriver-wrench', 'fa-solid fa-link', 'fa-brands fa-github', 'fa-brands fa-youtube',
  ];

  function pick(v: string) { onselect(v); onclose(); }
</script>

<div class="icon-picker-overlay" onclick={(e) => { e.stopPropagation(); onclose(); }} onkeydown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); onclose(); } }} role="button" tabindex="-1">
  <div class="icon-picker" onclick={(e) => e.stopPropagation()} role="dialog" aria-label="选择分组图标" tabindex="-1">
    <div class="ip-head">
      <span>{t('group.iconTitle') || '选择分组图标'}</span>
      <button class="ip-close" onclick={onclose} aria-label="关闭">✕</button>
    </div>

    <div class="ip-section">
      <div class="ip-label">内置图标</div>
      <div class="ip-grid">
        {#each GROUP_ICON_IDS as id}
          <button class="ip-cell" class:selected={value === id} onclick={() => pick(id)} title={id}>
            <GroupIcon icon={id} size={22} />
          </button>
        {/each}
      </div>
    </div>

    <div class="ip-section">
      <div class="ip-label">Font Awesome</div>
      <div class="ip-grid">
        {#each faIcons as cls}
          <button class="ip-cell" class:selected={value === cls} aria-label={cls} onclick={() => pick(cls)}>
            <i class={cls}></i>
          </button>
        {/each}
      </div>
    </div>

    <div class="ip-section">
      <div class="ip-label">自定义图片链接</div>
      <div class="ip-url-row">
        <input class="form-input" type="text" placeholder="https://.../icon.png" bind:value={customUrl}
          onkeydown={(e) => { if (e.key === 'Enter' && customUrl.trim()) pick(customUrl.trim()); }} />
        <button class="btn btn-primary" onclick={() => { if (customUrl.trim()) pick(customUrl.trim()); }}>使用</button>
      </div>
    </div>
  </div>
</div>

<style>
  .icon-picker-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: grid; place-items: center; z-index: 1000; }
  .icon-picker { width: min(440px, 92vw); max-height: 80vh; overflow-y: auto; background: var(--card-bg, #fff); border-radius: 16px; padding: 16px; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
  .ip-head { display: flex; justify-content: space-between; align-items: center; font-weight: 700; margin-bottom: 12px; }
  .ip-close { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-color, #333); }
  .ip-section { margin-bottom: 14px; }
  .ip-label { font-size: 12px; opacity: .7; margin-bottom: 8px; }
  .ip-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; }
  .ip-cell { aspect-ratio: 1; display: grid; place-items: center; border: 1px solid color-mix(in srgb, var(--text-color, #333) 12%, transparent); border-radius: 10px; background: transparent; color: var(--text-color, #333); cursor: pointer; font-size: 18px; transition: all .15s; }
  .ip-cell:hover { border-color: var(--primary-color); }
  .ip-cell.selected { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 14%, transparent); color: var(--primary-color); }
  .ip-url-row { display: flex; gap: 8px; }
  .ip-url-row .form-input { flex: 1; }
</style>
