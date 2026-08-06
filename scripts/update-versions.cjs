const fs = require('fs');

// Fix manifest encoding: detect bad UTF-8 sequences and replace with correct Chinese
function fixManifestEncoding(f) {
  let c = fs.readFileSync(f, 'utf8');
  // Fix known corrupted Chinese strings (names contain truncation damage, descriptions have bad control chars)
  c = c.replace(/"name": "[^"]*Quick Dial"/, '"name": "呲啦起始页 - Quick Dial"');
  c = c.replace(/"description": "[^"]*",/, '"description": "极简无广告浏览器新标签页，支持自定义导航、多引擎搜索、天气农历、壁纸主题。替代原生标签页的最佳选择。",');
  // Update versions
  c = c.replace(/"version": "1\.0\.\d+"/g, '"version": "1.0.8"');
  c = c.replace(/"version_name": "1\.0\.\d+"/g, '"version_name": "1.0.8"');
  fs.writeFileSync(f, c, 'utf8');
  // Verify JSON parse
  try { JSON.parse(c); console.log('OK:', f); } catch(e) { console.log('BAD JSON:', f, e.message); }
}

const files = [
  'public/manifest.json', 'public/manifest-chrome.json', 'public/manifest-edge.json', 'public/manifest-firefox.json',
  'fnos/app/ui/manifest.json', 'fnos/app/ui/manifest-chrome.json', 'fnos/app/ui/manifest-edge.json', 'fnos/app/ui/manifest-firefox.json'
];
files.forEach(fixManifestEncoding);

const vj = JSON.parse(fs.readFileSync('public/version.json', 'utf8'));
vj.version = '1.0.8';
vj.buildDate = '2026-06-22';
vj.downloadUrl = 'https://github.com/corbancc/quick-dial/releases/tag/v1.0.8';
fs.writeFileSync('public/version.json', JSON.stringify(vj, null, 2), 'utf8');
console.log('OK: version.json');
