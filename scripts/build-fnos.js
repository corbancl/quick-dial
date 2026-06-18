/**
 * Quick Dial - 飞牛NAS应用构建脚本
 * 
 * 功能：
 *   1. 确保 dist/ 已构建
 *   2. 清空 fnos/app/ui/ 中的旧文件（保留 config、images）
 *   3. 复制 dist/* 到 fnos/app/ui/
 *   4. 生成 version.json
 * 
 * 使用：npm run build && npm run build:fnos
 * 打包：cd fnos && fnpack build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const FNOS = path.join(ROOT, 'fnos');
const FNOS_UI = path.join(FNOS, 'app', 'ui');

// 保留文件（不被清空）
const KEEP_FILES = ['config', 'images'];

// 1. 检查 dist/
if (!fs.existsSync(DIST)) {
  console.error('❌ dist/ 不存在，请先运行 npm run build');
  process.exit(1);
}

// 2. 清空 fnos/app/ui/（保留特定文件）
console.log('🧹 清理 fnos/app/ui/ ...');
if (fs.existsSync(FNOS_UI)) {
  const entries = fs.readdirSync(FNOS_UI);
  for (const entry of entries) {
    if (KEEP_FILES.includes(entry)) continue;
    const target = path.join(FNOS_UI, entry);
    fs.rmSync(target, { recursive: true, force: true });
  }
}

// 3. 复制 dist/* → fnos/app/ui/
console.log('📦 复制 dist/ → fnos/app/ui/ ...');
const distEntries = fs.readdirSync(DIST);
let fileCount = 0;
for (const entry of distEntries) {
  const src = path.join(DIST, entry);
  const dest = path.join(FNOS_UI, entry);

  if (fs.statSync(src).isDirectory()) {
    copyDirSync(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
  fileCount++;
}

// 3. 生成 version.json
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));
const versionJson = {
  version: pkg.version,
  buildDate: new Date().toISOString().split('T')[0],
  checkUrl: 'https://cilacila.cn/version.json',
  downloadUrl: 'https://github.com/corbancc/quick-dial/releases/latest',
  platform: 'fnos',
};
fs.writeFileSync(
  path.join(FNOS_UI, 'version.json'),
  JSON.stringify(versionJson, null, 2),
  'utf-8'
);

// 4. 复制根级图标到 UI images
const imagesDir = path.join(FNOS_UI, 'images');
if (fs.existsSync(imagesDir)) {
  if (fs.existsSync(path.join(FNOS, 'ICON.PNG'))) {
    fs.copyFileSync(path.join(FNOS, 'ICON.PNG'), path.join(imagesDir, 'icon_64.png'));
  }
  if (fs.existsSync(path.join(FNOS, 'ICON_256.PNG'))) {
    fs.copyFileSync(path.join(FNOS, 'ICON_256.PNG'), path.join(imagesDir, 'icon_256.png'));
  }
}

console.log(`\n✅ 完成！已复制 ${fileCount} 个文件/目录到 fnos/app/ui/`);
console.log(`   版本: v${pkg.version}`);
console.log(`\n🔨 打包命令: cd fnos && fnpack build`);
console.log(`   输出文件: fnos/quick-dial_v${pkg.version}.fpk`);

// 辅助：递归复制目录
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
