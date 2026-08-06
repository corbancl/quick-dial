const { execSync } = require('child_process');

const commands = [
  'cd M:/new && git add -A',
  'cd M:/new && git commit -m "fix: Firefox data_collection_permissions move to gecko + remove @html usage"',
  'cd M:/new && git push origin master',
  'cd M:/new && git push github master'
];

for (const cmd of commands) {
  console.log(`\n>>> ${cmd}`);
  try {
    const result = execSync(cmd, { encoding: 'utf8', timeout: 30000 });
    console.log(result);
  } catch(e) {
    console.log('STDERR:', e.stderr?.toString('utf8'));
    console.log('STDOUT:', e.stdout?.toString('utf8'));
    if (e.status !== 0) {
      console.log(`Failed with status ${e.status}`);
      break;
    }
  }
}
