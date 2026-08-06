const fs = require('fs');

// Find types file
const typesFile = 'M:/new/src/types/index.ts';
if (fs.existsSync(typesFile)) {
  const c = fs.readFileSync(typesFile, 'utf8');
  
  // Find search engine definitions
  const searchIdx = c.indexOf('DEFAULT_SEARCH_ENGINES');
  if (searchIdx >= 0) {
    const endIdx = c.indexOf('];', searchIdx);
    const block = c.substring(searchIdx, endIdx + 2);
    console.log('=== DEFAULT_SEARCH_ENGINES ===');
    console.log(block.substring(0, 5000));
    
    // Count engines
    const engineCount = (block.match(/\{[^}]*?id:/g) || []).length;
    console.log('\nTotal engines: ' + engineCount);
  }
  
  // Find theme/wallpaper styles  
  const styleIdx = c.indexOf('ThemeStyle');
  if (styleIdx >= 0) {
    const endIdx = Math.min(c.indexOf(';', styleIdx), c.indexOf('\n\n', styleIdx));
    if (endIdx > styleIdx) {
      console.log('\n=== ThemeStyle ===');
      console.log(c.substring(styleIdx, endIdx + 1));
    }
  }
}
