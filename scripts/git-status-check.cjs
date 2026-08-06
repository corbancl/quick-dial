const { execSync } = require('child_process');

const commands = [
  'cd M:/new && git log --oneline -5',
  'cd M:/new && git branch',
  'cd M:/new && git remote -v'
];

for (const cmd of commands) {
  console.log(`>>> ${cmd}`);
  try {
    const result = execSync(cmd, { encoding: 'utf8', timeout: 10000 });
    console.log(result.substring(0, 200));
  } catch(e) {
    console.log('Stderr:', (e.stderr?.toString('utf8') || '').substring(0, 300));
  }
}
