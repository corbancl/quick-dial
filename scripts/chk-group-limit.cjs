const fs = require('fs');
const c = fs.readFileSync('M:/new/src/types/index.ts', 'utf8');

// Find group limits
const matches = c.match(/FREE.*GROUP|FREE.*LIMIT|GROUP.*LIMIT/gi);
if (matches) console.log('Group limits: ' + matches.join('\n'));

// Search for 3, group, limit near each other
const groupIdx = c.indexOf('FREE_GROUP');
if (groupIdx >= 0) console.log('\nContext:\n' + c.substring(groupIdx-5, groupIdx+100));
else {
  const idx = c.indexOf('group');
  if (idx >= 0) console.log('\nGroup context:\n' + c.substring(idx, idx+200));
}
