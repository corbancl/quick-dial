<script lang="ts">
  import { t } from '../utils/i18n.svelte';
  import { getSettings } from '../stores/settings.svelte';
  import { getQuoteContent, getQuoteSource, getQuoteLoading, getQuoteError, fetchQuote } from '../stores/quote.svelte';

  let spinning = $state(false);

  async function handleRefresh() {
    if (spinning) return;
    spinning = true;
    await fetchQuote();
    spinning = false;
  }

  const content = $derived(getQuoteContent());
  const source = $derived(getQuoteSource());
  const isLoading = $derived(getQuoteLoading());
  const errorMsg = $derived(getQuoteError());
</script>

{#if isLoading && !content}
  <div class="quote-inline quote-loading">
    <span class="quote-spinner"></span>
  </div>
{:else if content}
  <div class="quote-inline">
    <span class="quote-text" title={content}>{content}</span>
    {#if source}
      <span class="quote-source">&mdash; {source}</span>
    {/if}
    <button
      class="quote-refresh"
      class:spinning
      onclick={handleRefresh}
      title={t('quote.refresh')}
      aria-label={t('quote.refresh')}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="23 4 23 10 17 10"/>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
      </svg>
    </button>
  </div>
{/if}

<style>
  .quote-inline {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 2px 0;
    font-size: 12px;
    color: var(--text-color, #e2e8f0);
    opacity: 0.5;
    max-width: 580px;
    margin: 4px auto 0;
    overflow: hidden;
    user-select: none;
  }
  .quote-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 340px;
  }
  .quote-source {
    opacity: 0.5;
    white-space: nowrap;
    font-size: 11px;
  }
  .quote-refresh {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: inherit;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
    flex-shrink: 0;
    margin-left: 4px;
  }
  .quote-inline:hover .quote-refresh {
    opacity: 0.5;
  }
  .quote-refresh:hover {
    opacity: 1 !important;
    background: var(--hover-bg, rgba(255,255,255,0.1));
  }
  .quote-refresh.spinning svg {
    animation: qspin 0.8s linear infinite;
  }
  .quote-loading {
    justify-content: center;
  }
  .quote-spinner {
    width: 10px;
    height: 10px;
    border: 2px solid var(--accent-color, #3b82f6);
    border-top-color: transparent;
    border-radius: 50%;
    animation: qspin 0.6s linear infinite;
  }
  @keyframes qspin { to { transform: rotate(360deg); } }
</style>
