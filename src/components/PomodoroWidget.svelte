<script lang="ts">
  import { t } from '../utils/i18n.svelte';
  import { getTimer, startTimer, pauseTimer, resetTimer } from '../stores/pomodoro.svelte';

  const state = $derived(getTimer());
  const progress = $derived((state.minutes * 60 + state.seconds) / state.totalSeconds);
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = $derived(circumference * (1 - progress));
  const displayMinutes = $derived(String(state.minutes).padStart(2, '0'));
  const displaySeconds = $derived(String(state.seconds).padStart(2, '0'));
</script>

<div class="pomodoro-section">
  <div class="pomodoro-card">
    <div class="timer-ring">
      <svg width="220" height="220" viewBox="0 0 220 220">
        <circle cx="110" cy="110" r="90" fill="none" stroke="var(--card-border, rgba(255,255,255,0.08))" stroke-width="6"/>
        <circle cx="110" cy="110" r="90" fill="none"
          stroke={state.phase === 'work' ? 'var(--accent-color, #3b82f6)' : '#22c55e'}
          stroke-width="6" stroke-linecap="round"
          stroke-dasharray={circumference} stroke-dashoffset={strokeDashoffset}
          transform="rotate(-90 110 110)"
          style="transition: stroke-dashoffset 0.3s linear;"
        />
      </svg>
      <div class="timer-text">
        <span class="timer-time">{displayMinutes}:{displaySeconds}</span>
        <span class="timer-phase" style="color: {state.phase === 'work' ? 'var(--accent-color, #3b82f6)' : '#22c55e'}">
          {state.phase === 'work' ? t('pomodoro.work') : t('pomodoro.break')}
        </span>
      </div>
    </div>
    <div class="timer-controls">
      {#if state.isRunning}
        <button class="pm-btn" onclick={pauseTimer}>{t('pomodoro.pause')}</button>
      {:else}
        <button class="pm-btn pm-btn-start" onclick={startTimer}>{t('pomodoro.start')}</button>
      {/if}
      <button class="pm-btn" onclick={resetTimer}>{t('pomodoro.reset')}</button>
    </div>
  </div>
</div>

<style>
  .pomodoro-section {
    width: 100%;
    margin: 20px auto;
    max-width: 800px;
    padding: 0 24px;
    display: flex;
    justify-content: center;
  }
  .pomodoro-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 32px;
    border-radius: 20px;
    background: var(--card-bg, rgba(255,255,255,0.06));
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--card-border, rgba(255,255,255,0.06));
  }
  .timer-ring {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .timer-text {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .timer-time {
    font-size: 42px;
    font-weight: 300;
    font-variant-numeric: tabular-nums;
    color: var(--text-color, #e2e8f0);
    letter-spacing: 2px;
  }
  .timer-phase {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.8;
  }
  .timer-controls {
    display: flex;
    gap: 12px;
  }
  .pm-btn {
    padding: 8px 24px;
    border: 1px solid var(--card-border, rgba(255,255,255,0.1));
    border-radius: 8px;
    background: var(--hover-bg, rgba(255,255,255,0.06));
    color: var(--text-color, #e2e8f0);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .pm-btn:hover {
    background: var(--hover-bg, rgba(255,255,255,0.12));
  }
  .pm-btn-start {
    background: var(--accent-color, #3b82f6);
    color: white;
    border-color: transparent;
  }
  .pm-btn-start:hover {
    opacity: 0.9;
  }
</style>
