const f = require('fs');
// Check assets/ for index.html
try {
  const files = f.readdirSync('M:/new/assets');
  console.log('assets/ files:', files);
  // Check size
  files.forEach(function(fn) {
    const s = f.statSync('M:/new/assets/' + fn);
    console.log('  ' + fn + ': ' + (s.size/1024).toFixed(1) + ' KB');
  });
} catch(e) { console.log(e.message); }

// Check if assets/ has index.html
console.log('\nLooking for index.html in assets/:');
try {
  const html = f.readFileSync('M:/new/assets/index.html', 'utf8');
  console.log('Found! (first 500 chars):');
  console.log(html.substring(0, 500));
} catch(e) { console.log('Not found: ' + e.message); }

// Check fnos build config
console.log('\n=== Look for fnos build script/config ===');
try {
  const files = f.readdirSync('M:/new/scripts', { withFileTypes: true });
  files.forEach(function(x) {
    if (!x.isDirectory()) console.log('scripts/' + x.name);
  });
} catch(e) { console.log(e.message); }

// Check if there's a separate vite.web.config
console.log('\n=== Looking for vite.web config ===');
['M:/new/vite.web.config.ts', 'M:/new/vite.web.config.js', 'M:/new/webpack.config.js'].forEach(function(p) {
  try {
    f.statSync(p);
    console.log('FOUND: ' + p);
  } catch(e) {}
});
