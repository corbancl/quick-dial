<script lang="ts">
  import { t } from '../utils/i18n.svelte';
  import { modalClose } from '../utils/modalClose';
  import {
    getClickCounts, getTotalClicks, clearClickCounts, getDailyClicks,
    getWeekDates, clearDailyClicks, getCategoryClicks, getHourlyClicks
  } from '../stores/recentSites.svelte';

  interface Props {
    onclose: () => void;
  }

  let { onclose }: Props = $props();

  let trendCanvas: HTMLCanvasElement | undefined = $state();
  let hourCanvas: HTMLCanvasElement | undefined = $state();

  // 30 天日期序列
  function getTrendDates(days = 30): string[] {
    const dates: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
    return dates;
  }

  function getTrendValues(): number[] {
    const daily = getDailyClicks();
    return getTrendDates(30).map(d => daily[d] || 0);
  }

  // 绘制 30 天趋势折线
  $effect(() => {
    const canvas = trendCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const vals = getTrendValues();
    const maxVal = Math.max(...vals, 1);
    const padL = 6, padR = 6, padT = 10, padB = 16;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const stepX = plotW / (vals.length - 1 || 1);

    ctx.clearRect(0, 0, w, h);

    // 网格基线
    ctx.strokeStyle = 'rgba(120,130,150,0.15)';
    ctx.lineWidth = 1;
    for (let g = 0; g <= 2; g++) {
      const y = padT + (plotH * g) / 2;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
    }

    // 面积填充
    ctx.beginPath();
    vals.forEach((v, i) => {
      const x = padL + i * stepX;
      const y = padT + plotH - (v / maxVal) * plotH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.lineTo(padL, padT + plotH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
    grad.addColorStop(0, 'rgba(59,130,246,0.28)');
    grad.addColorStop(1, 'rgba(59,130,246,0.02)');
    ctx.fillStyle = grad;
    ctx.fill();

    // 折线
    ctx.beginPath();
    vals.forEach((v, i) => {
      const x = padL + i * stepX;
      const y = padT + plotH - (v / maxVal) * plotH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 末点高亮
    const lastX = padL + plotW;
    const lastY = padT + plotH - (vals[vals.length - 1] / maxVal) * plotH;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
  });

  // 绘制 24 小时时段分布
  $effect(() => {
    const canvas = hourCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const arr = getHourlyClicks();
    const vals = Array.from({ length: 24 }, (_, i) => arr[i] || 0);
    const maxVal = Math.max(...vals, 1);
    const barW = (w - 4) / 24 - 2;
    const barHMax = h - 16;

    ctx.clearRect(0, 0, w, h);
    vals.forEach((v, i) => {
      const barH = (v / maxVal) * barHMax;
      const x = 2 + i * (barW + 2);
      const y = h - 12 - barH;
      // 高亮白天 8-22 时段
      const isDay = i >= 8 && i <= 22;
      ctx.fillStyle = isDay ? 'rgba(59,130,246,0.85)' : 'rgba(59,130,246,0.3)';
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [2, 2, 0, 0]);
      ctx.fill();
      // 整点标注（每 6 小时）
      if (i % 6 === 0) {
        ctx.fillStyle = 'var(--text-color, rgba(30,41,59,0.5))';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(i), x + barW / 2, h - 2);
      }
    });
  });

  function getTopSites(): { url: string; count: number }[] {
    const counts = getClickCounts();
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([url, count]) => ({ url, count }));
  }

  function getTopCategories(): { name: string; count: number }[] {
    const counts = getCategoryClicks();
    const entries = Object.entries(counts).sort(([, a], [, b]) => b - a);
    const max = entries.length ? entries[0][1] : 1;
    return entries.map(([name, count]) => ({ name, count, pct: Math.round((count / max) * 100) }));
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

  const topCats = $derived(getTopCategories());
</script>

<div class="modal-overlay" use:modalClose={onclose}>
  <div class="modal-content">
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
      <div class="stat-item">
        <span class="stat-value">{Object.keys(getCategoryClicks()).length}</span>
        <span class="stat-label">{t('stats.categories')}</span>
      </div>
    </div>

    <!-- 30 天趋势曲线 -->
    <div class="chart-section">
      <h4 class="stats-subtitle">{t('stats.trend')}</h4>
      <canvas bind:this={trendCanvas} class="chart-canvas trend"></canvas>
    </div>

    <!-- 热门分类 -->
    {#if topCats.length > 0}
      <div class="stats-list">
        <h4 class="stats-subtitle">{t('stats.byCategory')}</h4>
        {#each topCats as cat}
          <div class="cat-row">
            <span class="cat-name">{cat.name || t('stats.uncategorized')}</span>
            <span class="cat-bar-wrap">
              <span class="cat-bar" style="width:{cat.pct}%"></span>
            </span>
            <span class="cat-count">{cat.count}</span>
          </div>
        {/each}
      </div>
    {/if}

    <!-- 时段分布 -->
    <div class="chart-section">
      <h4 class="stats-subtitle">{t('stats.byHour')}</h4>
      <canvas bind:this={hourCanvas} class="chart-canvas hour"></canvas>
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
    border-radius: 8px;
    background: var(--hover-bg, rgba(0,0,0,0.02));
  }
  .chart-canvas.trend { height: 150px; }
  .chart-canvas.hour { height: 90px; }
  .stats-list { margin-top: 8px; }
  .stats-subtitle { font-size: 13px; margin-bottom: 8px; opacity: 0.5; }
  .cat-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 0;
    font-size: 13px;
  }
  .cat-name { width: 90px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cat-bar-wrap { flex: 1; height: 8px; background: var(--hover-bg, rgba(0,0,0,0.06)); border-radius: 4px; overflow: hidden; }
  .cat-bar { display: block; height: 100%; background: var(--primary-color, #3b82f6); border-radius: 4px; transition: width .3s; }
  .cat-count { width: 32px; text-align: right; opacity: 0.5; flex-shrink: 0; }
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
