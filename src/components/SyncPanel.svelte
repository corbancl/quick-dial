<script lang="ts">
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

  async function handleAuth() {
    if (!username.trim() || !password.trim()) {
      status = '请填写用户名和密码';
      statusOk = false;
      return;
    }
    loading = true;
    status = '';
    const result = isLogin ? await login(username.trim(), password) : await register(username.trim(), password);
    if (result.ok) {
      syncProStatus();
      showToast(isLogin ? '登录成功' : '注册成功', 'success');
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
        // 注入到页面
        let styleEl = document.getElementById('qd-custom-css') as HTMLStyleElement | null;
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = 'qd-custom-css';
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = result.data.customCss;
      }
      status = '已下载云端数据，3秒后自动刷新...';
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
    showToast('已退出登录', 'info');
    onclose();
  }

  function formatTime(iso: string | null): string {
    if (!iso) return '从未同步';
    try {
      const d = new Date(iso);
      return d.toLocaleString('zh-CN');
    } catch { return iso; }
  }
</script>

<div class="modal-overlay" bind:this={overlayEl}>
  <div class="modal-content" bind:this={contentEl}>
    <h3 class="modal-title">☁️ 云同步</h3>

    {#if isLoggedIn()}
      <!-- 已登录 -->
      <p class="sync-notice">💡 数据不会自动同步，点按钮手动上传或下载</p>
      <div class="sync-status">
        <span class="sync-user">👤 {getUsername()}</span>
        <span class="sync-time">同步时间：{formatTime(getLastSyncTime())}</span>
      </div>

      {#if getIsPro()}
        <div class="sync-actions">
          <button class="btn btn-primary" onclick={handleUpload} disabled={loading}>
            {loading ? '同步中...' : '📤 上传到云端'}
          </button>
          <button class="btn btn-secondary" onclick={handleDownload} disabled={loading}>
            📥 从云端下载
          </button>
        </div>
      {:else}
        <p class="sync-pro-only">⚠️ 云同步需 Pro，<span class="pro-link">去设置升级</span></p>
      {/if}

      <div class="form-actions">
        <button class="btn btn-secondary" onclick={handleLogout}>退出登录</button>
        <button class="btn btn-secondary" onclick={onclose}>关闭</button>
      </div>
    {:else}
      <!-- 登录/注册 -->
      <div class="form-group">
        <label class="form-label" for="sync-username">用户名</label>
        <input id="sync-username" class="form-input" type="text" bind:value={username} placeholder="至少2个字符" />
      </div>
      <div class="form-group">
        <label class="form-label" for="sync-password">密码</label>
        <input id="sync-password" class="form-input" type="password" bind:value={password} placeholder="至少6位" onkeydown={(e) => e.key === 'Enter' && handleAuth()} />
      </div>

      <div class="form-actions">
        <button class="btn btn-primary" onclick={handleAuth} disabled={loading}>
          {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
        </button>
        <button class="btn btn-secondary" onclick={onclose}>关闭</button>
      </div>

      <p class="auth-switch">
        {#if isLogin}
          没有账号？<button class="link-btn" onclick={() => { isLogin = false; status = ''; }}>立即注册</button>
        {:else}
          已有账号？<button class="link-btn" onclick={() => { isLogin = true; status = ''; }}>去登录</button>
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
