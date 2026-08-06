/**
 * 列出官网 www.cilacila.cn 的 /download 与 /downloads 目录内容
 * 只读，不做任何修改
 */
const ftp = require('basic-ftp');

(async () => {
  const c = new ftp.Client(30000);
  try {
    await c.access({
      host: '116.62.179.194',
      port: 21,
      user: 'wwwcilacilacn',
      password: 'pC2RN5Z2h7x6',
    });
    for (const dir of ['/download', '/downloads']) {
      try {
        const list = await c.list(dir);
        console.log('\n=== ' + dir + ' (' + list.length + ' 项) ===');
        list
          .filter((f) => f.isFile)
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach((f) => {
            console.log('  ' + f.name + '  ' + (f.size / 1024).toFixed(0) + ' KB');
          });
      } catch (e) {
        console.log('\n=== ' + dir + ' === ERROR: ' + e.message);
      }
    }
  } catch (e) {
    console.error('FTP ERROR:', e.message);
    process.exitCode = 1;
  } finally {
    c.close();
  }
})();
