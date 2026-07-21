#!/usr/bin/env node
/**
 * Quick Dial 浏览器扩展打包脚本 (v1.0.10)
 * 使用 adm-zip 替代 PowerShell Compress-Archive，确保 zip 内路径使用正斜杠 /
 * 产物：
 *   1. Chrome 提交包 (zip)
 *   2. Edge 提交包 (zip)
 *   3. Firefox 提交包 (zip)
 *   4. 离线安装包 (zip)
 *   5. CRX 离线安装包 (crx)
 */

const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = 'M:/new';
const DIST = path.join(ROOT, 'dist');
const PACKAGES = path.join(ROOT, 'packages');
const KEYS = path.join(ROOT, 'keys');
const VERSION = '1.0.10';

const BROWSERS = {
  chrome: { manifest_src: 'manifest.json', label: 'Chrome' },
  edge: { manifest_src: 'manifest-edge.json', label: 'Edge' },
  firefox: { manifest_src: 'manifest-firefox.json', label: 'Firefox' },
};

const CHROME_EXE = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PEM_FILE = path.join(KEYS, 'dist.pem');

/**
 * 用 adm-zip 打包目录，确保路径使用正斜杠
 */
function zipDirWithAdmZip(srcDir, destZip, filterFn) {
  const zip = new AdmZip();
  
  // Walk the directory and add files with forward-slash paths
  function walkDir(dirPath, entryPath = '') {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullLocal = path.join(dirPath, entry.name);
      const zipEntryPath = entryPath ? `${entryPath}/${entry.name}` : entry.name;
      
      if (filterFn && !filterFn(zipEntryPath, entry.isDirectory())) continue;
      
      if (entry.isDirectory()) {
        // Add directory entry
        zip.addFile(zipEntryPath + '/', Buffer.alloc(0));
        walkDir(fullLocal, zipEntryPath);
      } else {
        // Read file content and add with forward-slash path
        const content = fs.readFileSync(fullLocal);
        zip.addFile(zipEntryPath, content);
      }
    }
  }
  
  walkDir(srcDir);
  zip.writeZip(destZip);
  
  const size = fs.statSync(destZip).size;
  console.log(`  Created: ${path.basename(destZip)} (${(size/1024/1024).toFixed(2)} MB)`);
  return destZip;
}

/**
 * Build browser-specific zip package
 */
function buildZipPackage(browserKey, config) {
  const label = config.label;
  const manifestSrc = config.manifest_src;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Building ${label} 提交包`);
  console.log(`${'='.repeat(60)}`);

  // Create temp directory
  const tmpDir = path.join(PACKAGES, `tmp_${browserKey}`);
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true });
  
  // Copy dist to tmp
  copyDirRecursive(DIST, tmpDir);

  // Replace manifest.json with browser-specific version
  const srcManifest = path.join(ROOT, manifestSrc);
  const dstManifest = path.join(tmpDir, 'manifest.json');
  fs.copyFileSync(srcManifest, dstManifest);
  console.log(`  Manifest: ${manifestSrc} -> manifest.json`);

  // Also include the source manifest for reference
  fs.copyFileSync(srcManifest, path.join(tmpDir, `manifest-${browserKey}-source.json`));

  // Files to exclude from browser packages
  const excludeFiles = [
    // Other browser manifests (keep manifest.json and our source)
    // HTML pages (only keep index.html)
  ];
  
  // Remove other browser manifests
  for (const fn of fs.readdirSync(tmpDir)) {
    if (fn.startsWith('manifest-') && fn !== 'manifest.json' && fn !== `manifest-${browserKey}-source.json`) {
      fs.unlinkSync(path.join(tmpDir, fn));
    }
    // Remove HTML pages except index.html
    if (fn.endsWith('.html') && fn !== 'index.html') {
      fs.unlinkSync(path.join(tmpDir, fn));
    }
    // Remove web-only files
    if (['pwa-manifest.json', 'theme-detect.js'].includes(fn)) {
      fs.unlinkSync(path.join(tmpDir, fn));
    }
  }

  // Create zip using adm-zip
  const zipName = `quick-dial-v${VERSION}-${browserKey}.zip`;
  const zipPath = path.join(PACKAGES, zipName);
  
  zipDirWithAdmZip(tmpDir, zipPath);

  // Clean up temp
  fs.rmSync(tmpDir, { recursive: true });
  return zipPath;
}

/**
 * Build offline installation zip
 */
function buildOfflineZip() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Building 离线安装包 (通用)`);
  console.log(`${'='.repeat(60)}`);

  const tmpDir = path.join(PACKAGES, 'tmp_offline');
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true });
  copyDirRecursive(DIST, tmpDir);

  // Clean up unnecessary files
  for (const fn of fs.readdirSync(tmpDir)) {
    if (fn.startsWith('manifest-') && fn !== 'manifest.json') {
      fs.unlinkSync(path.join(tmpDir, fn));
    }
    if (fn.endsWith('.html') && fn !== 'index.html') {
      fs.unlinkSync(path.join(tmpDir, fn));
    }
    if (['pwa-manifest.json', 'theme-detect.js'].includes(fn)) {
      fs.unlinkSync(path.join(tmpDir, fn));
    }
  }

  // Add installation README
  fs.writeFileSync(path.join(tmpDir, '安装说明.txt'), 
    `呲啦起始页 Quick Dial v${VERSION} — 离线安装说明\n` +
    `=============================================\n\n` +
    `Chrome / Edge 安装：\n` +
    `  1. 打开浏览器，地址栏输入 chrome://extensions/ 或 edge://extensions/\n` +
    `  2. 打开右上角"开发者模式"开关\n` +
    `  3. 将本文件夹拖入浏览器窗口\n` +
    `  4. 完成！打开新标签页即可看到\n\n` +
    `Firefox 安装：\n` +
    `  1. 打开 Firefox，地址栏输入 about:debugging\n` +
    `  2. 点击"此Firefox" → "临时载入附加组件"\n` +
    `  3. 选择本文件夹中的 manifest-firefox.json\n` +
    `  4. 完成\n\n` +
    `注意：离线安装的扩展不会自动更新，请定期下载最新版本。\n` +
    `官方网站：https://www.cilacila.cn\n`,
    { encoding: 'utf8' }
  );

  const zipName = `quick-dial-v${VERSION}-offline.zip`;
  const zipPath = path.join(PACKAGES, zipName);
  zipDirWithAdmZip(tmpDir, zipPath);
  fs.rmSync(tmpDir, { recursive: true });
  return zipPath;
}

/**
 * Build Chrome CRX package
 */
function buildCrx() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Building Chrome CRX 离线安装包`);
  console.log(`${'='.repeat(60)}`);

  if (!fs.existsSync(CHROME_EXE)) {
    console.log('  WARNING: Chrome not found, skipping CRX build');
    return null;
  }
  if (!fs.existsSync(PEM_FILE)) {
    console.log('  WARNING: PEM key not found, skipping CRX build');
    return null;
  }

  const crxTmp = path.join(PACKAGES, 'tmp_crx');
  if (fs.existsSync(crxTmp)) fs.rmSync(crxTmp, { recursive: true });
  copyDirRecursive(DIST, crxTmp);

  for (const fn of fs.readdirSync(crxTmp)) {
    if (fn.startsWith('manifest-') && fn !== 'manifest.json') {
      fs.unlinkSync(path.join(crxTmp, fn));
    }
    if (fn.endsWith('.html') && fn !== 'index.html') {
      fs.unlinkSync(path.join(crxTmp, fn));
    }
    if (['pwa-manifest.json', 'theme-detect.js'].includes(fn)) {
      fs.unlinkSync(path.join(crxTmp, fn));
    }
  }

  try {
    execSync(`"${CHROME_EXE}" --headless --disable-gpu --pack-extension="${crxTmp}" --pack-extension-key="${PEM_FILE}"`, 
      { timeout: 30000, stdio: 'pipe' });
  } catch(e) {
    console.log('  Chrome packing error (may still succeed):', e.stderr?.toString().slice(0, 200));
  }

  const expectedCrx = `${crxTmp}.crx`;
  if (fs.existsSync(expectedCrx)) {
    const targetCrx = path.join(PACKAGES, `quick-dial-v${VERSION}.crx`);
    fs.renameSync(expectedCrx, targetCrx);
    const size = fs.statSync(targetCrx).size;
    console.log(`  CRX built: ${targetCrx} (${(size/1024/1024).toFixed(2)} MB)`);
  } else {
    console.log('  CRX not generated');
  }

  fs.rmSync(crxTmp, { recursive: true });
  const crxFile = path.join(PACKAGES, `quick-dial-v${VERSION}.crx`);
  return fs.existsSync(crxFile) ? crxFile : null;
}

/**
 * Helper: copy directory recursively
 */
function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ===== Main =====
console.log(`${'='.repeat(60)}`);
console.log(`  Quick Dial v${VERSION} — 多平台打包构建 (adm-zip)`);
console.log(`${'='.repeat(60)}`);

if (!fs.existsSync(DIST)) {
  console.error('ERROR: dist/ directory not found. Run npm run build first.');
  process.exit(1);
}

fs.mkdirSync(PACKAGES, { recursive: true });

// Clean previous packages
for (const fn of fs.readdirSync(PACKAGES)) {
  if (fn.endsWith('.zip') || fn.endsWith('.crx')) {
    fs.unlinkSync(path.join(PACKAGES, fn));
  }
}
console.log(`  Cleaned ${PACKAGES}/`);

const results = [];

// 1. Browser-specific zip packages
for (const [browserKey, config] of Object.entries(BROWSERS)) {
  try {
    const p = buildZipPackage(browserKey, config);
    results.push(['提交包', config.label, p]);
  } catch(e) {
    console.log(`  FAILED: ${e.message}`);
  }
}

// 2. Offline zip
try {
  const p = buildOfflineZip();
  results.push(['离线包', '通用', p]);
} catch(e) {
  console.log(`  FAILED: ${e.message}`);
}

// 3. CRX
try {
  const p = buildCrx();
  if (p) results.push(['CRX', 'Chrome', p]);
} catch(e) {
  console.log(`  FAILED: ${e.message}`);
}

// Summary
console.log(`\n${'='.repeat(60)}`);
console.log(`  构建完成！产出清单：`);
console.log(`${'='.repeat(60)}`);
for (const [type, browser, filePath] of results) {
  const size = fs.statSync(filePath).size / (1024 * 1024);
  console.log(`  [${type}] ${browser.padEnd(8)} ${path.basename(filePath).padEnd(40)} ${(size).toFixed(2)} MB`);
}
console.log(`\n  输出目录: ${PACKAGES}`);
console.log(`${'='.repeat(60)}`);
