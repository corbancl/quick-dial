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
const os = require('os');
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
  // 注意: 必须先「实拷贝」到 dest 之外的暂存区，否则 clearDir(dest) 会连同它们一起删除。
  const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'qd-keep-'));
  const keepSnap = [];
  for (const k of keep) {
    const src = path.join(dest, k);
    if (!fs.existsSync(src)) continue;
    const snap = path.join(stage, k.replace(/[\\/]/g, '__'));
    if (fs.statSync(src).isDirectory()) rcopy(src, snap);
    else { fs.mkdirSync(path.dirname(snap), { recursive: true }); fs.copyFileSync(src, snap); }
    keepSnap.push([k, snap]);
  }
  clearDir(dest);
  rcopy(DIST, dest);
  for (const [k, snap] of keepSnap) {
    const target = path.join(dest, k);
    fs.rmSync(target, { recursive: true, force: true });
    if (fs.statSync(snap).isDirectory()) rcopy(snap, target);
    else { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(snap, target); }
  }
  fs.rmSync(stage, { recursive: true, force: true });
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

// ---------- 四端 smoke 校验 (T4 防漏端) ----------
// 在同步后运行；任何失败项累计，主流程据此非零退出。
// 也可用 `node scripts/release.cjs --check` 单独运行（不构建、不改动任何文件）。
function smoke() {
  const failures = [];
  const fail = (m) => { console.error('   ✘ ' + m); failures.push(m); };
  const ok = (m) => console.log('   ✔ ' + m);
  const srcVersion = readVersion();

  // 四端定义：rel=true 表示部署在子目录，必须使用相对路径 ./，禁止绝对 / 路径
  const ends = [
    { name: 'web(dist)',      dir: DIST,      rel: false, need: ['index.html', 'js.png', 'assets'] },
    { name: '插件端(Emlog)',  dir: PLUGIN_WEB, rel: true,  need: ['index.html', 'js.png', 'preview.jpg', 'assets'], platform: 'plugin' },
    { name: '飞牛端(NAS)',    dir: FNOS_UI,   rel: true,  need: ['index.html', 'assets', 'config', 'images/icon_64.png'], platform: 'fnos' },
  ];
  const isNonEmpty = (p) => {
    if (!fs.existsSync(p)) return false;
    if (fs.statSync(p).isDirectory()) {
      let n = 0;
      for (const e of fs.readdirSync(p)) { const fp = path.join(p, e); if (fs.statSync(fp).isDirectory() || fs.statSync(fp).size > 0) n++; }
      return n > 0;
    }
    return fs.statSync(p).size > 0;
  };

  // A. 版本一致性（各端 version.json + quickdial.php 必须 == 源版本）
  console.log('  [A] 版本一致性 (源版本 ' + srcVersion + ')');
  for (const ep of ends) {
    const vj = path.join(ep.dir, 'version.json');
    if (fs.existsSync(vj)) {
      try {
        const v = JSON.parse(fs.readFileSync(vj, 'utf8')).version;
        if (v !== srcVersion) fail(`${ep.name} version.json=${v} ≠ 源版本 ${srcVersion}`);
        else ok(`${ep.name} version.json=${v}`);
      } catch (e) { fail(`${ep.name} version.json 解析失败: ${e.message}`); }
    } else ok(`${ep.name} 无 version.json(跳过)`);
  }
  const php = path.join(ROOT, 'quickdial-emlog/quickdial/quickdial.php');
  if (fs.existsSync(php)) {
    const s = fs.readFileSync(php, 'utf8');
    const vm = s.match(/^\s*\*\s*Version:\s*([\d.]+)/m);
    if (vm) {
      if (vm[1] !== srcVersion) fail(`quickdial.php Version=${vm[1]} ≠ 源版本 ${srcVersion}`);
      else ok(`quickdial.php Version=${vm[1]}`);
    } else fail('quickdial.php 未找到 Version: 字段');
    const nm = s.match(/Plugin Name:\s*([^\r\n]+)/);
    if (nm && /Version:/i.test(nm[1])) fail('quickdial.php Plugin Name 仍含 Version 文本(标题会带版本号!)');
  }

  // B. 跨端构建哈希一致性（若各端引用的主 JS 哈希不同 → 漏端/未重新构建）
  console.log('  [B] 跨端构建哈希一致性');
  const mainHash = (dir) => {
    const idx = path.join(dir, 'index.html');
    if (!fs.existsSync(idx)) return null;
    const m = fs.readFileSync(idx, 'utf8').match(/assets\/(index-[A-Za-z0-9_-]+)\.js/);
    return m ? m[1] : null;
  };
  const hashes = {};
  for (const ep of ends) { const h = mainHash(ep.dir); if (h) hashes[ep.name] = h; }
  const uniq = new Set(Object.values(hashes));
  if (uniq.size > 1) fail('各端构建哈希不一致(疑似漏端/未重新构建): ' + JSON.stringify(hashes));
  else if (uniq.size === 1) ok('各端构建哈希一致: ' + [...uniq][0]);
  else fail('未能从任何端解析到主 JS 哈希');

  // C. 绝对路径泄漏（插件/飞牛端 index.html 不得出现 /assets、/js.png 等绝对路径）
  console.log('  [C] 绝对路径检查 (插件/飞牛必须用 ./)');
  for (const ep of ends) {
    if (!ep.rel) continue;
    const idx = path.join(ep.dir, 'index.html');
    if (!fs.existsSync(idx)) { fail(`${ep.name} 缺少 index.html`); continue; }
    const html = fs.readFileSync(idx, 'utf8');
    const bad = [...html.matchAll(/(?:src|href)\s*=\s*["'](\/[^/"'][^"']*)["']/g)].map((x) => x[1]);
    if (bad.length) fail(`${ep.name} index.html 含绝对路径(应为 ./): ${bad.join(', ')}`);
    else ok(`${ep.name} 路径均为相对`);
  }

  // D. 引用资源存在性（index.html 引用的 ./xxx 必须存在）
  console.log('  [D] 引用资源存在性');
  for (const ep of ends) {
    const idx = path.join(ep.dir, 'index.html');
    if (!fs.existsSync(idx)) { fail(`${ep.name} 缺少 index.html`); continue; }
    const html = fs.readFileSync(idx, 'utf8');
    const refs = [...html.matchAll(/(?:src|href)\s*=\s*["'](\.\/[^"']+)["']/g)].map((x) => x[1].split('?')[0]);
    for (const r of refs) { if (!fs.existsSync(path.resolve(ep.dir, r))) fail(`${ep.name} 引用缺失: ${r}`); }
    ok(`${ep.name} index.html 引用资源已核对(${refs.length} 项)`);
  }

  // E. 关键资源齐全（飞牛端 config、images/icon_64.png 必须存在）
  console.log('  [E] 关键资源齐全');
  for (const ep of ends) {
    for (const f of ep.need) {
      const p = path.join(ep.dir, f);
      if (!isNonEmpty(p)) fail(`${ep.name} 缺少关键资源(或为空): ${f}`);
      else ok(`${ep.name} ✓ ${f}`);
    }
  }

  // F0. 平台标识注入（云同步 detectPlatform 靠它区分端，漏注入会 fallback 成 web）
  console.log('  [F0] 平台标识 __QD_PLATFORM');
  for (const ep of ends) {
    if (!ep.platform) continue;
    const idx = path.join(ep.dir, 'index.html');
    if (!fs.existsSync(idx)) { fail(`${ep.name} 缺 index.html，无法校验平台标识`); continue; }
    const html = fs.readFileSync(idx, 'utf-8');
    if (!html.includes(`__QD_PLATFORM='${ep.platform}'`)) fail(`${ep.name} 未注入 __QD_PLATFORM='${ep.platform}'`);
    else ok(`${ep.name} ✓ __QD_PLATFORM='${ep.platform}'`);
  }

  // F. 飞牛端启动配置 app/ui/config 必须是「文件」且为合法 JSON
  //    历史事故: 该文件曾被同步流程清成空目录, 导致 fnpack 报
  //    Required file "app/ui/config" is missing。仅查存在性不足以拦截。
  console.log('  [F] 飞牛端启动配置 config');
  const fnosCfg = path.join(FNOS_UI, 'config');
  if (!fs.existsSync(fnosCfg)) {
    fail('飞牛端 app/ui/config 不存在');
  } else if (fs.statSync(fnosCfg).isDirectory()) {
    fail('飞牛端 app/ui/config 是目录，应为 JSON 文件(fnpack 会报 missing)');
  } else {
    try {
      const cfg = JSON.parse(fs.readFileSync(fnosCfg, 'utf-8'));
      const app = cfg['.url'] && cfg['.url']['quick-dial.APPLICATION'];
      if (!app) fail('飞牛端 config 缺少 .url["quick-dial.APPLICATION"] 节点');
      else {
        for (const k of ['title', 'icon', 'type', 'port', 'url']) {
          if (!app[k]) fail(`飞牛端 config 缺字段: ${k}`);
        }
        ok(`飞牛端 config 合法 (title=${app.title}, port=${app.port})`);
      }
    } catch (e) {
      fail(`飞牛端 config 不是合法 JSON: ${e.message}`);
    }
  }

  return failures;
}

// ---------- 主流程 ----------
function main() {
  const args = process.argv.slice(2);
  const noBuild = args.includes('--no-build');
  const checkOnly = args.includes('--check');
  const verArg = args.find((a) => /^\d+\.\d+\.\d+/.test(a));

  // --check: 仅运行 smoke，不构建、不改动任何文件（非零退出即校验失败）
  if (checkOnly) {
    log('=== 呲啦起始页 四端 smoke 校验 (--check, 只读) ===');
    const f = smoke();
    if (f.length) { console.error(`\n[smoke] ${f.length} 项校验失败 → 非零退出`); process.exit(1); }
    console.log('\n[smoke] 全部通过 ✔');
    return;
  }

  log('=== 呲啦起始页 一键四端 release ===');
  if (verArg) {
    log(`[0] 版本升级 -> ${verArg}`);
    spawnSync('node', [path.join(ROOT, 'scripts/sync-version.cjs'), verArg], { cwd: ROOT, stdio: 'inherit' });
  }
  if (!noBuild) build(); else log('[1/5] 跳过构建 (--no-build)');
  syncEndpoint('插件端(Emlog)', PLUGIN_WEB, [], 'plugin');
  syncEndpoint('飞牛端(NAS)', FNOS_UI, ['config', 'images'], 'fnos');
  packCrx();
  fnosPack();
  const published = ftpPublish();
  if (published) onlineVerify();
  verify();
  // T4: 同步后门禁校验，失败则非零退出，阻断后续/发布
  log('[6/6] 四端 smoke 校验:');
  const f = smoke();
  if (f.length) { console.error(`\n[smoke] ${f.length} 项校验失败 → 非零退出`); process.exit(1); }
  console.log('\n[完成 + smoke 通过 ✔]');
}

main();
