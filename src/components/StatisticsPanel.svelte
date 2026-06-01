<script lang="ts">
  import { getClickCounts, getTotalClicks, clearClickCounts } from '../stores/recentSites.svelte';

  interface Props {
    onclose: () => void;
  }

  let { onclose }: Props = $props();

  let overlayEl: HTMLDivElement | undefined = $state();
  let contentEl: HTMLDivElement | undefined = $state();

  $effect(() => {
    const o = overlayEl;
    const c = contentEl;
    if (!o) return;
    function handleClick(e: MouseEvent) {
      if (c && !c.contains(e.target as Node)) onclose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onclose();
    }
    o.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      o.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  });

  function getTopSites(): { url: string; count: number }[] {
    const counts = getClickCounts();
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([url, count]) => ({ url, count }));
  }

  function formatUrl(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  function exportCSV() {
    const counts = getClickCounts();
    const rows = Object.entries(counts).sort(([,a],[,b]) => b - a);
    let csv = '网站,点击次数\n';
    for (const [url, count] of rows) {
      csv += `"${url}",${count}\n`;
    }
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'quick-dial-stats-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }
</script>

<div class="modal-overlay" bind:this={overlayEl}>
  <div class="modal-content" bind:this={contentEl}>
    <h3 class="modal-title">{t('stats.title')}</h3>

    <div class="stats-summary">
      <div class="stat-item">
        <span class="stat-value">{getTotalClicks()}</span>
        <span class="stat-label">{t('stats.total')}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{Object.keys(getClickCounts()).length}</span>
        <span class="stat-label">{t('stats.sites')}</span>
      </div>
    </div>

    {#if getTopSites().length > 0}
      <div class="stats-list">
        <h4 class="stats-subtitle">{t('stats.ranking')}</h4>
        {#each getTopSites() as site, i}
          <div class="stats-row">
            <span class="stats-rank">{i + 1}</span>
            <span class="stats-url">{formatUrl(site.url)}</span>
            <span class="stats-count">{site.count} 次</span>
          </div>
        {/each}
      </div>
    {:else}
      <p class="stats-empty">{t('stats.empty')}</p>
    {/if}

    <div class="form-actions">
      <button class="btn btn-secondary" onclick={exportCSV}>{t('stats.export')}</button>
      <button class="btn btn-secondary" onclick={() => { clearClickCounts(); }}>{t('stats.clear')}</button>
      <button class="btn btn-secondary" onclick={onclose}>关闭</button>
    </div>
  </div>
</div>

<style>
  .stats-summary {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
  }
  .stat-item {
    flex: 1;
    text-align: center;
    padding: 12px;
    background: var(--hover-bg, rgba(0,0,0,0.04));
    border-radius: 10px;
  }
  .stat-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--primary-color, #3b82f6);
  }
  .stat-label {
    font-size: 12px;
    color: var(--text-color, #1e293b);
    opacity: 0.5;
  }
  .stats-list { margin-top: 8px; }
  .stats-subtitle { font-size: 13px; margin-bottom: 8px; opacity: 0.5; }
  .stats-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 1px solid var(--card-border, rgba(0,0,0,0.04));
  }
  .stats-rank { width: 20px; font-size: 12px; font-weight: 600; opacity: 0.4; text-align: center; }
  .stats-url { flex: 1; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .stats-count { font-size: 12px; opacity: 0.5; }
  .stats-empty { text-align: center; padding: 20px; opacity: 0.4; font-size: 13px; }
  .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
</style>
