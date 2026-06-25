const fs = require('fs');
const c = fs.readFileSync('M:/new/website/index.html', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('v1.0') || l.includes('1.0.8') || l.includes('version')) {
    console.log((i+1) + ': ' + l.trim().substring(0, 150));
  }
});
