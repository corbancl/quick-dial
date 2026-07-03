const fs = require('fs');

// Build all manifests from scratch (original files have encoding corruption)
// Extract key from raw bytes of current manifest.json
const rawKeyContent = fs.readFileSync('public/manifest.json', 'latin1');
const keyMatch = rawKeyContent.match(/"key": "([^"]+)"/);
const extKey = keyMatch ? keyMatch[1] : null;
console.log('Key extracted:', extKey ? extKey.substring(0, 20) + '...' : 'MISSING');

const base = {
  "manifest_version": 3,
  "name": "呲啦起始页 - Quick Dial",
  "version": "1.0.9",
  "version_name": "1.0.9",
  "description": "极简无广告浏览器新标签页，支持自定义导航、多引擎搜索、天气农历、壁纸主题。替代原生标签页的最佳选择。",
  "author": "Quick Dial",
  "homepage_url": "https://www.cilacila.cn",
  "chrome_url_overrides": { "newtab": "index.html" },
  "action": {
    "default_icon": { "16": "js.png", "48": "js.png", "128": "js.png" },
    "default_title": "Quick Dial"
  },
  "permissions": ["storage", "contextMenus"],
  "host_permissions": [
    "https://api.ruseo.cn/*",
    "https://sync.ruseo.cn/*",
    "https://picsum.photos/*",
    "https://api.qrserver.com/*"
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' https://rescdn.apihz.cn https://images.xxapi.cn https: data:; connect-src 'self' https://api.ruseo.cn https://sync.ruseo.cn https://api.rss2json.com https://picsum.photos https://rescdn.apihz.cn https://images.xxapi.cn https://hm.baidu.com https://api.deepseek.com https://dashscope.aliyuncs.com https://api.moonshot.cn https://open.bigmodel.cn https://aip.baidubce.com https://api.openai.com"
  },
  "background": { "service_worker": "background.js" },
  "icons": { "16": "js.png", "48": "js.png", "128": "js.png" }
};

base.key = extKey;

// Chrome manifest (public/manifest.json) - has key + minimum_chrome_version
const chromeManifest = { ...base };
chromeManifest.minimum_chrome_version = "88";
fs.writeFileSync('public/manifest.json', JSON.stringify(chromeManifest, null, 2) + '\n', 'utf8');
console.log('OK: public/manifest.json');

// Chrome-specific (manifest-chrome.json) - same as manifest.json
fs.writeFileSync('public/manifest-chrome.json', JSON.stringify(chromeManifest, null, 2) + '\n', 'utf8');
console.log('OK: public/manifest-chrome.json');

// Edge manifest - Chrome-compatible, no key needed for store
const edgeManifest = { ...base, minimum_chrome_version: "88" };
delete edgeManifest.key;
fs.writeFileSync('public/manifest-edge.json', JSON.stringify(edgeManifest, null, 2) + '\n', 'utf8');
console.log('OK: public/manifest-edge.json');

// Firefox manifest - different background, no key, add browser_specific_settings
const firefoxManifest = { ...base };
delete firefoxManifest.key;
delete firefoxManifest.minimum_chrome_version;
firefoxManifest.background = { "scripts": ["background.js"] };
firefoxManifest.browser_specific_settings = {
  "gecko": {
    "id": "quickdial@cilacila.cn",
    "strict_min_version": "109.0"
  }
};
fs.writeFileSync('public/manifest-firefox.json', JSON.stringify(firefoxManifest, null, 2) + '\n', 'utf8');
console.log('OK: public/manifest-firefox.json');

// fnos versions - same as public but without key
const fnosBase = { ...chromeManifest };
delete fnosBase.key;
delete fnosBase.minimum_chrome_version;
fs.writeFileSync('fnos/app/ui/manifest.json', JSON.stringify(fnosBase, null, 2) + '\n', 'utf8');
console.log('OK: fnos/app/ui/manifest.json');

const fnosChrome = { ...chromeManifest };
delete fnosChrome.key;
fnosChrome.minimum_chrome_version = "88";
fs.writeFileSync('fnos/app/ui/manifest-chrome.json', JSON.stringify(fnosChrome, null, 2) + '\n', 'utf8');
console.log('OK: fnos/app/ui/manifest-chrome.json');

const fnosEdge = { ...base, minimum_chrome_version: "88" };
delete fnosEdge.key;
fs.writeFileSync('fnos/app/ui/manifest-edge.json', JSON.stringify(fnosEdge, null, 2) + '\n', 'utf8');
console.log('OK: fnos/app/ui/manifest-edge.json');

const fnosFirefox = { ...base };
delete fnosFirefox.key;
delete fnosFirefox.minimum_chrome_version;
fnosFirefox.background = { "scripts": ["background.js"] };
fnosFirefox.browser_specific_settings = {
  "gecko": {
    "id": "quickdial@cilacila.cn",
    "strict_min_version": "109.0"
  }
};
fs.writeFileSync('fnos/app/ui/manifest-firefox.json', JSON.stringify(fnosFirefox, null, 2) + '\n', 'utf8');
console.log('OK: fnos/app/ui/manifest-firefox.json');

console.log('\nAll manifests written. Validating...');
const manifestFiles = [
  'public/manifest.json', 'public/manifest-chrome.json', 'public/manifest-edge.json', 'public/manifest-firefox.json',
  'fnos/app/ui/manifest.json', 'fnos/app/ui/manifest-chrome.json', 'fnos/app/ui/manifest-edge.json', 'fnos/app/ui/manifest-firefox.json'
];
let allOk = true;
manifestFiles.forEach(f => {
  try {
    const c = JSON.parse(fs.readFileSync(f, 'utf8'));
    console.log('VALID:', f, 'v' + c.version);
  } catch(e) {
    console.log('INVALID:', f, e.message);
    allOk = false;
  }
});
console.log(allOk ? '\nAll valid!' : '\nSome invalid!');
