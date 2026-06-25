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
    
    // List root to see current state
    const root = await client.list();
    console.log('Root entries: ' + root.map(e => e.name).join(', '));
    
    // Try creating downloads dir with absolute path
    await client.ensureDir('/downloads');
    await client.cd('/downloads');
    console.log('CWD: /downloads');
    
    const pkgDir = 'M:/new/packages';
    const files = fs.readdirSync(pkgDir).filter(f => f.startsWith('quick-dial-v1.0.8'));
    
    let done = 0;
    for (const f of files) {
      try {
        await client.uploadFrom(path.join(pkgDir, f), f);
        console.log('  OK: ' + f);
        done++;
      } catch (e) {
        console.log('  FAIL: ' + f + ' - ' + e.message);
      }
    }
    
    console.log(`\nDone: ${done} OK`);
  } catch (e) {
    console.error('FTP error:', e.message);
  }
  client.close();
}

run();
