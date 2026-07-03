const ftp = require('basic-ftp');
const fs = require('fs');

async function upload() {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access({
      host: '116.62.179.194',
      user: 'wwwcilacilacn',
      password: 'pC2RN5Z2h7x6',
    });
    await client.uploadFrom('M:/new/website/index.html', '/index.html');
    console.log('index.html uploaded');
    await client.uploadFrom('M:/new/website/en.html', '/en.html');
    console.log('en.html uploaded');
  } catch (err) {
    console.error('Upload error:', err);
  }
  client.close();
}

upload();
