const { execSync } = require('child_process');
execSync('git add -A', { cwd: 'M:\\new', stdio: 'inherit' });
execSync('git commit -m "v1.0.9: remove SubscribePanel, fix theme dropdown, update website payment, restore email binding"', { cwd: 'M:\\new', stdio: 'inherit' });
console.log('Commit done');
