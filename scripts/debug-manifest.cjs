const fs = require('fs');
const f = 'public/manifest.json';
const buf = fs.readFileSync(f);
const text = buf.toString('utf8');
const lines = text.split('\n');
// Show lines 0-15 char-by-char with hex
for (let li = 0; li < Math.min(15, lines.length); li++) {
  const line = lines[li];
  console.log('Line ' + li + ' (' + line.length + ' chars):');
  // Show last 20 chars of each line in hex
  let hex = '';
  for (let i = Math.max(0, line.length - 30); i < line.length; i++) {
    hex += line.charCodeAt(i).toString(16).padStart(2,'0') + ' ';
  }
  console.log('  tail hex:', hex);
  console.log('  tail: ' + JSON.stringify(line.substring(line.length - 20)));
}
