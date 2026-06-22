// lang.js — 语言偏好持久化，自动跳转
(function(){
  var lang = localStorage.getItem('qd-site-lang') || 'zh';
  var page = location.pathname.split('/').pop().replace(/\/$/,'') || 'index.html';
  var isEn = page.indexOf('en-') === 0 || page === 'en.html';

  // 页面语言与偏好不符 → 自动跳到对应语言版
  if (lang === 'en' && !isEn) {
    var t = page === 'index.html' ? 'en.html' : page.replace(/^(\w+)\.html$/, 'en-$1.html');
    location.replace(t + location.hash); return;
  }
  if (lang === 'zh' && isEn) {
    var t = page === 'en.html' ? './' : page.replace(/^en-(\w+)\.html$/, '$1.html');
    location.replace(t + location.hash); return;
  }

  window.qdToggleLang = function(){
    var next = lang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('qd-site-lang', next);
    var map = {
      'index.html':'en.html','en.html':'./',
      'privacy.html':'en-privacy.html','en-privacy.html':'privacy.html',
      'account.html':'en-account.html','en-account.html':'account.html',
      'about.html':'en-about.html','en-about.html':'about.html',
      'copyright.html':'en-copyright.html','en-copyright.html':'copyright.html',
      'contact.html':'en-contact.html','en-contact.html':'contact.html',
      'guide.html':'en-guide.html','en-guide.html':'guide.html'
    };
    location.href = map[page] || (next === 'zh' ? './' : 'en.html');
  };
})();
