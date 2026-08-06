const fs = require('fs');
const files = [
  'M:/new/website/about.html',
  'M:/new/website/contact.html',
  'M:/new/website/copyright.html',
  'M:/new/website/privacy.html',
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replaceAll('href="https://github.com"', 'href="https://gitee.com/corbancc/quick-dial"');
  fs.writeFileSync(f, c);
  console.log('OK:', f.split('/').pop());
});
