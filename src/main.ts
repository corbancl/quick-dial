/// <reference types="svelte" />
import App from './App.svelte';
import { mount } from 'svelte';

// 百度统计 - 动态加载以避免 Vite 打包警告
const analyticsScript = document.createElement('script');
analyticsScript.src = './analytics.js';
analyticsScript.async = true;
document.head.appendChild(analyticsScript);

const app = mount(App, { target: document.getElementById('app')! });

export default app;