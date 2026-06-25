const fs = require('fs');
const path = require('path');
const glob = require('child_process');

const dir = 'M:/new/dist';
const files = fs.readdirSync(dir).filter(f => /\.html$/i.test(f) && f !== 'index.html');

files.forEach(f => {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');
  const links = c.match(/href=["'][^"']*["']/gi) || [];
  console.log(f + ':');
  links.forEach(l => console.log('  ' + l));
});
