const { execSync } = require('child_process');

process.chdir('M:/new');

const commands = [
  'git remote add origin git@gitee.com:corbancc/quick-dial.git',
  'git remote add github git@github.com:corbancl/quick-dial.git',
  'git remote -v',
  'git push -u origin master --force',
  'git push -u github master --force',
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
