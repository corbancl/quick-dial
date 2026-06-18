<script lang="ts">
  import { getSettings, setSearchEngine, setClockStyle, setShowDate, setShowWeekday, setShowRecentSites, setShowTodo, setShowNotes, setShowAI, setShowHoroscope, setZodiacSign, setHideBranding, setRecentSitesCount, setOpenInNewTab, setThemeStyle, setNotesDisplayMode, setTodoDisplayMode, setShowQuote, setQuoteType, setShowPomodoro, setShowCurrency, setShowRss, setLayout } from '../stores/settings.svelte';
  import { getIsPro } from '../stores/subscription.svelte';
  import { getAvailableEngines, getLockedEngines, getAllEngines } from '../utils/search';
  import { checkSubscription } from '../utils/payment';
  import { t, getLang, setLang } from '../utils/i18n.svelte';
  import { modalClose } from '../utils/modalClose';
  import type { ClockStyle, ThemeStyle, NotesDisplayMode, TodoDisplayMode, ZodiacSign, QuoteType } from '../types';
  import { isProTheme, ZODIAC_SIGNS } from '../types';
  import { applyThemeStyle } from '../utils/theme';

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

  function handleThemeStyleChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const style = select.value as ThemeStyle;
    // 免费用户不能选 Pro 主题
    if (isProTheme(style) && !getIsPro()) {
      alert(t('theme.proRequired'));
      select.value = getSettings().themeStyle;
      return;
    }
    setThemeStyle(style);
    applyThemeStyle(style);
  }

  function handleNotesDisplayModeChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const mode = select.value as NotesDisplayMode;
    if (mode === 'colorful' && !getIsPro()) {
      alert(t('note.proRequired'));
      select.value = getSettings().notesDisplayMode;
      return;
    }
    setNotesDisplayMode(mode);
  }

  function handleTodoDisplayModeChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const mode = select.value as TodoDisplayMode;
    if (mode === 'kanban' && !getIsPro()) {
      alert(t('todo.proRequired'));
      select.value = getSettings().todoDisplayMode;
      return;
    }
    setTodoDisplayMode(mode);
  }
</script>

<div class="modal-overlay" use:modalClose={onclose}>
  <div class="modal-content">
    <h3 class="modal-title">{t('settings.title')}</h3>

    <div class="settings-list">
      <!-- UI 主题风格 -->
      <div class="setting-item">
        <label class="setting-label" for="theme-style">{t('settings.theme')}</label>
        <select id="theme-style" class="form-select" value={getSettings().themeStyle} onchange={handleThemeStyleChange}>
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
          <option value="sidebar">{t('layout.sidebar')}</option>
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

      <!-- 显示最近访问 -->
      <div class="setting-item">
        <label class="setting-label" for="show-recent">{t('settings.showRecent')}</label>
        <label class="toggle">
          <input id="show-recent" type="checkbox" checked={getSettings().showRecentSites} onchange={(e) => setShowRecentSites((e.target as HTMLInputElement).checked)} />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <!-- 显示待办清单 -->
      <div class="setting-item">
        <label class="setting-label" for="show-todo">{t('settings.showTodo')}</label>
        <label class="toggle">
          <input id="show-todo" type="checkbox" checked={getSettings().showTodo} onchange={(e) => setShowTodo((e.target as HTMLInputElement).checked)} />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <!-- 待办显示模式 -->
      {#if getSettings().showTodo}
        <div class="setting-item">
          <label class="setting-label" for="todo-mode">{t('todo.mode')}</label>
          <select id="todo-mode" class="form-select" value={getSettings().todoDisplayMode} onchange={handleTodoDisplayModeChange}>
            <option value="list">{t('todo.modeList')}</option>
            <option value="kanban" disabled={!getIsPro()}>{t('todo.modeKanban')}</option>
          </select>
        </div>
      {/if}

      <!-- 显示便签 -->
      <div class="setting-item">
        <label class="setting-label" for="show-notes">{t('settings.showNotes')}</label>
        <label class="toggle">
          <input id="show-notes" type="checkbox" checked={getSettings().showNotes} onchange={(e) => setShowNotes((e.target as HTMLInputElement).checked)} />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <!-- 便签显示模式 -->
      {#if getSettings().showNotes}
        <div class="setting-item">
          <label class="setting-label" for="notes-mode">{t('note.mode')}</label>
          <select id="notes-mode" class="form-select" value={getSettings().notesDisplayMode} onchange={handleNotesDisplayModeChange}>
            <option value="structured">{t('note.modeStructured')}</option>
            <option value="list">{t('note.modeList')}</option>
            <option value="colorful" disabled={!getIsPro()}>{t('note.modeColorful')}</option>
          </select>
        </div>
      {/if}

      <!-- 显示 AI 助手 -->
      <div class="setting-item">
        <label class="setting-label" for="show-ai">{t('settings.showAI')}</label>
        <label class="toggle">
          <input id="show-ai" type="checkbox" checked={getSettings().showAI} onchange={(e) => setShowAI((e.target as HTMLInputElement).checked)} />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <!-- 显示星座运势 -->
      <div class="setting-item">
        <label class="setting-label" for="show-horoscope">{t('horoscope.settings')}</label>
        <label class="toggle">
          <input id="show-horoscope" type="checkbox" checked={getSettings().showHoroscope} onchange={(e) => setShowHoroscope((e.target as HTMLInputElement).checked)} />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <!-- 我的星座 -->
      {#if getSettings().showHoroscope}
        <div class="setting-item">
          <label class="setting-label" for="zodiac-sign">{t('horoscope.zodiac')}</label>
          <select id="zodiac-sign" class="form-select" value={getSettings().zodiacSign} onchange={(e) => setZodiacSign((e.target as HTMLSelectElement).value as ZodiacSign)}>
            {#each ZODIAC_SIGNS as zs}
              <option value={zs.id}>{getLang() === 'zh-CN' ? zs.zh : zs.en}</option>
            {/each}
          </select>
        </div>
      {/if}

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

      <!-- 显示番茄钟 -->
      <div class="setting-item">
        <label class="setting-label" for="show-pomodoro">{t('settings.showPomodoro')}</label>
        <label class="toggle">
          <input id="show-pomodoro" type="checkbox" checked={getSettings().showPomodoro} onchange={(e) => setShowPomodoro((e.target as HTMLInputElement).checked)} />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <!-- 显示汇率换算 -->
      <div class="setting-item">
        <label class="setting-label" for="show-currency">{t('settings.showCurrency')}</label>
        <label class="toggle">
          <input id="show-currency" type="checkbox" checked={getSettings().showCurrency} onchange={(e) => setShowCurrency((e.target as HTMLInputElement).checked)} />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <!-- 显示 RSS 订阅 -->
      <div class="setting-item">
        <label class="setting-label" for="show-rss">{t('settings.showRss')}</label>
        <label class="toggle">
          <input id="show-rss" type="checkbox" checked={getSettings().showRss} onchange={(e) => setShowRss((e.target as HTMLInputElement).checked)} />
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

      <!-- Pro 已激活：订阅信息 + 续费 -->
      {#if getIsPro()}
        <div class="sub-info">
          <div class="sub-plan-name">{pn(subPlan)}</div>
          {#if subExpire}
            <div class="sub-expire">{t('pro.expire')}{subExpire.slice(0, 10)}</div>
          {:else}
            <div class="sub-expire lifetime">{t('settings.lifetime')}</div>
          {/if}
          {#if subPlan !== 'lifetime' && onsubscribe}
            <button class="btn btn-outline btn-renew" onclick={onsubscribe}>{t('pro.renew')}</button>
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
            {t('pro.upgrade')}
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
    flex-shrink: 0;
  }

  /* 带下拉菜单的设置项：label 和 select 同行排列 */
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
