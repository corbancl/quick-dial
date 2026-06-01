<script lang="ts">
import { t } from '../utils/i18n.svelte';
  import { getSettings } from '../stores/settings.svelte';
  import { getDisplaySites } from '../stores/recentSites.svelte';
  import type { RecentSite } from '../types';

  function getSites(): RecentSite[] {
    const settings = getSettings();
    return getDisplaySites(settings.recentSitesCount);
  }

  function handleClick(url: string) {
    window.open(url, '_blank');
  }
</script>

<div class="recent-sites">
  <div class="recent-header">
    <span class="recent-title">{t('recent.title')}</span>
  </div>
  <div class="recent-list">
    {#each getSites() as site, i}
      <button class="recent-item" onclick={() => handleClick(site.url)} title={site.title}>
        <span class="recent-icon"><i class="fa-solid fa-link"></i></span>
        <span class="recent-name">{site.title}</span>
      </button>
    {:else}
      <p class="recent-empty">{t('recent.empty')}记录</p>
    {/each}
  </div>
</div>

<style>
  .recent-sites {
    width: 100%;
    max-width: 800px;
    padding: 16px 0;
  }

  .recent-header {
    margin-bottom: 8px;
  }

  .recent-title {
    font-size: 13px;
    color: var(--text-color, #1e293b);
    opacity: 0.5;
    font-weight: 500;
  }

  .recent-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .recent-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: var(--card-bg, rgba(255,255,255,0.85));
    border: 1px solid var(--card-border, rgba(0,0,0,0.06));
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
    font-size: 13px;
    color: var(--text-color, #1e293b);
    max-width: 160px;
  }

  .recent-item:hover {
    border-color: var(--primary-color, #4f46e5);
    transform: translateY(-1px);
  }

  .recent-icon {
    font-size: 12px;
    opacity: 0.4;
  }

  .recent-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .recent-empty {
    font-size: 13px;
    color: var(--text-color, #1e293b);
    opacity: 0.35;
    padding: 8px 0;
  }
</style>
