/// <reference types="svelte" />
import App from './App.svelte';
import { mount } from 'svelte';

// 百度统计 - 图片像素追踪（兼容 Manifest V3 CSP）
// Web 和扩展端统一使用此方式
const analyticsScript = document.createElement('script');
analyticsScript.src = './analytics.js';
analyticsScript.async = true;
document.head.appendChild(analyticsScript);

const app = mount(App, { target: document.getElementById('app')! });

export default app;