const fs = require('fs');
const path = require('path');

const dir = 'M:/new/website';

['guide.html', 'en-guide.html'].forEach(f => {
  const file = path.join(dir, f);
  let c = fs.readFileSync(file, 'utf8');
  
  // Fix direct link to use qdToggleLang
  const oldEn = `onclick="location.href='guide.html'"`;
  const oldZh = `onclick="location.href='en-guide.html'"`;
  
  c = c.replace(oldEn, 'onclick="qdToggleLang()"');
  c = c.replace(oldZh, 'onclick="qdToggleLang()"');
  
  fs.writeFileSync(file, c, 'utf8');
  console.log(f + ': fixed (direct link → qdToggleLang)');
});
