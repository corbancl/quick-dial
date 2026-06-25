const fs = require('fs');
const path = require('path');

const dir = 'M:/new/website';
const pages = ['account.html', 'index.html', 'privacy.html'];

pages.forEach(p => {
  const file = path.join(dir, p);
  let c = fs.readFileSync(file, 'utf8');
  const original = c;
  
  // Fix 1: Replace qdSwitchLang with qdToggleLang
  c = c.replace(/onclick="qdSwitchLang\(qdLang==='en'\?'zh-CN':'en'\)"/g, 'onclick="qdToggleLang()"');
  
  // Fix 2: Also fix the nav-btn onclick to point to correct pages
  // Chinese account.html nav-btn should go to account.html, not en.html
  
  if (c !== original) {
    fs.writeFileSync(file, c, 'utf8');
    console.log(p + ': FIXED onclick');
  } else {
    console.log(p + ': no match');
  }
});

// Also fix account.html footer to include the full links like en-account.html
const cnAcc = path.join(dir, 'account.html');
let cn = fs.readFileSync(cnAcc, 'utf8');
// Check current footer
const footerIdx = cn.lastIndexOf('<div class="footer"');
if (footerIdx >= 0) {
  console.log('\naccount.html current footer: ' + cn.substring(footerIdx, footerIdx + 200));
}
