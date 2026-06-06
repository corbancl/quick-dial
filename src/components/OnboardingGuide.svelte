<script lang="ts">
import { t, setLang, getLang } from '../utils/i18n.svelte';

  let { oncomplete }: { oncomplete?: () => void } = $props();

  interface Step {
    title: string;
    desc: string;
    icon: string;
  }

  const steps = $derived([
    { title: t('onboard.step1Title'), desc: t('onboard.step1Desc'), icon: '🔍' },
    { title: t('onboard.step2Title'), desc: t('onboard.step2Desc'), icon: '📌' },
    { title: t('onboard.step3Title'), desc: t('onboard.step3Desc'), icon: '🎨' },
    { title: t('onboard.step4Title'), desc: t('onboard.step4Desc'), icon: '🌐' },
  ]);

  let show = $state(false);
  let current = $state(0);
  let dismissed = $state(false);

  $effect(() => {
    if (localStorage.getItem('qd-onboarded')) return;
    setTimeout(() => show = true, 300);
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
    oncomplete?.();
  }

  function dotClick(i: number) {
    current = i;
  }

  function pickLang(lang: 'zh-CN' | 'en') {
    setLang(lang);
  }
</script>

{#if show && !dismissed}
  <div class="onboard-overlay">
    <div class="onboard-card">
      <!-- Logo -->
      <div class="onboard-brand">
        <span class="onboard-logo">⚡</span>
        <h1 class="onboard-name">呲啦起始页</h1>
        <p class="onboard-tagline">Quick Dial</p>
      </div>

      <!-- Step content -->
      <span class="onboard-icon">{steps[current].icon}</span>
      <h2 class="onboard-title">{steps[current].title}</h2>
      <p class="onboard-desc">{steps[current].desc}</p>

      <div class="onboard-dots">
        {#each steps as _, i}
          <button class="onboard-dot" class:active={current === i} onclick={() => dotClick(i)} aria-label="第{i + 1}步"></button>
        {/each}
      </div>

      <div class="onboard-actions">
        <button class="onboard-btn skip" onclick={dismiss}>{t('onboard.skip')}</button>
        <button class="onboard-btn primary" onclick={next}>
          {current < steps.length - 1 ? t('onboard.next') : t('onboard.start')}
        </button>
      </div>

      <!-- Language switcher at bottom -->
      <div class="onboard-lang">
        <button class:active={getLang() === 'zh-CN'} onclick={() => pickLang('zh-CN')}>中文</button>
        <button class:active={getLang() === 'en'} onclick={() => pickLang('en')}>English</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .onboard-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: var(--bg-color, #f8fafc);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.4s ease;
  }
  .onboard-card {
    text-align: center;
    max-width: 380px;
    width: 90%;
    padding: 48px 32px 32px;
    animation: slideUp 0.5s ease;
  }
  .onboard-brand {
    margin-bottom: 32px;
  }
  .onboard-logo {
    font-size: 56px;
    display: block;
    margin-bottom: 8px;
  }
  .onboard-name {
    font-size: 28px;
    font-weight: 800;
    color: var(--text-color, #1e293b);
    letter-spacing: -1px;
  }
  .onboard-tagline {
    font-size: 13px;
    color: var(--accent, #3b82f6);
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .onboard-icon { font-size: 64px; display: block; margin: 20px 0 12px; }
  .onboard-title { font-size: 20px; font-weight: 700; color: var(--text-color); margin-bottom: 8px; }
  .onboard-desc { font-size: 14px; color: var(--text-color); opacity: 0.55; line-height: 1.7; max-width: 280px; margin: 0 auto 28px; }
  .onboard-dots { display: flex; justify-content: center; gap: 8px; margin-bottom: 24px; }
  .onboard-dot {
    width: 8px; height: 8px; border-radius: 50%; border: none;
    background: var(--card-border, #e2e8f0); cursor: pointer; padding: 0; transition: all 0.3s;
  }
  .onboard-dot.active { background: #3b82f6; width: 24px; border-radius: 4px; }
  .onboard-actions { display: flex; justify-content: space-between; gap: 12px; }
  .onboard-btn { flex: 1; padding: 14px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
  .onboard-btn.primary { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
  .onboard-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
  .onboard-btn.skip { background: var(--hover-bg, rgba(0,0,0,0.04)); color: var(--text-color); opacity: 0.6; }
  .onboard-btn.skip:hover { opacity: 1; }
  .onboard-lang { margin-top: 28px; display: flex; justify-content: center; gap: 4px; }
  .onboard-lang button {
    padding: 6px 16px; border-radius: 20px; border: 1px solid var(--card-border, #e2e8f0);
    background: none; font-size: 12px; cursor: pointer; color: var(--text-color); opacity: 0.5; transition: all 0.2s;
  }
  .onboard-lang button.active { opacity: 1; background: var(--accent, #3b82f6); color: white; border-color: var(--accent); }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
</style>
