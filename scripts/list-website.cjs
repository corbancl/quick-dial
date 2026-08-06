const fs = require('fs');
const path = require('path');

function walk(dir, base) {
  const results = [];
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(base, full).replace(/\\/g, '/');
    if (e.isDirectory()) {
      results.push(...walk(full, base));
    } else {
      results.push({ local: full, remote: rel, size: fs.statSync(full).size });
    }
  }
  return results;
}

const files = walk('M:/new/website', 'M:/new/website');
console.log('Total files: ' + files.length);
const totalSize = files.reduce((s, f) => s + f.size, 0);
console.log('Total size: ' + (totalSize / 1024).toFixed(1) + ' KB\n');
files.forEach(f => console.log(f.remote + '  (' + (f.size/1024).toFixed(1) + ' KB)'));
