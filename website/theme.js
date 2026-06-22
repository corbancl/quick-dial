// website-theme.js — 独立页面跟随起始页扩展主题
(function () {
  const isDark = localStorage.getItem('quick-dial-is-dark') === '1';
  const html = document.documentElement;

  if (isDark) {
    html.setAttribute('data-theme', 'dark');
    const root = document.documentElement;
    root.style.setProperty('--bg', '#0f172a');
    root.style.setProperty('--card', '#1e293b');
    root.style.setProperty('--border', '#334155');
    root.style.setProperty('--text', '#f1f5f9');
    root.style.setProperty('--text2', '#94a3b8');
    root.style.setProperty('--shadow', '0 1px 3px rgba(0,0,0,0.3)');
    // 导航条暗色背景
    const nav = document.querySelector('.nav');
    if (nav) nav.style.background = 'rgba(15,23,42,0.92)';
  }

  // 监听扩展主题变化（扩展通过 storage 事件通知）
  window.addEventListener('storage', function (e) {
    if (e.key === 'quick-dial-is-dark') {
      location.reload();
    }
  });
})();
