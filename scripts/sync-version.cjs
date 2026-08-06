#!/usr/bin/env node
/**
 * 版本号单源同步脚本
 * 唯一真相源: public/version.json 的 version 字段
 *
 * 用法:
 *   node scripts/sync-version.cjs           从 public/version.json 同步所有文件（修复滞后）
 *   node scripts/sync-version.cjs 1.0.13    升级到 1.0.13 并同步（同时更新 buildDate）
 *   node scripts/sync-version.cjs --check   仅校验一致性，不一致则非零退出
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// 需同步的 manifest 文件（排除 dist/ 构建产物，会被重新构建覆盖）
const MANIFEST_REL = [
  'manifest.json', 'manifest-chrome.json', 'manifest-edge.json', 'manifest-firefox.json',
  'public/manifest.json', 'public/manifest-chrome.json', 'public/manifest-firefox.json', 'public/manifest-edge.json',
  'fnos/app/ui/manifest.json', 'fnos/app/ui/manifest-chrome.json', 'fnos/app/ui/manifest-edge.json', 'fnos/app/ui/manifest-firefox.json',
  'quickdial-emlog/quickdial/web/manifest.json', 'quickdial-emlog/quickdial/web/manifest-chrome.json', 'quickdial-emlog/quickdial/web/manifest-edge.json', 'quickdial-emlog/quickdial/web/manifest-firefox.json',
];

const VERSION_JSON = 'public/version.json';
const PKG_JSON = 'package.json';
const FNOS_MANIFEST = 'fnos/manifest';
const PHP_PLUGIN = 'quickdial-emlog/quickdial/quickdial.php';

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const writeJson = (p, obj) => fs.writeFileSync(path.join(ROOT, p), JSON.stringify(obj, null, 2) + '\n');
const readTxt = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const writeTxt = (p, s) => fs.writeFileSync(path.join(ROOT, p), s);
const todayISO = () => new Date().toISOString().slice(0, 10);
const exists = (p) => fs.existsSync(path.join(ROOT, p));

const arg = process.argv[2];
const checkOnly = arg === '--check';

// 确定目标版本
const cur = readJson(VERSION_JSON);
let target;
if (checkOnly) {
  target = cur.version;
} else if (arg && /^\d+\.\d+\.\d+/.test(arg)) {
  target = arg;
} else {
  target = cur.version;
}

const reports = [];
let mismatch = false;

function syncManifest(rel) {
  if (!exists(rel)) { reports.push(`SKIP    ${rel} (missing)`); return; }
  const j = readJson(rel);
  const before = j.version;
  if (checkOnly) {
    if (before !== target) { mismatch = true; reports.push(`MISMATCH ${rel}: ${before} != ${target}`); }
    return;
  }
  j.version = target;
  if ('version_name' in j) j.version_name = target;
  writeJson(rel, j);
  reports.push(`OK      ${rel}: ${before} -> ${target}`);
}

// public/version.json
if (!checkOnly) {
  cur.version = target;
  cur.buildDate = todayISO();
  writeJson(VERSION_JSON, cur);
}

// package.json
const pkg = readJson(PKG_JSON);
if (checkOnly) {
  if (pkg.version !== target) { mismatch = true; reports.push(`MISMATCH package.json: ${pkg.version} != ${target}`); }
} else {
  const b = pkg.version;
  pkg.version = target;
  writeJson(PKG_JSON, pkg);
  reports.push(`OK      package.json: ${b} -> ${target}`);
}

// 所有 manifest
MANIFEST_REL.forEach(syncManifest);

// fnos/manifest (key=value 格式)
if (exists(FNOS_MANIFEST)) {
  let s = readTxt(FNOS_MANIFEST);
  const m = s.match(/^version=.*$/m);
  if (m) {
    const before = m[0];
    if (checkOnly) {
      if (before !== `version=${target}`) { mismatch = true; reports.push(`MISMATCH fnos/manifest: ${before} != version=${target}`); }
    } else {
      s = s.replace(/^version=.*$/m, `version=${target}`);
      writeTxt(FNOS_MANIFEST, s);
      reports.push(`OK      fnos/manifest: ${before} -> version=${target}`);
    }
  }
} else reports.push(`SKIP    fnos/manifest (missing)`);

// quickdial.php (PHP 注释 Version:)
if (exists(PHP_PLUGIN)) {
  let s = readTxt(PHP_PLUGIN);
  const m = s.match(/^\s*\*\s*Version:\s*.*$/m);
  if (m) {
    const before = m[0].trim();
    if (checkOnly) {
      const bm = before.match(/Version:\s*([\d.]+)/);
      if (!bm || bm[1] !== target) { mismatch = true; reports.push(`MISMATCH quickdial.php: ${before} != Version: ${target}`); }
    } else {
      s = s.replace(/^\s*\*\s*Version:\s*.*$/m, ` * Version: ${target}`);
      writeTxt(PHP_PLUGIN, s);
      reports.push(`OK      quickdial.php: ${before} -> Version: ${target}`);
    }
  }
} else reports.push(`SKIP    quickdial.php (missing)`);

console.log(reports.join('\n'));
if (checkOnly) {
  if (mismatch) { console.error(`\n[版本不一致] 请运行: node scripts/sync-version.cjs <newVersion>`); process.exit(1); }
  console.log(`\n[OK] 所有文件版本一致: ${target}`);
} else {
  console.log(`\n[完成] 已同步所有文件到 ${target}`);
}
