const fs = require('fs');
const path = require('path');

const pkgDir = 'M:/new/packages';
const files = fs.readdirSync(pkgDir).filter(f => f.startsWith('quick-dial-v1.0.8'));

files.forEach(f => {
  const stat = fs.statSync(path.join(pkgDir, f));
  const kb = (stat.size / 1024).toFixed(2);
  const mb = (stat.size / 1024 / 1024).toFixed(2);
  const size = stat.size > 1024 * 1024 ? mb + ' MB' : kb + ' KB';
  console.log(f.padEnd(40) + size);
});
