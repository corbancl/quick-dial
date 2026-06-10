/**
 * Quick Dial AI 代理服务
 * 用途：持有 DeepSeek API Key 在服务端，前端无 Key 时通过此代理调用，Key 不泄露
 *
 * 部署方式：
 *   1. 设置环境变量 DEEPSEEK_API_KEY=sk-xxx
 *   2. node proxy-server.js
 *   3. 在 Web 服务器（nginx 等）中反向代理 /api/ai-proxy → http://localhost:7788/api/ai-proxy
 *
 * 安全措施：
 *   - 简单速率限制（60秒内最多30次请求）
 *   - 仅透传模型和消息，不暴露 API Key
 *   - 建议生产环境额外配置 IP 白名单或 Token 验证
 */

const http = require('http');

const PORT = process.env.PROXY_PORT || 7788;
const API_KEY = process.env.DEEPSEEK_API_KEY || '';
const UPSTREAM = 'https://api.deepseek.com/chat/completions';

// 简易速率限制
const rateMap = new Map();
const RATE_WINDOW = 60_000;
const RATE_MAX = 30;

function rateLimit(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateMap.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_MAX;
}

// 定时清理过期记录
setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW;
  for (const [ip, v] of rateMap) { if (v.start < cutoff) rateMap.delete(ip); }
}, 120_000);

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.url !== '/api/ai-proxy' || req.method !== 'POST') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (rateLimit(ip)) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Too many requests, try again later' }));
    return;
  }

  if (!API_KEY) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Server not configured: missing API key' }));
    return;
  }

  // 读取请求体
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const upstreamUrl = new URL(UPSTREAM);
      const isHttps = upstreamUrl.protocol === 'https:';
      const transport = isHttps ? require('https') : require('http');

      const proxyReq = transport.request({
        hostname: upstreamUrl.hostname,
        port: upstreamUrl.port || (isHttps ? 443 : 80),
        path: upstreamUrl.pathname + upstreamUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: 60_000,
      }, proxyRes => {
        let data = '';
        proxyRes.on('data', chunk => { data += chunk; });
        proxyRes.on('end', () => {
          res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'application/json',
          });
          res.end(data);
        });
      });

      proxyReq.on('error', err => {
        console.error('[proxy] upstream error:', err.message);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Upstream error: ' + err.message }));
      });

      proxyReq.on('timeout', () => {
        proxyReq.destroy();
        res.writeHead(504, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Upstream timeout' }));
      });

      proxyReq.write(body);
      proxyReq.end();
    } catch (err) {
      console.error('[proxy] error:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal error' }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`[ai-proxy] listening on :${PORT}`);
  console.log(`[ai-proxy] upstream: ${UPSTREAM}`);
  console.log(`[ai-proxy] key configured: ${API_KEY ? 'yes (' + API_KEY.slice(0, 8) + '...)' : 'NO — set DEEPSEEK_API_KEY'}`);
});
