const fs = require('fs');

// Get the full footer from en-account.html (has the complete footer)
const en = fs.readFileSync('M:/new/website/en-account.html', 'utf8');
const footerStart = en.indexOf('<div class="footer">');
const footerEnd = en.indexOf('</div>\n<div id="toast">');
const fullFooter = en.substring(footerStart, footerEnd + 6); // +6 for </div>

console.log('Footer block length:', fullFooter.length);
console.log('Footer:');
console.log(fullFooter);
