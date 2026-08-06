const ftp = require('basic-ftp');

async function main() {
  const client = new ftp.Client();
  try {
    await client.access({
      host: '116.62.179.194',
      user: 'wwwcilacilacn',
      password: 'pC2RN5Z2h7x6',
    });
    for (const d of ['/download', '/downloads']) {
      try {
        const list = await client.list(d);
        console.log('=== ' + d + ' ===');
        for (const f of list) console.log(f.name, f.size);
      } catch (e) {
        console.log(d, 'ERR', e.message);
      }
    }
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exitCode = 1;
  }
  client.close();
}
main();
