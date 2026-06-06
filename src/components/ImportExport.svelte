<script lang="ts">
  import { getDialsState, initDials } from '../stores/dials.svelte';
  import { initTheme, getTheme } from '../stores/theme.svelte';
  import { initSettings, getSettings } from '../stores/settings.svelte';
  import { initRecentSites, getRecentSites } from '../stores/recentSites.svelte';
  import { loadData, saveData } from '../utils/storage';
  import { parseBookmarkGroups } from '../utils/bookmark';
  import { getIsPro } from '../stores/subscription.svelte';
  import { generateId } from '../types';
  import type { AppData, DialItem, DialGroup } from '../types';
  import { t } from '../utils/i18n.svelte';

  interface Props {
    onclose: () => void;
  }

  let { onclose }: Props = $props();

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

  let isProcessing = $state(false);
  let message = $state('');
  let isError = $state(false);

  function exportData() {
    const data: AppData = {
      version: 1,
      dials: getDialsState().items,
      groups: getDialsState().groups,
      searchEngines: [],
      theme: getTheme(),
      settings: getSettings(),
      recentSites: getRecentSites(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speed-dial-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    message = t('ie.exportOk');
    setTimeout(() => { message = ''; }, 2000);
  }

  async function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      isProcessing = true;
      message = '';

      try {
        const text = await file.text();
        const data: AppData = JSON.parse(text);

        // 验证数据
        if (!data.version || typeof data.version !== 'number') {
          throw new Error('无效的备份文件格式');
        }

        // 初始化所有 store
        initDials({ dials: data.dials || [], groups: data.groups || [] });
        initTheme(data.theme);
        initSettings(data.settings);
        initRecentSites(data.recentSites || []);

        message = t('ie.importOk');
        setTimeout(onclose, 1200);
      } catch (err) {
        isError = true;
        message = err instanceof Error ? err.message : t('ie.failed');
      } finally {
        isProcessing = false;
      }
    };

    input.click();
  }

  async function importBookmarks() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      isProcessing = true;
      message = '';

      try {
        const html = await file.text();
        const groups = parseBookmarkGroups(html);
        if (groups.length === 0) throw new Error(t('ie.noBookmark'));

        const state = getDialsState();
        const existingUrls = new Set(state.items.map(d => d.url.toLowerCase()));
        let totalImported = 0;

        // 免费用户最多3组，超出文件夹自动并入默认分组
        const maxGroups = getIsPro() ? 999 : 3;
        const existingGroups = state.groups.length;
        const remainingSlots = maxGroups - existingGroups;
        let groupsCreated = 0;

        // 确保默认分组存在
        let defaultGroup = state.groups.find(g => g.name === '默认收藏');
        if (!defaultGroup) {
          defaultGroup = { id: generateId(), name: '默认收藏' };
          state.groups = [...state.groups, defaultGroup];
        }

        for (const bg of groups) {
          let targetGroup: DialGroup;

          if (remainingSlots > groupsCreated) {
            // 还有分组额度，检查是否已存在同名分组
            let existing = state.groups.find(g => g.name === bg.name);
            if (!existing) {
              existing = { id: generateId(), name: bg.name };
              state.groups = [...state.groups, existing];
              groupsCreated++;
            }
            targetGroup = existing;
          } else {
            // 超出免费分组数，归入默认分组
            targetGroup = defaultGroup;
          }

          const newItems = bg.items
            .filter(b => !existingUrls.has(b.url.toLowerCase()))
            .slice(0, 50)
            .map((b, i) => ({
              id: crypto.randomUUID(), title: b.title, url: b.url,
              icon: '', groupId: targetGroup.id, sortOrder: i, createdAt: Date.now(),
            }));

          state.items = [...state.items, ...newItems];
          totalImported += newItems.length;
        }

        if (totalImported === 0) { isError = true; throw new Error(t('ie.allExist')); }

        initDials({ dials: state.items, groups: state.groups });

        message = `成功导入 ${totalImported} 个书签至 ${Math.min(groups.length, maxGroups)} 个分组`;
        if (!getIsPro() && groups.length > maxGroups) {
          message += `，超出 ${groups.length - maxGroups} 个文件夹自动归入"默认收藏"`;
        }
        message += '！';
        setTimeout(() => { message = ''; }, 5000);
      } catch (err) {
        isError = true;
        message = err instanceof Error ? err.message : t('ie.failed');
      } finally {
        isProcessing = false;
      }
    };

    input.click();
  }

  function clearData() {
    if (!confirm(t('ie.clear') + '？')) return;
    initDials({ dials: [], groups: [] });
    initRecentSites([]);
    localStorage.removeItem('speed-dial-data');
    message = t('ie.cleared');
    setTimeout(() => { message = ''; }, 2000);
  }
</script>

<div class="modal-overlay" bind:this={overlayEl}>
  <div class="modal-content" bind:this={contentEl}>
    <h3 class="modal-title">{t('ie.title')}</h3>

    <div class="ie-actions">
      <button class="btn btn-primary" onclick={exportData} disabled={isProcessing}>
        <i class="fa-solid fa-file-export"></i> {t('ie.export')}
      </button>
      <button class="btn btn-secondary" onclick={importData} disabled={isProcessing}>
        <i class="fa-solid fa-file-import"></i> {t('ie.import')}
      </button>
      <button class="btn btn-secondary" onclick={importBookmarks} disabled={isProcessing}>
        <i class="fa-solid fa-bookmark"></i> {t('ie.importBookmarks')}
      </button>
      <p class="ie-hint">{t('ie.bookmarkHint')}</p>
    </div>

    {#if message}
      <div class="ie-message" class:error={isError} role="alert">
        {message}
      </div>
    {/if}

    <div class="ie-danger">
      <button class="btn btn-danger" onclick={clearData} disabled={isProcessing}>
        <i class="fa-solid fa-trash-can"></i> {t('ie.clear')}
      </button>
      <p class="ie-hint">{t('ie.clearHint')}</p>
    </div>

    <div class="form-actions">
      <button class="btn btn-secondary" onclick={onclose}>{t('common.close')}</button>
    </div>
  </div>
</div>

<style>
  .ie-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
  }

  .ie-message {
    padding: 10px 14px;
    background: rgba(34, 197, 94, 0.08);
    color: #16a34a;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 16px;
  }

  .ie-message.error {
    background: rgba(239, 68, 68, 0.08);
    color: #ef4444;
  }

  .ie-hint {
    font-size: 11px;
    color: var(--text-color, #1e293b);
    opacity: 0.45;
    line-height: 1.6;
    text-align: center;
    margin-top: -4px;
  }

  .ie-danger {
    padding-top: 16px;
    border-top: 1px solid var(--card-border, rgba(0,0,0,0.06));
    margin-bottom: 16px;
  }

  .btn-danger {
    background: transparent;
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .btn-danger:hover {
    background: rgba(239, 68, 68, 0.08);
  }
</style>
