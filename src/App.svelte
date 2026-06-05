<script lang="ts">
  import './app.css';
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

  import { initDials, getDialsState, ensureDefaultGroup, addDial } from './stores/dials.svelte';
  import { initTheme, getTheme } from './stores/theme.svelte';
  import { initSettings, getSettings } from './stores/settings.svelte';
  import { initRecentSites, getRecentSites } from './stores/recentSites.svelte';
  import { getIsPro } from './stores/subscription.svelte';
  import { isLoggedIn } from './utils/sync';
  import { checkSubscription } from './utils/payment';
  import { showToast } from './utils/toast.svelte';
  import { checkStorageSupport, loadData, saveData } from './utils/storage';
  import { registerShortcut, focusSearch } from './utils/keyboard';
  import { getToasts, dismissToast } from './utils/toast.svelte';
  import { getContextAdd } from './utils/contextMenu';
import { t } from './utils/i18n.svelte';
  import type { AppData } from './types';

  const VERSION = 'v1.0.3';

  let showWallpaperPicker = $state(false);
  let showImportExport = $state(false);
  let showSettings = $state(false);
  let showStats = $state(false);
  let showSync = $state(false);
  let showSubscribe = $state(false);
  let showHelp = $state(false);
  let showAddDial = $state(false);
  let addDialPrefill = $state({ title: '', url: '' });
  let customFooter = $state(localStorage.getItem('quick-dial-custom-footer') || '');
  let cardExpanded = $state(false);

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

  // Pro 过期提醒（每24小时检查一次）
  let proExpiryChecked = $state(false);
  $effect(() => {
    if (proExpiryChecked || !getIsPro() || !isLoggedIn()) return;
    proxied: {
      checkSubscription().then(s => {
        proExpiryChecked = true;
        if (!s.expireAt) return; // 终身
        const daysLeft = Math.ceil((new Date(s.expireAt).getTime() - Date.now()) / 86400000);
        if (daysLeft <= 7 && daysLeft > 0) {
          showToast(`Pro 将于 ${daysLeft} 天后到期，请及时续费`, daysLeft <= 3 ? 'error' : 'info', 5000);
        }
      });
    }
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
  } else {
    // 首次使用，创建默认分组和示例数据
    const defaultGroupId = ensureDefaultGroup();
    addDial({
      title: 'Rusuo API',
      url: 'https://api.ruseo.cn/',
      icon: '🔧',
      groupId: defaultGroupId,
      sortOrder: 0
    });
    addDial({
      title: 'Rusuo',
      url: 'https://ruseo.cn/',
      icon: '🏠',
      groupId: defaultGroupId,
      sortOrder: 1
    });
    addDial({
      title: 'JS Hub',
      url: 'https://js.ruseo.cn/',
      icon: '📦',
      groupId: defaultGroupId,
      sortOrder: 2
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

  registerShortcut('k', focusSearch, '聚焦搜索', { ctrl: true });
  registerShortcut(',', () => showSettings = true, '打开设置', { ctrl: true });
  registerShortcut('b', () => showWallpaperPicker = true, '壁纸设置', { ctrl: true, shift: true });
  registerShortcut('s', () => showSync = true, '云同步', { ctrl: true, shift: true });
  registerShortcut('?', () => showHelp = !showHelp, '快捷键帮助', {});

  // 使用 $derived 创建稳定的数据引用，避免无限循环
  const appData = $derived((): AppData => {
    const dialsState = getDialsState();
    const theme = getTheme();
    const settings = getSettings();
    const recentSites = getRecentSites();
    
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

<OnboardingGuide />

<div class="app-container">
  <div class="app-header">
    <ClockWidget />
    <div class="header-widgets">
      <WeatherWidget expanded={cardExpanded} ontoggle={() => cardExpanded = !cardExpanded} />
      <LunarWidget expanded={cardExpanded} ontoggle={() => cardExpanded = !cardExpanded} />
    </div>
  </div>

  <SearchBox />

  <SpeedDial />

  {#if getSettings().showRecentSites}
    <RecentSites />
  {/if}

  <!-- 底部工具栏 -->
  <div class="toolbar">
    <button class="btn-icon" onclick={() => showWallpaperPicker = true} title="壁纸">
      <i class="fa-solid fa-image"></i>
    </button>
    <button class="btn-icon" onclick={() => showImportExport = true} title="导入/导出">
      <i class="fa-solid fa-folder-open"></i>
    </button>
    <button class="btn-icon" onclick={() => showStats = true} title="访问统计">
      <i class="fa-solid fa-chart-simple"></i>
    </button>
    <button class="btn-icon" onclick={() => showSync = true} title="云同步">
      <i class="fa-solid fa-cloud-arrow-up"></i>
    </button>
    {#if !getIsPro()}
      <button class="btn-icon btn-upgrade" onclick={() => showSubscribe = true} title="升级 Pro">
        <i class="fa-solid fa-crown"></i>
      </button>
    {/if}
    <button class="btn-icon" onclick={() => showSettings = true} title="设置">
      <i class="fa-solid fa-gear"></i>
    </button>
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
      <div class="footer-left">
        <span>&copy;2026 <a class="footer-domain" href="https://cilacila.cn" target="_blank" rel="noopener">cilacila.cn</a> {t('footer.copyright')}</span>
        <span class="footer-divider"></span>
        {#if isLoggedIn() && getIsPro() && customFooter}
          <span class="footer-custom">{customFooter}</span>
          <span class="footer-divider"></span>
        {/if}
        <a class="footer-link" href="about.html">关于我们</a>
        <span class="footer-divider"></span>
        <a class="footer-link" href="privacy.html">隐私政策</a>
        <span class="footer-divider"></span>
        <a class="footer-link" href="copyright.html">版权声明</a>
        <span class="footer-divider"></span>
        <a class="footer-link" href="contact.html">联系方式</a>
      </div>
      <div class="footer-right">
        <span class="footer-version">{VERSION}</span>
        {#if isLoggedIn() && getIsPro()}
          <span class="footer-pro-badge">PRO</span>
        {/if}
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

  .toolbar {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    gap: 8px;
    z-index: 100;
  }

  .app-footer {
    text-align: center;
    padding: 20px 0 12px;
    user-select: none;
  }

  .footer-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 8px 18px;
    border-radius: 20px;
    font-size: 12px;
    color: var(--text-color, #1e293b);
    opacity: 0.4;
    transition: opacity 0.3s;
  }

  .footer-inner:hover { opacity: 0.7; }

  .footer-version { font-family: monospace; font-size: 11px; opacity: 0.7; }

  .footer-domain {
    color: var(--text-color, #1e293b);
    text-decoration: none;
    opacity: 0.7;
    transition: opacity 0.2s;
  }
  .footer-domain:hover { opacity: 1; }
  .footer-link { color: var(--text2); text-decoration: none; font-size: 11px; opacity: 0.6; transition: opacity 0.2s; }
  .footer-link:hover { opacity: 1; }
  .footer-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .footer-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

  .footer-custom {
    font-weight: 600;
    opacity: 0.8;
  }

  .footer-divider {
    width: 1px;
    height: 10px;
    background: var(--text-color, #1e293b);
    opacity: 0.15;
    border-radius: 1px;
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

  @media (max-width: 640px) {
    .toolbar {
      bottom: 12px;
      right: 12px;
    }

    .header-widgets {
      gap: 8px;
    }
  }
</style>
