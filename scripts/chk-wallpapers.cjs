const fs = require('fs');
const c = fs.readFileSync('M:/new/src/utils/theme.ts', 'utf8');

// Find wallpaper array
const wpIdx = c.indexOf('WALLPAPERS');
if (wpIdx >= 0) {
  const end = c.indexOf('];', wpIdx);
  console.log(c.substring(wpIdx, end + 2));
} else {
  // Check types for wallpaper config
  console.log('WALLPAPERS not found in theme.ts');
  // Search for background/bg image urls
  const matches = c.match(/background.*url|wallpaper/gi);
  if (matches) console.log('Found: ' + matches.join('\n'));
}
