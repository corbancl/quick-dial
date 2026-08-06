const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'quickdial-emlog', 'quickdial'); // 顶层 quickdial/
const OUT = path.join(ROOT, 'packages', 'quickdial-emlog-v1.0.16.zip');

if (!fs.existsSync(SRC)) { console.error('源目录不存在: ' + SRC); process.exit(1); }

const zip = new AdmZip();
zip.addLocalFolder(SRC, 'quickdial');
zip.writeZip(OUT);

const z = new AdmZip(OUT);
const entries = z.getEntries().map(e => e.entryName);
console.log('打包完成: ' + OUT);
console.log('条目数: ' + entries.length);
console.log('大小: ' + fs.statSync(OUT).size + ' 字节');

// 校验包内 quickdial.php 的 Plugin URL
const php = z.getEntry('quickdial/quickdial.php');
if (php) {
  const txt = php.getData().toString('utf8');
  const m = txt.match(/\* Plugin URL:\s*(.+)/);
  console.log('包内 Plugin URL: ' + (m ? m[1].trim() : '(未找到)'));
  // 同时确认版本
  const v = txt.match(/\* Version:\s*(.+)/);
  console.log('包内 Version: ' + (v ? v[1].trim() : '(未找到)'));
} else {
  console.error('包内未找到 quickdial/quickdial.php');
  process.exit(2);
}
