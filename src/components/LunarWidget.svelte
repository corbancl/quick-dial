<script lang="ts">
  import { fetchLunar, type LunarData } from '../utils/weather';

  let { expanded = false, ontoggle = () => {}, compact = false }: { expanded?: boolean; ontoggle?: () => void; compact?: boolean } = $props();

  let lunar = $state<LunarData | null>(null);
  let loading = $state(true);

  $effect(() => {
    fetchLunar().then(data => {
      lunar = data;
      loading = false;
    });
  });

  function getHolidayName(): string {
    if (!lunar?.holiday?.today || lunar.holiday.today.length === 0) return '';
    return lunar.holiday.today.map((h: any) => h.name || h).join(' · ');
  }

  function getSolarTermName(): string {
    if (!lunar?.solar_term?.current) return '';
    return normalizeSolarTerm(lunar.solar_term.current);
  }

  function getNextSolarTerm(): string {
    if (!lunar?.solar_term?.next) return '';
    const date = lunar.solar_term.next_date;
    const name = normalizeSolarTerm(lunar.solar_term.next);
    return `${name} (${date})`;
  }

  // 节气英文标识转中文
  function normalizeSolarTerm(term: string): string {
    const termMap: Record<string, string> = {
      'XIAO_HAN': '小寒',
      'DA_HAN': '大寒',
      'LI_CHUN': '立春',
      'YU_SHUI': '雨水',
      'JING_ZHE': '惊蛰',
      'CHUN_FEN': '春分',
      'QING_MING': '清明',
      'GU_YU': '谷雨',
      'LI_XIA': '立夏',
      'XIAO_MAN': '小满',
      'MANG_ZHONG': '芒种',
      'XIA_ZHI': '夏至',
      'XIAO_SHU': '小暑',
      'DA_SHU': '大暑',
      'LI_QIU': '立秋',
      'CHU_SHU': '处暑',
      'BAI_LU': '白露',
      'QIU_FEN': '秋分',
      'HAN_LU': '寒露',
      'SHUANG_JIANG': '霜降',
      'LI_DONG': '立冬',
      'XIAO_XUE': '小雪',
      'DA_XUE': '大雪',
      'DONG_ZHI': '冬至',
      // 已是中文的直接返回
      '小寒': '小寒',
      '大寒': '大寒',
      '立春': '立春',
      '雨水': '雨水',
      '惊蛰': '惊蛰',
      '春分': '春分',
      '清明': '清明',
      '谷雨': '谷雨',
      '立夏': '立夏',
      '小满': '小满',
      '芒种': '芒种',
      '夏至': '夏至',
      '小暑': '小暑',
      '大暑': '大暑',
      '立秋': '立秋',
      '处暑': '处暑',
      '白露': '白露',
      '秋分': '秋分',
      '寒露': '寒露',
      '霜降': '霜降',
      '立冬': '立冬',
      '小雪': '小雪',
      '大雪': '大雪',
      '冬至': '冬至',
    };
    return termMap[term] || term;
  }
</script>

{#if loading}
  <div class="lunar-widget loading">
    <div class="lunar-skeleton"></div>
  </div>
{:else if lunar}
  <div class="lunar-widget" class:compact onclick={ontoggle} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && ontoggle()}>
    <div class="lunar-main">
      <!-- 农历日期 -->
      <div class="lunar-date">{compact ? lunar.lunar.formatted.replace(/^.*?年/, '') : lunar.lunar.formatted}</div>

      {#if !compact}
      <!-- 中国年（折叠模式下显示） -->
      <div class="lunar-year-chinese">{lunar.lunar.year_chinese}</div>
      
      <!-- 干支 / 生肖 -->
      <div class="lunar-ganzhi">
        <span class="ganzhi-item">{lunar.lunar.year_ganzhi}年</span>
        <span class="ganzhi-item">({lunar.lunar.year_shengxiao})</span>
      </div>
      
      <!-- 节日或节气 -->
      {#if getHolidayName()}
        <div class="lunar-special holiday">
          <i class="fa-solid fa-cake-candles"></i>
          <span>{getHolidayName()}</span>
        </div>
      {:else if getSolarTermName()}
        <div class="lunar-special solar-term">
          <i class="fa-solid fa-leaf"></i>
          <span>{getSolarTermName()}</span>
        </div>
      {:else if lunar.solar_term?.next}
        <div class="lunar-special next-term">
          <i class="fa-regular fa-calendar"></i>
          <span>{getNextSolarTerm()}</span>
        </div>
      {/if}
      {/if}
    </div>

    {#if expanded && !compact}
      <div class="lunar-detail">
        <!-- 今日宜忌 -->
        {#if lunar.almanac.yi.length > 0}
          <div class="almanac-row">
            <span class="almanac-label yi">宜</span>
            <span class="almanac-value">{lunar.almanac.yi.slice(0, 5).join(' · ')}</span>
          </div>
        {/if}
        {#if lunar.almanac.ji.length > 0}
          <div class="almanac-row">
            <span class="almanac-label ji">忌</span>
            <span class="almanac-value">{lunar.almanac.ji.slice(0, 5).join(' · ')}</span>
          </div>
        {/if}
        
        <!-- 方位 -->
        <div class="almanac-row">
          <span class="almanac-label">财神</span>
          <span class="almanac-value">{lunar.almanac.cai_shen}方</span>
        </div>
        <div class="almanac-row">
          <span class="almanac-label">喜神</span>
          <span class="almanac-value">{lunar.almanac.xi_shen}方</span>
        </div>
        <div class="almanac-row">
          <span class="almanac-label">福神</span>
          <span class="almanac-value">{lunar.almanac.fu_shen}方</span>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .lunar-widget {
    background: var(--card-bg, rgba(255,255,255,0.85));
    border: 1px solid var(--card-border, rgba(0,0,0,0.06));
    border-radius: 16px;
    padding: 10px 16px;
    backdrop-filter: blur(8px);
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
    min-width: 180px;
  }

  .lunar-widget:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .lunar-widget.loading {
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lunar-widget.compact {
    background: none;
    border: none;
    border-radius: 0;
    padding: 0;
    backdrop-filter: none;
    box-shadow: none;
  }
  .lunar-widget.compact:hover {
    transform: none;
  }
  .lunar-widget.compact .lunar-main {
    gap: 0;
  }
  .lunar-widget.compact .lunar-date {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.2;
  }

  .lunar-skeleton {
    width: 100%;
    height: 40px;
    background: linear-gradient(90deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.05) 75%);
    background-size: 200% 100%;
    animation: skeleton 1.5s ease-in-out infinite;
    border-radius: 8px;
  }

  @keyframes skeleton {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .lunar-main {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .lunar-date {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-color, #1e293b);
  }

  .lunar-ganzhi {
    display: flex;
    gap: 8px;
    font-size: 12px;
    color: var(--text-color, #1e293b);
    opacity: 0.6;
  }

  .lunar-year-chinese {
    display: none;
  }

  .ganzhi-item {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .lunar-special {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    margin-top: 4px;
    padding: 4px 8px;
    border-radius: 6px;
    background: rgba(79, 70, 229, 0.08);
    color: var(--primary-color, #4f46e5);
  }

  .lunar-special.holiday {
    background: rgba(239, 68, 68, 0.08);
    color: #ef4444;
  }

  .lunar-special.solar-term {
    background: rgba(34, 197, 94, 0.08);
    color: #16a34a;
  }

  .lunar-special.next-term {
    background: rgba(0,0,0,0.04);
    color: var(--text-color, #1e293b);
    opacity: 0.7;
  }

  .lunar-special i {
    font-size: 12px;
  }

  .lunar-detail {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--card-border, rgba(0,0,0,0.06));
    display: flex;
    flex-direction: column;
    gap: 6px;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .almanac-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }

  .almanac-label {
    font-weight: 600;
    color: var(--text-color, #1e293b);
    opacity: 0.5;
    min-width: 24px;
  }

  .almanac-label.yi {
    color: #16a34a;
    opacity: 1;
  }

  .almanac-label.ji {
    color: #ef4444;
    opacity: 1;
  }

  .almanac-value {
    color: var(--text-color, #1e293b);
    opacity: 0.7;
  }

  @media (max-width: 640px) {
    .lunar-widget {
      padding: 8px 12px;
      min-width: 150px;
    }

    .lunar-date {
      font-size: 14px;
    }

    .lunar-ganzhi {
      font-size: 11px;
    }

    .lunar-special {
      font-size: 12px;
    }
  }
</style>
