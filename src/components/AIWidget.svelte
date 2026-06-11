<script lang="ts">
  import { t } from '../utils/i18n.svelte';
  import { getChatMessages, getChatConfig, isChatLoading, sendMessage, clearChat, setAIConfig, getCurrentProvider } from '../stores/chat.svelte';
  import { chatCompletion, BUILTIN_PROVIDERS, getProvider, CUSTOM_MODEL_VALUE } from '../utils/ai';
  import { addNote } from '../stores/notes.svelte';
  import { getIsPro } from '../stores/subscription.svelte';

  import { tick } from 'svelte';

  let { onclose }: { onclose?: () => void } = $props();

  let inputText = $state('');
  let showConfig = $state(false);
  let messagesEl = $state<HTMLDivElement | null>(null);
  let configKey = $state('');
  let configProvider = $state('deepseek');
  let configModel = $state('deepseek-chat');
  let configCustomModel = $state('');
  let configSystemPrompt = $state('');

  function isCustom(val: string): boolean { return val === CUSTOM_MODEL_VALUE; }

  function getEffectiveModel(): string {
    return isCustom(configModel) ? configCustomModel : configModel;
  }

  function openConfig() {
    const c = getChatConfig();
    configProvider = c.provider;
    configKey = c.apiKey;
    configSystemPrompt = c.systemPrompt || '';
    // Check if current model is a built-in one or custom
    const p = getProvider(c.provider);
    const isBuiltin = p?.models.some(m => m.value === c.model);
    configModel = isBuiltin ? c.model : CUSTOM_MODEL_VALUE;
    configCustomModel = isBuiltin ? '' : c.model;
    showConfig = true;
  }

  function saveConfig() {
    setAIConfig({ provider: configProvider, apiKey: configKey, model: getEffectiveModel(), systemPrompt: configSystemPrompt });
    showConfig = false;
  }

  async function handleSend() {
    const text = inputText.trim();
    if (!text || isChatLoading()) return;
    inputText = '';
    await sendMessage(text, chatCompletion);
    await tick();
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  // toast 提示
  let toastText = $state('');
  let toastTimer = $state<ReturnType<typeof setTimeout> | null>(null);

  function showToast(key: string) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText = t(key) || key;
    toastTimer = setTimeout(() => { toastText = ''; }, 2000);
  }

  async function copyToClipboard(text: string) {
    try { await navigator.clipboard.writeText(text); showToast('ai.copied'); }
    catch { /* noop */ }
  }

  function saveToNotes(text: string) {
    addNote(text);
    showToast('ai.noteSaved');
  }

  const messages = $derived(getChatMessages());
  const loading = $derived(isChatLoading());
  const provider = $derived(getCurrentProvider());
</script>

<div class="ai-sidebar">
  <!-- 头部 -->
  <div class="ai-header">
    <div class="ai-header-left" style="color:var(--text-color,#1e293b);">
      <img class="ai-icon" src="aizss.png" alt="AI" />
      <span style="font-weight:600;font-size:15px;color:var(--text-color,#1e293b);">{t('ai.title')}</span>
      <span class="ai-badge">{provider.name}</span>
    </div>
    <div class="ai-header-actions">
      {#if messages.length > 0}
        <button class="ai-btn-icon" onclick={clearChat} title={t('ai.clear')}>⟳</button>
      {/if}
      <button class="ai-btn-icon" onclick={openConfig} title={t('ai.config')}>&#9881;</button>
      <button class="ai-btn-icon" onclick={onclose} title={t('common.close')}>×</button>
    </div>
  </div>

  <!-- 消息列表 -->
  <div class="ai-messages" bind:this={messagesEl}>
    {#if messages.length === 0}
      <div class="ai-welcome">
        <p class="ai-welcome-text">{t('ai.welcome')}</p>
        <div class="ai-suggestions">
          <button class="ai-chip" onclick={() => { inputText = t('ai.suggest1'); handleSend(); }}>{t('ai.suggest1')}</button>
          <button class="ai-chip" onclick={() => { inputText = t('ai.suggest2'); handleSend(); }}>{t('ai.suggest2')}</button>
          <button class="ai-chip" onclick={() => { inputText = t('ai.suggest3'); handleSend(); }}>{t('ai.suggest3')}</button>
        </div>
      </div>
    {:else}
      {#each messages as msg (msg.time)}
        <div class="ai-msg" class:ai-user={msg.role === 'user'} class:ai-assistant={msg.role === 'assistant'}>
          <div class="ai-avatar">
            {#if msg.role === 'assistant'}
              <img src="aizss.png" alt="AI" style="width:20px;height:20px;" />
            {:else}
              <img src="u.png" alt="User" style="width:24px;height:24px;border-radius:50%;" />
            {/if}
          </div>
          <div class="ai-bubble">
            <p class="ai-bubble-text">{msg.text}</p>
            <div class="ai-bubble-foot">
              <span class="ai-time">{new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              {#if msg.role === 'assistant' && msg.text && msg.text !== t('ai.thinking')}
                <button class="ai-bubble-btn" onclick={() => copyToClipboard(msg.text)} title={t('ai.copy')}>📋</button>
                <button class="ai-bubble-btn" onclick={() => saveToNotes(msg.text)} title={t('ai.saveToNotes')}>📝</button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
      {#if loading}
        <div class="ai-msg ai-assistant">
          <div class="ai-avatar"><img src="aizss.png" alt="AI" style="width:20px;height:20px;" /></div>
          <div class="ai-bubble">
            <p class="ai-bubble-text ai-thinking">{t('ai.thinking')}</p>
          </div>
        </div>
      {/if}
    {/if}
  </div>

  <!-- 配置面板 -->
  {#if showConfig}
    <div class="ai-config">
      <div class="ai-config-row">
        <label class="ai-config-label" for="ai-provider">{t('ai.provider')}</label>
        <select id="ai-provider" class="ai-select" bind:value={configProvider} onchange={(e) => {
          const p = getProvider(e.target.value);
          if (p) { configModel = p.defaultModel; configKey = ''; }
        }}>
          {#each BUILTIN_PROVIDERS as p}
            <option value={p.id}>{p.name}</option>
          {/each}
        </select>
      </div>
      {#if getProvider(configProvider)?.needKey !== false}
        <div class="ai-config-row">
          <label class="ai-config-label" for="ai-apikey">{t('ai.apiKey')}</label>
          <input id="ai-apikey" class="ai-input" type="password" bind:value={configKey} placeholder={t('ai.apiKeyHint')} />
        </div>
      {/if}
      <div class="ai-config-row">
        <label class="ai-config-label" for="ai-model">{t('ai.model')}</label>
        <select id="ai-model" class="ai-select" bind:value={configModel} onchange={(e) => {
          if (isCustom(e.target.value) && !configCustomModel) {
            configCustomModel = 'custom-model-name';
          }
        }}>
          {#each (getProvider(configProvider)?.models || []) as m}
            <option value={m.value}>{m.label}</option>
          {/each}
        </select>
      </div>
      {#if isCustom(configModel)}
        <div class="ai-config-row">
          <label class="ai-config-label" for="ai-custom-model">{t('ai.customModel')}</label>
          <!-- svelte-ignore a11y_autofocus -->
          <input id="ai-custom-model" class="ai-input" type="text" bind:value={configCustomModel} placeholder="e.g. my-custom-model" autofocus />
        </div>
      {/if}
      <!-- System Prompt (Pro) -->
      <div class="ai-config-row">
        <span class="ai-config-label">
          {t('ai.systemPrompt')}
          {#if !getIsPro()}
            <span class="ai-pro-badge">PRO</span>
          {/if}
        </span>
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        {#if getIsPro()}
          <textarea id="ai-system-prompt" class="ai-textarea" bind:value={configSystemPrompt} placeholder={t('ai.systemPromptHint')} rows="3"></textarea>
        {:else}
          <div class="ai-locked-field" role="button" tabindex="0" onclick={() => { if (onclose) onclose(); alert(t('ai.systemPromptPro')); }} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { if (onclose) onclose(); alert(t('ai.systemPromptPro')); } }}>
            <span class="ai-locked-text">{t('ai.systemPromptLocked')}</span>
          </div>
        {/if}
      </div>
      <div class="ai-config-actions">
        <button class="ai-config-btn" onclick={saveConfig}>{t('common.confirm')}</button>
        <button class="ai-config-btn ai-config-cancel" onclick={() => showConfig = false}>{t('common.cancel')}</button>
      </div>
    </div>
  {/if}

  <!-- toast 提示 -->
  {#if toastText}
    <div class="ai-toast">{toastText}</div>
  {/if}

  <!-- 输入区 -->
  <div class="ai-input-area">
    <input
      class="ai-input-box"
      type="text"
      bind:value={inputText}
      placeholder={t('ai.placeholder')}
      onkeydown={handleKeydown}
      disabled={loading}
      autocomplete="off"
    />
    <button class="ai-send-btn" onclick={handleSend} disabled={loading || !inputText.trim()}>
      {t('ai.send')}
    </button>
  </div>
</div>

<style>
  .ai-sidebar {
    width: 320px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--card-bg, rgba(255,255,255,0.95));
    border-left: 1px solid var(--card-border, rgba(0,0,0,0.06));
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    font-size: 13px;
  }

  .ai-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--card-border, rgba(0,0,0,0.06));
    flex-shrink: 0;
  }
  .ai-header-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .ai-icon { width: 24px; height: 24px; border-radius: 6px; object-fit: contain; }
  /* .ai-title 已移除，由 ai-badge 替代 */
  .ai-badge { font-size: 12px; padding: 2px 8px; border-radius: 6px; font-weight: 600; background: #1d4ed8; color: #fff; }
  .ai-header-actions { display: flex; gap: 4px; }
  .ai-btn-icon {
    background: none; border: none; font-size: 15px;
    cursor: pointer; padding: 4px; line-height: 1;
    color: var(--text-color, #1e293b); opacity: 0.5;
    transition: opacity 0.15s;
  }
  .ai-btn-icon:hover { opacity: 0.9; }

  .ai-messages {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .ai-welcome { text-align: center; padding: 40px 0 20px; }
  .ai-welcome-text { font-size: 13px; opacity: 0.6; margin: 0 0 16px; }
  .ai-suggestions { display: flex; flex-direction: column; gap: 6px; align-items: center; }
  .ai-chip {
    background: var(--hover-bg, rgba(0,0,0,0.03));
    border: 1px solid var(--card-border, rgba(0,0,0,0.06));
    border-radius: 8px; padding: 6px 14px; font-size: 12px;
    cursor: pointer; color: var(--text-color, #1e293b);
    transition: all 0.15s; max-width: 220px;
  }
  .ai-chip:hover { border-color: rgba(59,130,246,0.3); background: var(--hover-bg, rgba(0,0,0,0.06)); }

  .ai-msg { display: flex; gap: 8px; }
  .ai-user { flex-direction: row-reverse; }
  .ai-avatar { flex-shrink: 0; }
  .ai-avatar img { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; object-fit: cover; background: var(--hover-bg, rgba(0,0,0,0.05)); }

  .ai-bubble {
    max-width: 80%;
    background: var(--hover-bg, rgba(0,0,0,0.03));
    border-radius: 12px;
    padding: 10px 12px;
  }
  .ai-user .ai-bubble {
    background: rgba(59,130,246,0.1);
  }
  .ai-bubble-text { margin: 0; font-size: 13px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
  .ai-thinking { opacity: 0.5; }
  .ai-bubble-foot { display: flex; align-items: center; gap: 6px; margin-top: 6px; }
  .ai-time { font-size: 10px; color: var(--text-color, #1e293b); opacity: 0.3; }
  .ai-bubble-btn {
    background: none; border: none; font-size: 13px;
    cursor: pointer; padding: 0; line-height: 1;
    opacity: 0; transition: opacity 0.15s;
  }
  .ai-bubble:hover .ai-bubble-btn { opacity: 0.5; }
  .ai-bubble-btn:hover { opacity: 0.9 !important; }

  /* toast */
  .ai-toast {
    position: absolute;
    bottom: 56px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.75);
    color: #fff;
    font-size: 12px;
    padding: 6px 16px;
    border-radius: 16px;
    pointer-events: none;
    z-index: 10;
    animation: ai-toast-in 0.2s ease-out;
  }
  @keyframes ai-toast-in {
    from { opacity: 0; transform: translateX(-50%) translateY(8px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .ai-input-area {
    padding: 10px 16px 14px;
    border-top: 1px solid var(--card-border, rgba(0,0,0,0.06));
    display: flex; gap: 8px; flex-shrink: 0;
  }
  .ai-input-box {
    flex: 1; padding: 8px 12px; border-radius: 10px;
    border: 1px solid var(--card-border, rgba(0,0,0,0.06));
    background: var(--input-bg, rgba(0,0,0,0.02));
    color: var(--text-color, #1e293b); font-size: 13px;
    outline: none; box-sizing: border-box;
    transition: border-color 0.2s;
  }
  .ai-input-box:focus { border-color: #3b82f6; }
  .ai-input-box::placeholder { opacity: 0.3; }
  .ai-input-box:disabled { opacity: 0.5; }

  .ai-send-btn {
    padding: 8px 16px; border-radius: 10px; font-size: 13px;
    font-weight: 600; border: none; cursor: pointer;
    background: #3b82f6; color: white; white-space: nowrap;
    transition: opacity 0.2s;
  }
  .ai-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .ai-send-btn:not(:disabled):hover { opacity: 0.9; }

  /* 配置面板 */
  .ai-config {
    padding: 12px 16px;
    border-top: 1px solid var(--card-border, rgba(0,0,0,0.06));
    display: flex; flex-direction: column; gap: 8px;
    flex-shrink: 0;
    max-height: 240px;
    overflow-y: auto;
  }
  .ai-config-row { display: flex; flex-direction: column; gap: 4px; }
  .ai-config-label { font-size: 11px; font-weight: 500; opacity: 0.6; }
  .ai-input, .ai-select {
    width: 100%; padding: 8px 12px; border-radius: 6px;
    border: 1px solid var(--card-border, rgba(0,0,0,0.1));
    background: var(--input-bg, rgba(0,0,0,0.04));
    color: var(--text-color, #1e293b); font-size: 13px;
    outline: none; box-sizing: border-box;
  }
  .ai-select { cursor: pointer; }
  .ai-input:focus, .ai-select:focus { border-color: #3b82f6; }
  .ai-config-actions { display: flex; gap: 8px; margin-top: 4px; }
  .ai-config-btn {
    flex: 1; padding: 6px; border-radius: 6px; font-size: 12px;
    font-weight: 600; border: none; cursor: pointer;
    background: #3b82f6; color: white;
  }
  .ai-config-cancel { background: var(--hover-bg, rgba(0,0,0,0.05)); color: var(--text-color, #1e293b); }
  .ai-textarea {
    width: 100%; padding: 8px 12px; border-radius: 6px;
    border: 1px solid var(--card-border, rgba(0,0,0,0.1));
    background: var(--input-bg, rgba(0,0,0,0.04));
    color: var(--text-color, #1e293b); font-size: 13px;
    outline: none; box-sizing: border-box; resize: vertical;
    font-family: inherit;
  }
  .ai-textarea:focus { border-color: #3b82f6; }
  .ai-textarea::placeholder { opacity: 0.4; }
  .ai-pro-badge {
    font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px;
    background: linear-gradient(135deg, #f59e0b, #f97316); color: #fff;
    margin-left: 6px; vertical-align: middle;
  }
  .ai-locked-field {
    width: 100%; padding: 10px 12px; border-radius: 6px;
    border: 1px dashed var(--card-border, rgba(0,0,0,0.15));
    background: var(--hover-bg, rgba(0,0,0,0.02));
    box-sizing: border-box; cursor: pointer;
    text-align: center; transition: all 0.15s;
  }
  .ai-locked-field:hover {
    border-color: #f59e0b;
    background: rgba(245,158,11,0.05);
  }
  .ai-locked-text { font-size: 12px; opacity: 0.4; }
</style>
