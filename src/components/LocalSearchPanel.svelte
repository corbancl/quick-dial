<script lang="ts">
  import type { LocalSearchResult } from '../utils/localSearch';
  import { truncateUrl } from '../utils/localSearch';
  import { t } from '../utils/i18n.svelte';

  interface Props {
    results: LocalSearchResult[];
    selectedIndex: number;
    keyword: string;
    engineName: string;
    onselect: (dial: { url: string }) => void;
  }

  let { results, selectedIndex, keyword, engineName, onselect }: Props = $props();

  /**
   * 将标题按关键词分割为片段数组，用于逐段渲染
   * 不使用 innerHTML/@html，纯 DOM 拆分
   */
  function splitByKeyword(title: string, kw: string): Array<{ text: string; highlight: boolean }> {
    if (!kw) return [{ text: title, highlight: false }];
    const lowerTitle = title.toLowerCase();
    const lowerKw = kw.toLowerCase();
    const segments: Array<{ text: string; highlight: boolean }> = [];
    let pos = 0;
    while (pos < title.length) {
      const idx = lowerTitle.indexOf(lowerKw, pos);
      if (idx === -1) {
        segments.push({ text: title.slice(pos), highlight: false });
        break;
      }
      if (idx > pos) {
        segments.push({ text: title.slice(pos, idx), highlight: false });
      }
      segments.push({ text: title.slice(idx, idx + kw.length), highlight: true });
      pos = idx + kw.length;
    }
    return segments;
  }
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
        <span class="result-title">
          {#each splitByKeyword(result.dial.title, keyword) as seg}
            {#if seg.highlight}
              <mark class="highlight">{seg.text}</mark>
            {:else}
              {seg.text}
            {/if}
          {/each}
        </span>
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
    font-size: 14px;
  }

  .panel-count {
    background: var(--accent-bg, rgba(99,102,241,0.1));
    color: var(--accent-color, #6366f1);
    padding: 1px 6px;
    border-radius: 8px;
    font-size: 11px;
  }

  .result-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    width: 100%;
    text-align: left;
    color: var(--text-color, #1e293b);
    transition: background 0.15s;
  }

  .result-item:hover {
    background: var(--hover-bg, rgba(0,0,0,0.04));
  }

  .result-item.selected {
    background: var(--accent-bg, rgba(99,102,241,0.1));
  }

  .result-icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
    border-radius: 4px;
  }

  .result-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .result-title {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-flex;
    align-items: center;
    gap: 0;
  }

  .highlight {
    background: var(--accent-bg, rgba(99,102,241,0.15));
    color: var(--accent-color, #6366f1);
    padding: 0 2px;
    border-radius: 2px;
    font-weight: 600;
  }

  .result-url {
    font-size: 11px;
    color: var(--text-muted, #94a3b8);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .result-group {
    font-size: 11px;
    color: var(--text-muted, #94a3b8);
    background: var(--hover-bg, rgba(0,0,0,0.04));
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
  }

  .panel-footer {
    padding: 6px 12px;
    font-size: 11px;
    color: var(--text-muted, #94a3b8);
    text-align: center;
  }
</style>
