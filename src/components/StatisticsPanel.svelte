<script lang="ts">
  import { t } from '../utils/i18n.svelte';
  import { getClickCounts, getTotalClicks, clearClickCounts, getDailyClicks, getWeekDates, clearDailyClicks } from '../stores/recentSites.svelte';

  interface Props {
    onclose: () => void;
  }

  let { onclose }: Props = $props();

  let overlayEl: HTMLDivElement | undefined = $state();
  let contentEl: HTMLDivElement | undefined = $state();
  let chartCanvas: HTMLCanvasElement | undefined = $state();

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

  // 绘制 7 天柱状图
  $effect(() => {
    const canvas = chartCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const days = getWeekDates();
    const daily = getDailyClicks();
    const vals = days.map(d => daily[d] || 0);
    const maxVal = Math.max(...vals, 1);
    const barW = (w - 20) / days.length - 8;
    const barHMax = h - 30;

    ctx.clearRect(0, 0, w, h);
    days.forEach((d, i) => {
      const barH = (vals[i] / maxVal) * barHMax;
      const x = 10 + i * (barW + 8);
      const y = h - 20 - barH;

      // Bar
      const today = days[days.length - 1];
      ctx.fillStyle = d === today ? '#3b82f6' : 'rgba(59,130,246,0.3)';
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
      ctx.fill();

      // Value on top
      if (vals[i] > 0) {
        ctx.fillStyle = 'var(--text-color, #1e293b)';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(vals[i]), x + barW / 2, y - 4);
      }

      // Date label
      const shortDate = d.slice(5); // MM-DD
      ctx.fillStyle = 'var(--text-color, rgba(30,41,59,0.5))';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(shortDate, x + barW / 2, h - 4);
    });
  });

  function getTopSites(): { url: string; count: number }[] {
    const counts = getClickCounts();
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([url, count]) => ({ url, count }));
  }

  function formatUrl(url: string): string {
    try { return new URL(url).hostname; }
    catch { return url; }
  }

  function exportCSV() {
    const counts = getClickCounts();
    const rows = Object.entries(counts).sort(([,a],[,b]) => b - a);
    let csv = '\uFEFF网站,点击次数\n';
    for (const [url, count] of rows) csv += `"${url}",${count}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `quick-dial-stats-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function getTodayClicks(): number {
    const today = new Date();
    const key = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const daily = getDailyClicks();
    return daily[key] || 0;
  }
</script>

<div class="modal-overlay" bind:this={overlayEl}>
  <div class="modal-content" bind:this={contentEl}>
    <h3 class="modal-title">{t('stats.title')}</h3>

    <div class="stats-summary">
      <div class="stat-item">
        <span class="stat-value">{getTodayClicks()}</span>
        <span class="stat-label">{t('stats.today')}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{getTotalClicks()}</span>
        <span class="stat-label">{t('stats.total')}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{Object.keys(getClickCounts()).length}</span>
        <span class="stat-label">{t('stats.sites')}</span>
      </div>
    </div>

    <!-- 7 天趋势 -->
    <div class="chart-section">
      <h4 class="stats-subtitle">{t('stats.weekly')}</h4>
      <canvas bind:this={chartCanvas} class="chart-canvas"></canvas>
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
      <button class="btn btn-secondary" onclick={() => { clearClickCounts(); clearDailyClicks(); }}>{t('stats.clear')}</button>
      <button class="btn btn-secondary" onclick={onclose}>{t('common.close')}</button>
    </div>
  </div>
</div>

<style>
  .stats-summary {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
  .stat-item {
    flex: 1;
    text-align: center;
    padding: 10px 6px;
    background: var(--hover-bg, rgba(0,0,0,0.04));
    border-radius: 10px;
  }
  .stat-value {
    display: block;
    font-size: 22px;
    font-weight: 700;
    color: var(--primary-color, #3b82f6);
  }
  .stat-label {
    font-size: 11px;
    color: var(--text-color, #1e293b);
    opacity: 0.5;
    margin-top: 2px;
  }
  .chart-section {
    margin-bottom: 16px;
  }
  .chart-canvas {
    width: 100%;
    height: 130px;
    border-radius: 8px;
    background: var(--hover-bg, rgba(0,0,0,0.02));
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
