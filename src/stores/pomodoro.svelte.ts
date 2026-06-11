import type { PomodoroState } from '../types';

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

let timer = $state<PomodoroState>({
  phase: 'work',
  minutes: WORK_MINUTES,
  seconds: 0,
  totalSeconds: WORK_MINUTES * 60,
  isRunning: false,
});

let intervalId: ReturnType<typeof setInterval> | null = null;

function beep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch { /* ignore */ }
}

function tick() {
  if (timer.seconds > 0) {
    timer.seconds--;
  } else if (timer.minutes > 0) {
    timer.minutes--;
    timer.seconds = 59;
  } else {
    beep();
    if (timer.phase === 'work') {
      timer.phase = 'break';
      timer.minutes = BREAK_MINUTES;
      timer.seconds = 0;
      timer.totalSeconds = BREAK_MINUTES * 60;
    } else {
      timer.phase = 'work';
      timer.minutes = WORK_MINUTES;
      timer.seconds = 0;
      timer.totalSeconds = WORK_MINUTES * 60;
    }
  }
}

export function getTimer(): Readonly<PomodoroState> {
  return timer;
}

export function startTimer() {
  if (timer.isRunning) return;
  timer.isRunning = true;
  intervalId = setInterval(tick, 1000);
}

export function pauseTimer() {
  timer.isRunning = false;
  if (intervalId) { clearInterval(intervalId); intervalId = null; }
}

export function resetTimer() {
  pauseTimer();
  timer.phase = 'work';
  timer.minutes = WORK_MINUTES;
  timer.seconds = 0;
  timer.totalSeconds = WORK_MINUTES * 60;
}
