const fs = require('fs');
const path = require('path');
const dir = 'M:/new/website';
fs.readdirSync(dir).filter(f => f.endsWith('.html')).forEach(f => {
  const c = fs.readFileSync(path.join(dir, f), 'utf8');
  console.log('=== ' + f + ' (' + c.length + ' bytes) ===');
  // Show first 5 lines for structure
  console.log(c.split('\n').slice(0, 3).join('\n'));
  console.log('...');
});
