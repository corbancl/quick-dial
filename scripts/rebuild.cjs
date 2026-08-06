const { execSync } = require('child_process');
try {
  execSync('npm run build', { cwd: 'M:/new', stdio: 'inherit' });
  console.log('Build complete');
} catch(e) {
  console.log('Build stderr:', e.stderr?.toString());
}
