<script lang="ts">
import { t, getLang } from '../utils/i18n.svelte';
  import { modalClose } from '../utils/modalClose';
  import { getIsPro, syncProStatus } from '../stores/subscription.svelte';
  import { isLoggedIn, getUsername, login, register, logout, uploadSync, downloadSync, getLastSyncTime } from '../utils/sync';
  import { loadData, saveData } from '../utils/storage';
  import { showToast } from '../utils/toast.svelte';

  interface Props {
    onclose: () => void;
  }

  let { onclose }: Props = $props();

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
    const result = await uploadSync();
    loading = false;
    status = result.msg;
    statusOk = result.ok;
  }

  async function handleDownload() {
    loading = true;
    status = '';
    const result = await downloadSync();
    if (result.ok && result.data) {
      saveData(result.data as any);
      // 同步自定义 CSS
      if (result.data.customCss !== undefined) {
        localStorage.setItem('quick-dial-custom-css', result.data.customCss);
        let styleEl = document.getElementById('qd-custom-css') as HTMLStyleElement | null;
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = 'qd-custom-css';
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = result.data.customCss;
      }
      // 同步自定义标题
      if (result.data.customTitle !== undefined) {
        localStorage.setItem('quick-dial-custom-title', result.data.customTitle);
        document.title = result.data.customTitle || '';
      }
      // 同步自定义底部
      if (result.data.customFooter !== undefined) {
        localStorage.setItem('quick-dial-custom-footer', result.data.customFooter);
      }
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
    <h3 class="modal-title">☁️ {t('sync.title')}</h3>

    {#if isLoggedIn()}
      <!-- 已{t('sync.login')} -->
      <p class="sync-notice">💡 {t('sync.manual')}</p>
      <div class="sync-status">
        <span class="sync-user">👤 {getUsername()}</span>
        <span class="sync-time">{t('sync.syncTime')}：{formatTime(getLastSyncTime())}</span>
      </div>

      {#if getIsPro()}
        <div class="sync-actions">
          <button class="btn btn-primary" onclick={handleUpload} disabled={loading}>
            {loading ? t('sync.syncing') : '📤 ' + t('sync.upload')}
          </button>
          <button class="btn btn-secondary" onclick={handleDownload} disabled={loading}>
            {'📥 ' + t('sync.download')}
          </button>
        </div>
      {:else}
        <p class="sync-pro-only">⚠️ {t('sync.proReq')}</p>
      {/if}

      <div class="form-actions">
        <button class="btn btn-secondary" onclick={handleLogout}>{t('sync.logout')}</button>
        <button class="btn btn-secondary" onclick={onclose}>{t('common.close')}</button>
      </div>
    {:else}
      <!-- {t('sync.login')}/{t('sync.register')} -->
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
  .sync-pro-only { text-align: center; padding: 20px; opacity: 0.5; font-size: 13px; line-height: 1.8; }
  .auth-switch { text-align: center; font-size: 13px; color: var(--text-color); opacity: 0.5; margin-top: 12px; }
  .link-btn { background: none; border: none; color: #3b82f6; font-size: 13px; font-weight: 600; cursor: pointer; padding: 0; text-decoration: underline; }
  .sync-status-msg { font-size: 12px; padding: 8px 12px; border-radius: 8px; margin-top: 8px; }
  .sync-status-msg.ok { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
  .sync-status-msg.error { background: rgba(239, 68, 68, 0.08); color: #ef4444; }
  .form-group { margin-bottom: 12px; }
  .form-label { display: block; font-size: 13px; margin-bottom: 4px; opacity: 0.7; }
  .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
</style>
