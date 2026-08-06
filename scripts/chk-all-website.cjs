const fs = require('fs');
const path = require('path');

function walk(dir, base) {
  const results = [];
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...walk(full, base));
    } else {
      results.push(path.relative(base, full));
    }
  }
  return results;
}

function checkFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const brokenTags = {};
  // Find all /tagname> patterns that are NOT </tagname>
  const matches = text.matchAll(/(?<!<)\/([a-z][a-z0-9]*)\s*>/g);
  for (const m of matches) {
    const tag = m[1];
    brokenTags[tag] = (brokenTags[tag] || 0) + 1;
  }
  return brokenTags;
}

const websiteDir = 'M:/new/website';
const allFiles = walk(websiteDir, websiteDir);
const htmlFiles = allFiles.filter(f => /\.html$/i.test(f));

console.log('Checking ' + htmlFiles.length + ' HTML files...\n');

let hasIssues = false;
for (const f of htmlFiles) {
  const full = path.join(websiteDir, f);
  const broken = checkFile(full);
  if (Object.keys(broken).length > 0) {
    hasIssues = true;
    console.log(f + ': ' + JSON.stringify(broken));
  }
}

if (!hasIssues) console.log('All clean!');
