const { execSync } = require('child_process');

// Reset staging area, then add only project files
const commands = [
  'cd M:/new && git reset HEAD',
  'cd M:/new && git add src/components/LocalSearchPanel.svelte src/utils/localSearch.ts manifest.json manifest-firefox.json manifest-edge.json',
  'cd M:/new && git diff --cached --stat'
];

for (const cmd of commands) {
  console.log(`>>> ${cmd}`);
  try {
    const result = execSync(cmd, { encoding: 'utf8', timeout: 10000 });
    console.log(result.substring(0, 500));
  } catch(e) {
    console.log('Result:', (e.stdout?.toString('utf8') || '').substring(0, 500));
    console.log('Stderr:', (e.stderr?.toString('utf8') || '').substring(0, 500));
  }
}
