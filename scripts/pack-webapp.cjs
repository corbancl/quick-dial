const { execSync } = require('child_process');
const cmd = 'powershell -Command "Compress-Archive -Path M:\\new\\dist\\* -DestinationPath M:\\new\\packages\\quick-dial-v1.0.8-webapp.zip -Force"';
const out = execSync(cmd, { timeout: 15000 });
console.log(out.toString());
console.log('done');
