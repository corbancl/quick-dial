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
    // 上传版本号格式的 fpk
    await client.uploadFrom('M:/new/downloads/quick-dial_v1.0.9_fnos.fpk', '/downloads/quick-dial_v1.0.9_fnos.fpk');
    console.log('quick-dial_v1.0.9_fnos.fpk uploaded');
    // 删除旧的无版本号 fpk
    try { await client.remove('/downloads/quick-dial.fpk'); console.log('Removed quick-dial.fpk'); } catch(e) { console.log('Old fpk not found or already removed'); }
  } catch (err) {
    console.error('Upload error:', err);
  }
  client.close();
}

upload();
