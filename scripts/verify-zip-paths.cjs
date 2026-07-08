const AdmZip = require('adm-zip');
const packages = [
  'M:/new/packages/quick-dial-v1.0.9-chrome.zip',
  'M:/new/packages/quick-dial-v1.0.9-edge.zip',
];

for (const pkg of packages) {
  const zip = new AdmZip(pkg);
  const entries = zip.getEntries();
  const backslash = entries.filter(e => e.entryName.includes('\\'));
  const assets = entries.filter(e => e.entryName.includes('assets'));
  
  console.log(`\n${pkg.split('/').pop()}:`);
  console.log(`  Total entries: ${entries.length}`);
  console.log(`  Backslash paths: ${backslash.length}`);
  if (backslash.length > 0) {
    console.log('  BAD paths:');
    backslash.forEach(e => console.log(`    ${e.entryName}`));
  } else {
    console.log('  All paths use forward slash - OK!');
  }
  console.log('  Assets entries:');
  assets.forEach(e => console.log(`    ${e.entryName}`));
}
