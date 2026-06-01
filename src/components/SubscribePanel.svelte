<script lang="ts">
  import { getUsername } from '../utils/sync';
  import { PLANS, createOrder, generateQRCodeSVG } from '../utils/payment';
  import type { PlanInfo } from '../utils/payment';

  interface Props {
    onclose: () => void;
  }

  let { onclose }: Props = $props();

  let selectedPlan = $state('yearly');
  let payMethod = $state<'wechat' | 'alipay'>('wechat');
  let status = $state('');
  let statusOk = $state(true);
  let loading = $state(false);
  let qrCode = $state('');
  let orderInfo = $state<{ plan: string; amount: number } | null>(null);
  let showQr = $state(false);

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

  async function handlePay() {
    loading = true;
    status = '';
    qrCode = '';
    showQr = false;

    const result = await createOrder(selectedPlan, payMethod);
    if (result.ok) {
      if (result.qrCode) {
        qrCode = generateQRCodeSVG(result.qrCode);
        orderInfo = { plan: result.plan || selectedPlan, amount: result.amount || 0 };
        showQr = true;
        status = '请使用' + (payMethod === 'wechat' ? '微信' : '支付宝') + '扫码支付';
        statusOk = true;
      } else if (result.payUrl) {
        // 支付宝 page_pay 兜底
        window.open(result.payUrl, '_blank');
        status = '已在新窗口打开支付页面';
        statusOk = true;
      } else {
        status = '获取支付链接失败';
        statusOk = false;
      }
    } else {
      status = result.msg;
      statusOk = false;
    }
    loading = false;
  }

  function getPlanPrice(plan: PlanInfo): string {
    return '¥' + plan.amount.toFixed(plan.amount === Math.floor(plan.amount) ? 0 : 2);
  }
</script>

<div class="modal-overlay" bind:this={overlayEl}>
  <div class="modal-content subscribe-modal" bind:this={contentEl}>
    <h3 class="modal-title">⚡ {t('sub.title')}</h3>

    {#if showQr}
      ...
      <!-- 支付二维码 -->
      <div class="qr-section">
        <p class="qr-hint">使用 {payMethod === 'wechat' ? '微信' : '支付宝'} 扫码支付</p>
        {#if qrCode}
          <img class="qr-img" src={qrCode} alt="支付二维码" />
        {/if}
        {#if orderInfo}
          <div class="qr-info">
            <span>{PLANS.find(p => p.id === orderInfo.plan)?.name}套餐</span>
            <span class="qr-amount">¥{orderInfo.amount.toFixed(2)}</span>
          </div>
        {/if}
        <p class="qr-tip">{t('sub.paidRefresh')}</p>
      </div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick={() => showQr = false}>返回</button>
        <button class="btn btn-secondary" onclick={onclose}>关闭</button>
      </div>
    {:else}
      <!-- 选择套餐 -->
      <p class="subscribe-user">👤 {getUsername()}</p>

      <div class="plan-list">
        {#each PLANS as plan}
          <label class="plan-card" class:selected={selectedPlan === plan.id}>
            <input type="radio" name="plan" value={plan.id} bind:group={selectedPlan} hidden />
            {#if plan.id === 'yearly'}
              <span class="plan-badge">推荐</span>
            {/if}
            <span class="plan-name">{plan.name}</span>
            <span class="plan-price">{getPlanPrice(plan)}</span>
            <span class="plan-period">{plan.days ? `/${plan.days}天` : '永久'}</span>
          </label>
        {/each}
      </div>

      <!-- 支付方式 -->
      <div class="pay-methods">
        <label class="pay-method" class:selected={payMethod === 'wechat'}>
          <input type="radio" name="method" value="wechat" bind:group={payMethod} hidden />
          <span class="pay-icon">💚</span>
          <span>微信支付</span>
        </label>
        <label class="pay-method" class:selected={payMethod === 'alipay'}>
          <input type="radio" name="method" value="alipay" bind:group={payMethod} hidden />
          <span class="pay-icon">💙</span>
          <span>支付宝</span>
        </label>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary btn-pay" onclick={handlePay} disabled={loading}>
          {loading ? t('sub.creating') : t('sub.pay')}
        </button>
        <button class="btn btn-secondary" onclick={onclose}>关闭</button>
      </div>
    {/if}

    {#if status}
      <p class="pay-status" class:ok={statusOk} class:error={!statusOk}>{status}</p>
    {/if}
  </div>
</div>

<style>
  .subscribe-modal { max-width: 420px; }

  .subscribe-user {
    font-size: 14px;
    margin-bottom: 12px;
    opacity: 0.7;
  }

  .plan-list {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .plan-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 14px 8px;
    border: 2px solid var(--card-border, rgba(0,0,0,0.08));
    border-radius: 12px;
    cursor: pointer;
    position: relative;
    transition: border-color 0.2s;
    background: var(--card-bg, rgba(255,255,255,0.5));
  }

  .plan-card.selected {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.04);
  }

  .plan-badge {
    position: absolute;
    top: -10px;
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 8px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    font-weight: 600;
  }

  .plan-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 4px;
  }

  .plan-price {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-color);
    line-height: 1;
  }

  .plan-period {
    font-size: 11px;
    color: var(--text-color);
    opacity: 0.4;
    margin-top: 2px;
  }

  .pay-methods {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .pay-method {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px;
    border: 2px solid var(--card-border, rgba(0,0,0,0.08));
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;
    transition: border-color 0.2s;
  }

  .pay-method.selected {
    border-color: #3b82f6;
  }

  .pay-icon { font-size: 16px; }

  .btn-pay {
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 600;
  }

  .qr-section {
    text-align: center;
    padding: 16px 0;
  }

  .qr-hint {
    font-size: 14px;
    margin-bottom: 12px;
    color: var(--text-color);
    opacity: 0.7;
  }

  .qr-img {
    width: 200px;
    height: 200px;
    border-radius: 12px;
    border: 2px solid var(--card-border);
    background: white;
    padding: 8px;
  }

  .qr-info {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
    font-size: 14px;
    color: var(--text-color);
  }

  .qr-amount {
    font-size: 20px;
    font-weight: 700;
    color: #ef4444;
  }

  .qr-tip {
    font-size: 12px;
    color: var(--text-color);
    opacity: 0.4;
    margin-top: 12px;
  }

  .pay-status {
    font-size: 12px;
    padding: 8px 12px;
    border-radius: 8px;
    margin-top: 8px;
  }

  .pay-status.ok {
    background: rgba(34, 197, 94, 0.1);
    color: #16a34a;
  }

  .pay-status.error {
    background: rgba(239, 68, 68, 0.08);
    color: #ef4444;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
  }
</style>
