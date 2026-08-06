const fs = require('fs');
let c = fs.readFileSync('M:/new/website/index.html', 'utf8');

// Find features section
const featIdx = c.indexOf('id="features"');
const nextSection = c.indexOf('id="pricing"', featIdx);
const featContent = c.substring(featIdx, nextSection);
console.log(featContent);
