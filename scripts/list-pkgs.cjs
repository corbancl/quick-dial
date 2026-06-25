const f = require('fs');
const d = f.readdirSync('M:/new/packages');
d.forEach(function(x) {
  const s = f.statSync('M:/new/packages/' + x);
  if (s.isFile()) console.log(x + '  ' + (s.size/1024/1024).toFixed(2) + ' MB');
});
