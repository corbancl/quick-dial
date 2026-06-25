const f = require('fs');
const d = f.readdirSync('M:/new/dist');
d.forEach(function(x) {
  const p = 'M:/new/dist/' + x;
  const s = f.statSync(p);
  if (s.isFile()) console.log(x + '  ' + (s.size/1024).toFixed(1) + ' KB');
  if (s.isDirectory()) console.log('[DIR] ' + x);
});
