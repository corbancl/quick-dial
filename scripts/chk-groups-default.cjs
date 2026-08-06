const fs = require('fs');

// Check settings default groups
const c = fs.readFileSync('M:/new/src/stores/settings.svelte.ts', 'utf8');
const defaultIdx = c.indexOf('dialGroups');
if (defaultIdx >= 0) console.log(c.substring(defaultIdx, defaultIdx + 500));
else console.log('No dialGroups default found');

// Check for group limit
const limitIdx = c.indexOf('group');
if (limitIdx >= 0) {
  const snippet = c.substring(limitIdx, limitIdx + 300);
  console.log('\nGroups context:\n' + snippet);
}
