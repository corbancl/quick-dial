const fs = require('fs');
const path = require('path');

const dir = 'M:/new/website';
const files = fs.readdirSync(dir).filter(f => /\.html$/i.test(f));

files.forEach(f => {
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  // Find nav-lang title
  const m = text.match(/nav-lang[^>]*title="([^"]*)"/);
  if (m) console.log(f + ': title="' + m[1] + '"');
  else console.log(f + ': no nav-lang button');
});
