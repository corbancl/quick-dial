const c = require('fs').readFileSync('M:/new/website/index.html', 'utf8');

// Find download section
const downloadIdx = c.indexOf('id="download"');
const nextSection = c.indexOf('id="faq"', downloadIdx);
console.log('Download section (' + (downloadIdx >= 0 ? 'found at ' + downloadIdx : 'NOT FOUND') + '):');
if (downloadIdx >= 0) {
  console.log(c.substring(downloadIdx, Math.min(downloadIdx + 3000, c.length)));
}
