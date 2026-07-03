<script lang="ts">
  import type { LocalSearchResult } from '../utils/localSearch';
  import { highlightTitle, truncateUrl } from '../utils/localSearch';
  import { t } from '../utils/i18n.svelte';

  interface Props {
    results: LocalSearchResult[];
    selectedIndex: number;
    keyword: string;
    engineName: string;
    onselect: (dial: { url: string }) => void;
  }

  let { results, selectedIndex, keyword, engineName, onselect }: Props = $props();
</script>

<div class="local-search-panel">
  <div class="panel-header">
    <span class="panel-icon">📌</span>
    <span>{t('search.local')}</span>
    <span class="panel-count">{results.length}</span>
  </div>

  {#each results as result, i}
    <button
      class="result-item"
      class:selected={i === selectedIndex}
      onclick={() => onselect({ url: result.dial.url })}
    >
      <img
        src={result.dial.icon}
        alt=""
        class="result-icon"
        loading="lazy"
        onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
      <div class="result-info">
        <span class="result-title">{@html highlightTitle(result.dial.title, keyword)}</span>
        <span class="result-url">{truncateUrl(result.dial.url)}</span>
      </div>
      <span class="result-group">{result.groupName || t('group.default')}</span>
    </button>
  {/each}

  <div class="panel-footer">
    {t('search.localHint', { engine: engineName, keyword })}
  </div>
</div>

<style>
  .local-search-panel {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--card-bg, rgba(255,255,255,0.95));
    border: 1px solid var(--card-border, rgba(0,0,0,0.08));
    border-radius: 12px;
    padding: 4px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    z-index: 10;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    max-height: 360px;
    overflow-y: auto;
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px 4px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-color, #1e293b);
    opacity: 0.7;
  }

  .panel-icon {
    font-size: 13px;
  }

  .panel-count {
    font-size: 10px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 8px;
    background: var(--primary-color, #3b82f6);
    color: white;
    opacity: 0.85;
    line-height: 1.5;
  }

  .result-item {
    display: flex;
    align-items: center;
    gap: 10px;
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

  .result-item:hover {
    background: var(--hover-bg, rgba(0,0,0,0.04));
  }

  .result-item.selected {
    background: color-mix(in srgb, var(--primary-color, #3b82f6) 12%, transparent);
    outline: 2px solid var(--primary-color, #3b82f6);
    outline-offset: -2px;
  }

  .result-icon {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .result-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1;
    min-width: 0;
  }

  .result-title {
    font-weight: 500;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .result-title :global(.local-match) {
    color: var(--primary-color, #3b82f6);
    font-weight: 700;
  }

  .result-url {
    font-size: 11px;
    opacity: 0.45;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .result-group {
    font-size: 10px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 8px;
    background: var(--hover-bg, rgba(0,0,0,0.06));
    opacity: 0.55;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .panel-footer {
    padding: 6px 12px 8px;
    font-size: 11px;
    color: var(--text-color, #1e293b);
    opacity: 0.4;
    text-align: center;
  }
</style>
