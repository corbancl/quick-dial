const { execSync } = require('child_process');
const fs = require('fs');

// Check where .git actually is
const paths = [
  'M:/new/.git',
  'C:/Users/Administrator/.qclaw/workspace-agent-f366e87a/.git'
];

for (const p of paths) {
  console.log(`${p}: ${fs.existsSync(p) ? 'EXISTS' : 'NOT FOUND'}`);
}

// List M:/new top level
console.log('\nM:/new contents:');
const items = fs.readdirSync('M:/new');
console.log(items.join(', '));

// Check if M:/new/.git/HEAD exists
const headPath = 'M:/new/.git/HEAD';
if (fs.existsSync(headPath)) {
  console.log('\nM:/new/.git/HEAD:', fs.readFileSync(headPath, 'utf8'));
} else {
  console.log('\nM:/new/.git/HEAD: NOT FOUND');
}
