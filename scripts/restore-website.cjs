const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const WEBSITE = 'M:/new/website';
const GIT_REF = '27a6566'; // Last commit with clean website files

// Get list of all files tracked in website/ at that commit
const tracked = execSync('git -C M:/new ls-tree -r --name-only ' + GIT_REF + ' -- website/', { encoding: 'utf8' });
const files = tracked.trim().split('\n').filter(Boolean);
console.log('Tracked website files in ' + GIT_REF + ': ' + files.length);

let restored = 0;
for (const f of files) {
  const content = execSync('git -C M:/new show ' + GIT_REF + ':' + f, { encoding: 'utf8', maxBuffer: 10*1024*1024 });
  const dest = path.join('M:/new', f);
  // Ensure directory exists
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(dest, content, 'utf8');
  console.log('Restored: ' + f);
  restored++;
}
console.log('\nRestored ' + restored + ' files from git');
