const fs = require('fs');
const c = fs.readFileSync('M:/new/website/en.html', 'utf8');
const idx = c.indexOf('12 engines');
if (idx >= 0) console.log('Found at ' + idx + ': ...' + c.substring(idx-20, idx+50) + '...');
else {
  // Try other variations
  const hits = c.match(/\d+\s*(engines|engines)/gi);
  console.log('Search hits: ' + (hits ? hits.join(', ') : 'NONE'));
}
