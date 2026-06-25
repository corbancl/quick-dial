const fs = require('fs');
const path = require('path');

// Scan for Chinese characters in en-*.html files
const dir = 'M:/new/website';
const files = fs.readdirSync(dir).filter(f => /^en-.*\.html$/i.test(f));

files.forEach(f => {
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  // Find all Chinese character sequences (CJK Unified Ideographs)
  const matches = [];
  const re = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u2f800-\u2fa1f]+/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    // Skip CSS comments and already english content
    // Get context around the match
    const start = Math.max(0, m.index - 30);
    const end = Math.min(text.length, m.index + m[0].length + 30);
    const ctx = text.substring(start, end).replace(/\n/g, '\\n');
    matches.push({text: m[0], idx: m.index, ctx});
  }
  
  if (matches.length > 0) {
    console.log(`\n=== ${f} (${matches.length} Chinese segments) ===`);
    matches.forEach(m => {
      console.log(`  [${m.idx}] "${m.text}"  context: ...${m.ctx}...`);
    });
  } else {
    console.log(`\n${f}: CLEAN`);
  }
});
