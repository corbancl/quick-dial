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
    
    // Check for any subdirectories
    const root = await client.list();
    const dirs = root.filter(f => f.isDirectory);
    for (const d of dirs) {
      console.log('=== ' + d.name + '/ ===');
      try {
        await client.cd(d.name);
        const files = await client.list();
        console.log(files.map(f => f.name + (f.isDirectory?'/':(' ('+f.size+' bytes)'))).join('\n'));
        await client.cd('..');
      } catch(e) {
        console.log('Error: ' + e.message);
      }
    }
  } catch (e) {
    console.error('FTP error:', e.message);
  }
  client.close();
}

run();
