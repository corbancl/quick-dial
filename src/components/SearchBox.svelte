<script lang="ts">
  import { getSettings, setSearchEngine } from '../stores/settings.svelte';
  import { getAvailableEngines, getAllEngines, getLockedEngines, buildSearchUrl } from '../utils/search';
  import { t } from '../utils/i18n.svelte';
  import { getIsPro, addCustomEngine, removeCustomEngine } from '../stores/subscription.svelte';
  import type { SearchEngine } from '../types';

  let keyword = $state('');
  let showEnginePicker = $state(false);
  let showCustomForm = $state(false);
  let customName = $state('');
  let customUrl = $state('');
  let inputEl: HTMLInputElement | undefined = $state();

  function handleSearch() {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    const engineId = getSettings().searchEngine;
    const url = buildSearchUrl(engineId, trimmed);
    window.open(url, '_blank');
  }

  function switchEngine(id: string) {
    const eng = getAllEngines().find(e => e.id === id);
    if (!eng) return;
    if (!getIsPro() && eng.proOnly) return;
    setSearchEngine(id);
    showEnginePicker = false;
    inputEl?.focus();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  function handleAddCustom() {
    const name = customName.trim();
    let url = customUrl.trim();
    if (!name || !url) return;
    if (!url.includes('{keyword}')) {
      url = url + '{keyword}';
    }
    addCustomEngine(name, url);
    customName = '';
    customUrl = '';
    showCustomForm = false;
  }

  // 全局快捷键 Ctrl+K 或 / 聚焦搜索
  function handleGlobalKeydown(e: KeyboardEvent) {
    const activeEl = document.activeElement;
    const isInputting = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';

    if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !isInputting)) {
      e.preventDefault();
      inputEl?.focus();
    }
  }

  $effect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleGlobalKeydown);
      return () => window.removeEventListener('keydown', handleGlobalKeydown);
    }
  });

  function currentEngine(): SearchEngine {
    const id = getSettings().searchEngine;
    return getAllEngines().find(e => e.id === id) ?? getAllEngines()[0]!;
  }
</script>

<div class="search-container">
  <div class="search-box">
    <button
      class="engine-btn"
      onclick={() => showEnginePicker = !showEnginePicker}
      title="切换搜索引擎"
    >
      {currentEngine().name}
      {#if !getIsPro() && currentEngine().proOnly}
        <span class="pro-badge">PRO</span>
      {/if}
      <span class="arrow">{showEnginePicker ? '▲' : '▼'}</span>
    </button>

    <input
      bind:this={inputEl}
      type="text"
      bind:value={keyword}
      onkeydown={handleKeydown}
      placeholder={t('search.placeholder')}
      class="search-input"
    />

    <button class="go-btn" onclick={handleSearch} title="搜索">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    </button>
  </div>

  {#if showEnginePicker}
    <div class="engine-picker">
      {#each getAvailableEngines() as engine}
        <button
          class="engine-option"
          class:active={engine.id === getSettings().searchEngine}
          onclick={() => switchEngine(engine.id)}
        >
          {engine.name}
          {#if engine.isCustom}
            <span class="custom-tag">自定义</span>
            <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
            <span class="delete-custom" role="button" tabindex="0" onclick={(e) => { e.stopPropagation(); removeCustomEngine(engine.id); }} title="删除">×</span>
          {/if}
        </button>
      {/each}

      {#if getLockedEngines().length > 0}
        <div class="engine-divider">
          <span class="divider-label">🔒 Pro 解锁</span>
        </div>
        {#each getLockedEngines() as engine}
          <button class="engine-option locked" disabled>
            {engine.name}
            <span class="lock-icon">🔒</span>
          </button>
        {/each}
      {/if}

      {#if getIsPro()}
        {#if showCustomForm}
          <div class="custom-form">
            <input
              type="text"
              class="custom-input"
              bind:value={customName}
              placeholder="引擎名称"
            />
            <input
              type="text"
              class="custom-input"
              bind:value={customUrl}
              placeholder="搜索URL（用{keyword}占位）"
            />
            <div class="custom-actions">
              <button class="btn-custom-cancel" onclick={() => showCustomForm = false}>{t('dial.cancel')}</button>
              <button class="btn-custom-save" onclick={handleAddCustom}>添加</button>
            </div>
          </div>
        {:else}
          <button class="engine-option add-custom" onclick={() => showCustomForm = true}>
            + 添加自定义引擎
          </button>
        {/if}
      {/if}
    </div>
  {/if}
</div>

{#if showEnginePicker}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="backdrop" onclick={() => { showEnginePicker = false; showCustomForm = false; }} role="button" tabindex="-1"></div>
{/if}

<style>
  .search-container {
    position: relative;
    width: 100%;
    max-width: 560px;
  }

  .search-box {
    display: flex;
    align-items: center;
    background: var(--card-bg, rgba(255,255,255,0.85));
    border: 1px solid var(--card-border, rgba(0,0,0,0.08));
    border-radius: 16px;
    padding: 4px;
    backdrop-filter: blur(12px);
    transition: box-shadow 0.2s, border-color 0.2s;
  }

  .search-box:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }

  .engine-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    border: none;
    background: transparent;
    color: var(--text-color, #1e293b);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 12px;
    transition: background 0.2s;
    white-space: nowrap;
  }

  .engine-btn:hover {
    background: var(--hover-bg, rgba(0,0,0,0.04));
  }

  .pro-badge {
    font-size: 9px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    padding: 1px 5px;
    border-radius: 4px;
  }

  .arrow {
    font-size: 10px;
    opacity: 0.5;
  }

  .search-input {
    flex: 1;
    padding: 10px 8px;
    border: none;
    background: transparent;
    font-size: 15px;
    color: var(--text-color, #1e293b);
    outline: none;
  }

  .search-input::placeholder {
    color: var(--text-color, #1e293b);
    opacity: 0.35;
  }

  .go-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border: none;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
  }

  .go-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  .go-btn:active {
    transform: scale(0.96);
  }

  .engine-picker {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    background: var(--card-bg, rgba(255,255,255,0.95));
    border: 1px solid var(--card-border, rgba(0,0,0,0.08));
    border-radius: 12px;
    padding: 4px;
    backdrop-filter: blur(12px);
    z-index: 10;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    min-width: 220px;
  }

  .engine-option {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 8px 12px;
    border: none;
    background: transparent;
    color: var(--text-color, #1e293b);
    font-size: 13px;
    cursor: pointer;
    border-radius: 8px;
    text-align: left;
    transition: background 0.15s;
  }

  .engine-option:hover:not(.locked) {
    background: var(--hover-bg, rgba(0,0,0,0.04));
  }

  .engine-option.active {
    background: var(--primary-color, #4f46e5);
    color: white;
  }

  .engine-option.locked {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .lock-icon {
    font-size: 11px;
    margin-left: auto;
  }

  .custom-tag {
    font-size: 10px;
    color: var(--primary-color, #4f46e5);
    background: rgba(79, 70, 229, 0.1);
    padding: 1px 5px;
    border-radius: 4px;
    margin-left: auto;
  }

  .delete-custom {
    font-size: 14px;
    color: #ef4444;
    cursor: pointer;
    padding: 0 4px;
    opacity: 0.6;
  }

  .delete-custom:hover {
    opacity: 1;
  }

  .engine-divider {
    display: flex;
    align-items: center;
    padding: 6px 12px 2px;
  }

  .divider-label {
    font-size: 11px;
    color: var(--text-color, #1e293b);
    opacity: 0.4;
  }

  .add-custom {
    color: var(--primary-color, #4f46e5);
    font-weight: 500;
    border-top: 1px solid var(--card-border, rgba(0,0,0,0.06));
    border-radius: 0;
    margin-top: 4px;
    padding-top: 10px;
  }

  .custom-form {
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    border-top: 1px solid var(--card-border, rgba(0,0,0,0.06));
    margin-top: 4px;
  }

  .custom-input {
    padding: 6px 10px;
    border: 1px solid var(--card-border, rgba(0,0,0,0.12));
    border-radius: 8px;
    font-size: 12px;
    background: var(--input-bg, rgba(0,0,0,0.02));
    color: var(--text-color, #1e293b);
    outline: none;
  }

  .custom-input:focus {
    border-color: var(--primary-color, #4f46e5);
  }

  .custom-actions {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
  }

  .btn-custom-cancel, .btn-custom-save {
    padding: 4px 12px;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
  }

  .btn-custom-cancel {
    background: var(--hover-bg, rgba(0,0,0,0.06));
    color: var(--text-color, #1e293b);
  }

  .btn-custom-save {
    background: var(--primary-color, #4f46e5);
    color: white;
  }

  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 9;
  }
</style>
