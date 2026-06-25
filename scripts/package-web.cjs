const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const websiteDir = 'M:/new/website';
const packagesDir = 'M:/new/packages';
const zipName = 'quick-dial-v1.0.8-web.zip';

// Use tar or a Node.js zip library... let's use the built-in approach
// Windows has no zip command, use Node.js adm-zip? Or we can use Compress-Archive
// Actually, let's just use JavaScript with the zip functionality

// Since we can't use PowerShell, let's use a Node.js approach with child_process
// But the user said no PowerShell... let me check what tools are available

// Actually, we can use Node.js to create a zip using the built-in zlib (but it's raw deflate)
// Better: use the archiver package or just call the python script

// Let's just use a Node.js zip using adm-zip if available, otherwise create from scratch
try {
  require.resolve('adm-zip');
} catch {
  console.log('adm-zip not found, installing...');
  execSync('npm install -g adm-zip', { stdio: 'inherit' });
}

const AdmZip = require('adm-zip');
const zip = new AdmZip();
zip.addLocalFolder(websiteDir, 'website');
const outPath = path.join(packagesDir, zipName);
zip.writeZip(outPath);
console.log('Web zip created:', outPath);

const stat = fs.statSync(outPath);
console.log('Size:', (stat.size / 1024 / 1024).toFixed(2), 'MB');
