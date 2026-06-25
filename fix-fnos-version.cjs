const fs = require('fs');
const files = [
  'M:\\new\\fnos\\app\\ui\\manifest.json',
  'M:\\new\\fnos\\app\\ui\\manifest-chrome.json',
  'M:\\new\\fnos\\app\\ui\\version.json',
  'M:\\new\\fnos\\manifest',
];
for (const f of files) {
  if (!fs.existsSync(f)) { console.log('Skip (not found):', f); continue; }
  let text = fs.readFileSync(f, 'utf8');
  text = text.replace(/1\.0\.8/g, '1.0.9');
  fs.writeFileSync(f, text, 'utf8');
  console.log('Updated:', f);
}
