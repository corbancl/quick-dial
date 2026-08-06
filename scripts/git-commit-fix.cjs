const { execSync } = require('child_process');

process.chdir('M:/new');

const commands = [
  'git add manifest-firefox.json public/manifest-firefox.json src/components/LocalSearchPanel.svelte',
  'git commit -m "fix: Firefox data_collection_permissions required must be array + remove @html"',
  'git push origin master',
];

for (const cmd of commands) {
  console.log(`>>> ${cmd}`);
  try {
    const result = execSync(cmd, { encoding: 'utf8', timeout: 30000 });
    console.log(result.substring(0, 300));
  } catch(e) {
    console.log('Stderr:', (e.stderr?.toString('utf8') || '').substring(0, 500));
    console.log('Stdout:', (e.stdout?.toString('utf8') || '').substring(0, 500));
  }
}
