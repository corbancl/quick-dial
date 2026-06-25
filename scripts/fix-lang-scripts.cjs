const fs = require('fs');
const path = require('path');

const dir = 'M:/new/website';

// All Chinese pages that should get lang.js
const pages = ['index.html', 'account.html', 'about.html', 'contact.html', 'copyright.html', 'privacy.html'];

pages.forEach(p => {
  const file = path.join(dir, p);
  if (!fs.existsSync(file)) { console.log(p + ': NOT FOUND'); return; }
  
  let c = fs.readFileSync(file, 'utf8');
  const original = c;
  
  // Replace i18n.js with lang.js
  c = c.replace(/<script src="i18n\.js"><\/script>/g, '<script src="lang.js"></script>');
  
  if (c !== original) {
    fs.writeFileSync(file, c, 'utf8');
    console.log(p + ': FIXED (i18n.js → lang.js)');
  } else {
    console.log(p + ': no i18n.js found');
  }
});
