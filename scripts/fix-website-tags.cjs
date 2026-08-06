const fs = require('fs');
const path = require('path');

const websiteDir = 'M:/new/website';
const HTML_TAGS = ['a','p','span','div','h1','h2','h3','h4','h5','h6',
  'title','li','ul','ol','strong','em','b','i','u','button','label',
  'section','article','nav','header','footer','main','aside','form',
  'input','select','option','textarea','table','tr','td','th','thead','tbody',
  'code','pre','small','br','hr','img','video','audio','source',
  'script','style','link','meta','head','body','html'];

// Read all HTML files
const allFiles = fs.readdirSync(websiteDir, {recursive: true})
  .filter(f => /\.html$/i.test(f));
const htmlFiles = allFiles.map(f => path.join(websiteDir, f));

let totalFixed = 0;

for (const filePath of htmlFiles) {
  let text = fs.readFileSync(filePath, 'utf8');
  const original = text;
  
  // For each tag, fix pattern: NOT preceded by <, followed by /tag>
  for (const tag of HTML_TAGS) {
    // Match "/tagname" (optionally with attributes) then ">" where the "/" is NOT preceded by "<"
    // We use a negative lookbehind (?<!<) for the /
    const regex = new RegExp('(?<!<)/' + tag + '(\\s[^>]*)?>', 'g');
    text = text.replace(regex, '</' + tag + '$1>');
  }
  
  if (text !== original) {
    // Count fixes
    const fixes = (original.match(/(?<!<)\/[a-z][a-z0-9]*\s*>/g) || []) -
                 (text.match(/(?<!<)\/[a-z][a-z0-9]*\s*>/g) || []);
    fs.writeFileSync(filePath, text, 'utf8');
    console.log('Fixed: ' + path.basename(filePath) + ' (' + fixes.length + ' fixes)');
    totalFixed += fixes.length;
  } else {
    console.log('Clean: ' + path.basename(filePath));
  }
}

console.log('\nTotal fixes: ' + totalFixed);
