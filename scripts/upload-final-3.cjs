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
    
    const files = ['account.html', 'index.html', 'en.html'];
    
    for (const f of files) {
      const local = path.join('M:/new/website', f);
      await client.uploadFrom(local, f);
      const size = fs.statSync(local).size;
      console.log('OK: ' + f + ' (' + size + ' bytes)');
    }
    
    console.log('All uploaded');
  } catch (e) {
    console.error('FTP error:', e.message);
  }
  client.close();
}

run();
