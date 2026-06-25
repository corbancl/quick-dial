const ftp = require('basic-ftp');

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
    
    console.log('=== Root ===');
    const root = await client.list();
    for (const f of root) console.log(f.name + (f.isDirectory ? '/' : ' (' + f.size + ' bytes)'));
    
    // Check if downloads dir exists
    console.log('\n=== /downloads/ ===');
    try {
      await client.cd('downloads');
      const dlFiles = await client.list();
      for (const f of dlFiles) console.log(f.name + ' (' + f.size + ' bytes)');
    } catch(e) {
      console.log('downloads dir not found or error:', e.message);
    }
    
  } catch (e) {
    console.error('FTP error:', e.message);
  }
  client.close();
}

run();
