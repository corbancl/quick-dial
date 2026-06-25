const http = require('http');

const urls = [
  'http://116.62.179.194/downloads/quick-dial-v1.0.8-chrome.zip',
  'http://116.62.179.194/downloads/quick-dial-v1.0.8-firefox.zip',
  'http://116.62.179.194/downloads/quick-dial-v1.0.8-webapp.zip',
  'http://116.62.179.194/account.html',
  'http://116.62.179.194/',
];

async function check(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      const cl = res.headers['content-length'];
      resolve(`OK: ${url} (${res.statusCode}) ${cl ? (cl/1024).toFixed(1)+'KB' : ''}`);
    });
    req.on('error', (e) => resolve(`FAIL: ${url} - ${e.message}`));
    req.setTimeout(10000, () => { req.destroy(); resolve(`TIMEOUT: ${url}`); });
  });
}

(async () => {
  for (const u of urls) console.log(await check(u));
})();
