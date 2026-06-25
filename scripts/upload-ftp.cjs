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

function walkFiles(dir, base) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(base, full).replace(/\\/g, '/');
    if (e.isDirectory()) {
      results.push(...walkFiles(full, base));
    } else {
      results.push({ local: full, remote: rel });
    }
  }
  return results;
}

async function main() {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access(config);
    console.log('Connected!');

    const files = walkFiles(DIST, DIST);
    console.log('Files: ' + files.length);

    let ok = 0;
    for (const f of files) {
      const dirParts = f.remote.replace(/\\/g, '/').split('/');
      const fname = dirParts.pop();
      const dirPath = dirParts.join('/');
      
      // Build directory structure from root, step by step
      if (dirPath) {
        await client.cd('/');
        const parts = dirPath.split('/');
        for (const part of parts) {
          try {
            await client.ensureDir(part);
            // ensureDir navigates INTO the directory, we stay there
          } catch(e) {
            console.log('ensureDir ' + part + ': ' + e.message);
          }
        }
        // Now CWD is in the target directory
        try {
          const size = fs.statSync(f.local).size;
          await client.uploadFrom(f.local, fname);
          console.log('OK: ' + f.remote + ' (' + (size/1024).toFixed(1) + ' KB)');
          ok++;
        } catch(e) {
          console.error('FAIL: ' + f.remote + ' - ' + e.message);
        }
      } else {
        // Root file
        await client.cd('/');
        try {
          const size = fs.statSync(f.local).size;
          await client.uploadFrom(f.local, fname);
          console.log('OK: ' + f.remote + ' (' + (size/1024).toFixed(1) + ' KB)');
          ok++;
        } catch(e) {
          console.error('FAIL: ' + f.remote + ' - ' + e.message);
        }
      }
    }
    console.log('\n=== Done! OK: ' + ok + '/' + files.length + ' ===');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    client.close();
  }
}

main();
