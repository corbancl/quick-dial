const fs = require('fs');
// Look at the specific broken area in account.html
const raw = fs.readFileSync('M:/new/website/account.html');
const text = raw.toString('utf8');

// Find "呲啦起始/title>" 
const idx = text.indexOf('呲啦起始');
if (idx >= 0) {
  const ctx = text.substring(idx - 5, idx + 20);
  console.log('Context around 呲啦起始:');
  for (let i = 0; i < ctx.length; i++) {
    console.log('  [' + i + '] char=' + ctx[i] + ' code=' + ctx.charCodeAt(i).toString(16));
  }
}

// Also check bytes directly
const byteIdx = raw.indexOf(Buffer.from('呲啦起始'));
if (byteIdx >= 0) {
  console.log('\nBytes around 呲啦起始 (hex):');
  for (let i = Math.max(0, byteIdx - 5); i < Math.min(raw.length, byteIdx + 30); i++) {
    console.log('  [' + i + '] 0x' + raw[i].toString(16).padStart(2,'0') + ' (' + String.fromCharCode(raw[i]) + ')');
  }
}
