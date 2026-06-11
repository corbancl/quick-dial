<script lang="ts">
  import './app.css';
  import './themes.css';
  import SearchBox from './components/SearchBox.svelte';
  import ClockWidget from './components/ClockWidget.svelte';
  import WeatherWidget from './components/WeatherWidget.svelte';
  import LunarWidget from './components/LunarWidget.svelte';
  import SpeedDial from './components/SpeedDial.svelte';
  import RecentSites from './components/RecentSites.svelte';
  import WallpaperPicker from './components/WallpaperPicker.svelte';
  import ImportExport from './components/ImportExport.svelte';
  import SettingsPanel from './components/SettingsPanel.svelte';
  import AddDialModal from './components/AddDialModal.svelte';
  import StatisticsPanel from './components/StatisticsPanel.svelte';
  import SyncPanel from './components/SyncPanel.svelte';
  import SubscribePanel from './components/SubscribePanel.svelte';
  import HelpPanel from './components/HelpPanel.svelte';
  import OnboardingGuide from './components/OnboardingGuide.svelte';
  import TodoWidget from './components/TodoWidget.svelte';
  import NotesWidget from './components/NotesWidget.svelte';
  import HoroscopeWidget from './components/HoroscopeWidget.svelte';
  import QuoteWidget from './components/QuoteWidget.svelte';
  import AIWidget from './components/AIWidget.svelte';
  import PomodoroWidget from './components/PomodoroWidget.svelte';
  import CurrencyWidget from './components/CurrencyWidget.svelte';

  import { initDials, getDialsState, ensureDefaultGroup, addDial } from './stores/dials.svelte';
  import { initTheme, getTheme } from './stores/theme.svelte';
  import { initSettings, getSettings, setSearchEngine } from './stores/settings.svelte';
  import { initRecentSites, getRecentSites } from './stores/recentSites.svelte';
  import { initTodos, getTodos } from './stores/todos.svelte';
  import { initNotes, getNotes } from './stores/notes.svelte';
  import { initChat, getChatMessages, getChatConfig } from './stores/chat.svelte';
  import { initQuote } from './stores/quote.svelte';
  import { initCurrency } from './stores/currency.svelte';
  import { getIsPro, syncProStatus, getAuthToken } from './stores/subscription.svelte';
  import { getWallpaper, setWallpaper } from './stores/wallpaper.svelte';
  import { fetchRandomWallpaper } from './utils/weather';
  import { isLoggedIn } from './utils/sync';
  import { checkSubscription } from './utils/payment';
  import { showToast } from './utils/toast.svelte';
  import { checkStorageSupport, loadData, saveData } from './utils/storage';
  import { registerShortcut, focusSearch } from './utils/keyboard';
  import { getToasts, dismissToast } from './utils/toast.svelte';
  import { getContextAdd } from './utils/contextMenu';
import { t, getLang } from './utils/i18n.svelte';
  import type { AppData } from './types';

  const VERSION = __VERSION__;
  const pg = $derived(getLang() === 'zh-CN' ? '' : 'en-');

  let showWallpaperPicker = $state(false);
  let showImportExport = $state(false);
  let showSettings = $state(false);
  let showStats = $state(false);
  let showSync = $state(false);
  let showSubscribe = $state(false);
  let showHelp = $state(false);
  let showAI = $state(false);
  let showAddDial = $state(false);
  let addDialPrefill = $state({ title: '', url: '' });
  let customFooter = $state(localStorage.getItem('quick-dial-custom-footer') || '');
  let cardExpanded = $state(false);
  let activeTab = $state('dials');

  // 轮询右键菜单添加（扩展环境）
  $effect(() => {
    const interval = setInterval(async () => {
      const data = await getContextAdd();
      if (data) {
        addDialPrefill = { title: data.title, url: data.url };
        showAddDial = true;
      }
    }, 500);
    return () => clearInterval(interval);
  });

  // 定时切换壁纸
  $effect(() => {
    const s = getSettings();
    if (!s.wallpaperAutoSwitch || !getIsPro()) return;
    const ms = s.wallpaperSwitchInterval === 'hourly' ? 3_600_000 : 86_400_000;
    const interval = setInterval(async () => {
      const url = await fetchRandomWallpaper();
      if (url) setWallpaper({ type: 'image', value: url, blur: getWallpaper().blur, brightness: getWallpaper().brightness });
    }, ms);
    return () => clearInterval(interval);
  });

  // Pro 过期提醒
  let proDaysLeft = $state(parseInt(localStorage.getItem('quick-dial-pro-days') || '0'));
  let proExpiryChecked = $state(false);
  $effect(() => {
    if (proExpiryChecked || !getIsPro() || !isLoggedIn()) return;
    proxied: {
      checkSubscription().then(s => {
        proExpiryChecked = true;
        if (!s.expireAt) return; // 终身
        const daysLeft = Math.ceil((new Date(s.expireAt).getTime() - Date.now()) / 86400000);
        if (daysLeft < 0) return; // 已过期
        if (daysLeft <= 7) {
          proDaysLeft = daysLeft;
          localStorage.setItem('quick-dial-pro-days', String(daysLeft));
          showToast(t('pro.expireTip', { days: String(daysLeft) }), daysLeft <= 3 ? 'error' : 'info', 6000);
        }
      });
    }
  });

  // 每次加载或登录时从服务器同步 Pro 状态，同步完成后的状态决定是否 Pro
  // cleanupProFeatures() 由 syncProStatus() 内部在检测到 Pro 被取消时自动调用
  $effect(() => {
    const token = getAuthToken();
    if (!token) return;
    syncProStatus();
  });

  // 初始化
  if (!checkStorageSupport()) {
    alert('您的浏览器不支持本地存储，部分功能可能无法使用。');
  }

  const saved = loadData<AppData>();
  if (saved && saved.version) {
    initDials({ dials: saved.dials || [], groups: saved.groups || [] });
    initTheme(saved.theme);
    initSettings(saved.settings);
    initRecentSites(saved.recentSites || []);
    initTodos(saved.todos || []);
    initNotes(saved.notes || []);
    initChat({ messages: saved.chatMessages, config: saved.chatConfig });
    initQuote();
    initCurrency();
  } else {
    // 首次使用，创建默认分组和示例导航
    const defaultGroupId = ensureDefaultGroup();

    // 常用分组 - 21个热门网站
    const fav = (domain: string) => `https://sync.ruseo.cn/api/favicon.php?domain=${domain}`;
    const commonItems: Array<{ title: string; url: string; icon: string }> = [
      { title: '百度', url: 'https://www.baidu.com/', icon: fav('baidu.com') },
      { title: '哔哩哔哩', url: 'https://www.bilibili.com/', icon: fav('bilibili.com') },
      { title: 'GitHub', url: 'https://github.com/', icon: fav('github.com') },
      { title: '淘宝', url: 'https://www.taobao.com/?pid=mm_14822724_24216217_80956897', icon: 'https://img.alicdn.com/tps/i3/T1OjaVFl4dXXa.JOZB-114-114.png' },
      { title: '京东', url: 'https://www.jd.com/', icon: fav('jd.com') },
      { title: '微博', url: 'https://weibo.com/', icon: fav('weibo.com') },
      { title: '知乎', url: 'https://www.zhihu.com/', icon: fav('zhihu.com') },
      { title: 'QQ邮箱', url: 'https://mail.qq.com/', icon: fav('mail.qq.com') },
      { title: '百度地图', url: 'https://map.baidu.com/', icon: fav('map.baidu.com') },
      { title: '网易云音乐', url: 'https://music.163.com/', icon: fav('music.163.com') },
      { title: '抖音', url: 'https://www.douyin.com/', icon: fav('douyin.com') },
      { title: '腾讯视频', url: 'https://v.qq.com/', icon: fav('v.qq.com') },
      { title: '豆瓣', url: 'https://www.douban.com/', icon: fav('douban.com') },
      { title: '微信公众平台', url: 'https://mp.weixin.qq.com/', icon: fav('mp.weixin.qq.com') },
      { title: 'Gitee', url: 'https://gitee.com/', icon: fav('gitee.com') },
      { title: '掘金', url: 'https://juejin.cn/', icon: fav('juejin.cn') },
      { title: '腾讯文档', url: 'https://docs.qq.com/', icon: fav('docs.qq.com') },
      { title: '爱奇艺', url: 'https://www.iqiyi.com/', icon: fav('iqiyi.com') },
      { title: 'CSDN', url: 'https://www.csdn.net/', icon: fav('csdn.net') },
      { title: '百度翻译', url: 'https://fanyi.baidu.com/', icon: fav('fanyi.baidu.com') },
      { title: '搜狗', url: 'https://www.sogou.com/', icon: fav('sogou.com') },
      { title: '呲啦官网', url: 'https://www.cilacila.cn/', icon: fav('www.cilacila.cn') },
      { title: '呲啦起始页', url: 'https://cilacila.cn/', icon: fav('cilacila.cn') },
      { title: '澄曜API Hub', url: 'https://api.ruseo.cn/', icon: 'https://api.ruseo.cn/apple-touch-icon.png' },
      { title: '瑞索工具网', url: 'https://ruseo.cn/', icon: 'https://ruseo.cn/static/images/logo.png' },
      { title: '计数器API', url: 'https://js.ruseo.cn/', icon: 'counter-api.png' },
    ];
    commonItems.forEach((item, i) => {
      addDial({ title: item.title, url: item.url, icon: item.icon, groupId: defaultGroupId, sortOrder: i });
    });
  }

  // 键盘快捷键
  // 保存右键菜单添加的导航
  function handleDialSave(data: { title: string; url: string; icon: string; groupId: string }) {
    addDial({
      title: data.title,
      url: data.url,
      icon: data.icon,
      groupId: data.groupId || ensureDefaultGroup(),
      sortOrder: getDialsState().items.length,
    });
    showAddDial = false;
    addDialPrefill = { title: '', url: '' };
  }

  registerShortcut('k', focusSearch, 'shortcut.search', { ctrl: true });
  registerShortcut(',', () => showSettings = !showSettings, 'shortcut.settings', { ctrl: true });
  registerShortcut('b', () => showWallpaperPicker = !showWallpaperPicker, 'shortcut.wallpaper', { ctrl: true, shift: true });
  registerShortcut('s', () => showSync = !showSync, 'shortcut.sync', { ctrl: true, shift: true });
  registerShortcut('?', () => showHelp = !showHelp, 'shortcut.help', {});

  // 使用 $derived 创建稳定的数据引用，避免无限循环
  const appData = $derived((): AppData => {
    const dialsState = getDialsState();
    const theme = getTheme();
    const settings = getSettings();
    const recentSites = getRecentSites();
    const todos = getTodos();
    const notes = getNotes();
    const chatMessages = getChatMessages();
    const chatConfig = getChatConfig();
    
    return {
      version: 1,
      dials: dialsState.items,
      groups: dialsState.groups,
      searchEngines: [],
      theme: {
        mode: theme.mode,
        primaryColor: theme.primaryColor,
        wallpaper: theme.wallpaper
      },
      settings: settings,
      recentSites: recentSites,
      todos: todos,
      notes: notes,
      chatMessages: chatMessages,
      chatConfig: chatConfig,
      customCss: localStorage.getItem('quick-dial-custom-css') || '',
    };
  });

  // 防抖保存，避免频繁写入
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;
  
  $effect(() => {
    // 触发依赖追踪
    const data = appData();
    
    // 清除之前的定时器
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    // 防抖 300ms 后保存
    saveTimeout = setTimeout(() => {
      saveData(data);
      saveTimeout = null;
    }, 300);
  });
</script>

<OnboardingGuide oncomplete={() => {
  // 引导页完成后，根据用户选择的语言设置默认搜索引擎
  setSearchEngine(getLang() === 'zh-CN' ? 'baidu' : 'google');
}} />

<div class="app-container">
  <div class="app-header">
    <ClockWidget />
    <div class="header-widgets">
      <WeatherWidget expanded={cardExpanded} ontoggle={() => cardExpanded = !cardExpanded} />
      <LunarWidget expanded={cardExpanded} ontoggle={() => cardExpanded = !cardExpanded} />
    </div>
  </div>

  <SearchBox />

  {#if getSettings().showQuote}
    <QuoteWidget />
  {/if}

  <!-- Tab 导航栏 -->
  {#if getSettings().showHoroscope || getSettings().showTodo || getSettings().showNotes || getSettings().showPomodoro || getSettings().showCurrency}
    <div class="tab-bar">
      <button class="tab-btn" class:active={activeTab === 'dials'} onclick={() => activeTab = 'dials'}>
        {t('tab.dials')}
      </button>
      {#if getSettings().showHoroscope}
        <button class="tab-btn" class:active={activeTab === 'horoscope'} onclick={() => activeTab = 'horoscope'}>
          {t('horoscope.title')}
        </button>
      {/if}
      {#if getSettings().showTodo}
        <button class="tab-btn" class:active={activeTab === 'todo'} onclick={() => activeTab = 'todo'}>
          {t('todo.title')}
        </button>
      {/if}
      {#if getSettings().showNotes}
        <button class="tab-btn" class:active={activeTab === 'notes'} onclick={() => activeTab = 'notes'}>
          {t('note.title')}
        </button>
      {/if}
      {#if getSettings().showPomodoro}
        <button class="tab-btn" class:active={activeTab === 'pomodoro'} onclick={() => activeTab = 'pomodoro'}>
          {t('pomodoro.title')}
        </button>
      {/if}
      {#if getSettings().showCurrency}
        <button class="tab-btn" class:active={activeTab === 'currency'} onclick={() => activeTab = 'currency'}>
          {t('currency.title')}
        </button>
      {/if}
    </div>
  {/if}

  <!-- Tab 内容区 -->
  {#if activeTab === 'dials' || (!getSettings().showHoroscope && !getSettings().showTodo && !getSettings().showNotes && !getSettings().showPomodoro && !getSettings().showCurrency)}
    <SpeedDial />
  {:else if activeTab === 'horoscope'}
    <HoroscopeWidget />
  {:else if activeTab === 'todo'}
    <TodoWidget />
  {:else if activeTab === 'notes'}
    <NotesWidget />
  {:else if activeTab === 'pomodoro'}
    <PomodoroWidget />
  {:else if activeTab === 'currency'}
    <CurrencyWidget />
  {/if}

  {#if getSettings().showRecentSites}
    <RecentSites />
  {/if}

  <!-- 底部工具栏 -->
  <div class="toolbar">
    <button class="btn-icon" onclick={() => showWallpaperPicker = true} title={t('toolbar.wallpaper')}>
      <i class="fa-solid fa-image"></i>
    </button>
    <button class="btn-icon" onclick={() => showImportExport = true} title={t('toolbar.ie')}>
      <i class="fa-solid fa-folder-open"></i>
    </button>
    <button class="btn-icon" onclick={() => showStats = true} title={t('toolbar.stats')}>
      <i class="fa-solid fa-chart-simple"></i>
    </button>
    <button class="btn-icon" onclick={() => showSync = true} title={t('toolbar.sync')}>
      <i class="fa-solid fa-cloud-arrow-up"></i>
    </button>
    {#if !getIsPro()}
      <button class="btn-icon btn-upgrade" onclick={() => showSubscribe = true} title={t('toolbar.upgrade')}>
        <i class="fa-solid fa-crown"></i>
      </button>
    {/if}
    <button class="btn-icon" onclick={() => showSettings = true} title={t('toolbar.settings')}>
      <i class="fa-solid fa-gear"></i>
    </button>
    <button class="btn-icon" onclick={() => showHelp = !showHelp} title={t('toolbar.help')}>
      <i class="fa-solid fa-question"></i>
    </button>
    {#if getSettings().showAI}
      <button class="btn-icon btn-ai" onclick={() => showAI = !showAI} title={t('ai.title')}>
        <i class="fa-solid fa-robot"></i>
      </button>
    {/if}
  </div>

  <!-- Toast 通知 -->
  {#if getToasts().length > 0}
    <div class="toast-container">
      {#each getToasts() as toast (toast.id)}
        <button class="toast toast-{toast.type}" onclick={() => dismissToast(toast.id)}>
          {toast.message}
        </button>
      {/each}
    </div>
  {/if}

  <footer class="app-footer">
    <div class="footer-inner">
      <!-- 第一行：版权 + 品牌 + 版本 -->
      <div class="footer-row footer-row-brand">
        {#if !getIsPro() || !getSettings().hideBranding}
        <div class="footer-brand">
          <span class="footer-logo"></span>
          <span class="footer-name">{t('footer.domain')}</span>
          {#if isLoggedIn() && getIsPro() && customFooter}
            <span class="footer-custom">{customFooter}</span>
          {/if}
        </div>
        {/if}
        <div class="footer-meta">
          <span class="footer-version">{VERSION}</span>
          {#if isLoggedIn() && getIsPro()}
            {#if proDaysLeft > 0}
              <span class="footer-pro-badge expiring" title={t('pro.expireTip', { days: String(proDaysLeft) })}>
                PRO · {proDaysLeft}{t('pro.days')}
              </span>
            {:else}
              <span class="footer-pro-badge">PRO</span>
            {/if}
          {/if}
        </div>
      </div>
      <!-- 第二行：备案号 -->
      <div class="footer-row footer-row-beian">
        <a class="footer-link" href="https://beian.miit.gov.cn" target="_blank" rel="noopener">鲁ICP备17012030号-23</a>
        <span class="footer-divider"></span>
        <span class="footer-psb">
          <img class="footer-psb-icon" src="/psb-icon.png" alt="网安备案图标" width="14" height="14" />
          <a class="footer-link" href="https://beian.mps.gov.cn/#/query/webSearch?code=37098202000884" target="_blank" rel="noopener">{t('footer.psbNumber')}</a>
        </span>
      </div>
      <!-- 第三行：站内链接 -->
      <div class="footer-row footer-row-links">
        <a class="footer-link" href="{pg}about.html">{t('footer.about')}</a>
        <span class="footer-dot">·</span>
        <a class="footer-link" href="{pg}privacy.html">{t('footer.privacy')}</a>
        <span class="footer-dot">·</span>
        <a class="footer-link" href="{pg}copyright.html">{t('footer.copyright')}</a>
        <span class="footer-dot">·</span>
        <a class="footer-link" href="{pg}contact.html">{t('footer.contact')}</a>
      </div>
    </div>
  </footer>
</div>

{#if showWallpaperPicker}
  <WallpaperPicker onclose={() => showWallpaperPicker = false} />
{/if}

{#if showImportExport}
  <ImportExport onclose={() => showImportExport = false} />
{/if}

{#if showSettings}
  <SettingsPanel onclose={() => showSettings = false} onsubscribe={() => { showSettings = false; showSubscribe = true; }} />
{/if}

{#if showStats}
  <StatisticsPanel onclose={() => showStats = false} />
{/if}

{#if showSync}
  <SyncPanel onclose={() => showSync = false} />
{/if}

{#if showSubscribe}
  <SubscribePanel onclose={() => showSubscribe = false} />
{/if}

{#if showHelp}
  <HelpPanel onclose={() => showHelp = false} />
{/if}

{#if showAI}
  <div class="ai-overlay">
    <div class="ai-close-area" role="button" tabindex="0" onclick={() => showAI = false} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') showAI = false; }}></div>
    <AIWidget onclose={() => showAI = false} />
  </div>
{/if}

{#if showAddDial}
  <AddDialModal
    onsave={handleDialSave}
    oncancel={() => showAddDial = false}
    prefillTitle={addDialPrefill.title}
    prefillUrl={addDialPrefill.url}
  />
{/if}

<style>
  .app-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .header-widgets {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  /* Tab 导航栏 */
  .tab-bar {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin: 12px auto 0;
    max-width: 800px;
    padding: 4px;
    border-radius: 10px;
    background: var(--card-bg, rgba(255,255,255,0.06));
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid var(--card-border, rgba(255,255,255,0.06));
  }
  .tab-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 14px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--text-color, #e2e8f0);
    font-size: 13px;
    opacity: 0.5;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .tab-btn:hover {
    opacity: 0.8;
    background: var(--hover-bg, rgba(255,255,255,0.08));
  }
  .tab-btn.active {
    opacity: 1;
    background: var(--accent-bg, rgba(59,130,246,0.15));
    color: var(--accent-color, #3b82f6);
    font-weight: 600;
  }

  .toolbar {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    gap: 8px;
    z-index: 100;
  }

  .app-footer {
    user-select: none;
    width: 100%;
    max-width: 800px;
    padding: 40px 0 24px;
  }

  .footer-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: var(--text-color, #1e293b);
    opacity: 0.45;
    transition: opacity 0.3s;
  }

  .footer-inner:hover { opacity: 0.7; }

  .footer-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .footer-row-brand { gap: 16px; }
  .footer-brand { display: flex; align-items: center; gap: 6px; }
  .footer-logo { font-size: 14px; }
  .footer-name { font-weight: 600; font-size: 13px; }
  .footer-meta { display: flex; align-items: center; gap: 8px; }
  .footer-version { font-family: monospace; font-size: 10px; opacity: 0.6; }

  .footer-custom {
    font-weight: 600;
    opacity: 0.8;
    padding-left: 8px;
    border-left: 1px solid var(--text-color, #1e293b);
    margin-left: 4px;
  }

  .footer-link { color: var(--text-color, #1e293b); text-decoration: none; font-size: 11px; opacity: 0.5; transition: opacity 0.2s; }
  .footer-link:hover { opacity: 1; }
  .footer-row-beian .footer-link { font-size: 11px; }
  .footer-psb { display: inline-flex; align-items: center; gap: 4px; }
  .footer-psb-icon { width: 14px; height: 14px; flex-shrink: 0; vertical-align: middle; }

  .footer-divider {
    width: 1px;
    height: 10px;
    background: var(--text-color, #1e293b);
    opacity: 0.15;
    border-radius: 1px;
    flex-shrink: 0;
  }

  .footer-dot {
    opacity: 0.2;
    font-size: 10px;
  }

  .footer-pro-badge {
    font-size: 9px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 10px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    letter-spacing: 0.5px;
  }
  .footer-pro-badge.expiring {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    animation: pulse-badge 2s ease-in-out infinite;
  }
  @keyframes pulse-badge {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  @media (max-width: 640px) {
    .toolbar {
      bottom: 12px;
      right: 12px;
    }

    .header-widgets {
      gap: 8px;
    }

    .app-footer { padding: 32px 12px 20px; }
    .footer-row-brand { flex-direction: column; gap: 6px; }
    .footer-row-links { gap: 4px; }
    .footer-link { font-size: 11px; }
  }

  .ai-overlay {
    position: fixed; inset: 0; z-index: 200;
    display: flex; justify-content: flex-end;
  }
  .ai-close-area { flex: 1; cursor: pointer; }
</style>
