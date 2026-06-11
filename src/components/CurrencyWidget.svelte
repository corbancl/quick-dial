<script lang="ts">
  import { t } from '../utils/i18n.svelte';
  import { getCurrencyData, getCurrencyLoading, getBaseCurrency, getAmount, getError, getTargets, setBaseCurrency, setAmount, fetchRates } from '../stores/currency.svelte';

  const currencyData = $derived(getCurrencyData());
  const isLoading = $derived(getCurrencyLoading());
  const base = $derived(getBaseCurrency());
  const amt = $derived(getAmount());
  const err = $derived(getError());
  const targets = $derived(getTargets());

  const CURRENCIES: Record<string, string> = {
    CNY: '人民币', USD: '美元', EUR: '欧元', JPY: '日元',
    GBP: '英镑', HKD: '港币', KRW: '韩元', AUD: '澳元', CAD: '加元',
  };

  function handleBaseChange(e: Event) {
    setBaseCurrency((e.target as HTMLSelectElement).value);
  }

  function handleAmountInput(e: Event) {
    const v = parseFloat((e.target as HTMLInputElement).value) || 0;
    setAmount(v);
  }

  $effect(() => {
    fetchRates();
  });

  function formatNum(n: number): string {
    if (n >= 1000) return n.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
    if (n >= 1) return n.toFixed(4);
    return n.toFixed(6);
  }
</script>

<div class="currency-section">
  <div class="currency-card">
    <!-- Input row -->
    <div class="currency-input-row">
      <div class="input-group">
        <label class="input-label" for="currency-amount">{t('currency.amount')}</label>
        <input id="currency-amount" type="number" class="currency-input" value={amt} oninput={handleAmountInput} min="0" step="1" />
      </div>
      <div class="input-group">
        <label class="input-label" for="currency-base">{t('currency.base')}</label>
        <select id="currency-base" class="currency-select" value={base} onchange={handleBaseChange}>
          {#each Object.keys(CURRENCIES) as code}
            <option value={code}>{code} - {CURRENCIES[code]}</option>
          {/each}
        </select>
      </div>
      <button class="refresh-btn" onclick={fetchRates} disabled={isLoading}>
        {#if isLoading}
          <span class="mini-spinner"></span>
        {:else}
          {t('currency.refresh')}
        {/if}
      </button>
    </div>

    <!-- Error -->
    {#if err}
      <div class="currency-error">{err}</div>
    {/if}

    <!-- Rates table -->
    {#if currencyData}
      <div class="rates-grid">
        {#each targets as code}
          {@const rate = currencyData.rates[code]}
          {@const conv = currencyData.converted?.[code]}
          {#if rate}
            <div class="rate-card">
              <div class="rate-currency">
                <span class="rate-code">{code}</span>
                <span class="rate-name">{CURRENCIES[code] || code}</span>
              </div>
              <div class="rate-values">
                <div class="rate-main">1 {base} = {formatNum(rate)} {code}</div>
                {#if conv}
                  <div class="rate-converted">{amt} {base} = {formatNum(conv)} {code}</div>
                {/if}
              </div>
            </div>
          {/if}
        {/each}
      </div>
      <div class="rate-updated">{t('currency.updated')}: {currencyData.data_updated || ''}</div>
    {/if}
  </div>
</div>

<style>
  .currency-section {
    width: 100%;
    margin: 20px auto;
    max-width: 800px;
    padding: 0 24px;
  }
  .currency-card {
    background: var(--card-bg, rgba(255,255,255,0.06));
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--card-border, rgba(255,255,255,0.06));
    border-radius: 16px;
    padding: 24px;
  }
  .currency-input-row {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 120px;
  }
  .input-label {
    font-size: 12px;
    color: var(--text-color, #e2e8f0);
    opacity: 0.6;
    font-weight: 500;
  }
  .currency-input, .currency-select {
    padding: 10px 14px;
    border: 1px solid var(--card-border, rgba(255,255,255,0.1));
    border-radius: 8px;
    background: var(--input-bg, rgba(255,255,255,0.04));
    color: var(--text-color, #e2e8f0);
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s;
  }
  .currency-input:focus, .currency-select:focus {
    border-color: var(--accent-color, #3b82f6);
  }
  .currency-select {
    appearance: none;
    cursor: pointer;
    padding-right: 32px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
  }
  .currency-select option {
    background: #1e293b;
    color: #e2e8f0;
  }
  .refresh-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 18px;
    border: 1px solid var(--card-border, rgba(255,255,255,0.1));
    border-radius: 8px;
    background: var(--hover-bg, rgba(255,255,255,0.06));
    color: var(--text-color, #e2e8f0);
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
  }
  .refresh-btn:hover { background: var(--hover-bg, rgba(255,255,255,0.12)); }
  .mini-spinner {
    width: 14px; height: 14px;
    border: 2px solid var(--accent-color); border-top-color: transparent;
    border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .currency-error {
    color: #ef4444; font-size: 13px; margin-bottom: 12px;
  }
  .rates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
  }
  .rate-card {
    padding: 14px 16px;
    border-radius: 10px;
    background: var(--hover-bg, rgba(255,255,255,0.04));
    border: 1px solid var(--card-border, rgba(255,255,255,0.06));
  }
  .rate-currency {
    display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
  }
  .rate-code {
    font-size: 15px; font-weight: 700; color: var(--accent-color, #3b82f6);
  }
  .rate-name {
    font-size: 12px; color: var(--text-color); opacity: 0.5;
  }
  .rate-values { display: flex; flex-direction: column; gap: 2px; }
  .rate-main {
    font-size: 13px; color: var(--text-color); font-family: 'SF Mono','Consolas',monospace;
  }
  .rate-converted {
    font-size: 12px; color: var(--accent-color); opacity: 0.7;
  }
  .rate-updated {
    margin-top: 16px;
    font-size: 11px; color: var(--text-color); opacity: 0.35;
    text-align: right;
  }
</style>
