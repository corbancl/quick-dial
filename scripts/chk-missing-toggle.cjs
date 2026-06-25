const fs = require('fs');

['index.html', 'privacy.html'].forEach(f => {
  const c = fs.readFileSync('M:/new/website/' + f, 'utf8');
  // Find nav-lang button
  const re = /<button[^>]*nav-lang[^>]*>/g;
  let m;
  while ((m = re.exec(c)) !== null) {
    console.log(f + ': ' + m[0]);
  }
  if (!c.includes('nav-lang')) console.log(f + ': NO nav-lang button');
});
