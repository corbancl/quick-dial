const ftp = require('basic-ftp');

async function main() {
  const client = new ftp.Client();
  try {
    await client.access({
      host: '116.62.179.194',
      user: 'wwwcilacilacn',
      password: 'pC2RN5Z2h7x6',
    });
    await client.ensureDir('/downloads');
    await client.uploadFrom(
      'M:/new/packages/quick-dial_v1.0.12_fnos.fpk',
      '/downloads/quick-dial_v1.0.12_fnos.fpk'
    );
    console.log('fpk uploaded -> /downloads/quick-dial_v1.0.12_fnos.fpk');
    try {
      await client.remove('/downloads/quick-dial_v1.0.9_fnos.fpk');
      console.log('old v1.0.9 fpk removed');
    } catch (e) {
      console.log('old fpk remove skip:', e.message);
    }
    await client.cd('/');
    await client.uploadFrom('M:/new/website/index.html', '/index.html');
    await client.uploadFrom('M:/new/website/en.html', '/en.html');
    console.log('index.html / en.html uploaded');
    const list = await client.list('/downloads');
    for (const f of list) console.log(f.name, f.size);
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exitCode = 1;
  }
  client.close();
}
main();
