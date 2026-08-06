const fs = require('fs');
const path = require('path');

const dir = 'M:/new/website';
const pages = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

pages.forEach(p => {
  const c = fs.readFileSync(path.join(dir, p), 'utf8');
  const scripts = c.match(/<script src="([^"]+)"><\/script>/g) || [];
  const hasToggle = c.includes('qdToggleLang');
  console.log(p.padEnd(22) + (hasToggle ? 'Toggle' : 'NO-TOG') + '  Scripts: ' + scripts.join(', '));
});
