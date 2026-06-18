/**
 * Quick Dial - 飞牛NAS 应用服务
 * 兼顾静态文件托管 + /api/apps 飞牛应用发现接口
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const STATIC_DIR = '/app';
const APPS_DIR = '/var/apps';
const PORT = 80;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

// 缓存：每 60 秒刷新一次应用列表
let appCache = null;
let cacheTime = 0;
const CACHE_TTL = 60_000;

function getApps() {
  const now = Date.now();
  if (appCache && (now - cacheTime) < CACHE_TTL) return appCache;

  const apps = [];
  try {
    if (!fs.existsSync(APPS_DIR)) return apps;
    const dirs = fs.readdirSync(APPS_DIR, { withFileTypes: true });
    for (const d of dirs) {
      if (!d.isDirectory() && !d.isSymbolicLink()) continue;
      const mf = path.join(APPS_DIR, d.name, 'manifest');
      if (!fs.existsSync(mf)) continue;

      const content = fs.readFileSync(mf, 'utf8');
      const appnameMatch = content.match(/^appname\s*=\s*(.+)/m);
      const name = appnameMatch ? appnameMatch[1].trim() : d.name;

      // 跳过自身
      if (name === 'quick-dial') continue;
      // 跳过纯服务（无 UI 入口的依赖）
      if (name.startsWith('nodejs') || name.startsWith('python') || name.startsWith('java') || name === 'redis' || name === 'minio' || name === 'mariadb' || name === 'rabbitmq') continue;

      const display = content.match(/display_name\s*=\s*(.+)/);
      const port = content.match(/service_port\s*=\s*(\d+)/);
      if (!display || !port) continue;

      // 跳过非数字端口（如 wizard 占位符）
      const portNum = parseInt(port[1]);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) continue;

      apps.push({
        name: display[1].trim(),
        port: portNum,
      });
    }
  } catch (e) {
    console.error('[api/apps] error:', e.message);
  }

  appCache = apps;
  cacheTime = now;
  return apps;
}

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // /api/apps
  if (req.url === '/api/apps' && req.method === 'GET') {
    const apps = getApps();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(apps));
    return;
  }

  // 静态文件
  const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  let filePath = path.join(STATIC_DIR, urlPath);
  filePath = path.normalize(filePath);

  // 防目录穿越
  if (!filePath.startsWith(STATIC_DIR)) {
    res.writeHead(403);
    res.end('403 Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();

  // 安全检查：无扩展名且非目录 → SPA fallback
  if (!ext && !fs.existsSync(filePath)) {
    filePath = path.join(STATIC_DIR, 'index.html');
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    filePath = path.join(STATIC_DIR, 'index.html');
  }

  const contentType = MIME[ext] || 'application/octet-stream';
  const content = fs.readFileSync(filePath);
  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': content.length,
    'Cache-Control': ext.match(/\.(css|js|woff2?|ttf|png|jpg|svg|ico)$/) ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
  res.end(content);
});

server.listen(PORT, () => {
  console.log(`Quick Dial server started on port ${PORT}`);
});
