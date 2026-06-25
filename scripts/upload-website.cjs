const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

const BASE = 'M:/new/website';
const config = {
  host: '116.62.179.194',
  port: 21,
  user: 'wwwcilacilacn',
  password: 'pC2RN5Z2h7x6'
};

function walk(dir, base) {
  const results = [];
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(base, full).replace(/\\/g, '/');
    if (e.isDirectory()) {
      results.push(...walk(full, base));
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

    // First, clean old files (but keep any important server files)
    console.log('Cleaning old files...');
    const KEEP = new Set(['.user.ini', '.well-known', 'verify-file.txt']);
    const rootList = await client.list('/');
    for (const item of rootList) {
      if (item.isDirectory && item.name !== '.' && item.name !== '..' && item.name !== '.well-known') {
        // Don't recursively delete - will overwrite
      } else if (item.isFile && !KEEP.has(item.name)) {
        try {
          await client.remove(item.name);
        } catch(e) {}
      }
    }
    // Remove old imgs/ if exists, then re-upload
    try { await client.removeDir('imgs'); } catch(e) {}

    console.log('Uploading...');
    const files = walk(BASE, BASE);
    let ok = 0;

    for (const f of files) {
      const parts = f.remote.replace(/\\/g, '/').split('/');
      const fname = parts.pop();
      const dirPath = parts.join('/');

      if (dirPath) {
        await client.cd('/');
        for (const part of dirPath.split('/')) {
          try { await client.ensureDir(part); } catch(e) {}
        }
        try {
          await client.uploadFrom(f.local, fname);
          const s = (fs.statSync(f.local).size / 1024).toFixed(1);
          console.log('OK: ' + f.remote + ' (' + s + ' KB)');
          ok++;
        } catch(e) { console.error('FAIL: ' + f.remote + ' - ' + e.message); }
      } else {
        await client.cd('/');
        try {
          await client.uploadFrom(f.local, fname);
          const s = (fs.statSync(f.local).size / 1024).toFixed(1);
          console.log('OK: ' + f.remote + ' (' + s + ' KB)');
          ok++;
        } catch(e) { console.error('FAIL: ' + f.remote + ' - ' + e.message); }
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
