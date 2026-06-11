<script lang="ts">
import { t } from '../utils/i18n.svelte';
  import type { DialItem } from '../types';
  import { getDialsState } from '../stores/dials.svelte';
  import IconPicker from './IconPicker.svelte';

  interface Props {
    onsave: (data: { title: string; url: string; icon: string; groupId: string; bgColor?: string }) => void;
    oncancel: () => void;
    prefillTitle?: string;
    prefillUrl?: string;
  }

  let { onsave, oncancel, prefillTitle = '', prefillUrl = '' }: Props = $props();

  let title = $state(prefillTitle);
  let url = $state(prefillUrl);
  let icon = $state('');
  let groupId = $state('');
  let isEdit = $state(false);
  let error = $state('');
  let bgColor = $state('');

  // 预填充时自动获取 favicon（右键菜单场景）
  $effect(() => {
    if (url && !icon) {
      fetchFavicon(url);
    }
  });

  // 外部调用此函数来填入编辑数据，避免 prop 对象引用问题
  export function fillEditData(data: { title: string; url: string; icon: string; groupId: string; bgColor?: string }) {
    title = data.title || '';
    url = data.url || '';
    icon = data.icon || '';
    groupId = data.groupId || '';
    bgColor = data.bgColor || '';
    isEdit = true;
  }

  export function resetForm() {
    title = '';
    url = '';
    icon = '';
    groupId = '';
    bgColor = '';
    isEdit = false;
    error = '';
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';
    if (!title.trim()) { error = '请输入' + t('dial.name'); return; }
    if (!url.trim()) { error = '请输入' + t('dial.url'); return; }
    let finalUrl: string;
    try {
      finalUrl = url.startsWith('http') ? url : `https://${url}`;
      new URL(finalUrl);
    } catch { error = 'URL 格式不正确'; return; }
    onsave({ title: title.trim(), url: finalUrl, icon: icon.trim(), groupId, bgColor: bgColor.trim() || undefined });
  }

  function handleUrlPaste(e: ClipboardEvent) {
    const pasted = e.clipboardData?.getData('text') || '';
    if (!pasted || title.trim()) return;
    try {
      const u = new URL(pasted.startsWith('http') ? pasted : `https://${pasted}`);
      const host = u.hostname.replace(/^www\./, '');
      const parts = host.split('.');
      if (parts.length >= 2) {
        title = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      }
      if (!icon) fetchFavicon(pasted);
    } catch { /* ignore */ }
  }

  function handleUrlBlur() {
    if (url.trim() && !icon) fetchFavicon(url.trim());
  }

  function fetchFavicon(raw: string) {
    try {
      const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
      icon = `https://sync.ruseo.cn/api/favicon.php?domain=${u.hostname}`;
    } catch { /* ignore */ }
  }
</script>

<div class="modal-overlay">
  <div class="modal-content">
    <h3 class="modal-title">{isEdit ? t('dial.edit') : t('dial.add')}</h3>
    <form onsubmit={handleSubmit}>
      <div class="form-group">
        <label class="form-label" for="dial-title">{t('dial.name')}</label>
        <input id="dial-title" class="form-input" type="text" bind:value={title} placeholder="例如：GitHub" required autocomplete="off" />
      </div>
      <div class="form-group">
        <label class="form-label" for="dial-url">{t('dial.url')}</label>
        <input id="dial-url" class="form-input" type="text" bind:value={url} placeholder="{t('dial.urlPlaceholder')}" onpaste={handleUrlPaste} onblur={handleUrlBlur} required autocomplete="url" />
      </div>
      <div class="form-group">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="form-label">{t('dial.icon')}</label>
        <IconPicker value={icon} onselect={(v) => icon = v} />
      </div>
      <div class="form-group">
        <label class="form-label" for="dial-bgcolor">{t('dial.bgColor')}</label>
        <div class="color-picker-row">
          <input id="dial-bgcolor" class="color-input" type="color" bind:value={bgColor} />
          <input class="form-input color-text" type="text" bind:value={bgColor} placeholder="#RRGGBB" maxlength="7" />
          {#if bgColor}
            <button type="button" class="color-clear" onclick={() => bgColor = ''}>✕</button>
          {/if}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="dial-group">{t('dial.group')}</label>
        <select id="dial-group" class="form-select" bind:value={groupId}>
          {#each getDialsState().groups as g}
            <option value={g.id}>{t(g.name)}</option>
          {/each}
        </select>
      </div>
      {#if error}
        <div class="form-error" role="alert">{error}</div>
      {/if}
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick={oncancel}>{t('dial.cancel')}</button>
        <button type="submit" class="btn btn-primary">{isEdit ? t('dial.save') : t('dial.add')}</button>
      </div>
    </form>
  </div>
</div>

<style>
  .form-error { color: #ef4444; font-size: 13px; margin-bottom: 12px; padding: 8px 12px; background: rgba(239,68,68,0.08); border-radius: 8px; }
  .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
  .color-picker-row { display: flex; gap: 8px; align-items: center; }
  .color-input { width: 36px; height: 36px; border: 2px solid var(--card-border); border-radius: 8px; cursor: pointer; padding: 2px; background: none; }
  .color-text { flex: 1; }
  .color-clear { background: none; border: 1px solid var(--card-border); border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 12px; color: var(--text2); }
  .color-clear:hover { background: var(--hover-bg); }
</style>
