// 部署脚本：web端(cilacila.cn) + 官网(www.cilacila.cn)
// 两个站点独立 docroot、独立 FTP 账号，绝不混用。
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

const HOST = '116.62.179.194';
const ROOT = 'M:/new';

const ENDS = {
  web: {
    label: 'web端 cilacila.cn',
    user: 'cilacila',
    password: 'kadFrTGY8b3S',
    local: path.join(ROOT, 'dist'),
    remote: '/',
    cleanAssets: true,
  },
  site: {
    label: '官网 www.cilacila.cn',
    user: 'wwwcilacilacn',
    password: 'pC2RN5Z2h7x6',
    local: path.join(ROOT, 'website'),
    remote: '/',
    cleanAssets: false,
  },
};

async function cleanStaleAssets(client, localAssetsDir, remoteAssetsDir) {
  const local = new Set(fs.readdirSync(localAssetsDir));
  const remote = await client.list(remoteAssetsDir);
  let removed = 0;
  for (const f of remote) {
    if (f.isFile && !local.has(f.name)) {
      await client.remove(path.posix.join(remoteAssetsDir, f.name));
      removed++;
      console.log('  ✗ removed stale', path.posix.join(remoteAssetsDir, f.name));
    }
  }
  console.log(`  [clean] ${removed} stale asset(s) removed`);
}

async function uploadTree(client, localDir, remoteDir, blocked) {
  const entries = fs.readdirSync(localDir, { withFileTypes: true });
  for (const e of entries) {
    const localPath = path.join(localDir, e.name);
    const remotePath = path.posix.join(remoteDir, e.name);
    if (e.isDirectory()) {
      try { await client.ensureDir(remotePath); } catch (err) { console.log('  ⚠ mkdir skip', remotePath, err.message); continue; }
      await uploadTree(client, localPath, remotePath, blocked);
    } else {
      try {
        await client.uploadFrom(localPath, remotePath);
        console.log('  ↑', remotePath);
      } catch (err) {
        blocked.push(remotePath);
        console.log('  ⛔ BLOCKED', remotePath, '-', err.message);
      }
    }
  }
}

async function deploy(which) {
  const cfg = ENDS[which];
  console.log(`\n===== 部署 ${cfg.label} =====`);
  const client = new ftp.Client(30000);
  client.ftp.verbose = false;
  try {
    await client.access({ host: HOST, user: cfg.user, password: cfg.password, port: 21, secure: false });
    await client.ensureDir(cfg.remote);
    const blocked = [];
    await uploadTree(client, cfg.local, cfg.remote, blocked);
    console.log(`  ↑ 目录已上传: ${cfg.local} -> ${cfg.remote}`);
    if (blocked.length) console.log(`  ⚠ 被拦截文件(${blocked.length}):`, blocked.join(', '));
    if (cfg.cleanAssets) {
      const la = path.join(cfg.local, 'assets');
      if (fs.existsSync(la)) await cleanStaleAssets(client, la, path.posix.join(cfg.remote, 'assets'));
    }
    console.log(`✅ ${cfg.label} 部署完成`);
  } catch (e) {
    console.error(`❌ ${cfg.label} 失败:`, e.message);
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

(async () => {
  const arg = process.argv[2] || 'all';
  if (arg === 'all' || arg === 'web') await deploy('web');
  if (arg === 'all' || arg === 'site') await deploy('site');
})();
