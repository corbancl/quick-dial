<script lang="ts">
  import { t, getLang } from '../utils/i18n.svelte';
  import { modalClose } from '../utils/modalClose';
  import { getIsPro, syncProStatus, getAutoSync, setAutoSync } from '../stores/subscription.svelte';
  import { isLoggedIn, getUsername, login, register, logout, uploadSync, downloadSync, applyRemoteData, getLastSyncTime } from '../utils/sync';
  import { loadData, saveData } from '../utils/storage';
  import { showToast } from '../utils/toast.svelte';

  interface Props {
    onclose: () => void;
  }

  let { onclose }: Props = $props();

  // ====== 云同步 ======
  let username = $state('');
  let password = $state('');
  let isLogin = $state(true);
  let status = $state('');
  let statusOk = $state(true);
  let loading = $state(false);

  async function handleAuth() {
    if (!username.trim() || !password.trim()) {
      status = t('sync.fillRequired');
      statusOk = false;
      return;
    }
    loading = true;
    status = '';
    const result = isLogin ? await login(username.trim(), password) : await register(username.trim(), password);
    if (result.ok) {
      syncProStatus();
      showToast(isLogin ? t('sync.loginOk') : t('sync.registerOk'), 'success');
      onclose();
      return;
    }
    loading = false;
    status = result.msg;
    statusOk = result.ok;
  }

  async function handleUpload() {
    loading = true;
    status = '';
    const result = await uploadSync(true);
    loading = false;
    status = result.msg;
    statusOk = result.ok;
  }

  async function handleDownload() {
    loading = true;
    status = '';
    const result = await downloadSync();
    if (result.ok && result.data) {
      applyRemoteData(result.data as any);
      status = t('sync.downloaded');
      statusOk = true;
      setTimeout(() => window.location.reload(), 3000);
    } else {
      status = result.msg;
      statusOk = false;
    }
    loading = false;
  }

  function handleLogout() {
    logout();
    showToast(t('sync.logout'), 'info');
    onclose();
  }

  function handleToggleAuto(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    setAutoSync(checked);
    showToast(checked ? t('sync.autoOn') : t('sync.autoOff'), 'success');
  }

  function formatTime(iso: string | null): string {
    if (!iso) return t('sync.never');
    try {
      const d = new Date(iso);
      return d.toLocaleString(getLang() === 'zh-CN' ? 'zh-CN' : 'en-US');
    } catch { return iso; }
  }
</script>

<div class="modal-overlay" use:modalClose={onclose}>
  <div class="modal-content">
    <h3 class="modal-title">🔄 {t('sync.title')}</h3>

    {#if isLoggedIn()}
      <p class="sync-notice">💡 {t('sync.manual')}</p>
      <div class="sync-status">
        <span class="sync-user">👤 {getUsername()}</span>
        <span class="sync-time">{t('sync.syncTime')}：{formatTime(getLastSyncTime())}</span>
      </div>

      <div class="sync-actions">
        <button class="btn btn-primary" onclick={handleUpload} disabled={loading}>
          {loading ? t('sync.syncing') : '📤 ' + t('sync.upload')}
        </button>
        <button class="btn btn-secondary" onclick={handleDownload} disabled={loading}>
          {'📥 ' + t('sync.download')}
        </button>
      </div>

      {#if getIsPro()}
        <label class="auto-sync-row">
          <input type="checkbox" checked={getAutoSync()} onchange={handleToggleAuto} />
          <span class="auto-sync-text">
            <span class="auto-sync-title">🔁 {t('sync.auto')}</span>
            <span class="auto-sync-desc">{t('sync.autoDesc')}</span>
          </span>
        </label>
      {:else}
        <p class="sync-free-hint">⚠️ {t('sync.freeHint')}</p>
      {/if}

      <div class="form-actions">
        <button class="btn btn-secondary" onclick={handleLogout}>{t('sync.logout')}</button>
        <button class="btn btn-secondary" onclick={onclose}>{t('common.close')}</button>
      </div>
    {:else}
      <div class="form-group">
        <label class="form-label" for="sync-username">{t('sync.user')}</label>
        <input id="sync-username" class="form-input" type="text" bind:value={username} placeholder={t('sync.plUser')} />
      </div>
      <div class="form-group">
        <label class="form-label" for="sync-password">{t('sync.password')}</label>
        <input id="sync-password" class="form-input" type="password" bind:value={password} placeholder={t('sync.plPwd')} onkeydown={(e) => e.key === 'Enter' && handleAuth()} />
      </div>

      <div class="form-actions">
        <button class="btn btn-primary" onclick={handleAuth} disabled={loading}>
          {loading ? t('sync.processing') : (isLogin ? t('sync.login') : t('sync.register'))}
        </button>
        <button class="btn btn-secondary" onclick={onclose}>{t('common.close')}</button>
      </div>

      <p class="auth-switch">
        {#if isLogin}
          {t('sync.noAccount')}<button class="link-btn" onclick={() => { isLogin = false; status = ''; }}>{t('sync.goRegister')}</button>
        {:else}
          {t('sync.hasAccount')}<button class="link-btn" onclick={() => { isLogin = true; status = ''; }}>{t('sync.goLogin')}</button>
        {/if}
      </p>
    {/if}

    {#if status}
      <p class="sync-status-msg" class:ok={statusOk} class:error={!statusOk}>
        {status}
      </p>
    {/if}
  </div>
</div>

<style>
  .sync-status {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 16px;
    padding: 12px;
    background: var(--hover-bg);
    border-radius: 10px;
  }
  .sync-user { font-size: 14px; font-weight: 600; }
  .sync-time { font-size: 12px; opacity: 0.5; }
  .sync-notice { font-size: 12px; opacity: 0.5; margin-bottom: 12px; line-height: 1.6; }
  .sync-actions { display: flex; gap: 8px; margin-bottom: 16px; }
  .sync-actions .btn { flex: 1; }
  .auto-sync-row { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; background: var(--hover-bg); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 12px; margin-bottom: 16px; cursor: pointer; }
  .auto-sync-row input[type="checkbox"] { width: 18px; height: 18px; margin-top: 2px; accent-color: var(--accent, #4f8fff); flex-shrink: 0; }
  .auto-sync-text { display: flex; flex-direction: column; gap: 2px; }
  .auto-sync-title { font-size: 14px; font-weight: 600; }
  .auto-sync-desc { font-size: 12px; opacity: 0.5; line-height: 1.5; }
  .sync-free-hint { font-size: 12px; opacity: 0.55; line-height: 1.7; padding: 10px 14px; background: var(--hover-bg); border-radius: 10px; margin-bottom: 16px; }
  .auth-switch { text-align: center; font-size: 13px; color: var(--text-color); opacity: 0.5; margin-top: 12px; }
  .link-btn { background: none; border: none; color: #3b82f6; font-size: 13px; font-weight: 600; cursor: pointer; padding: 0; text-decoration: underline; }
  .sync-status-msg { font-size: 12px; padding: 8px 12px; border-radius: 8px; margin-top: 8px; }
  .sync-status-msg.ok { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
  .sync-status-msg.error { background: rgba(239, 68, 68, 0.08); color: #ef4444; }
  .form-group { margin-bottom: 12px; }
  .form-label { display: block; font-size: 13px; margin-bottom: 4px; opacity: 0.7; }
  .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
</style>
