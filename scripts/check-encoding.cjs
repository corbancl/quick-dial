const fs = require('fs');
const file = 'M:/new/website/index.html';
const buf = fs.readFileSync(file);
const text = buf.toString('utf8');

// Find all U+FFFD positions and show surrounding decoded text
let count = 0;
for (let i = 0; i < text.length && count < 20; i++) {
  if (text.charCodeAt(i) === 0xFFFD) {
    count++;
    const ctx = text.substring(Math.max(0, i-8), Math.min(text.length, i+12));
    console.log('FFFD #' + count + ' at char ' + i + ': ' + JSON.stringify(ctx));
    
    // Find the corresponding byte position
    let charPos = 0;
    for (let bi = 0; bi < buf.length; ) {
      const b = buf[bi];
      let byteLen = 1;
      if (b >= 0xF0) byteLen = 4;
      else if (b >= 0xE0) byteLen = 3;
      else if (b >= 0xC0) byteLen = 2;
      
      if (charPos === i) {
        let rawHex = '';
        for (let k = 0; k < byteLen; k++) rawHex += buf[bi+k].toString(16).padStart(2,'0') + ' ';
        console.log('  -> raw bytes ' + bi + ': ' + rawHex);
        // Show surrounding context
        let ctxHex = '';
        for (let j = Math.max(0, bi-15); j <= Math.min(buf.length-1, bi+byteLen+10); j++) {
          ctxHex += buf[j].toString(16).padStart(2,'0') + ' ';
        }
        console.log('  -> context: ' + ctxHex);
        // Show as latin1
        console.log('  -> latin1: ' + buf.toString('latin1', Math.max(0, bi-15), Math.min(buf.length, bi+byteLen+10)));
        break;
      }
      charPos++;
      bi += byteLen;
    }
  }
}

console.log('\nTotal FFFD: ' + count + ' (of shown)');
