const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

const DIST = 'M:/new/dist';
const config = {
  host: '116.62.179.194',
  port: 21,
  user: 'cilacila',
  password: 'kadFrTGY8b3S'
};

async function main() {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access(config);
    console.log('Connected!');
    
    // 1. Check what's inside assets/ and fontawesome/
    console.log('\n=== /assets/ contents ===');
    const assets = await client.list('/assets');
    for (const f of assets) console.log('  ' + f.type + '\t' + f.name + '\tuid=' + f.unique);

    console.log('\n=== /fontawesome/ contents ===');
    try {
      const fa = await client.list('/fontawesome');
      for (const f of fa) console.log('  ' + f.type + '\t' + f.name);
    } catch(e) { console.log('  Error: ' + e.message); }

    console.log('\n=== /icons/ contents ===');
    try {
      const ic = await client.list('/icons');
      for (const f of ic) console.log('  ' + f.type + '\t' + f.name);
    } catch(e) { console.log('  Error: ' + e.message); }

    // 2. Try to delete nested dirs from previous failed run
    console.log('\n--- Removing nested junk dirs ---');
    await client.cd('/');
    try { await client.removeEmptyDir('/assets/assets'); console.log('removed /assets/assets'); } catch(e) {}
    try { await client.removeDir('/assets/assets'); console.log('removed /assets/assets (recursive)'); } catch(e) { console.log('rm assets/assets: ' + e.message); }
    
    // List siblings again  
    console.log('\n=== /assets/ after cleanup ===');
    const a2 = await client.list('/assets');
    for (const f of a2) console.log('  ' + f.type + '\t' + f.name + '\tperms=' + f.permissions);
    
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    client.close();
  }
}

main();
