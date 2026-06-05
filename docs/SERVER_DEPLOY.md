# Quick Dial / 呲啦起始页 — 服务器部署完整指南

> 目标服务器：阿里云 ECS（宝塔面板） · 域名：cilacila.cn / ruseo.cn

---

## 一、服务器环境确认

登录宝塔面板 → 确认以下已安装：

```
Nginx 1.20+
PHP 8.0+（用于 API，纯静态可跳过）
MySQL 5.7+（用于 API）
phpMyAdmin（数据库管理）
```

---

## 二、部署一：官网 → www.cilacila.cn

### 2.1 创建站点

1. 宝塔 → **网站** → **添加站点**
2. 域名：`www.cilacila.cn`
3. 根目录：`/www/wwwroot/www.cilacila.cn`
4. PHP 版本：**纯静态**
5. 提交

### 2.2 上传文件

```bash
cd M:\new\website
tar -czf website.tar.gz *

scp M:\new\website\website.tar.gz root@你的服务器IP:/tmp/

ssh root@你的服务器IP
mkdir -p /www/wwwroot/www.cilacila.cn
cd /www/wwwroot/www.cilacila.cn
tar -xzf /tmp/website.tar.gz
chown -R www:www /www/wwwroot/www.cilacila.cn
chmod -R 755 /www/wwwroot/www.cilacila.cn
```

### 2.3 宝塔上传方式

1. 宝塔 → **文件** → 进入 `/www/wwwroot/www.cilacila.cn`
2. 点击 **上传** → 拖入 `website/` 下所有文件

### 2.4 配置 HTTPS

1. 宝塔 → 网站 → www.cilacila.cn → **SSL**
2. Let's Encrypt → 勾选 cilacila.cn + www.cilacila.cn
3. 申请 → 勾选「强制 HTTPS」

### 2.5 Nginx 配置

```nginx
index index.html;
error_page 404 /index.html;
gzip on;
gzip_types text/html text/css application/javascript image/svg+xml;
gzip_min_length 256;
```

---

## 三、部署二：扩展 Web 端 → cilacila.cn

### 3.1 创建站点

1. 宝塔 → **网站** → **添加站点**
2. 域名：`cilacila.cn`
3. 根目录：`/www/wwwroot/cilacila.cn`
4. PHP 版本：**纯静态**
5. 提交

### 3.2 构建并上传

```bash
# 本地构建
cd M:\new
npm run build

# 打包 dist 并上传
cd M:\new\dist
tar -czf dist.tar.gz *
scp M:\new\dist\dist.tar.gz root@你的服务器IP:/tmp/

# SSH → 服务器解压
ssh root@你的服务器IP
mkdir -p /www/wwwroot/cilacila.cn
cd /www/wwwroot/cilacila.cn
tar -xzf /tmp/dist.tar.gz
chown -R www:www /www/wwwroot/cilacila.cn
chmod -R 755 /www/wwwroot/cilacila.cn
```

### 3.3 宝塔上传方式

1. 宝塔 → 文件 → `/www/wwwroot/cilacila.cn`
2. 上传 `dist/` 下所有文件（拖入 index.html, assets/ 等）

### 3.4 配置 HTTPS

1. SSL → Let's Encrypt → 勾选 `cilacila.cn`
2. 申请 → 勾选「强制 HTTPS」

### 3.5 Nginx 配置

```nginx
index index.html;
error_page 404 /index.html;
gzip on;
gzip_types text/html text/css application/javascript image/svg+xml;
gzip_min_length 256;
```

### 3.6 验证

访问 `https://cilacila.cn` → 扩展主界面

### 3.7 重定向：裸域 → www（可选）

如果希望 `cilacila.cn` 自动跳转到 `www.cilacila.cn`，在 cilacila.cn 站点配置中：

```nginx
return 301 https://www.cilacila.cn$request_uri;
```

---

---

## 四、后端 API（已部署 → sync.ruseo.cn/api/）

后端已在 `sync.ruseo.cn` 运行中，PHP + MySQL。如需要更新：

```bash
# 更新 API 文件
scp M:\new\api/*.php root@IP:/www/wwwroot/sync.ruseo.cn/api/

# 更新数据库（如有新增 .sql）
mysql -u root -p 库名 < M:\new\api/xxx.sql
```

---

## 五、DNS 配置汇总

| 子域名 | 记录类型 | 值 | 用途 |
|--------|----------|-----|------|
| `@` (cilacila.cn) | A | 服务器IP | 扩展 Web 端 |
| `www` | A | 服务器IP | 官网 |
| `sync` | A | 服务器IP | 后端 API |

---

## 六、部署后检查清单

- [ ] `https://www.cilacila.cn` 可访问，显示中文首页
- [ ] `https://www.cilacila.cn/en.html` 可访问，显示英文首页
- [ ] 语言切换（🌐）正常工作，跨页面保持一致
- [ ] 隐私政策、关于我们、版权声明、联系方式页面均可访问
- [ ] `https://cilacila.cn` 可访问，显示扩展主界面
- [ ] `https://sync.ruseo.cn/api/sync.php` 返回 JSON
- [ ] 登录/注册功能正常
- [ ] 所有子域名启用 HTTPS
- [ ] 宝塔面板中设置每日自动备份数据库

---

## 七、日常更新流程

```bash
# === 更新官网 ===
cd M:\new\website
# 修改 HTML 文件...
# 上传（宝塔文件管理器直接拖入）

# === 更新扩展 ===
cd M:\new
# 修改源码...
npm run build
# 上传 dist/ 到服务器对应目录

# === 更新 API ===
cd M:\new\api
# 修改 .php 文件...
# 上传到服务器 /www/wwwroot/sync.ruseo.cn/api/

# === 推送到 Gitee ===
git add -A
git commit -m "描述改动"
git push origin master
```
