#!/usr/bin/env node
/**
 * 一键四端 release 流水线
 * 串联: 版本同步 -> 构建 -> 同步插件端/飞牛端 -> crx 打包 -> (门控)飞牛 fnpack + 官网发布 -> 出包 sha256 校验
 *
 * 用法:
 *   node scripts/release.cjs                本地四端同步当前版本 + 出包校验
 *   node scripts/release.cjs 1.0.13         升级到 1.0.13 并完整发布（需环境变量就绪）
 *   node scripts/release.cjs --no-build    跳过 npm run build（用现有 dist/）
 *
 * 环境变量(远程步骤门控):
 *   FNOS_PASS      飞牛 SSH 密码 -> 启用飞牛 fnpack 打包 + 下载
 *   FNOS_HOST/FNOS_USER/FNOS_PORT  可选，默认 192.168.110.238 / corban / 22
 *   FTP_HOST/FTP_USER/FTP_PASS/FTP_DIR  官网发布凭证 -> 启用 FTP 上传
 */
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PLUGIN_WEB = path.join(ROOT, 'quickdial-emlog/quickdial/web');
const FNOS_UI = path.join(ROOT, 'fnos/app/ui');

const log = (m) => console.log(m);
const sha256 = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const fmt = (n) => (n / 1024).toFixed(0) + ' KB';

// ---------- 文件同步 ----------
function rcopy(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dest, e.name);
    if (e.isDirectory()) rcopy(s, d);
    else fs.copyFileSync(s, d);
  }
}
function clearDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}
function countFiles(dir) {
  let n = 0;
  const walk = (p) => fs.readdirSync(p, { withFileTypes: true }).forEach((e) => {
    const f = path.join(p, e.name);
    if (e.isDirectory()) walk(f); else n++;
  });
  if (fs.existsSync(dir)) walk(dir);
  return n;
}
function syncEndpoint(name, dest, keep = [], platform = null) {
  if (!fs.existsSync(DIST)) { console.error(`[跳过] ${name}: dist/ 不存在，请先构建`); return; }
  // 保留指定子项（如 fnos 的 config/images，非 dist 产物，缺失会导致 fnpack 失败）
  const keepSnap = [];
  for (const k of keep) {
    const src = path.join(dest, k);
    if (fs.existsSync(src)) keepSnap.push([k, src]);
  }
  clearDir(dest);
  rcopy(DIST, dest);
  for (const [k, src] of keepSnap) {
    const target = path.join(dest, k);
    fs.rmSync(target, { recursive: true, force: true });
    rcopy(src, target);
  }
  // 注入平台标识，供云同步 detectPlatform 精确区分端（避免 fallback 成 web）
  if (platform) {
    const idx = path.join(dest, 'index.html');
    if (fs.existsSync(idx)) {
      let html = fs.readFileSync(idx, 'utf-8');
      if (!html.includes('__QD_PLATFORM')) {
        html = html.replace('</head>', `  <script>window.__QD_PLATFORM='${platform}';</script>\n</head>`);
        fs.writeFileSync(idx, html, 'utf-8');
        log(`   🏷️ 已注入 __QD_PLATFORM=${platform}`);
      }
    }
  }
  log(`[OK] 同步 ${name} -> ${path.relative(ROOT, dest)} (${countFiles(dest)} 文件)`);
}

// ---------- 构建 ----------
function build() {
  log('[1/5] 构建 web/扩展端 (npm run build)...');
  execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
}

// ---------- crx 打包 ----------
function readVersion() {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'public/version.json'), 'utf8')).version; }
  catch { return 'x'; }
}
function packCrx() {
  const chromePaths = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    (process.env.LOCALAPPDATA || '') + '/Google/Chrome/Application/chrome.exe',
  ];
  const chrome = chromePaths.find((p) => p && fs.existsSync(p));
  const pem = path.join(ROOT, 'dist.pem');
  if (!chrome) { log('[跳过] crx: 未找到 Chrome，跳过（可手动用 chrome --pack-extension）'); return; }
  if (!fs.existsSync(pem)) { log('[跳过] crx: 缺少 dist.pem'); return; }
  const ver = readVersion();
  const outName = `quickdial-v${ver}.crx`;
  const outPath = path.join(ROOT, 'packages', outName);
  log('[2/5] 打包 crx (Chrome)...');
  const r = spawnSync(chrome, ['--headless', '--pack-extension=' + DIST, '--pack-extension-key=' + pem, '--no-message-box'], { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0) { log('[警告] crx 打包返回码 ' + r.status); return; }
  // Chrome 在 extension 同级输出 dist.crx（即 M:\new\dist.crx），归位重命名
  const tmp = path.join(ROOT, 'dist.crx');
  if (fs.existsSync(tmp)) { fs.renameSync(tmp, outPath); log(`[OK] crx -> packages/${outName}`); }
  else log('[警告] 未找到生成的 dist.crx');
}

// ---------- 飞牛 fnpack (SSH, 门控) ----------
function fnosPack() {
  if (!process.env.FNOS_PASS) { log('[跳过] 飞牛 fnpack: 未设置 FNOS_PASS，跳过'); return; }
  const py = 'C:/Users/Administrator/.workbuddy/binaries/python/envs/default/Scripts/python.exe';
  const env = { ...process.env };
  log('[3/5] 飞牛 fnpack (SSH)...');
  let r = spawnSync(py, [path.join(ROOT, 'scripts/fnos_pack.py')], { cwd: ROOT, stdio: 'inherit', env });
  if (r.status !== 0) { log('[警告] fnos_pack.py 失败'); return; }
  r = spawnSync(py, [path.join(ROOT, 'scripts/fnos_download.py')], { cwd: ROOT, stdio: 'inherit', env });
  if (r.status === 0) log('[OK] 飞牛 fpk 已打包并下载');
  else log('[警告] fnos_download.py 失败');
}

// ---------- 官网 FTP 发布 (门控) ----------
function ftpPublish() {
  const { FTP_HOST, FTP_USER, FTP_PASS, FTP_DIR } = process.env;
  if (!FTP_HOST || !FTP_USER || !FTP_PASS) { log('[跳过] 官网发布: 未设置 FTP_* 凭证，跳过'); return false; }
  log('[4/5] 官网发布 (FTP)...');
  const r = spawnSync('node', [path.join(ROOT, 'scripts/fnos_ftp_upload.cjs')], { cwd: ROOT, stdio: 'inherit', env: process.env });
  if (r.status === 0) { log('[OK] 官网发布完成'); return true; }
  log('[警告] 官网发布失败'); return false;
}

// ---------- 线上比对闭环 (T3) ----------
function onlineVerify() {
  const ver = readVersion();
  const checks = [
    ['crx', `https://www.cilacila.cn/download/quickdial-v${ver}.crx`, path.join(ROOT, 'packages', `quickdial-v${ver}.crx`)],
    ['fpk', `https://www.cilacila.cn/downloads/quick-dial_v${ver}_fnos.fpk`, path.join(ROOT, 'packages', `quick-dial_v${ver}_fnos.fpk`)],
  ];
  log('[校验] 线上 vs 本地 sha256:');
  const tmp = path.join(ROOT, 'packages', '_online_tmp');
  for (const [label, url, local] of checks) {
    if (!fs.existsSync(local)) { log(`   ${label}: 本地产物缺失，跳过`); continue; }
    const r = spawnSync('curl', ['-sL', '-m', '30', '-o', tmp, url], { stdio: 'ignore' });
    if (r.status !== 0 || !fs.existsSync(tmp) || fs.statSync(tmp).size === 0) { log(`   ${label}: 线上下载失败，跳过`); continue; }
    const ok = sha256(tmp) === sha256(local);
    log(`   ${label}: ${ok ? 'IDENTICAL ✔' : 'DIFFERS ✘'} ${sha256(tmp).slice(0, 16)}`);
    fs.existsSync(tmp) && fs.unlinkSync(tmp);
  }
}

// ---------- 出包校验 (sha256) ----------
function verify() {
  log('[5/5] 出包 sha256 校验:');
  const items = [];
  for (const f of fs.readdirSync(path.join(ROOT, 'packages'), { withFileTypes: true })) {
    const p = path.join(ROOT, 'packages', f.name);
    if (f.isFile() && (f.name.endsWith('.crx') || f.name.endsWith('.fpk'))) items.push([f.name, p]);
  }
  for (const [label, p] of items) {
    log(`       ${label.padEnd(28)} ${sha256(p).slice(0, 16)}…  ${fmt(fs.statSync(p).size)}`);
  }
  log(`[完成] 当前版本: ${(() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'public/version.json'), 'utf8')).version; } catch { return '?'; } })()}`);
}

// ---------- 主流程 ----------
function main() {
  const args = process.argv.slice(2);
  const noBuild = args.includes('--no-build');
  const verArg = args.find((a) => /^\d+\.\d+\.\d+/.test(a));

  log('=== 呲啦起始页 一键四端 release ===');
  if (verArg) {
    log(`[0] 版本升级 -> ${verArg}`);
    spawnSync('node', [path.join(ROOT, 'scripts/sync-version.cjs'), verArg], { cwd: ROOT, stdio: 'inherit' });
  }
  if (!noBuild) build(); else log('[1/5] 跳过构建 (--no-build)');
  syncEndpoint('插件端(Emlog)', PLUGIN_WEB, [], 'plugin');
  syncEndpoint('飞牛端(NAS)', FNOS_UI, ['config', 'images']);
  packCrx();
  fnosPack();
  const published = ftpPublish();
  if (published) onlineVerify();
  verify();
}

main();
