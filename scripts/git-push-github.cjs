const { execSync } = require('child_process');

process.chdir('M:/new');

try {
  const result = execSync('git push github master', {
    encoding: 'utf8',
    timeout: 60000,
    env: { ...process.env, GIT_SSH_COMMAND: 'ssh -o StrictHostKeyChecking=no' }
  });
  console.log(result.substring(0, 300));
} catch(e) {
  console.log('Stderr:', (e.stderr?.toString('utf8') || '').substring(0, 500));
  console.log('Stdout:', (e.stdout?.toString('utf8') || '').substring(0, 500));
}
