const fs = require('fs');
['index.html','en.html'].forEach(f => {
  const c = fs.readFileSync('M:/new/website/' + f, 'utf8');
  const m = c.match(/<div class="hero-tag">(.*?)<\/div>/);
  console.log(f + ' hero-tag: ' + (m ? m[1] : 'NOT FOUND'));
});
