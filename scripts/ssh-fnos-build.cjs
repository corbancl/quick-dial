const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH 连接成功');
  conn.exec('cd /vol1/1000/fnos && fnpack build', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('退出码:', code);
      conn.end();
    });
    stream.on('data', (data) => console.log('' + data));
    stream.stderr.on('data', (data) => console.error('ERR:', '' + data));
  });
});
conn.on('error', (err) => {
  console.error('SSH 连接失败:', err.message);
  process.exit(1);
});
conn.connect({
  host: '192.168.110.61',
  port: 22,
  username: 'corban',
  password: '7832518ycx',
  readyTimeout: 10000
});
