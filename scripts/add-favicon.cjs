const fs = require('fs');
const path = require('path');
const dir = 'M:/new/dist';
const files = fs.readdirSync(dir).filter(f => /\.html$/i.test(f) && f !== 'index.html');

const favicon = '<link rel="icon" type="image/png" href="./js.png" />';

files.forEach(f => {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');
  
  // Check if already has favicon
  if (/<link[^>]*icon/i.test(c)) {
    console.log('SKIP (already has icon): ' + f);
    return;
  }
  
  // Add after <head> or after <meta charset>
  c = c.replace(/(<meta charset="UTF-8"[^>]*>)/i, '$1\n    ' + favicon);
  fs.writeFileSync(p, c, 'utf8');
  console.log('OK: ' + f);
});
