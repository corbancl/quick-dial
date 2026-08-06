const fs = require('fs');
const path = require('path');

const dir = 'M:/new/dist';
const files = fs.readdirSync(dir).filter(f => /\.html$/i.test(f) && f !== 'index.html');

files.forEach(f => {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');
  // Only replace the "back to home" link, preserve other index.html refs if any
  c = c.replace(/(href=["'])index\.html(["'])/gi, '$1/$2');
  fs.writeFileSync(p, c, 'utf8');
  console.log('Fixed: ' + f);
});
