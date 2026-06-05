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

## 四、部署三：后端 API → sync.ruseo.cn/api/

### 4.1 确认站点已存在

宝塔 → 网站 → 检查 `sync.ruseo.cn` 是否已创建。如未创建：

1. 添加站点，域名填 `sync.ruseo.cn`
2. 根目录：`/www/wwwroot/sync.ruseo.cn`
3. PHP 版本：**8.0+**
4. 提交

### 4.2 上传 API 文件

```bash
cd M:\new
tar -czf api.tar.gz api/

scp M:\new\api.tar.gz root@你的服务器IP:/tmp/

ssh root@你的服务器IP
cd /www/wwwroot/sync.ruseo.cn
mkdir -p api
cd api
tar -xzf /tmp/api.tar.gz --strip-components=1
chown -R www:www /www/wwwroot/sync.ruseo.cn
chmod -R 755 /www/wwwroot/sync.ruseo.cn
```

### 4.3 导入数据库

```bash
# 在服务器上
mysql -u root -p 你的数据库名 < /www/wwwroot/sync.ruseo.cn/api/sync.sql
mysql -u root -p 你的数据库名 < /www/wwwroot/sync.ruseo.cn/api/account.sql
mysql -u root -p 你的数据库名 < /www/wwwroot/sync.ruseo.cn/api/admin.sql
mysql -u root -p 你的数据库名 < /www/wwwroot/sync.ruseo.cn/api/pay.sql
```

或通过 phpMyAdmin：登录 → 选择数据库 → 导入 → 选择 .sql 文件 → 执行。

### 4.4 修改数据库连接

编辑每个 `.php` 文件的数据库配置（通常在文件顶部）：

```php
$db_host = 'localhost';
$db_user = '你的数据库用户名';
$db_pass = '你的数据库密码';
$db_name = '你的数据库名';
```

### 4.5 Nginx 配置（允许跨域 + URL 重写）

宝塔 → 网站 → sync.ruseo.cn → 配置文件，在 server{} 块内：

```nginx
# 跨域头
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Headers "Content-Type, Authorization";
add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";

# API 路由（确保 .php 扩展名处理正确）
location /api/ {
    try_files $uri $uri/ /api/index.php?$query_string;
}

# PHP 处理
location ~ \.php$ {
    fastcgi_pass unix:/tmp/php-cgi-80.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}
```

### 4.6 配置 HTTPS + 验证

1. SSL → Let's Encrypt → 申请
2. 浏览器访问 `https://sync.ruseo.cn/api/sync.php` → 应返回 JSON

---

## 五、部署四：管理后台 → bot.chenliang.xyz（你原有）

如果 `bot.chenliang.xyz` 就是管理后台，确认：
- 站点是否存在，根目录是否包含 `admin.php`
- 数据库连接配置是否正确
- SSL 证书是否有效

如需要从此项目部署 admin：
```bash
# 上传 admin.php 和 admin.sql 到对应站点
scp M:\new\api\admin.php root@IP:/www/wwwroot/bot.chenliang.xyz/
scp M:\new\api\admin.sql root@IP:/tmp/
```

---

## 六、DNS 配置汇总

| 子域名 | 记录类型 | 值 | 用途 |
|--------|----------|-----|------|
| `@` (cilacila.cn) | A | 服务器IP | 扩展 Web 端 |
| `www` | A | 服务器IP | 官网 |
| `sync` | A | 服务器IP | 后端 API |

---

## 七、部署后检查清单

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

## 八、日常更新流程

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
