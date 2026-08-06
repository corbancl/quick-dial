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

// Write AMO-specific build instructions as a separate file for reviewers
const amoBuildInstructions = `# AMO Build Instructions

## Environment
- **Operating System:** Windows 10/11, macOS, or Linux
- **Node.js:** v18.x or v22.x
- **npm:** v8.x+ or v10.x+

## Build Steps
1. Install dependencies: \`npm install\`
2. Build the extension: \`npm run build\` (runs \`vite build\`)
3. The built extension output is in \`dist/\` directory

## Firefox-Specific Build
After running \`npm run build\`, the Firefox extension manifest (\`manifest-firefox.json\`) is used by the packaging script to create the Firefox-specific zip:
- \`node scripts/package-extensions.cjs\` — generates platform-specific packages in \`packages/\`

## Key Build Tools
| Tool | Purpose |
|------|---------|
| Vite 6 | Bundler — combines multiple JS/TS/Svelte files into single bundles |
| Svelte 5 | UI framework — compiles .svelte template files into JS |
| TypeScript 5.x | Type checking — compiles .ts files |
| adm-zip | Packaging script dependency for creating zip files |

## innerHTML Warnings
The compiled output has 2 innerHTML usages. These are from **Svelte 5 runtime internals** (template parsing and reactive DOM updates), NOT from source code. Our source code uses zero innerHTML assignments. This is a known Svelte 5 behavior documented at https://svelte.dev/.

## Source Code
- GitHub: https://github.com/corbancl/quick-dial
- Gitee: https://gitee.com/corbancc/quick-dial
`;

zip.addFile('AMO_BUILD_INSTRUCTIONS.md', Buffer.from(amoBuildInstructions, 'utf8'));

const outPath = path.join(root, 'quick-dial-v1.0.9-source.zip');
zip.writeZip(outPath);

const stats = fs.statSync(outPath);
console.log(`Source package created: ${outPath}`);
console.log(`Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (max 200 MB)`);
console.log(`Entries: ${zip.getEntries().length}`);
console.log('✅ AMO_BUILD_INSTRUCTIONS.md included');
