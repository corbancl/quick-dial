// Pro 高级动效：全局微交互开关
// 仅 Pro 用户可开启。开启后给 body 加 .pro-motion 类，
// app.css 中 :global(body.pro-motion ...) 据此施加克制的微交互。

const MOTION_KEY = 'quick-dial-pro-motion';

export function getProMotion(): boolean {
  return localStorage.getItem(MOTION_KEY) === '1';
}

export function setProMotion(on: boolean): void {
  localStorage.setItem(MOTION_KEY, on ? '1' : '0');
  applyProMotion();
}

export function applyProMotion(): void {
  document.body.classList.toggle('pro-motion', getProMotion());
}
