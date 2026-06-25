const { execSync } = require('child_process');
const cwd = 'M:/new';

try {
  console.log(execSync('git add -f public/manifest.json public/manifest-chrome.json public/manifest-edge.json public/manifest-firefox.json fnos/app/ui/manifest.json fnos/app/ui/manifest-chrome.json fnos/app/ui/manifest-edge.json fnos/app/ui/manifest-firefox.json public/version.json website/ CHANGELOG-v1.0.8.md scripts/update-versions.cjs scripts/fix-manifests.cjs scripts/fix-website.cjs', { cwd }).toString());
  
  console.log(execSync('git commit -m "v1.0.8: manifest encoding fixes + website encoding fix + changelog"', { cwd }).toString());
  
  console.log('Git commit OK');
} catch (e) {
  console.log('OUT:', e.stdout?.toString());
  console.log('ERR:', e.stderr?.toString());
}
