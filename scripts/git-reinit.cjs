const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Remove corrupted .git and re-initialize
const gitDir = 'M:/new/.git';
if (fs.existsSync(gitDir)) {
  fs.rmSync(gitDir, { recursive: true, force: true });
  console.log('Removed corrupted .git');
}

// Re-initialize
const commands = [
  'cd M:/new && git init',
  'cd M:/new && git add .gitignore',
  'cd M:/new && git add manifest.json manifest-firefox.json manifest-edge.json',
  'cd M:/new && git add src/ public/ vite.config.ts tsconfig.json svelte.config.js package.json package-lock.json',
  'cd M:/new && git add background.js icons/ fontawesome/ scripts/package-extensions.cjs scripts/verify-zip-paths.cjs scripts/upload-packages-v3.cjs',
  'cd M:/new && git commit -m "v1.0.9: initial clean commit after filter-repo recovery"',
  'cd M:/new && git remote add origin git@gitee.com:corbancc/quick-dial.git',
  'cd M:/new && git remote add github git@github.com:corbancl/quick-dial.git',
  'cd M:/new && git log --oneline -3'
];

for (const cmd of commands) {
  console.log(`>>> ${cmd}`);
  try {
    const result = execSync(cmd, { encoding: 'utf8', timeout: 30000 });
    console.log(result.substring(0, 300));
  } catch(e) {
    console.log('Stderr:', (e.stderr?.toString('utf8') || '').substring(0, 500));
    console.log('Status:', e.status);
    if (e.status === 0 || e.status === null) continue;
    // For add commands, if some files don't exist, just continue
    if (cmd.includes('git add') && e.stderr?.includes('did not match')) continue;
    break;
  }
}
