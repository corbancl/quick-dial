const fs = require('fs');

// Also check en.html and index.html
const files = ['en.html', 'index.html'];
files.forEach(f => {
  const text = fs.readFileSync('M:/new/website/' + f, 'utf8');
  const re = /[\u4e00-\u9fff]+/g;
  const matches = [...text.matchAll(re)].map(m => m[0]).filter(s => s.length >= 2);
  const unique = [...new Set(matches)];
  console.log('\n=== ' + f + ': ' + unique.length + ' unique Chinese strings ===');
  unique.forEach(u => console.log('  ' + u));
});
