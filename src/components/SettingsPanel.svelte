<script lang="ts">
  import { getSettings, setSearchEngine, setClockStyle, setShowDate, setShowWeekday, setShowRecentSites, setRecentSitesCount, setOpenInNewTab } from '../stores/settings.svelte';
  import { getIsPro } from '../stores/subscription.svelte';
  import { checkSubscription } from '../utils/payment';
  import { t, getLang, setLang } from '../utils/i18n.svelte';
  import type { ClockStyle } from '../types';

  interface Props {
    onclose: () => void;
    onsubscribe?: () => void;
  }

  let { onclose, onsubscribe }: Props = $props();

  let customCss = $state(localStorage.getItem('quick-dial-custom-css') || '');
  let customCssTimeout: ReturnType<typeof setTimeout> | undefined;

  function handleCustomCssChange(e: Event) {
    customCss = (e.target as HTMLTextAreaElement).value;
    // 防抖保存
    clearTimeout(customCssTimeout);
    customCssTimeout = setTimeout(() => {
      localStorage.setItem('quick-dial-custom-css', customCss);
      applyCustomCss(customCss);
    }, 400);
  }

  function applyCustomCss(css: string) {
    let styleEl = document.getElementById('qd-custom-css') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'qd-custom-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
  }

  // 初始化时应用已保存的自定义 CSS
  $effect(() => {
    applyCustomCss(customCss);
  });

  // 订阅详细信息
  let subPlan = $state('');
  let subExpire = $state('');
  function pn(p: string) {
    return {monthly: t('pro.monthly'), yearly: t('pro.yearly'), lifetime: t('pro.lifetime'), free: 'Free'}[p] || p;
  };

  $effect(() => {
    if (getIsPro()) {
      checkSubscription().then(s => {
        subPlan = s.plan;
        subExpire = s.expireAt || '';
      });
    }
  });

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

  function handleSearchEngineChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    setSearchEngine(select.value);
  }

  function handleClockStyleChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    setClockStyle(select.value as ClockStyle);
  }
</script>

<div class="modal-overlay" bind:this={overlayEl}>
  <div class="modal-content" bind:this={contentEl}>
    <h3 class="modal-title">{t('settings.title')}</h3>

    <div class="settings-list">
      <!-- 主题 -->
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">{t('settings.theme')}</span>
          <span class="setting-hint">{t('settings.themeHint')}</span>
        </div>
      </div>

      <!-- 搜索引擎 -->
      <div class="setting-item">
        <label class="setting-label" for="search-engine">{t('settings.engine')}</label>
        <select id="search-engine" class="form-select" value={getSettings().searchEngine} onchange={handleSearchEngineChange}>
          <option value="google">Google</option>
          <option value="baidu">百度</option>
          <option value="bing">Bing</option>
          <option value="sogou">搜狗</option>
          <option value="so">360搜索</option>
          <option value="zhihu">知乎</option>
        </select>
      </div>

      <!-- 时钟样式 -->
      <div class="setting-item">
        <label class="setting-label" for="clock-style">{t('clock.styles')}</label>
        <select id="clock-style" class="form-select" value={getSettings().clockStyle} onchange={handleClockStyleChange}>
          <option value="digital">{t('clock.digital')}</option>
          <option value="minimal">{t('clock.minimal')}</option>
          <option value="classic">{t('clock.classic')}</option>
          <option value="flip">{t('clock.flip')}</option>
          <option value="neon">{t('clock.neon')}</option>
          <option value="binary">{t('clock.binary')}</option>
        </select>
      </div>

      <!-- 语言 -->
      <div class="setting-item">
        <label class="setting-label" for="lang">Language / 语言</label>
        <select id="lang" class="form-select" value={getLang()} onchange={(e) => { setLang((e.target as HTMLSelectElement).value as 'zh-CN' | 'en'); setTimeout(() => location.reload(), 100); }}>
          <option value="zh-CN">中文</option>
          <option value="en">English</option>
        </select>
      </div>

      <!-- 显示日期 -->
      <div class="setting-item">
        <label class="setting-label" for="show-date">{t('settings.showDate')}</label>
        <label class="toggle">
          <input id="show-date" type="checkbox" checked={getSettings().showDate} onchange={(e) => setShowDate((e.target as HTMLInputElement).checked)} />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <!-- 显示星期 -->
      <div class="setting-item">
        <label class="setting-label" for="show-weekday">{t('settings.showWeekday')}</label>
        <label class="toggle">
          <input id="show-weekday" type="checkbox" checked={getSettings().showWeekday} onchange={(e) => setShowWeekday((e.target as HTMLInputElement).checked)} />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <!-- 显示最近访问 -->
      <div class="setting-item">
        <label class="setting-label" for="show-recent">{t('settings.showRecent')}</label>
        <label class="toggle">
          <input id="show-recent" type="checkbox" checked={getSettings().showRecentSites} onchange={(e) => setShowRecentSites((e.target as HTMLInputElement).checked)} />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <!-- 最近访问数量 -->
      {#if getSettings().showRecentSites}
        <div class="setting-item">
          <label class="setting-label" for="recent-count">{t('settings.recentCount')}</label>
          <input
            id="recent-count"
            class="form-input"
            type="number"
            min="3"
            max="20"
            value={getSettings().recentSitesCount}
            onchange={(e) => setRecentSitesCount(parseInt((e.target as HTMLInputElement).value) || 10)}
            style="width: 80px;"
          />
        </div>
      {/if}

      <!-- 新标签页打开 -->
      <div class="setting-item">
        <label class="setting-label" for="open-new-tab">{t('settings.newTab')}</label>
        <label class="toggle">
          <input id="open-new-tab" type="checkbox" checked={getSettings().openInNewTab} onchange={(e) => setOpenInNewTab((e.target as HTMLInputElement).checked)} />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <!-- 自定义 CSS（独立卡片） -->
    {#if getIsPro()}
      <div class="card-section custom-css-card">
        <div class="card-header">
          <span class="card-icon">🎨</span>
          <span class="card-title">{t('pro.customCss')}</span>
        </div>
        <p class="card-desc">{t('pro.customCssDesc')}</p>
        <textarea id="custom-css" class="custom-css-input"
          rows="6"
          value={customCss}
          oninput={handleCustomCssChange}
          placeholder={t('pro.cssPlaceholder')}
        ></textarea>
      </div>
    {/if}

    <!-- Pro 订阅 -->
    <div class="pro-section">
      <div class="pro-header">
        <span class="pro-title">{t('pro.title')}</span>
        {#if getIsPro()}
          <span class="pro-status active">{t('pro.active')}</span>
        {:else}
          <span class="pro-status">{t('pro.inactive')}</span>
        {/if}
      </div>

      <!-- Pro 已激活：订阅信息 + 续费 -->
      {#if getIsPro()}
        <div class="sub-info">
          <div class="sub-plan-name">{pn(subPlan)}</div>
          {#if subExpire}
            <div class="sub-expire">{t('pro.expire')}{subExpire.slice(0, 10)}</div>
          {:else}
            <div class="sub-expire lifetime">终身有效</div>
          {/if}
          {#if subPlan !== 'lifetime' && onsubscribe}
            <button class="btn btn-outline btn-renew" onclick={onsubscribe}>{t('pro.renew')}</button>
          {/if}
        </div>

        <!-- 自定义底部文案 -->
        <div class="card-section">
          <div class="card-header">
            <span class="card-icon">🏷️</span>
            <span class="card-title">{t('pro.customTitle')}</span>
          </div>
          <p class="card-desc">{t('pro.customTitleDesc')}</p>
          <div class="form-group" style="margin:0 0 12px 0">
            <input class="form-input" id="custom-title" type="text"
              value={localStorage.getItem('quick-dial-custom-title') || ''}
              oninput={(e) => {
                const v = (e.target as HTMLInputElement).value;
                localStorage.setItem('quick-dial-custom-title', v);
                document.title = v || '呲啦起始页 - 极简无广告浏览器新标签页';
              }}
              placeholder={t('pro.customTitleEg')}
              maxlength="50"
            />
          </div>
        </div>

        <!-- 自定义底部文案 -->
        <div class="card-section">
          <div class="card-header">
            <span class="card-icon">✏️</span>
            <span class="card-title">{t('pro.customFooter')}</span>
          </div>
          <p class="card-desc">{t('pro.customFooterDesc')}</p>
          <div class="form-group" style="margin:0">
            <input class="form-input" id="custom-footer" type="text"
              value={localStorage.getItem('quick-dial-custom-footer') || ''}
              oninput={(e) => { localStorage.setItem('quick-dial-custom-footer', (e.target as HTMLInputElement).value); }}
              placeholder={t('pro.customFooterEg')}
              maxlength="40"
            />
          </div>
        </div>
      {:else}
        <div class="pro-features">
          <div class="pro-feature">
            <span class="feature-check">✓</span>
            <span>{t('pro.feature1')}</span>
          </div>
          <div class="pro-feature">
            <span class="feature-check">✓</span>
            <span>云端数据同步</span>
          </div>
          <div class="pro-feature">
            <span class="feature-check">✓</span>
            <span>自定义上传壁纸</span>
          </div>
          <div class="pro-feature">
            <span class="feature-check">✓</span>
            <span>{t('pro.feature4')}</span>
          </div>
        </div>

        <div class="pro-pricing">
          <div class="pricing-option">
            <span class="pricing-price">¥9.9</span>
            <span class="pricing-period">/月</span>
          </div>
          <div class="pricing-option recommended">
            <span class="pricing-badge">推荐</span>
            <span class="pricing-price">¥68</span>
            <span class="pricing-period">/年</span>
          </div>
          <div class="pricing-option">
            <span class="pricing-price">¥198</span>
            <span class="pricing-period">终身</span>
          </div>
        </div>

        {#if onsubscribe}
          <button class="btn btn-primary btn-subscribe" onclick={onsubscribe}>
            ⚡ 升级 Quick Dial Pro
          </button>
        {/if}
      {/if}

    </div>

    <div class="form-actions">
      <button class="btn btn-secondary" onclick={onclose}>{t('common.close')}</button>
    </div>
  </div>
</div>

<style>
  .settings-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--card-border, rgba(0,0,0,0.04));
  }

  .setting-item:last-child {
    border-bottom: none;
  }

  .setting-label {
    font-size: 14px;
    color: var(--text-color, #1e293b);
    margin: 0;
  }

  .setting-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .setting-hint {
    font-size: 12px;
    color: var(--text-color, #1e293b);
    opacity: 0.4;
  }

  /* Toggle Switch */
  .toggle {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    cursor: pointer;
  }

  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.1);
    border-radius: 24px;
    transition: background 0.2s;
  }

  .toggle-slider::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    left: 2px;
    bottom: 2px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .toggle input:checked + .toggle-slider {
    background: var(--primary-color, #4f46e5);
  }

  .toggle input:checked + .toggle-slider::before {
    transform: translateX(20px);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  /* Pro Section */
  .pro-section {
    margin-top: 20px;
    padding: 16px;
    border: 1px solid var(--card-border, rgba(0,0,0,0.08));
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.04), rgba(168, 85, 247, 0.04));
  }

  .pro-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .pro-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-color, #1e293b);
    flex: 1;
  }

  .pro-status {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    background: rgba(0,0,0,0.06);
    color: var(--text-color, #1e293b);
    opacity: 0.5;
  }

  .pro-status.active {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.15));
    color: #3b82f6;
    opacity: 1;
  }

  .pro-features {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
  }

  .pro-feature {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-color, #1e293b);
    opacity: 0.7;
  }

  .feature-check {
    color: #22c55e;
    font-weight: 700;
  }

  .pro-pricing {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
  }

  .pricing-option {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 8px;
    border: 1px solid var(--card-border, rgba(0,0,0,0.08));
    border-radius: 10px;
    background: var(--card-bg, rgba(255,255,255,0.5));
    position: relative;
  }

  .pricing-option.recommended {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.06);
  }

  .pricing-badge {
    position: absolute;
    top: -8px;
    font-size: 10px;
    padding: 1px 8px;
    border-radius: 8px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    font-weight: 600;
  }

  .pricing-price {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-color, #1e293b);
    line-height: 1;
  }

  .pricing-period {
    font-size: 11px;
    color: var(--text-color, #1e293b);
    opacity: 0.5;
    margin-top: 2px;
  }

  /* 自定义 CSS 独立卡片 */
  .card-section {
    border: 1px solid var(--card-border, rgba(0,0,0,0.08));
    border-radius: 14px;
    padding: 18px;
    margin-bottom: 16px;
    background: var(--card-bg, rgba(255,255,255,0.5));
  }
  .card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .card-icon { font-size: 16px; }
  .card-title { font-size: 14px; font-weight: 700; color: var(--text-color); }
  .card-desc { font-size: 12px; color: var(--text-color); opacity: 0.4; margin-bottom: 12px; }

  .custom-css-input {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--card-border, rgba(0,0,0,0.08));
    border-radius: 10px;
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 13px;
    line-height: 1.6;
    background: var(--input-bg, rgba(0,0,0,0.02));
    color: var(--text-color);
    resize: vertical;
    outline: none;
  }
  .custom-css-input:focus { border-color: #3b82f6; }

  /* 订阅信息 */
  .sub-info {
    background: var(--hover-bg, rgba(0,0,0,0.02));
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
  }
  .sub-plan-name { font-size: 16px; font-weight: 700; color: var(--text-color); margin-bottom: 4px; }
  .sub-expire { font-size: 13px; color: var(--text-color); opacity: 0.5; margin-bottom: 10px; }
  .sub-expire.lifetime { color: #a855f7; opacity: 1; font-weight: 600; }
  .btn-renew { font-size: 12px; padding: 8px 16px; }

  .btn-subscribe {
    width: 100%;
    margin-top: 12px;
    padding: 12px;
    font-size: 15px;
    font-weight: 600;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  }
</style>
