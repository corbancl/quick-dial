#!/usr/bin/env node
/**
 * 后端部署（sync.ruseo.cn）— 备份 + 上传 + 校验
 *
 * 重要: FTP 账号 syncruseocn 已 chroot，登录后的 / 就等于 /www/wwwroot/sync.ruseo.cn
 *       所以远程路径直接用相对根路径 /api/xxx.php，切勿再拼 /www/wwwroot/...
 *
 * 用法: node scripts/deploy-backend.cjs [file1.php file2.php ...]   默认 admin.php
 */
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CFG = { host: '116.62.179.194', port: 21, user: 'syncruseocn', password: 'bDMkxPWtksCJ' };

const files = process.argv.slice(2).length ? process.argv.slice(2) : ['admin.php'];
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const BACKUP_DIR = path.join(ROOT, 'backups', 'sync.ruseo.cn', stamp);

(async () => {
  const c = new ftp.Client(30000);
  c.ftp.verbose = false;
  let failed = 0;
  try {
    await c.access(CFG);
    console.log('[连接] sync.ruseo.cn OK');
    fs.mkdirSync(BACKUP_DIR, { recursive: true });

    for (const f of files) {
      const local = path.join(ROOT, 'api', f);
      const remote = '/api/' + f;
      if (!fs.existsSync(local)) { console.error(`[跳过] 本地不存在: api/${f}`); failed++; continue; }

      // 1) 备份线上现有文件
      const bak = path.join(BACKUP_DIR, f);
      try {
        await c.downloadTo(bak, remote);
        console.log(`[备份] ${remote} -> backups/sync.ruseo.cn/${stamp}/${f} (${fs.statSync(bak).size} B)`);
      } catch (e) {
        console.log(`[备份] ${remote} 线上不存在或下载失败（视为新增）: ${e.message}`);
        if (fs.existsSync(bak)) fs.unlinkSync(bak);
      }

      // 2) 上传
      await c.uploadFrom(local, remote);
      const localSize = fs.statSync(local).size;
      console.log(`[上传] api/${f} -> ${remote} (${localSize} B)`);

      // 3) 回读比对（字节级确认线上 == 本地）
      const tmp = path.join(BACKUP_DIR, f + '.uploaded');
      await c.downloadTo(tmp, remote);
      const same = fs.readFileSync(tmp).equals(fs.readFileSync(local));
      console.log(`[校验] ${remote} 字节比对: ${same ? 'IDENTICAL ✔' : 'DIFFERS ✘'}`);
      fs.unlinkSync(tmp);
      if (!same) failed++;
    }
  } catch (e) {
    console.error('[错误] ' + e.message);
    failed++;
  } finally {
    c.close();
  }
  console.log(`\n备份目录: ${path.relative(ROOT, BACKUP_DIR)}`);
  process.exit(failed ? 1 : 0);
})();
