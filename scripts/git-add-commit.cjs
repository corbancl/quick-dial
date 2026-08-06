const { execSync } = require('child_process');

process.chdir('M:/new');

// Add files that match .gitignore rules (git will auto-exclude node_modules etc.)
// But we need to be selective since .gitignore might not cover everything

const commands = [
  // Core project files
  'git add .gitignore package.json package-lock.json vite.config.ts tsconfig.json svelte.config.js',
  'git add manifest.json manifest-firefox.json manifest-edge.json manifest-chrome.json pwa-manifest.json',
  'git add background.js theme-detect.js js.png js.svg',
  'git add src/ public/ icons/ fontawesome/ docs/',
  // Build scripts (safe ones only)
  'git add scripts/package-extensions.cjs scripts/verify-zip-paths.cjs',
  // Website pages (safe ones)
  'git add about.html en-about.html contact.html en-contact.html copyright.html en-copyright.html privacy.html en-privacy.html',
  'git add index.html README.md CHANGELOG-v1.0.8.md',
  // Static assets
  'git add assets/ beilian.png',
  // Check status
  'git status --short | head -20',
  // Commit
  'git commit -m "v1.0.9: Firefox data_collection_permissions fix + remove @html usage"',
];

for (const cmd of commands) {
  console.log(`>>> ${cmd}`);
  try {
    const result = execSync(cmd, { encoding: 'utf8', timeout: 30000 });
    console.log(result.substring(0, 300));
  } catch(e) {
    const err = e.stderr?.toString('utf8') || '';
    const out = e.stdout?.toString('utf8') || '';
    if (err.includes('did not match') || err.includes('fatal: pathspec')) {
      console.log('SKIP (file not found):', cmd);
      continue;
    }
    console.log('Stderr:', err.substring(0, 200));
    console.log('Stdout:', out.substring(0, 200));
  }
}
