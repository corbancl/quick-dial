const fs = require('fs');
['index.html','en.html','account.html','privacy.html','guide.html','en-guide.html'].forEach(f => {
  const c = fs.readFileSync('M:/new/website/' + f, 'utf8');
  const m = c.match(/<title>([^<]+)<\/title>/);
  if (m) console.log(f + ': ' + m[1]);
});
