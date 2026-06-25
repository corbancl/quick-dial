const ftp = require('basic-ftp');
const fs = require('fs');

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
    
    const files = ['index.html', 'en.html', 'account.html', 'privacy.html', 'guide.html', 'en-guide.html'];
    for (const f of files) {
      await client.uploadFrom('M:/new/website/' + f, f);
      console.log('OK: ' + f + ' (' + fs.statSync('M:/new/website/' + f).size + ' bytes)');
    }
    console.log('Done');
  } catch (e) {
    console.error('FTP error:', e.message);
  }
  client.close();
}

run();
