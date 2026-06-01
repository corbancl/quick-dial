<script lang="ts">
import { t } from '../utils/i18n.svelte';
  import { getSettings } from '../stores/settings.svelte';
  import { formatDate, formatWeekday } from '../utils/theme';

  let hours = $state(0);
  let minutes = $state(0);
  let seconds = $state(0);
  let currentDate = $state(new Date());

  $effect(() => {
    const updateClock = () => {
      const now = new Date();
      hours = now.getHours();
      minutes = now.getMinutes();
      seconds = now.getSeconds();
      currentDate = now;
    };
    
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  });

  function timeStr(): string {
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  function hour12(): number {
    return hours % 12 || 12;
  }

  function ampm(): string {
    return hours >= 12 ? 'PM' : 'AM';
  }

  // 二进制时钟计算
  function toBinary(n: number, bits: number): string {
    return n.toString(2).padStart(bits, '0');
  }

  function getBinaryHours(): string[] {
    return toBinary(hours, 6).split('');
  }

  function getBinaryMinutes(): string[] {
    return toBinary(minutes, 6).split('');
  }

  function getBinarySeconds(): string[] {
    return toBinary(seconds, 6).split('');
  }

  function getStyle(): string {
    return getSettings().clockStyle;
  }
</script>

<div class="clock-widget" class:digital={getStyle() === 'digital'} class:minimal={getStyle() === 'minimal'} class:classic={getStyle() === 'classic'} class:flip={getStyle() === 'flip'} class:neon={getStyle() === 'neon'} class:binary={getStyle() === 'binary'}>
  {#if getStyle() === 'digital'}
    <!-- 数字时钟（默认） -->
    <div class="clock-time">{timeStr()}</div>
    <div class="clock-info">
      {#if getSettings().showDate}
        <span class="clock-date">{formatDate(currentDate)}</span>
      {/if}
      {#if getSettings().showWeekday}
        <span class="clock-weekday">{formatWeekday(currentDate)}</span>
      {/if}
    </div>

  {:else if getStyle() === 'minimal'}
    <!-- 极简时钟 -->
    <div class="clock-time minimal-time">
      {String(hours).padStart(2, '0')}<span class="blink">:</span>{String(minutes).padStart(2, '0')}
    </div>
    <div class="clock-info">
      {#if getSettings().showDate}
        <span class="clock-date">{formatDate(currentDate)}</span>
      {/if}
      {#if getSettings().showWeekday}
        <span class="clock-weekday">{formatWeekday(currentDate)}</span>
      {/if}
    </div>

  {:else if getStyle() === 'classic'}
    <!-- 经典时钟 -->
    <div class="classic-wrapper">
      <div class="classic-time">
        <span class="classic-hour">{hour12()}</span>
        <span class="classic-separator">:</span>
        <span class="classic-minute">{String(minutes).padStart(2, '0')}</span>
        <span class="classic-ampm">{ampm()}</span>
      </div>
      <div class="classic-seconds-bar">
        <div class="classic-seconds-progress" style="width: {(seconds / 60) * 100}%"></div>
      </div>
    </div>
    <div class="clock-info">
      {#if getSettings().showDate}
        <span class="clock-date">{formatDate(currentDate)}</span>
      {/if}
      {#if getSettings().showWeekday}
        <span class="clock-weekday">{formatWeekday(currentDate)}</span>
      {/if}
    </div>

  {:else if getStyle() === 'flip'}
    <!-- 翻页时钟 -->
    <div class="flip-wrapper">
      <div class="flip-unit">
        <div class="flip-card">
          <span class="flip-digit">{String(hours).padStart(2, '0')}</span>
        </div>
        <span class="flip-label">时</span>
      </div>
      <span class="flip-separator">:</span>
      <div class="flip-unit">
        <div class="flip-card">
          <span class="flip-digit">{String(minutes).padStart(2, '0')}</span>
        </div>
        <span class="flip-label">分</span>
      </div>
      <span class="flip-separator">:</span>
      <div class="flip-unit">
        <div class="flip-card">
          <span class="flip-digit">{String(seconds).padStart(2, '0')}</span>
        </div>
        <span class="flip-label">秒</span>
      </div>
    </div>
    <div class="clock-info">
      {#if getSettings().showDate}
        <span class="clock-date">{formatDate(currentDate)}</span>
      {/if}
      {#if getSettings().showWeekday}
        <span class="clock-weekday">{formatWeekday(currentDate)}</span>
      {/if}
    </div>

  {:else if getStyle() === 'neon'}
    <!-- 霓虹时钟 -->
    <div class="neon-time">
      <span class="neon-hour">{String(hours).padStart(2, '0')}</span>
      <span class="neon-separator">:</span>
      <span class="neon-minute">{String(minutes).padStart(2, '0')}</span>
      <span class="neon-seconds">{String(seconds).padStart(2, '0')}</span>
    </div>
    <div class="clock-info neon-info">
      {#if getSettings().showDate}
        <span class="clock-date">{formatDate(currentDate)}</span>
      {/if}
      {#if getSettings().showWeekday}
        <span class="clock-weekday">{formatWeekday(currentDate)}</span>
      {/if}
    </div>

  {:else if getStyle() === 'binary'}
    <!-- 二进制时钟 -->
    <div class="binary-wrapper">
      <div class="binary-row">
        <span class="binary-label">H</span>
        {#each getBinaryHours() as bit, i}
          <div class="binary-bit" class:active={bit === '1'}></div>
        {/each}
      </div>
      <div class="binary-row">
        <span class="binary-label">M</span>
        {#each getBinaryMinutes() as bit, i}
          <div class="binary-bit" class:active={bit === '1'}></div>
        {/each}
      </div>
      <div class="binary-row">
        <span class="binary-label">S</span>
        {#each getBinarySeconds() as bit, i}
          <div class="binary-bit" class:active={bit === '1'}></div>
        {/each}
      </div>
      <div class="binary-decimal">{timeStr()}</div>
    </div>
    <div class="clock-info">
      {#if getSettings().showDate}
        <span class="clock-date">{formatDate(currentDate)}</span>
      {/if}
      {#if getSettings().showWeekday}
        <span class="clock-weekday">{formatWeekday(currentDate)}</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .clock-widget {
    text-align: center;
    user-select: none;
  }

  .clock-time {
    font-size: 64px;
    font-weight: 300;
    line-height: 1.1;
    letter-spacing: 2px;
    color: var(--text-color, #1e293b);
  }

  :global([data-theme="dark"]) .clock-time {
    font-weight: 400;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  .clock-info {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 4px;
    font-size: 15px;
    opacity: 0.6;
    color: var(--text-color, #1e293b);
  }

  :global([data-theme="dark"]) .clock-info {
    opacity: 0.8;
  }

  /* Minimal 样式 */
  .minimal-time {
    font-size: 72px;
    font-weight: 200;
    letter-spacing: -2px;
  }

  .blink {
    animation: blink 1s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* Classic 样式 */
  .classic-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .classic-time {
    display: flex;
    align-items: baseline;
    gap: 2px;
  }

  .classic-hour {
    font-size: 72px;
    font-weight: 600;
    color: var(--text-color, #1e293b);
  }

  .classic-separator {
    font-size: 48px;
    font-weight: 300;
    color: var(--text-color, #1e293b);
    opacity: 0.5;
  }

  .classic-minute {
    font-size: 72px;
    font-weight: 600;
    color: var(--text-color, #1e293b);
  }

  .classic-ampm {
    font-size: 16px;
    font-weight: 500;
    margin-left: 8px;
    color: var(--primary-color, #4f46e5);
  }

  .classic-seconds-bar {
    width: 200px;
    height: 3px;
    background: rgba(0,0,0,0.1);
    border-radius: 2px;
    overflow: hidden;
  }

  .classic-seconds-progress {
    height: 100%;
    background: var(--primary-color, #4f46e5);
    transition: width 1s linear;
  }

  /* Flip 样式 */
  .flip-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .flip-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .flip-card {
    background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 50%, #2a2a2a 50%, #1a1a1a 100%);
    border-radius: 8px;
    padding: 12px 16px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
  }

  .flip-digit {
    font-size: 48px;
    font-weight: 700;
    font-family: 'Courier New', monospace;
    color: #f0f0f0;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  .flip-label {
    font-size: 12px;
    color: var(--text-color, #1e293b);
    opacity: 0.5;
  }

  .flip-separator {
    font-size: 36px;
    font-weight: 300;
    color: var(--text-color, #1e293b);
    opacity: 0.5;
    margin-top: -16px;
  }

  /* Neon 样式 */
  .neon-time {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .neon-hour, .neon-minute {
    font-size: 72px;
    font-weight: 700;
    color: #fff;
    text-shadow: 
      0 0 5px var(--primary-color, #4f46e5),
      0 0 10px var(--primary-color, #4f46e5),
      0 0 20px var(--primary-color, #4f46e5),
      0 0 40px var(--primary-color, #4f46e5);
  }

  .neon-separator {
    font-size: 48px;
    font-weight: 300;
    color: var(--primary-color, #4f46e5);
    animation: neon-pulse 1s ease-in-out infinite;
  }

  .neon-seconds {
    font-size: 24px;
    font-weight: 400;
    color: var(--primary-color, #4f46e5);
    margin-left: 8px;
    text-shadow: 0 0 10px var(--primary-color, #4f46e5);
  }

  @keyframes neon-pulse {
    0%, 100% { opacity: 1; text-shadow: 0 0 10px var(--primary-color, #4f46e5); }
    50% { opacity: 0.5; text-shadow: 0 0 5px var(--primary-color, #4f46e5); }
  }

  .neon-info {
    opacity: 0.8;
    text-shadow: 0 0 5px var(--primary-color, #4f46e5);
  }

  /* Binary 样式 */
  .binary-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: rgba(0,0,0,0.05);
    border-radius: 12px;
  }

  .binary-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .binary-label {
    width: 20px;
    font-size: 14px;
    font-weight: 600;
    color: var(--primary-color, #4f46e5);
  }

  .binary-bit {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: rgba(0,0,0,0.1);
    transition: all 0.2s;
  }

  .binary-bit.active {
    background: var(--primary-color, #4f46e5);
    box-shadow: 0 0 8px var(--primary-color, #4f46e5);
  }

  .binary-decimal {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-color, #1e293b);
    opacity: 0.6;
    margin-top: 8px;
    font-family: 'Courier New', monospace;
  }

  @media (max-width: 640px) {
    .clock-time, .minimal-time, .classic-hour, .classic-minute {
      font-size: 48px;
    }

    .flip-digit {
      font-size: 32px;
    }

    .neon-hour, .neon-minute {
      font-size: 48px;
    }

    .classic-seconds-bar {
      width: 150px;
    }

    .clock-info {
      font-size: 13px;
    }
  }
</style>
