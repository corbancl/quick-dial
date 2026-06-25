const fs = require('fs');

// Check search engines config
const searchFile = 'M:/new/src/utils/search.ts';
if (fs.existsSync(searchFile)) {
  const c = fs.readFileSync(searchFile, 'utf8');
  console.log('=== Search Engines Config ===');
  console.log(c.substring(0, 2000));
}

console.log('\n=== Wallpaper/Theme Config ===');
const themeFile = 'M:/new/src/utils/theme.ts';
if (fs.existsSync(themeFile)) {
  const c = fs.readFileSync(themeFile, 'utf8');
  console.log(c.substring(0, 2000));
}
