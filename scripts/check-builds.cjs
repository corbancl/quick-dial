const f = require('fs');
// Check build/, api/, assets/ directories
['M:/new/build', 'M:/new/api', 'M:/new/assets'].forEach(function(p) {
  try {
    const r = f.readdirSync(p, { withFileTypes: true });
    console.log(p + ':');
    r.forEach(function(x) { console.log('  ' + (x.isDirectory() ? '[DIR] ' : '') + x.name); });
  } catch(e) {
    console.log(p + ': NOT FOUND');
  }
});
// Check vite config for multiple build targets
try {
  const vc = f.readFileSync('M:/new/vite.config.ts', 'utf8');
  console.log('\n=== vite.config.ts (first 2000 chars) ===');
  console.log(vc.substring(0, 2000));
} catch(e) {
  console.log('vite.config.ts: ' + e.message);
}
