<script lang="ts">
  import { getSettings, setZodiacSign } from '../stores/settings.svelte';
  import { getIsPro } from '../stores/subscription.svelte';
  import { fetchHoroscope, getHoroscopeData, getHoroscopeLoading, getHoroscopeError } from '../stores/horoscope.svelte';
  import { t, getLang } from '../utils/i18n.svelte';
  import type { ZodiacSign, HoroscopeTime } from '../types';
  import { ZODIAC_SIGNS } from '../types';

  const TIMES: { id: HoroscopeTime; key: string; pro: boolean }[] = [
    { id: 'today', key: 'horoscope.today', pro: false },
    { id: 'week',  key: 'horoscope.week',  pro: true },
    { id: 'month', key: 'horoscope.month', pro: true },
    { id: 'year',  key: 'horoscope.year',  pro: true },
  ];

  let activeSign = $state<ZodiacSign>(getSettings().zodiacSign);
  let activeTime = $state<HoroscopeTime>('today');

  function selectSign(sign: ZodiacSign) {
    activeSign = sign;
    setZodiacSign(sign);
    fetchHoroscope(sign, activeTime);
  }

  function selectTime(tt: { id: HoroscopeTime; pro: boolean }) {
    if (tt.pro && !getIsPro()) {
      // 静默忽略，不弹窗
      return;
    }
    activeTime = tt.id;
    fetchHoroscope(activeSign, tt.id);
  }

  // 初始加载
  let loaded = $state(false);
  $effect(() => {
    if (!loaded) {
      loaded = true;
      fetchHoroscope(activeSign, activeTime);
    }
  });

  function fortuneBarLabel(k: string): string {
    const map: Record<string, string> = { all: 'horoscope.overall', health: 'horoscope.health', love: 'horoscope.love', money: 'horoscope.money', work: 'horoscope.work' };
    return t(map[k] || k);
  }

  function pctColor(v: number): string {
    if (v >= 4) return 'var(--horoscope-good, #22c55e)';
    if (v >= 3) return 'var(--horoscope-mid, #eab308)';
    return 'var(--horoscope-bad, #ef4444)';
  }

  function indexPct(s: string): number {
    return parseInt(s) || 0;
  }
</script>

<div class="horoscope-section">
  <!-- 标题栏 -->
  <div class="horo-topbar">
    <span class="horo-title">🔮 {t('horoscope.title')}</span>
    <!-- 时间选择 -->
    <div class="horo-tabs">
      {#each TIMES as tt}
        <button
          class="horo-tab"
          class:active={activeTime === tt.id}
          class:pro-locked={tt.pro && !getIsPro()}
          onclick={() => selectTime(tt)}
          disabled={tt.pro && !getIsPro()}
          title={tt.pro && !getIsPro() ? t('horoscope.proTime') : ''}
        >
          {t(tt.key)}
          {#if tt.pro && !getIsPro()}
            <span class="tab-lock">🔒</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <!-- 星座选择 -->
  <div class="horo-signs">
    {#each ZODIAC_SIGNS as zs}
      <button
        class="horo-sign"
        class:selected={activeSign === zs.id}
        onclick={() => selectSign(zs.id)}
        title={getLang() === 'zh-CN' ? zs.zh : zs.en}
      >
        <span class="sign-emoji">{zs.emoji}</span>
        <span class="sign-name">{getLang() === 'zh-CN' ? zs.zh : zs.en}</span>
      </button>
    {/each}
  </div>

  <!-- 运势卡片 -->
  <div class="horo-card">
    {#if getHoroscopeLoading() && !getHoroscopeData()}
      <div class="horo-loading">{t('horoscope.loading')}</div>
    {:else if getHoroscopeError() && !getHoroscopeData()}
      <div class="horo-error">
        <span>{t('horoscope.error')}</span>
        <button class="horo-retry" onclick={() => fetchHoroscope(activeSign, activeTime)}>{t('horoscope.retry')}</button>
      </div>
    {:else if getHoroscopeData()}
      {@const d = getHoroscopeData()!}
      <!-- 综合评分 -->
      <div class="horo-overall">
        <div class="overall-left">
          <div class="overall-score" style="color: {pctColor(d.fortune.all)}">
            {indexPct(d.index.all)}<span class="overall-pct-sign">%</span>
          </div>
          <div class="overall-type">{d.type}</div>
        </div>
        <div class="overall-right">
          <div class="overall-comment">{d.shortcomment}</div>
          <div class="overall-time">{d.time}</div>
        </div>
      </div>

      <!-- 各项运势条 -->
      <div class="horo-bars">
        {#each ['health', 'love', 'money', 'work'] as k}
          {@const v = d.fortune[k as keyof typeof d.fortune] as number}
          {@const pct = d.index[k as keyof typeof d.index] as string}
          <div class="horo-bar-row">
            <span class="bar-label">{fortuneBarLabel(k)}</span>
            <div class="bar-track">
              <div
                class="bar-fill"
                style="width: {indexPct(pct)}%; background: {pctColor(v)}"
              ></div>
            </div>
            <span class="bar-value" style="color: {pctColor(v)}">{pct}</span>
          </div>
        {/each}
      </div>

      <!-- 幸运信息 -->
      <div class="horo-lucky">
        <span class="lucky-item">🎨 {t('horoscope.luckyColor')}: <strong>{d.luckycolor}</strong></span>
        <span class="lucky-sep">|</span>
        <span class="lucky-item">🔢 {t('horoscope.luckyNumber')}: <strong>{d.luckynumber}</strong></span>
        <span class="lucky-sep">|</span>
        <span class="lucky-item">♑ {t('horoscope.luckyConst')}: <strong>{d.luckyconstellation}</strong></span>
      </div>

      <!-- 宜忌 -->
      <div class="horo-todo">
        <span class="todo-yi">✅ {t('horoscope.yi')} {d.todo.yi}</span>
        <span class="todo-ji">❌ {t('horoscope.ji')} {d.todo.ji}</span>
      </div>

      <!-- 运势全文 -->
      <details class="horo-detail">
        <summary class="horo-summary">{t('horoscope.overall')} — {d.fortunetext.all.slice(0, 40)}...</summary>
        <div class="horo-text">
          <p>{d.fortunetext.all}</p>
        </div>
      </details>
    {/if}
  </div>
</div>

<style>
  .horoscope-section {
    width: 100%;
    margin: 20px auto;
    max-width: 800px;
    padding: 0 24px;
  }

  .horo-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .horo-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-color, #e2e8f0);
    opacity: 0.85;
    white-space: nowrap;
  }

  /* 时间标签 */
  .horo-tabs {
    display: flex;
    gap: 4px;
    background: rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 3px;
  }

  .horo-tab {
    padding: 3px 10px;
    border-radius: 8px;
    font-size: 11px;
    font-family: inherit;
    color: var(--text-color, #e2e8f0);
    opacity: 0.5;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .horo-tab:hover { opacity: 0.8; }
  .horo-tab.active { opacity: 1; background: rgba(59, 130, 246, 0.25); color: #3b82f6; font-weight: 600; }
  .horo-tab.pro-locked { opacity: 0.25; cursor: not-allowed; }
  .horo-tab.pro-locked:hover { opacity: 0.25; }
  .tab-lock { font-size: 9px; margin-left: 1px; }

  /* 星座选择器 */
  .horo-signs {
    display: flex;
    gap: 2px;
    margin-bottom: 12px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.1) transparent;
  }
  .horo-signs::-webkit-scrollbar { height: 4px; }
  .horo-signs::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

  .horo-sign {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    padding: 4px 6px;
    border-radius: 10px;
    background: none;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.15s;
    min-width: 52px;
    font-family: inherit;
    color: var(--text-color, #e2e8f0);
  }

  .horo-sign:hover { background: rgba(255,255,255,0.06); }
  .horo-sign.selected {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.4);
  }

  .sign-emoji { font-size: 18px; line-height: 1; }
  .sign-name { font-size: 9px; opacity: 0.5; white-space: nowrap; }
  .horo-sign.selected .sign-name { opacity: 0.8; }

  /* 运势卡片 */
  .horo-card {
    border: 1px solid var(--card-border, rgba(255,255,255,0.08));
    border-radius: 14px;
    padding: 16px 18px;
    background: var(--card-bg, rgba(30,41,59,0.85));
    transition: all 0.2s;
  }

  .horo-loading, .horo-error {
    text-align: center;
    padding: 20px;
    font-size: 13px;
    color: var(--text-color, #e2e8f0);
    opacity: 0.5;
  }
  .horo-retry {
    margin-left: 8px;
    background: rgba(59,130,246,0.2);
    color: #3b82f6;
    border: none;
    padding: 2px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
  }
  .horo-retry:hover { background: rgba(59,130,246,0.35); }

  /* 综合评分 */
  .horo-overall {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 14px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .overall-left {
    text-align: center;
    min-width: 70px;
  }
  .overall-score {
    font-size: 36px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -1px;
  }
  .overall-pct-sign { font-size: 18px; font-weight: 600; }
  .overall-type {
    font-size: 10px;
    margin-top: 2px;
    opacity: 0.5;
    color: var(--text-color, #e2e8f0);
  }
  .overall-right { flex: 1; min-width: 0; }
  .overall-comment {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-color, #e2e8f0);
    line-height: 1.4;
  }
  .overall-time {
    font-size: 10px;
    opacity: 0.4;
    margin-top: 2px;
    color: var(--text-color, #e2e8f0);
  }

  /* 运势条 */
  .horo-bars {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px 14px;
    margin-bottom: 12px;
  }
  @media (max-width: 640px) {
    .horo-bars { grid-template-columns: 1fr; }
  }

  .horo-bar-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .bar-label {
    font-size: 11px;
    opacity: 0.55;
    min-width: 28px;
    color: var(--text-color, #e2e8f0);
  }
  .bar-track {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: rgba(255,255,255,0.08);
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.4s ease;
  }
  .bar-value {
    font-size: 11px;
    font-weight: 600;
    min-width: 32px;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  /* 幸运信息 */
  .horo-lucky {
    display: flex;
    gap: 6px;
    font-size: 11px;
    opacity: 0.55;
    color: var(--text-color, #e2e8f0);
    margin-bottom: 8px;
    flex-wrap: wrap;
  }
  .lucky-item strong { opacity: 0.9; font-weight: 600; }
  .lucky-sep { opacity: 0.2; }

  /* 宜忌 */
  .horo-todo {
    display: flex;
    gap: 16px;
    font-size: 11px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
  .todo-yi { color: var(--horoscope-good, #22c55e); opacity: 0.8; }
  .todo-ji { color: var(--horoscope-bad, #ef4444); opacity: 0.8; }

  /* 详细运势 */
  .horo-detail { margin-top: 4px; }
  .horo-summary {
    font-size: 11px;
    opacity: 0.45;
    cursor: pointer;
    color: var(--text-color, #e2e8f0);
  }
  .horo-summary:hover { opacity: 0.7; }
  .horo-text {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.6;
    opacity: 0.65;
    color: var(--text-color, #e2e8f0);
    padding: 8px 0;
  }
  .horo-text p { margin: 0; }
</style>
