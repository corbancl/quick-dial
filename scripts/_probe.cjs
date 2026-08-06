const ftp = require('basic-ftp');
async function probe() {
  const c = new ftp.Client();
  c.ftp.verbose = false;
  await c.access({ host: '116.62.179.194', user: 'wwwcilacilacn', password: 'pC2RN5Z2h7x6', port: 21, secure: false });
  const dirs = ['/', '/downloads', '/app', '/start', '/content/plugins/quickdial/web', '/assets'];
  for (const dir of dirs) {
    try {
      const list = await c.list(dir);
      console.log(`\n[${dir}] (${list.length}):`);
      console.log(list.slice(0, 50).map(e => e.name + (e.isDirectory ? '/' : '')).join(', '));
    } catch (e) {
      console.log(`\n[${dir}] ERR: ${e.message}`);
    }
  }
  c.close();
}
probe().catch(e => { console.error(e); process.exit(1); });
