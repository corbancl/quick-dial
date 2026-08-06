const f = require('fs');
function list(p, d) {
  const r = f.readdirSync(p, { withFileTypes: true });
  console.log(p);
  r.forEach(function(x) {
    if (x.isDirectory()) {
      list(p + '/' + x.name, d + 1);
    } else if (d < 4) {
      console.log('  '.repeat(d) + x.name);
    }
  });
}
list('M:/new/fnos', 0);
console.log('---');
list('M:/new/server', 0);
