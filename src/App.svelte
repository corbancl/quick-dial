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
  import HelpPanel from './components/HelpPanel.svelte';
  import OnboardingGuide from './components/OnboardingGuide.svelte';
  import QuoteWidget from './components/QuoteWidget.svelte';
  import AIWidget from './components/AIWidget.svelte';
  import RssWidget from './components/RssWidget.svelte';

  import { initDials, getDialsState, ensureDefaultGroup, addDial } from './stores/dials.svelte';
  import { initTheme, getTheme } from './stores/theme.svelte';
  import { initSettings, getSettings, setSearchEngine } from './stores/settings.svelte';
  import { initRecentSites, getRecentSites } from './stores/recentSites.svelte';
  import { initChat, getChatMessages, getChatConfig } from './stores/chat.svelte';
  import { initRss, getRssData } from './stores/rss.svelte';
  import { initQuote } from './stores/quote.svelte';
  import { getIsPro, syncProStatus, getAuthToken, startProPolling } from './stores/subscription.svelte';
  import { getWallpaper, setWallpaper } from './stores/wallpaper.svelte';
  import { fetchRandomWallpaper } from './utils/weather';
  import { isLoggedIn } from './utils/sync';
  import { showToast } from './utils/toast.svelte';
  import { checkStorageSupport, loadData, saveData } from './utils/storage';
  import { registerShortcut, focusSearch } from './utils/keyboard';
  import { getToasts, dismissToast } from './utils/toast.svelte';
  import { getContextAdd } from './utils/contextMenu';
  import { t, getLang } from './utils/i18n.svelte';
  import { discoverFnosApps } from './utils/fnos';
  import type { AppData } from './types';

  const VERSION = __VERSION__;
  const pg = $derived(getLang() === 'zh-CN' ? '' : 'en-');

  let showWallpaperPicker = $state(false);
  let showImportExport = $state(false);
  let showSettings = $state(false);
  let showStats = $state(false);
  let showSync = $state(false);
  let showHelp = $state(false);
  let showAI = $state(false);
  let showRss = $state(false);
  let showAddDial = $state(false);
  let addDialPrefill = $state({ title: '', url: '' });
  let customFooter = $state(localStorage.getItem('quick-dial-custom-footer') || '');

  // 插件端底部自定义（由 PHP 注入 window.PLUGIN_FOOTER）
  let pluginFooterLinks = $state(null as {text:string,url:string}[] | null);
  let pluginFooterCopyright = $state('');
  let pluginFooterIcpText = $state('');
  let pluginFooterIcpUrl = $state('');
  let pluginFooterPsbText = $state('');
  let pluginFooterPsbUrl = $state('');
  $effect(() => {
    const pf = (window as any).PLUGIN_FOOTER;
    if (pf) {
      if (pf.links) pluginFooterLinks = pf.links;
      if (pf.copyright) pluginFooterCopyright = pf.copyright;
      if (pf.icpText) pluginFooterIcpText = pf.icpText;
      if (pf.icpUrl) pluginFooterIcpUrl = pf.icpUrl;
      if (pf.psbText) pluginFooterPsbText = pf.psbText;
      if (pf.psbUrl) pluginFooterPsbUrl = pf.psbUrl;
    }
  });
  let cardExpanded = $state(false);
  let mobileWidgetExpanded = $state(false);
  let isMobile = $state(window.innerWidth <= 640);
  $effect(() => {
    const onResize = () => { isMobile = window.innerWidth <= 640; };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });
  let compactWidgets = $derived(isMobile && !mobileWidgetExpanded);

  function scrollToTop() {
    document.getElementById('app')?.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function scrollToBottom() {
    const app = document.getElementById('app');
    if (app) app.scrollTo({ top: app.scrollHeight, behavior: 'smooth' });
  }

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
    const token = localStorage.getItem('quick-dial-token');
    proxied: {
      if (!token) return;
      fetch('https://sync.ruseo.cn/api/pay.php?action=status', {
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(r => r.json()).then(result => {
        proExpiryChecked = true;
        const expireAt = result.data?.expire_at;
        if (!expireAt) return; // 终身
        const daysLeft = Math.ceil((new Date(expireAt).getTime() - Date.now()) / 86400000);
        if (daysLeft < 0) return; // 已过期
        if (daysLeft <= 7) {
          proDaysLeft = daysLeft;
          localStorage.setItem('quick-dial-pro-days', String(daysLeft));
          showToast(t('pro.expireTip', { days: String(daysLeft) }), daysLeft <= 3 ? 'error' : 'info', 6000);
        }
      });
    }
  });

  // 每次加载或登录时从服务器同步 Pro 状态
  $effect(() => {
    const token = getAuthToken();
    if (!token) return;
    syncProStatus();
  });

  // Web端定期刷新 Pro 状态（30分钟间隔）
  $effect(() => {
    const token = getAuthToken();
    if (!token) return;
    const interval = setInterval(() => syncProStatus(), 30 * 60 * 1000);
    return () => clearInterval(interval);
  });

  // 布局模式同步到 document 属性
  $effect(() => {
    document.documentElement.setAttribute('data-layout', getSettings().layout);
  });

  // 初始化
  if (!checkStorageSupport()) {
    alert('您的浏览器不支持本地存储，部分功能可能无法使用。');
  }

  const saved = loadData<AppData>();
  // 先初始化设置，确保 themeStyle 正确
  initSettings(saved?.settings);
  // 再初始化主题，使用正确的 themeStyle
  if (saved && saved.version) {
    initDials({ dials: saved.dials || [], groups: saved.groups || [] });
    initTheme(saved.theme);
    initRecentSites(saved.recentSites || []);
    initChat({ messages: saved.chatMessages, config: saved.chatConfig });
    initRss(saved.rssData);
    initQuote();
  } else {
    // 首次使用，确保主题初始化
    initTheme(undefined);
    // 创建默认分组和示例导航
    const defaultGroupId = ensureDefaultGroup();

    // 常用分组 - 热门网站
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
      { title: '豆包', url: 'https://www.doubao.com/', icon: fav('www.doubao.com') },
      { title: '呲啦官网', url: 'https://www.cilacila.cn/', icon: fav('www.cilacila.cn') },
      { title: '呲啦起始页', url: 'https://cilacila.cn/', icon: fav('cilacila.cn') },
      { title: '澄曜API Hub', url: 'https://api.ruseo.cn/', icon: 'https://api.ruseo.cn/apple-touch-icon.png' },
      { title: '澄曜工作室', url: 'https://www.chenliang.xyz/', icon: fav('www.chenliang.xyz') },
      { title: '瑞索工具网', url: 'https://ruseo.cn/', icon: 'https://ruseo.cn/static/images/logo.png' },
      { title: '计数器API', url: 'https://js.ruseo.cn/', icon: 'counter-api.png' },
    ];
    commonItems.forEach((item, i) => {
      addDial({ title: item.title, url: item.url, icon: item.icon, groupId: defaultGroupId, sortOrder: i });
    });

    // 飞牛NAS：自动发现已安装应用
    discoverFnosApps();
  }

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

  // 使用 $derived 创建稳定的数据引用
  const appData = $derived((): AppData => {
    const dialsState = getDialsState();
    const theme = getTheme();
    const settings = getSettings();
    const recentSites = getRecentSites();
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
      chatMessages: chatMessages,
      chatConfig: chatConfig,
      rssData: getRssData(),
      customCss: localStorage.getItem('quick-dial-custom-css') || '',
    };
  });

  // 防抖保存
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;
  
  $effect(() => {
    const data = appData();
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveData(data);
      saveTimeout = null;
    }, 300);
  });
</script>

<OnboardingGuide oncomplete={() => {
  setSearchEngine(getLang() === 'zh-CN' ? 'baidu' : 'google');
}} />

{#snippet headerContent()}
  <ClockWidget />
{/snippet}

  <!-- 右上角挂件 -->
  <div class="corner-widgets" class:mobile-expanded={mobileWidgetExpanded} onclick={() => mobileWidgetExpanded = !mobileWidgetExpanded} role="button" tabindex="0" onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') mobileWidgetExpanded = !mobileWidgetExpanded; }}>
    {#if getSettings().showWeather}
      <WeatherWidget expanded={cardExpanded} ontoggle={() => cardExpanded = !cardExpanded} compact={compactWidgets} />
    {/if}
    {#if getSettings().showLunar}
      <LunarWidget expanded={cardExpanded} ontoggle={() => cardExpanded = !cardExpanded} compact={compactWidgets} />
    {/if}
  </div>

  <div class="app-container">
  {#if getSettings().layout === 'sidebar'}
    <!-- 侧栏布局 -->
    <div class="sidebar-root">
      <aside class="sidebar-left">
        {@render headerContent()}
      </aside>
      <main class="sidebar-right">
        <SearchBox />
        <div class="sidebar-body">
          <SpeedDial />
          {#if getSettings().showQuote}<QuoteWidget />{/if}
          {#if getSettings().showRecentSites}<RecentSites />{/if}
        </div>
      </main>
    </div>
  {:else}
    <!-- 居中/宽屏布局 -->
    <div class="app-header">
      {@render headerContent()}
    </div>
    <SearchBox />
    {#if getSettings().showQuote}<QuoteWidget />{/if}
    <SpeedDial />
    {#if getSettings().showRecentSites}<RecentSites />{/if}
  {/if}

  <!-- 底部工具栏 -->
  <div class="toolbar">
    {#if getSettings().showRss}
    <button class="btn-icon" onclick={() => showRss = !showRss} title={t('rss.title')}>
      <i class="fa-solid fa-rss"></i>
    </button>
    {/if}
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
      <button class="btn-icon btn-upgrade" onclick={() => { window.open('https://www.cilacila.cn/account.html', '_blank'); startProPolling(() => showToast('Pro 已激活', 'success')); }} title={t('toolbar.upgrade')}>
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
      <div class="footer-row footer-row-brand">
        {#if !getIsPro() || !getSettings().hideBranding}
          <span class="footer-logo"></span>
          <span class="footer-name">{t('footer.domain')}</span>
        {/if}
        {#if isLoggedIn() && getIsPro() && customFooter}
          <span class="footer-custom" class:no-sep={getIsPro() && getSettings().hideBranding}>{customFooter}</span>
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
      <div class="footer-row footer-row-beian">
        <span class="footer-psb">
          <img class="footer-psb-icon" src="/preview.jpg" alt="ICP备案图标" width="14" height="14" />
          {#if pluginFooterIcpText}
            <a class="footer-link" href={pluginFooterIcpUrl || '#'} target="_blank" rel="noopener">{pluginFooterIcpText}</a>
          {:else}
            <a class="footer-link" href="https://beian.miit.gov.cn" target="_blank" rel="noopener">鲁ICP备17012030号-23</a>
          {/if}
        </span>
        <span class="footer-divider"></span>
        <span class="footer-psb">
          <img class="footer-psb-icon" src="/psb-icon.png" alt="网安备案图标" width="14" height="14" />
          {#if pluginFooterPsbText}
            <a class="footer-link" href={pluginFooterPsbUrl || '#'} target="_blank" rel="noopener">{pluginFooterPsbText}</a>
          {:else}
            <a class="footer-link" href="https://beian.mps.gov.cn/#/query/webSearch?code=37098202000884" target="_blank" rel="noopener">{t('footer.psbNumber')}</a>
          {/if}
        </span>
      </div>
      <div class="footer-row footer-row-links">
        {#if pluginFooterLinks}
          {#each pluginFooterLinks as link, i}
            {#if link.text && link.url}
              <a class="footer-link" href={link.url}>{link.text}</a>
              {#if i < pluginFooterLinks.filter(l => l.text && l.url).length - 1}
                <span class="footer-dot">·</span>
              {/if}
            {/if}
          {/each}
        {:else}
          <a class="footer-link" href="{pg}about.html">{t('footer.about')}</a>
          <span class="footer-dot">·</span>
          <a class="footer-link" href="{pg}privacy.html">{t('footer.privacy')}</a>
          <span class="footer-dot">·</span>
          <a class="footer-link" href="{pg}copyright.html">{t('footer.copyright')}</a>
          <span class="footer-dot">·</span>
          <a class="footer-link" href="{pg}contact.html">{t('footer.contact')}</a>
        {/if}
      </div>
      {#if pluginFooterCopyright}
        <div class="footer-row" style="opacity:0.55;font-size:11px">{pluginFooterCopyright}</div>
      {/if}
    </div>
  </footer>
</div>

<div class="side-nav">
  <button class="side-nav-btn" onclick={(e) => { e.stopPropagation(); scrollToTop(); }} title={t('top')}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  </button>
  <button class="side-nav-btn" onclick={(e) => { e.stopPropagation(); scrollToBottom(); }} title={t('bottom')}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </button>
</div>

{#if showWallpaperPicker}
  <WallpaperPicker onclose={() => showWallpaperPicker = false} />
{/if}

{#if showImportExport}
  <ImportExport onclose={() => showImportExport = false} />
{/if}

{#if showSettings}
  <SettingsPanel onclose={() => showSettings = false} />
{/if}

{#if showStats}
  <StatisticsPanel onclose={() => showStats = false} />
{/if}

{#if showSync}
  <SyncPanel onclose={() => showSync = false} />
{/if}

{#if showHelp}
  <HelpPanel onclose={() => showHelp = false} />
{/if}

{#if showAI}
  <div class="modal-overlay">
    <div class="modal-close-area" role="button" tabindex="0" onclick={() => showAI = false} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') showAI = false; }}></div>
    <div class="modal-float-card">
      <AIWidget onclose={() => showAI = false} />
    </div>
  </div>
{/if}

{#if showRss}
  <div class="modal-overlay">
    <div class="modal-close-area" role="button" tabindex="0" onclick={() => showRss = false} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') showRss = false; }}></div>
    <div class="modal-float-card">
      <RssWidget onclose={() => showRss = false} />
    </div>
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
    margin-bottom: 20px;
  }

  .corner-widgets {
    position: fixed;
    top: 20px;
    left: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 90;
  }
  .corner-widgets :global(.weather-widget),
  .corner-widgets :global(.lunar-widget) {
    width: 210px;
  }

  .toolbar {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    gap: 8px;
    z-index: 100;
  }

  .side-nav {
    position: fixed;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 100;
  }
  .side-nav-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid var(--card-border, rgba(255,255,255,0.06));
    background: var(--card-bg, rgba(255,255,255,0.06));
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: var(--text-color, #e2e8f0);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s;
    opacity: 0.35;
  }
  .side-nav-btn:hover {
    opacity: 1;
    background: var(--accent-bg, rgba(59,130,246,0.15));
    color: var(--accent-color, #3b82f6);
  }
  .side-nav-btn svg {
    pointer-events: none;
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
    opacity: 0.55;
    transition: opacity 0.3s;
  }

  .footer-inner:hover { opacity: 0.85; }

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
  .footer-custom.no-sep { border-left: none; padding-left: 0; margin-left: 0; }

  .footer-link { color: var(--text-color, #1e293b); text-decoration: none; font-size: 11px; opacity: 0.65; transition: opacity 0.2s, color 0.2s; }
  .footer-link:hover { opacity: 1; color: var(--primary-color, #3b82f6); }
  .footer-row-beian .footer-link { font-size: 11px; }
  .footer-psb { display: inline-flex; align-items: center; gap: 4px; }
  .footer-psb-icon { width: 14px; height: 14px; flex-shrink: 0; vertical-align: middle; }

  .footer-divider {
    width: 1px;
    height: 10px;
    background: var(--text-color, #1e293b);
    opacity: 0.2;
    border-radius: 1px;
    flex-shrink: 0;
  }

  .footer-dot {
    opacity: 0.35;
    font-size: 10px;
    color: var(--text-color, #1e293b);
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

    .corner-widgets {
      top: 12px;
      left: 12px;
      gap: 6px;
    }
    .corner-widgets:not(.mobile-expanded) {
      flex-direction: column;
      background: var(--card-bg, rgba(255,255,255,0.85));
      border: 1px solid var(--card-border, rgba(0,0,0,0.08));
      border-radius: 16px;
      padding: 8px 14px;
      gap: 0;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      cursor: pointer;
      max-width: fit-content;
      min-width: 80px;
    }
    .corner-widgets:not(.mobile-expanded) :global(.weather-widget),
    .corner-widgets:not(.mobile-expanded) :global(.lunar-widget) {
      width: auto;
      padding: 0;
      background: none;
      border: none;
      border-radius: 0;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      min-width: auto;
      box-shadow: none;
    }
    .corner-widgets:not(.mobile-expanded) :global(.weather-widget:hover),
    .corner-widgets:not(.mobile-expanded) :global(.lunar-widget:hover) {
      transform: none;
      box-shadow: none;
    }
    /* 天气：temp 和 desc 各占一行（隐藏图标、位置、详情、预报） */
    .corner-widgets:not(.mobile-expanded) :global(.weather-main) {
      flex-direction: column;
      gap: 1px;
      align-items: flex-start;
    }
    .corner-widgets:not(.mobile-expanded) :global(.weather-icon),
    .corner-widgets:not(.mobile-expanded) :global(.weather-location),
    .corner-widgets:not(.mobile-expanded) :global(.weather-details),
    .corner-widgets:not(.mobile-expanded) :global(.weather-forecast) {
      display: none !important;
    }
    .corner-widgets:not(.mobile-expanded) :global(.weather-info) {
      display: contents;
    }
    .corner-widgets:not(.mobile-expanded) :global(.weather-temp) {
      font-size: 16px;
      font-weight: 700;
      line-height: 1.2;
    }
    .corner-widgets:not(.mobile-expanded) :global(.weather-desc) {
      font-size: 11px;
      opacity: 0.65;
      line-height: 1.2;
    }
    /* 天气行底部微分隔 */
    .corner-widgets:not(.mobile-expanded) :global(.weather-widget) {
      border-bottom: 1px solid var(--card-border, rgba(0,0,0,0.06));
      padding-bottom: 4px;
      margin-bottom: 3px;
    }
    /* 农历：仅显示月日 */
    .corner-widgets:not(.mobile-expanded) :global(.lunar-main) {
      flex-direction: column;
      gap: 0;
      align-items: flex-start;
    }
    .corner-widgets:not(.mobile-expanded) :global(.lunar-date) {
      font-size: 13px;
      font-weight: 600;
      line-height: 1.2;
    }
    .corner-widgets:not(.mobile-expanded) :global(.lunar-year-chinese),
    .corner-widgets:not(.mobile-expanded) :global(.lunar-ganzhi),
    .corner-widgets:not(.mobile-expanded) :global(.lunar-special),
    .corner-widgets:not(.mobile-expanded) :global(.lunar-detail) {
      display: none !important;
    }
    .corner-widgets.mobile-expanded {
      flex-direction: column;
    }
    .corner-widgets.mobile-expanded :global(.weather-widget),
    .corner-widgets.mobile-expanded :global(.lunar-widget) {
      width: 160px;
    }

    .app-footer { padding: 32px 12px 80px; }
    .footer-row-brand { flex-direction: column; gap: 6px; }
    .footer-row-links { gap: 4px; }
    .footer-link { font-size: 11px; }
  }

  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    display: flex; align-items: center; justify-content: center;
  }
  .modal-close-area { position: absolute; inset: 0; cursor: pointer; background: rgba(0,0,0,0.3); }
  .modal-float-card {
    position: relative;
    z-index: 1;
    border-radius: 16px;
    background: var(--bg-color, #0f172a);
    box-shadow: 0 16px 48px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1);
    overflow: hidden;
  }

  /* ====== 布局模式 ====== */
  :global(html[data-layout="wide"]) .app-header {
    max-width: 1200px !important;
  }

  /* 侧栏 */
  .sidebar-root {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 0 24px;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    align-items: start;
  }
  .sidebar-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    min-height: 60vh;
    min-width: 0;
  }
  .sidebar-right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 60vh;
    min-width: 0;
  }
  .sidebar-right :global(.search-container) {
    align-self: center;
    max-width: 800px;
  }
  .sidebar-body {
    display: flex;
    flex-direction: column;
  }
</style>
