const fs = require('fs');

// Search all source files for group limit
const files = [
  'M:/new/src/stores/settings.svelte.ts',
  'M:/new/src/stores/subscription.svelte.ts',
  'M:/new/src/types/index.ts',
  'M:/new/src/App.svelte'
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const c = fs.readFileSync(f, 'utf8');
  // Search for "limit" near "group" or "GROUP"
  const re = /(.{0,100}(?:group|GROUP).{0,100}limit.{0,100})|(.{0,100}limit.{0,100}(?:group|GROUP).{0,100})/gi;
  const m = c.match(re);
  if (m) console.log(f + ': ' + m.join('\n'));
  
  // Also check for maxGroups or groupCount
  if (c.includes('maxGroups') || c.includes('groupLimit') || c.includes('max_group')) {
    console.log(f + ' has group limit var');
  }
}
console.log('Search complete');
