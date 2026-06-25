const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

const localDir = 'M:/new/fnos';
const files = ['quick-dial-v1.0.8.fpk'];

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

    // Ensure downloads/ exists
    await client.ensureDir('/downloads');
    await client.cd('/downloads');

    for (const f of files) {
      const lp = path.join(localDir, f);
      if (!fs.existsSync(lp)) {
        console.log(`MISSING: ${f}`);
        continue;
      }
      console.log(`Uploading ${f} (${(fs.statSync(lp).size/1024).toFixed(1)}KB)...`);
      await client.uploadFrom(lp, f);
      console.log(`  ✓ ${f}`);
    }

    console.log('\nDone!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

upload();
