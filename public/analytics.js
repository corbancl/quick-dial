// 百度统计 - 图片像素追踪（兼容 Manifest V3 CSP，不加载外部脚本）
(function() {
  var si = 'f76a8c6d82f80426895a923be73188cb';
  var img = new Image();
  var r = Math.floor(Math.random() * 2147483647);
  img.src = 'https://hm.baidu.com/hm.gif?si=' + si + '&et=0&ep=0&nv=0&st=4&v=pixel-1.0&rnd=' + r + '&su=' + encodeURIComponent(document.referrer || '');
})();
