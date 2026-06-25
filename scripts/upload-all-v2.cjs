const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

const files = [
  // Main pages (updated logo)
  'index.html', 'en.html',
  // Chinese sub-pages
  'account.html', 'guide.html', 'about.html', 'contact.html', 'copyright.html', 'privacy.html',
  // English sub-pages
  'en-account.html', 'en-guide.html', 'en-about.html', 'en-contact.html', 'en-copyright.html', 'en-privacy.html',
];

const localDir = 'M:/new/website';

async function upload() {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access({
      host: '116.62.179.194',
      user: 'wwwcilacilacn',
      password: 'pC2RN5Z2h7x6',
    });
    console.log('Connected');
    for (const f of files) {
      const lp = path.join(localDir, f);
      if (!fs.existsSync(lp)) { console.log(`MISSING: ${f}`); continue; }
      await client.uploadFrom(lp, f);
      const size = fs.statSync(lp).size;
      console.log(`OK: ${f} (${size} bytes)`);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  client.close();
}
upload();
