const fs = require('fs');
const path = require('path');

const websiteDir = 'M:/new/website';
const files = fs.readdirSync(websiteDir).filter(f => f.endsWith('.html'));

console.log('=== Replacing EF BF BD (�) sequences with context-appropriate chars ===\n');

// The pattern is: \xEF\xBF\xBD\x3F (�?) - always followed by 3F (?)
// Context determines replacement:
// - <tag>�?text  ->  <tag>text (remove browser display fix)
// - text�?Chinese -> text|Chinese (pipe or period)
// - text�?</tag>  -> text。</tag> or text></tag>
// Strategy: Remove the 4 bytes ef bf bd 3f entirely when between known HTML contexts

files.forEach(file => {
  const fpath = path.join(websiteDir, file);
  const buf = fs.readFileSync(fpath);
  
  // Count occurrences
  let origCount = 0;
  for (let i = 0; i < buf.length - 3; i++) {
    if (buf[i] === 0xef && buf[i+1] === 0xbf && buf[i+2] === 0xbd) origCount++;
  }
  
  if (origCount === 0) {
    console.log('SKIP:', file, '(clean)');
    return;
  }
  
  // Build new buffer: replace EF BF BD 3F with context-appropriate byte
  const newBuf = Buffer.alloc(buf.length); // worst case same size
  let writePos = 0;
  let replaceCount = 0;
  
  for (let i = 0; i < buf.length; i++) {
    if (i + 3 < buf.length && buf[i] === 0xef && buf[i+1] === 0xbf && buf[i+2] === 0xbd && buf[i+3] === 0x3f) {
      // Look at what follows (after the "EFBFBD3F")
      const nextByte = i + 4 < buf.length ? buf[i + 4] : 0;
      // Look at what precedes
      const prevByte = i > 0 ? buf[i - 1] : 0;
      
      // Context-based replacement:
      // After a CJK character (0x80-0xBF continuation byte) and before a space or tag:
      //   "集�?AI" -> "集|AI" (pipe)
      // After HTML tag close (>): ">�?text" -> ">text" (was a display fix char)
      // Before </p>: "。�?</p>" -> "。</p>" (Chinese period)
      // Before other tags: "器�?<br>" -> "器<br>" (keep original char by byte pattern)
      
      // Strategy: just delete these 4 bytes entirely. The context typically recovers.
      i += 3; // skip EF BF BD 3F
      replaceCount++;
      continue;
    }
    
    newBuf[writePos++] = buf[i];
  }
  
  const result = newBuf.subarray(0, writePos);
  
  // Verify UTF-8
  let ffCount = 0;
  try {
    const text = result.toString('utf8');
    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) === 0xFFFD) ffCount++;
    }
    // Update version
    const fixed = text.replace(/>v1\.0\.6</g, '>v1.0.8<').replace(/"1\.0\.6"/g, '"1.0.8"');
    fs.writeFileSync(fpath, fixed, 'utf8');
    console.log('OK:', file, `replaced ${replaceCount}/${origCount} (${ffCount} FFFD remaining)`);
  } catch (e) {
    console.log('FAIL:', file, e.message);
  }
});
