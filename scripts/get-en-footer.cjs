const fs = require('fs');

// Get en footer
const en = fs.readFileSync('M:/new/website/en-account.html', 'utf8');
const footerStart = en.lastIndexOf('<div class="footer">');
const footerEnd = en.indexOf('<div id="toast">');
const enFooter = en.substring(footerStart, footerEnd);
console.log('EN Footer (' + enFooter.length + ' bytes):');
console.log(enFooter);
