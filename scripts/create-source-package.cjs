const AdmZip = require('M:/new/node_modules/adm-zip');
const fs = require('fs');
const path = require('path');

const root = 'M:/new';
const zip = new AdmZip();

// Files to include (source only, no dist/node_modules/build artifacts)
const includeDirs = ['src', 'public', 'scripts'];
const includeFiles = [
  'package.json',
  'package-lock.json',
  'vite.config.ts',
  'tsconfig.json',
  'svelte.config.js',
  'manifest.json',
  'manifest-firefox.json',
  'manifest-edge.json',
  'background.js',
  'README.md',
];

// Add individual files
for (const f of includeFiles) {
  const fullPath = path.join(root, f);
  if (fs.existsSync(fullPath)) {
    zip.addLocalFile(fullPath, '', f);
  }
}

// Add directories (excluding node_modules and dist)
function addDirRecursive(dirPath, zipPath) {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const item of items) {
    if (item.name === 'node_modules' || item.name === 'dist' || item.name === '.git' || item.name === 'packages') continue;
    const full = path.join(dirPath, item.name);
    const zp = zipPath ? zipPath + '/' + item.name : item.name;
    if (item.isDirectory()) {
      addDirRecursive(full, zp);
    } else {
      zip.addLocalFile(full, '', zp);
    }
  }
}

for (const d of includeDirs) {
  const fullPath = path.join(root, d);
  if (fs.existsSync(fullPath)) {
    addDirRecursive(fullPath, d);
  }
}

// Create/update README.md with build instructions if it doesn't exist
const readmePath = path.join(root, 'README.md');
let readme = '';
if (fs.existsSync(readmePath)) {
  readme = fs.readFileSync(readmePath, 'utf8');
}

// Ensure build instructions are present
if (!readme.includes('Build Instructions')) {
  readme += `
## Build Instructions

**Operating System:** Windows 10/11, macOS, or Linux

**Node.js version:** v22.x (or v18.x+)
**npm version:** 10.x (or 8.x+)

### Build Steps
1. Clone the repository
2. Run \`npm install\` to install dependencies
3. Run \`npm run build\` (which executes \`vite build\`)
4. The built extension is in the \`dist/\` directory

### Package Firefox Extension
After building, run \`node scripts/package-extensions.cjs\` to generate platform-specific zip packages. The Firefox package uses \`manifest-firefox.json\` as its manifest.

### Key Dependencies
- Svelte 5 (UI framework / template compiler)
- Vite 6 (build tool / bundler)
- TypeScript 5.x (type checking)
- adm-zip (packaging script dependency)
`;
}

// Remove old README from zip, add updated one
zip.addLocalFile(readmePath, '', 'README.md');

const outPath = path.join(root, 'quick-dial-v1.0.10-source.zip');
zip.writeZip(outPath);

const stats = fs.statSync(outPath);
console.log(`Source package created: ${outPath}`);
console.log(`Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (max 200 MB)`);
console.log(`Entries: ${zip.getEntries().length}`);

// List key entries
const entries = zip.getEntries().map(e => e.entryName);
console.log('\nKey files:');
for (const e of entries.filter(f => !f.startsWith('src/') || f.endsWith('.svelte') || f.endsWith('.ts'))) {
  console.log('  ' + e);
}
