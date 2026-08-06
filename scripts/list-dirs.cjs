const f = require('fs');
const p = 'M:/new';
const items = f.readdirSync(p, { withFileTypes: true });
const dirs = items.filter(function(d) { return d.isDirectory(); }).map(function(d) { return d.name; });
console.log(dirs.join('\n'));
