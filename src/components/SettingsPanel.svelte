<script lang="ts">
  import { getSettings, setSearchEngine, setClockStyle, setShowDate, setShowWeekday, setShowWeather, setShowLunar, setShowRecentSites, setShowAI, setHideBranding, setRecentSitesCount, setOpenInNewTab, setThemeStyle, setShowQuote, setQuoteType, setShowRss, setLayout } from '../stores/settings.svelte';
  import { getIsPro } from '../stores/subscription.svelte';
  import { getAvailableEngines, getLockedEngines, getAllEngines } from '../utils/search';
  import { t, getLang, setLang } from '../utils/i18n.svelte';
  import type { ClockStyle, ThemeStyle, QuoteType } from '../types';
  import { isProTheme } from '../types';
  import { applyThemeStyle } from '../utils/theme';

  interface Props {
    onclose: () => void;
  }

  let { onclose }: Props = $props();

  let closing = $state(false);

  function handleClose() {
    if (closing) return;
    closing = true;
    setTimeout(() => onclose(), 250);
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') handleClose();
  }

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

  // 订阅详细信息（从 syncProStatus 获取）
  let subPlan = $state('');
  let subExpire = $state('');

  // 简易计划名映射
  function pn(p: string) {
    return {monthly: t('pro.monthly'), yearly: t('pro.yearly'), lifetime: t('pro.lifetime')}[p] || p;
  };

  $effect(() => {
    if (getIsPro()) {
      // 从后端同步订阅详情（plan + expireAt）
      const token = localStorage.getItem('quick-dial-token');
      if (token) {
        fetch('https://sync.ruseo.cn/api/pay.php?action=status', {
          headers: { 'Authorization': `Bearer ${token}` },
        }).then(r => r.json()).then(result => {
          if (result.code === 200 && result.data) {
            subPlan = result.data.plan || '';
            subExpire = result.data.expire_at || '';
          }
        }).catch(() => {});
      }
    }
  });

  function handleSearchEngineChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const engine = getAllEngines().find(en => en.id === select.value);
    if (!engine) return;
    if (!getIsPro() && engine.proOnly) return;
    setSearchEngine(select.value);
  }

  function handleClockStyleChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    setClockStyle(select.value as ClockStyle);
  }

  // 从 DOM 读取实际主题（比 getSettings() 快照更可靠）
  let currentThemeStyle = $state(document.documentElement.getAttribute('data-theme-style') as ThemeStyle || getSettings().themeStyle || 'tech');

  function handleThemeStyleChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const style = select.value as ThemeStyle;
    // 免费用户不能选 Pro 主题
    if (isProTheme(style) && !getIsPro()) {
      alert(t('theme.proRequired'));
      select.value = currentThemeStyle;
      return;
    }
    currentThemeStyle = style;
    setThemeStyle(style);
    applyThemeStyle(style);
  }

</script>

<svelte:window onkeydown={handleKey} />
<div class="modal-overlay" class:closing onclick={handleClose} onkeydown={(e) => { if (e.key === 'Enter') handleClose(); }} role="dialog" tabindex="-1">
  <div class="modal-panel" class:closing onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="document">
    <div class="modal-header">
      <h3 class="modal-title">{t('settings.title')}</h3>
      <button class="modal-close" onclick={handleClose} aria-label="关闭">✕</button>
    </div>
    <div class="modal-body">

    <div class="settings-list">
      <!-- UI 主题风格 -->
      <div class="setting-item">
        <label class="setting-label" for="theme-style">{t('settings.theme')}</label>
        <select id="theme-style" class="form-select" value={currentThemeStyle} onchange={handleThemeStyleChange}>
          <option value="tech">{t('theme.tech')}</option>
          <option value="minimal">{t('theme.minimal')}</option>
          <option value="paper">{t('theme.paper')}</option>
          <option value="ocean">{t('theme.ocean')}</option>
          <option value="glass" disabled={!getIsPro()}>{t('theme.glass')}</option>
          <option value="neu" disabled={!getIsPro()}>{t('theme.neu')}</option>
          <option value="cyberpunk" disabled={!getIsPro()}>{t('theme.cyberpunk')}</option>
          <option value="retro" disabled={!getIsPro()}>{t('theme.retro')}</option>
        </select>
      </div>

      <!-- 页面布局 -->
      <div class="setting-item">
        <label class="setting-label" for="layout-mode">{t('layout.title')}</label>
        <select id="layout-mode" class="form-select" value={getSettings().layout} onchange={(e) => setLayout((e.target as HTMLSelectElement).value as any)}>
          <option value="centered">{t('layout.centered')}</option>
          <option value="wide">{t('layout.wide')}</option>
        </select>
      </div>

      <!-- 搜索引擎 -->
      <div class="setting-item">
        <label class="setting-label" for="search-engine">{t('settings.engine')}</label>
        <select id="search-engine" class="form-select" value={getSettings().searchEngine} onchange={handleSearchEngineChange}>
          {#each getAvailableEngines() as engine}
            <option value={engine.id}>
              {engine.name}{engine.isCustom ? ' ★' : ''}
            </option>
          {/each}
          {#each getLockedEngines() as engine}
            <option value={engine.id} disabled>🔒 {engine.name} (PRO)</option>
          {/each}
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

      <!-- 显示天气 -->
      <div class="setting-item">
        <label class="setting-label" for="show-weather">{t('settings.showWeather')}</label>
        <label class="toggle">
          <input id="show-weather" type="checkbox" checked={getSettings().showWeather} onchange={(e) => setShowWeather((e.target as HTMLInputElement).checked)} />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <!-- 显示农历 -->
      <div class="setting-item">
        <label class="setting-label" for="show-lunar">{t('settings.showLunar')}</label>
        <label class="toggle">
          <input id="show-lunar" type="checkbox" checked={getSettings().showLunar} onchange={(e) => setShowLunar((e.target as HTMLInputElement).checked)} />
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

      <!-- 显示 AI 助手 -->
      <div class="setting-item">
        <label class="setting-label" for="show-ai">{t('settings.showAI')}</label>
        <label class="toggle">
          <input id="show-ai" type="checkbox" checked={getSettings().showAI} onchange={(e) => setShowAI((e.target as HTMLInputElement).checked)} />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <!-- 显示每日一言 -->
      <div class="setting-item">
        <label class="setting-label" for="show-quote">{t('quote.settings')}</label>
        <label class="toggle">
          <input id="show-quote" type="checkbox" checked={getSettings().showQuote} onchange={(e) => setShowQuote((e.target as HTMLInputElement).checked)} />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <!-- 一言类型 -->
      {#if getSettings().showQuote}
        <div class="setting-item">
          <label class="setting-label" for="quote-type">{t('quote.type')}</label>
          <select id="quote-type" class="form-select" value={getSettings().quoteType} onchange={(e) => setQuoteType((e.target as HTMLSelectElement).value as QuoteType)}>
            <option value="hitokoto">{t('quote.hitokoto')}</option>
            <option value="qinggan">{t('quote.qinggan')}</option>
            <option value="love">{t('quote.love')}</option>
            <option value="saylove">{t('quote.saylove')}</option>
            <option value="dog">{t('quote.dog')}</option>
            <option value="wanan">{t('quote.wanan')}</option>
            <option value="zaoan">{t('quote.zaoan')}</option>
            <option value="saohua">{t('quote.saohua')}</option>
            <option value="poison_soup">{t('quote.poison_soup')}</option>
          </select>
        </div>
      {/if}

      <!-- RSS 订阅 (Pro) -->
      <div class="setting-item">
        <label class="setting-label" for="show-rss">
          {t('settings.showRss')}
          {#if !getIsPro()}<span class="pro-lock">🔒 PRO</span>{/if}
        </label>
        <label class="toggle">
          <input id="show-rss" type="checkbox" disabled={!getIsPro()} checked={getSettings().showRss} onchange={(e) => setShowRss((e.target as HTMLInputElement).checked)} />
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

    <!-- 自定义 CSS(独立卡片) -->
    {#if getIsPro()}
      <div class="card-section custom-css-card">
        <div class="card-header">
          <span class="card-icon"></span>
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

      <!-- Pro 已激活:订阅信息 + 续费 -->
      {#if getIsPro()}
        <div class="sub-info">
          <div class="sub-plan-name">{pn(subPlan)}</div>
          {#if subExpire}
            <div class="sub-expire">{t('pro.expire')}{subExpire.slice(0, 10)}</div>
          {:else}
            <div class="sub-expire lifetime">{t('settings.lifetime')}</div>
          {/if}
          {#if subPlan !== 'lifetime'}
            <a class="btn btn-outline btn-renew" href="https://www.cilacila.cn/account" target="_blank" rel="noopener">{t('pro.renew')}</a>
          {/if}
        </div>

        <!-- 自定义底部文案 -->
        <div class="card-section">
          <div class="card-header">
            <span class="card-icon"></span>
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
            <span class="card-icon"></span>
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

        <!-- 隐藏品牌名 -->
        <div class="setting-item">
          <label class="setting-label" for="hide-branding">
            {t('pro.hideBranding')}
          </label>
          <label class="toggle">
            <input id="hide-branding" type="checkbox" checked={getSettings().hideBranding} onchange={(e) => setHideBranding((e.target as HTMLInputElement).checked)} />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <p class="card-desc" style="margin-top:4px">{t('pro.hideBrandingDesc')}</p>
      {:else}
        <div class="pro-features">
          <div class="pro-feature">
            <span class="feature-check">✓</span>
            <span>{t('pro.feature1')}</span>
          </div>
          <div class="pro-feature">
            <span class="feature-check">✓</span>
            <span>{t('pro.featureSync')}</span>
          </div>
          <div class="pro-feature">
            <span class="feature-check">✓</span>
            <span>{t('pro.featureWallpaper')}</span>
          </div>
          <div class="pro-feature">
            <span class="feature-check">✓</span>
            <span>{t('pro.feature4')}</span>
          </div>
        </div>

        <div class="pro-cta">
          <p class="pro-cta-text">{t('pro.guideText')}</p>
          <a class="btn btn-primary btn-website" href="https://www.cilacila.cn/account" target="_blank" rel="noopener">
            {t('pro.guideBtn')}
          </a>
        </div>
      {/if}

    </div>

    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0);
    transition: background 0.3s;
  }
  .modal-overlay:not(.closing) {
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(4px);
  }
  .modal-panel {
    position: relative;
    width: 480px;
    max-width: 95vw;
    max-height: 85vh;
    background: var(--bg-color, #0f172a);
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: modalIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) both;
  }
  .modal-panel.closing {
    animation: modalOut 0.25s ease-in forwards;
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes modalOut {
    from { opacity: 1; transform: scale(1) translateY(0); }
    to { opacity: 0; transform: scale(0.95) translateY(10px); }
  }
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--card-border, rgba(255,255,255,0.06));
    flex-shrink: 0;
  }
  .modal-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--text-color);
    margin: 0;
  }
  .modal-close {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid var(--card-border, rgba(255,255,255,0.1));
    background: transparent;
    color: var(--text-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 18px;
    transition: background 0.2s, color 0.2s;
    opacity: 0.6;
  }
  .modal-close:hover {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    opacity: 1;
  }
  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px 24px;
  }
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
    flex-shrink: 0;
  }

  /* 带下拉菜单的设置项:label 和 select 同行排列 */
  .setting-item:has(select.form-select) {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 12px;
  }
  .setting-item:has(select.form-select) .form-select {
    width: auto;
    min-width: 0;
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

  .pro-lock {
    font-size: 10px;
    font-weight: 700;
    color: #a855f7;
    margin-left: 6px;
    letter-spacing: 0.5px;
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

  .pro-cta {
    margin-top: 14px;
    text-align: center;
  }

  .pro-cta-text {
    font-size: 12px;
    color: var(--text-color, #1e293b);
    opacity: 0.5;
    margin-bottom: 10px;
  }

  .btn-website {
    display: inline-block;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: #fff;
    border-radius: 10px;
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .btn-website:hover {
    opacity: 0.9;
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

  

  @media (max-width: 640px) {
    .modal-panel {
      width: 95vw;
      max-height: 90vh;
    }
    .modal-header {
      padding: 16px 16px 12px;
    }
    .modal-body {
      padding: 16px;
    }
  }
</style>
