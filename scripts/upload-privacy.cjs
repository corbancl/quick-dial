const ftp = require('basic-ftp');

async function upload() {
  const client = new ftp.Client();
  await client.access({
    host: '116.62.179.194',
    port: 21,
    user: 'wwwcilacilacn',
    password: 'pC2RN5Z2h7x6',
    secure: false,
  });
  await client.uploadFrom('M:/new/website/en-privacy.html', 'en-privacy.html');
  client.close();
  console.log('Done');
}

upload().catch(e => { console.error(e); process.exit(1); });
