const ftp = require('basic-ftp');
const files = ['about.html','contact.html','copyright.html','privacy.html',
  'en-about.html','en-contact.html','en-copyright.html','en-privacy.html'];

async function main() {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access({ host:'116.62.179.194', port:21, user:'cilacila', password:'kadFrTGY8b3S' });
    for (const f of files) {
      await client.cd('/');
      await client.uploadFrom('M:/new/dist/' + f, f);
      console.log('OK: ' + f);
    }
    console.log('Done! 8 files updated.');
  } catch(e) { console.error(e.message); }
  finally { client.close(); }
}
main();
