#!/usr/bin/env node
/**
 * web 端部署（cilacila.cn）— 上传 dist/ + 校验
 *
 * 重要: cilacila.cn 与 www.cilacila.cn 是两个独立站点、独立 docroot、独立 FTP 账号。
 *       web 端必须用账号 cilacila（登录后的根即 cilacila.cn 的 docroot）。
 *       官网账号是 wwwcilacilacn，绝不可混用。
 *
 * 用法: node scripts/deploy-web.cjs [--prune]
 *       --prune  清理远程 assets/ 中本地已不存在的旧哈希产物
 */
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const CFG = { host: '116.62.179.194', port: 21, user: 'cilacila', password: 'kadFrTGY8b3S' };
const PRUNE = process.argv.includes('--prune');

const walk = (dir, base = dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, base, out);
    else out.push(path.relative(base, f).replace(/\\/g, '/'));
  }
  return out;
};

(async () => {
  if (!fs.existsSync(DIST)) { console.error('[错误] dist/ 不存在，请先 npm run build'); process.exit(1); }
  const localFiles = walk(DIST);
  const c = new ftp.Client(60000);
  c.ftp.verbose = false;
  let failed = 0;
  try {
    await c.access(CFG);
    console.log(`[连接] cilacila.cn OK  本地待传 ${localFiles.length} 个文件`);

    await c.uploadFromDir(DIST, '/');
    console.log('[上传] dist/ -> / 完成');

    // 回读校验关键文件（字节级）
    for (const f of ['index.html', 'version.json']) {
      const local = path.join(DIST, f);
      if (!fs.existsSync(local)) continue;
      const tmp = path.join(ROOT, '.qd_verify_tmp');
      await c.downloadTo(tmp, '/' + f);
      const same = fs.readFileSync(tmp).equals(fs.readFileSync(local));
      console.log(`[校验] /${f} 字节比对: ${same ? 'IDENTICAL ✔' : 'DIFFERS ✘'}`);
      fs.unlinkSync(tmp);
      if (!same) failed++;
    }

    // 远程 assets 残留盘点（可选清理）
    try {
      const remoteAssets = (await c.list('/assets')).filter((x) => x.isFile).map((x) => x.name);
      const localAssets = new Set(localFiles.filter((f) => f.startsWith('assets/')).map((f) => f.slice(7)));
      const stale = remoteAssets.filter((n) => !localAssets.has(n));
      if (stale.length) {
        console.log(`[盘点] 远程 assets/ 存在 ${stale.length} 个旧哈希残留: ${stale.slice(0, 10).join(', ')}${stale.length > 10 ? ' …' : ''}`);
        if (PRUNE) {
          for (const n of stale) { await c.remove('/assets/' + n); }
          console.log(`[清理] 已删除 ${stale.length} 个旧产物`);
        } else {
          console.log('[提示] 未清理（加 --prune 可清理）');
        }
      } else console.log('[盘点] 远程 assets/ 无残留');
    } catch (e) { console.log('[盘点] assets 列举失败: ' + e.message); }
  } catch (e) {
    console.error('[错误] ' + e.message);
    failed++;
  } finally {
    c.close();
  }
  process.exit(failed ? 1 : 0);
})();
