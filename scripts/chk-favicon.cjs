const fs = require('fs');
const c = fs.readFileSync('M:/new/dist/index.html', 'utf8');
const m = c.match(/<link[^>]*icon[^>]*>/gi);
console.log(m ? m.join('\n') : 'no favicon');
// Also check all <head> content
const head = c.match(/<head>([\s\S]*?)<\/head>/i);
if (head) console.log('\n=== head content ===\n' + head[1]);
