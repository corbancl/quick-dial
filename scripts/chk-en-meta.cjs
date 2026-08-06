const c = require('fs').readFileSync('M:/new/website/en.html', 'utf8');
// Find title
const titleMatch = c.match(/<title>([^<]+)<\/title>/);
if (titleMatch) console.log('Title: ' + titleMatch[1]);
// Find og:title
const ogMatch = c.match(/<meta property="og:title" content="([^"]+)"/);
if (ogMatch) console.log('OG Title: ' + ogMatch[1]);
// Find meta description
const descMatch = c.match(/<meta name="description" content="([^"]+)"/);
if (descMatch) console.log('Desc: ' + descMatch[1]);
