const fs = require('fs');

// Check search engines
const searchFile = 'M:/new/src/utils/searchEngines.ts';
if (fs.existsSync(searchFile)) {
  const c = fs.readFileSync(searchFile, 'utf8');
  const engines = c.match(/(?:id|name):\s*'([^']+)'/g);
  console.log('=== Search Engines ===');
  if (engines) {
    const names = [...new Set(engines.map(m => {
      const v = m.match(/'([^']+)'/);
      return v ? v[1] : '';
    }))];
    console.log('Count: ' + names.length);
    console.log(names.join(', '));
  }
}

// Check wallpapers/themes  
const themeFile = 'M:/new/src/utils/themes.ts';
if (fs.existsSync(themeFile)) {
  const c = fs.readFileSync(themeFile, 'utf8');
  const wallpapers = c.match(/(?:id|name):\s*'([^']+)'/g);
  console.log('\n=== Wallpapers/Themes ===');
  if (wallpapers) {
    const names = wallpapers.map(m => {
      const v = m.match(/'([^']+)'/);
      return v ? v[1] : '';
    }).filter(n => n && n.length > 1);
    console.log('Count: ' + names.length);
    console.log(names.join(', '));
  }
}
