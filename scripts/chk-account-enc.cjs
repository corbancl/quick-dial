const fs = require('fs');
const path = require('path');

const files = ['account.html', 'en-account.html'];
for (const f of files) {
  const p = path.join('M:/new/website', f);
  const raw = fs.readFileSync(p);
  // Count EF BF BD (U+FFFD replacement character) and its variants
  let count = 0;
  for (let i = 0; i < raw.length - 2; i++) {
    if (raw[i] === 0xEF && raw[i+1] === 0xBF && raw[i+2] === 0xBD) count++;
  }
  console.log(f + ': size=' + raw.length + ' bytes, U+FFFD markers=' + count);
  
  // Also check for other corruption patterns
  // Look for " /span>" (missing <)  
  const text = raw.toString('utf8');
  const brokenTags = text.match(/\/[a-z]+>/g) || [];
  const brokenEndTags = [];
  for (const tag of brokenTags) {
    // Count occurrences of "/span>" "/div>" "/title>" "/button>" etc. without preceding <
    const re = new RegExp('(?<!<)' + tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = text.match(re);
    if (matches) brokenEndTags.push(tag + ' x' + matches.length);
  }
  if (brokenEndTags.length) console.log('  Broken end tags: ' + brokenEndTags.join(', '));
}
