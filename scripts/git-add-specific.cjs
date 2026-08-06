const { execSync } = require('child_process');

// Only add specific files, not node_modules
const commands = [
  'cd M:/new && git add src/components/LocalSearchPanel.svelte manifest-firefox.json manifest.json manifest-edge.json',
  'cd M:/new && git status --short'
];

for (const cmd of commands) {
  console.log(`\n>>> ${cmd}`);
  try {
    const result = execSync(cmd, { encoding: 'utf8', timeout: 10000 });
    console.log(result);
  } catch(e) {
    console.log('STDERR:', e.stderr?.toString('utf8'));
    console.log('STDOUT:', e.stdout?.toString('utf8'));
  }
}
