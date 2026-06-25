const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

async function run() {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  
  try {
    await client.access({
      host: '116.62.179.194',
      user: 'wwwcilacilacn',
      password: 'pC2RN5Z2h7x6',
      port: 21,
      secure: false
    });
    
    console.log('Connected');
    
    // Ensure downloads/ directory exists
    try { await client.ensureDir('downloads'); } catch(e) {}
    
    const pkgDir = 'M:/new/packages';
    const files = fs.readdirSync(pkgDir).filter(f => f.startsWith('quick-dial-v1.0.8'));
    
    let done = 0;
    let fail = 0;
    
    for (const f of files) {
      try {
        await client.uploadFrom(path.join(pkgDir, f), 'downloads/' + f);
        const stat = fs.statSync(path.join(pkgDir, f));
        const size = (stat.size / 1024).toFixed(1) + ' KB';
        console.log('  OK: downloads/' + f + ' (' + size + ')');
        done++;
      } catch (e) {
        console.log('  FAIL: ' + f + ' - ' + e.message);
        fail++;
      }
    }
    
    console.log(`\nDone: ${done} OK, ${fail} failed`);
  } catch (e) {
    console.error('FTP error:', e.message);
  }
  client.close();
}

run();
