const { execSync } = require('child_process');
const fs = require('fs');

// Remove wrongly-placed .git from workspace
const wsGit = 'C:/Users/Administrator/.qclaw/workspace-agent-f366e87a/.git';
if (fs.existsSync(wsGit)) {
  fs.rmSync(wsGit, { recursive: true, force: true });
  console.log('Removed workspace .git');
}

// Remove .git-rewrite from M:/new (filter-repo leftover)
const rewriteDir = 'M:/new/.git-rewrite';
if (fs.existsSync(rewriteDir)) {
  fs.rmSync(rewriteDir, { recursive: true, force: true });
  console.log('Removed .git-rewrite');
}

// Now properly init git in M:/new using node's chdir
process.chdir('M:/new');
console.log('Working dir:', process.cwd());

// Init
try {
  const initResult = execSync('git init', { encoding: 'utf8', timeout: 10000 });
  console.log('Init result:', initResult);
} catch(e) {
  console.log('Init:', e.stderr?.toString('utf8'));
}

// Check .git was created in M:/new
console.log('M:/new/.git exists:', fs.existsSync('M:/new/.git'));
if (fs.existsSync('M:/new/.git/HEAD')) {
  console.log('HEAD:', fs.readFileSync('M:/new/.git/HEAD', 'utf8'));
}
