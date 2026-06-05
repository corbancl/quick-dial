<script lang="ts">
import { t } from '../utils/i18n.svelte';
  import { onMount } from 'svelte';

  interface Step {
    title: string;
    desc: string;
    icon: string;
  }

  const steps: Step[] = [
    { title: t('onboard.step1Title'), desc: t('onboard.step1Desc'), icon: '🔍' },
    { title: t('onboard.step2Title'), desc: t('onboard.step2Desc'), icon: '📌' },
    { title: t('onboard.step3Title'), desc: t('onboard.step3Desc'), icon: '🎨' },
    { title: t('onboard.step4Title'), desc: t('onboard.step4Desc'), icon: '🌐' },
  ];

  let show = $state(false);
  let current = $state(0);
  let dismissed = $state(false);

  onMount(() => {
    if (localStorage.getItem('qd-onboarded')) return;
    setTimeout(() => show = true, 500);
  });

  function next() {
    if (current < steps.length - 1) {
      current++;
    } else {
      dismiss();
    }
  }

  function dismiss() {
    show = false;
    dismissed = true;
    localStorage.setItem('qd-onboarded', '1');
  }

  function dotClick(i: number) {
    current = i;
  }
</script>

{#if show && !dismissed}
  <div class="onboard-overlay">
    <div class="onboard-card">
      <span class="onboard-icon">{steps[current].icon}</span>
      <h2 class="onboard-title">{steps[current].title}</h2>
      <p class="onboard-desc">{steps[current].desc}</p>

      <div class="onboard-dots">
        {#each steps as _, i}
          <button class="onboard-dot" class:active={current === i} onclick={() => dotClick(i)} aria-label="第{i + 1}步"></button>
        {/each}
      </div>

      <div class="onboard-actions">
        <button class="btn btn-secondary" onclick={dismiss}>{t('onboard.skip')}</button>
        <button class="btn btn-primary" onclick={next}>
          {current < steps.length - 1 ? t('onboard.next') : t('onboard.start')}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .onboard-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
  }
  .onboard-card {
    background: var(--card-bg, #fff);
    border-radius: 20px;
    padding: 40px 32px 28px;
    text-align: center;
    max-width: 340px;
    width: 90%;
    animation: slideUp 0.3s ease;
  }
  .onboard-icon { font-size: 48px; display: block; margin-bottom: 16px; }
  .onboard-title { font-size: 22px; font-weight: 700; color: var(--text-color); margin-bottom: 8px; }
  .onboard-desc { font-size: 14px; color: var(--text-color); opacity: 0.6; line-height: 1.6; margin-bottom: 24px; }
  .onboard-dots { display: flex; justify-content: center; gap: 8px; margin-bottom: 20px; }
  .onboard-dot {
    width: 8px; height: 8px; border-radius: 50%; border: none;
    background: var(--card-border); cursor: pointer; padding: 0; transition: all 0.2s;
  }
  .onboard-dot.active { background: #3b82f6; width: 24px; border-radius: 4px; }
  .onboard-actions { display: flex; justify-content: space-between; gap: 12px; }
  .onboard-actions .btn { flex: 1; padding: 12px; font-size: 14px; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
