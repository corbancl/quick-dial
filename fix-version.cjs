const fs = require('fs');
const path = require('path');
const files = [
  'M:\\new\\public\\manifest-chrome.json',
  'M:\\new\\public\\manifest-edge.json',
  'M:\\new\\public\\manifest-firefox.json',
];
for (const f of files) {
  let text = fs.readFileSync(f, 'utf8');
  text = text.replace(/"version": "1\.0\.8"/g, '"version": "1.0.9"');
  text = text.replace(/"version_name": "1\.0\.8"/g, '"version_name": "1.0.9"');
  fs.writeFileSync(f, text, 'utf8');
  console.log('Updated:', f);
}
