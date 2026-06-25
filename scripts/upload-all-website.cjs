const ftp = require('basic-ftp');
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
    
    const localDir = 'M:/new/website';
    const files = require('fs').readdirSync(localDir).filter(f => 
      /\.(html|js|png|css)$/.test(f)
    );
    
    let done = 0;
    let fail = 0;
    
    for (const f of files) {
      try {
        await client.uploadFrom(path.join(localDir, f), f);
        console.log('  OK: ' + f);
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
