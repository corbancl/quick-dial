<script lang="ts">
  import type { DialItem } from '../types';
  import { getDialsState } from '../stores/dials.svelte';
  import IconPicker from './IconPicker.svelte';

  interface Props {
    onsave: (data: { title: string; url: string; icon: string; groupId: string }) => void;
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

  // 外部调用此函数来填入编辑数据，避免 prop 对象引用问题
  export function fillEditData(data: { title: string; url: string; icon: string; groupId: string }) {
    title = data.title || '';
    url = data.url || '';
    icon = data.icon || '';
    groupId = data.groupId || '';
    isEdit = true;
  }

  export function resetForm() {
    title = '';
    url = '';
    icon = '';
    groupId = '';
    isEdit = false;
    error = '';
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';
    if (!title.trim()) { error = '请输入网站名称'; return; }
    if (!url.trim()) { error = '请输入网站链接'; return; }
    let finalUrl: string;
    try {
      finalUrl = url.startsWith('http') ? url : `https://${url}`;
      new URL(finalUrl);
    } catch { error = '请输入有效的链接'; return; }
    onsave({ title: title.trim(), url: finalUrl, icon: icon.trim(), groupId });
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
    <h3 class="modal-title">{isEdit ? '编辑导航' : '添加导航'}</h3>
    <form onsubmit={handleSubmit}>
      <div class="form-group">
        <label class="form-label" for="dial-title">网站名称</label>
        <input id="dial-title" class="form-input" type="text" bind:value={title} placeholder="例如：GitHub" required autocomplete="off" />
      </div>
      <div class="form-group">
        <label class="form-label" for="dial-url">网站链接</label>
        <input id="dial-url" class="form-input" type="text" bind:value={url} placeholder="粘贴链接自动识别名称" onpaste={handleUrlPaste} onblur={handleUrlBlur} required autocomplete="url" />
      </div>
      <div class="form-group">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="form-label">选择图标</label>
        <IconPicker value={icon} onselect={(v) => icon = v} />
      </div>
      <div class="form-group">
        <label class="form-label" for="dial-group">所属分组</label>
        <select id="dial-group" class="form-select" bind:value={groupId}>
          {#each getDialsState().groups as g}
            <option value={g.id}>{g.name}</option>
          {/each}
        </select>
      </div>
      {#if error}
        <div class="form-error" role="alert">{error}</div>
      {/if}
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick={oncancel}>取消</button>
        <button type="submit" class="btn btn-primary">{isEdit ? '保存' : '添加'}</button>
      </div>
    </form>
  </div>
</div>

<style>
  .form-error { color: #ef4444; font-size: 13px; margin-bottom: 12px; padding: 8px 12px; background: rgba(239,68,68,0.08); border-radius: 8px; }
  .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
</style>
