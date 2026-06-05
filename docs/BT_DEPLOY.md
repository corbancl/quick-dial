# 官网宝塔面板部署指南

## 一、准备工作

### 1.1 服务器环境要求

| 项目 | 要求 |
|------|------|
| 操作系统 | CentOS 7+ / Ubuntu 20.04+ / Debian 11+ |
| 宝塔面板 | 7.9+（免费专业版均可） |
| Nginx | 1.18+（推荐安装最新版） |
| Node.js | 18+（仅构建时需要） |

### 1.2 域名解析

在域名控制台添加 DNS 记录：

| 类型 | 主机记录 | 记录值 | TTL |
|------|---------|--------|-----|
| A | `dial` | 服务器公网 IP | 600 |

例如：`dial.cilacila.cn` → `你的服务器IP`

> DNS 生效通常需要 1-10 分钟，可通过 `ping dial.cilacila.cn` 验证。

---

## 二、本地构建

在本地开发机上执行：

```bash
cd M:\new
npm run build
```

构建完成后 `dist/` 目录即为最终产物：

```
dist/
├── index.html
├── manifest.json
├── manifest-chrome.json
├── manifest-edge.json
├── manifest-firefox.json
├── background.js
├── js.png
├── jss.png
├── fontawesome/
│   ├── css/all.min.css
│   └── webfonts/
├── assets/
│   ├── index-xxx.js
│   └── index-xxx.css
└── icons/
```

压缩 dist 目录：

```powershell
# Windows PowerShell
Compress-Archive -Path "M:\new\dist\*" -DestinationPath "M:\new\dist.zip" -Force
```

---

## 三、宝塔面板创建站点

### 3.1 登录宝塔面板

浏览器访问 `http://你的服务器IP:8888`，输入账号密码登录。

### 3.2 添加站点

1. 点击左侧菜单 **网站** → 点击 **添加站点**
2. 按以下信息填写：

| 配置项 | 填写内容 |
|--------|---------|
| 域名 | `dial.cilacila.cn`（一行一个，可添加多个域名） |
| 备注 | Quick Dial 官网（可选） |
| 根目录 | `/www/wwwroot/dial.cilacila.cn`（自动生成，保持默认即可） |
| 数据库 | **不创建**（纯静态网站不需要数据库） |
| PHP 版本 | **纯静态** |
| FTP | **不创建** |

3. 点击 **提交**

### 3.3 确认站点目录

提交后宝塔会自动创建站点目录：`/www/wwwroot/dial.cilacila.cn`

---

## 四、上传文件

### 方式一：通过宝塔文件管理器上传（推荐新手）

1. 点击宝塔左侧菜单 **文件**
2. 进入 `/www/wwwroot/dial.cilacila.cn` 目录
3. 点击 **上传** → 选择本地 `dist.zip`
4. 上传完成后，点击 dist.zip 右侧的 **解压** → 解压到当前目录
5. 解压后删除 dist.zip 压缩包

### 方式二：通过 SCP 命令行上传

```powershell
# 上传压缩包到服务器
scp "M:\new\dist.zip" root@你的服务器IP:/www/wwwroot/dial.cilacila.cn/

# SSH 登录服务器
ssh root@你的服务器IP

# 进入站点目录并解压
cd /www/wwwroot/dial.cilacila.cn
unzip dist.zip
rm dist.zip

# 设置正确的文件权限
chown -R www:www /www/wwwroot/dial.cilacila.cn
chmod -R 755 /www/wwwroot/dial.cilacila.cn
```

### 方式三：通过 SFTP 工具上传

使用 FileZilla、WinSCP 等工具：

1. 主机：`你的服务器IP`
2. 协议：SFTP（端口 22）
3. 用户名：`root`
4. 密码：服务器密码
5. 登录后进入 `/www/wwwroot/dial.cilacila.cn` 上传 dist 目录下的所有文件

---

## 五、配置 Nginx

### 5.1 进入网站配置

1. 宝塔左侧菜单 → **网站**
2. 找到 `dial.cilacila.cn` → 点击右侧 **设置**

### 5.2 配置网站目录

1. 点击左侧 **网站目录**
2. 确认运行用户为 `www`
3. 确认目录路径为 `/www/wwwroot/dial.cilacila.cn`

### 5.3 配置默认文档

1. 点击左侧 **默认文档**
2. 确认 `index.html` 在列表中（如果没有就添加）
3. 可删除不需要的默认文档（如 index.php）

### 5.4 配置伪静态

点击左侧 **伪静态**，选择 `default`，清空内容后添加以下配置：

```nginx
# SPA 单页应用支持
location / {
    try_files $uri $uri/ /index.html;
}

# 静态资源缓存（1年）
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 禁止访问隐藏文件
location ~ /\. {
    deny all;
}

# 禁止访问 JSON 文件（防止 manifest 被直接访问）
location ~ /manifest.*\.json$ {
    add_header Content-Type "application/json";
}
```

### 5.5 配置 Gzip 压缩

点击左侧 **配置文件**，找到 `gzip` 相关配置，确保包含以下内容：

```nginx
gzip on;
gzip_min_length 1k;
gzip_buffers 4 16k;
gzip_http_version 1.1;
gzip_comp_level 6;
gzip_types text/plain text/css application/javascript application/json text/xml application/xml application/xml+rss text/javascript image/svg+xml;
gzip_vary on;
```

---

## 六、配置 HTTPS

### 6.1 申请 Let's Encrypt 免费证书

1. 点击网站设置 → 左侧 **SSL**
2. 选择 **Let's Encrypt**
3. 确认域名列表包含 `dial.cilacila.cn`
4. 输入邮箱（用于证书过期提醒）
5. 点击 **申请**

### 6.2 强制 HTTPS

1. 证书申请成功后，切换到 **强制 HTTPS**
2. 开启 **强制 HTTPS** 开关
3. 保存

### 6.3 定期自动续签

宝塔面板默认会在证书过期前 30 天自动续签 Let's Encrypt 证书，无需手动操作。

可在 **计划任务** 中确认：
1. 宝塔左侧菜单 → **计划任务**
2. 确认存在 "Let's Encrypt 证书续签" 任务（默认每天执行）

---

## 七、访问验证

### 7.1 基础访问测试

在浏览器中访问：

```
https://dial.cilacila.cn
```

确认以下内容正常显示：
- 页面能正常加载
- 时钟组件正常运行
- 搜索框、导航卡片等功能正常

### 7.2 检查 HTTPS

浏览器地址栏显示 **锁形图标**，点击确认：
- 证书有效
- 证书颁发机构为 Let's Encrypt
- 证书域名包含 `dial.cilacila.cn`

### 7.3 检查 Gzip 压缩

```bash
# 在本地终端执行
curl -I -H "Accept-Encoding: gzip" https://dial.cilacila.cn/
```

确认响应头包含：

```
Content-Encoding: gzip
```

### 7.4 检查缓存

```bash
curl -I https://dial.cilacila.cn/assets/index-xxx.js
```

确认响应头包含：

```
Cache-Control: public, immutable
expires: <未来一年的日期>
```

---

## 八、后续更新

### 8.1 更新流程

```
1. 本地修改代码
2. npm run build
3. 上传新 dist 到服务器（覆盖旧文件）
4. 刷新浏览器验证
```

### 8.2 快速更新脚本

在服务器端创建更新脚本 `/root/update-dial.sh`：

```bash
#!/bin/bash
# Quick Dial 官网快速更新脚本

BACKUP_DIR="/www/backup/dial"
SITE_DIR="/www/wwwroot/dial.cilacila.cn"
UPLOAD_DIR="/tmp/dial-upload"

# 创建备份
mkdir -p "$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)"
cp -r "$SITE_DIR" "$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)/"

# 清理并解压新文件
rm -rf "$SITE_DIR"/*
unzip "$UPLOAD_DIR/dist.zip" -d "$SITE_DIR"

# 设置权限
chown -R www:www "$SITE_DIR"
chmod -R 755 "$SITE_DIR"

# 清理 Nginx 缓存（如果使用宝塔缓存）
# nginx -s reload

echo "更新完成！"
```

### 8.3 回滚方法

```bash
# 列出所有备份
ls -la /www/backup/dial/

# 回滚到指定版本
cp -r /www/backup/dial/20260601_120000/* /www/wwwroot/dial.cilacila.cn/
chown -R www:www /www/wwwroot/dial.cilacila.cn
```

---

## 九、常见问题

### 9.1 访问显示 404

**原因**：文件未正确上传或 Nginx 配置有误

**解决**：
1. 确认 `/www/wwwroot/dial.cilacila.cn/index.html` 文件存在
2. 确认文件权限为 `www:www`
3. 检查 Nginx 错误日志：`/www/wwwlogs/dial.cilacila.cn.error.log`

### 9.2 访问显示 403

**原因**：文件权限不正确

**解决**：
```bash
chown -R www:www /www/wwwroot/dial.cilacila.cn
chmod -R 755 /www/wwwroot/dial.cilacila.cn
```

### 9.3 HTTPS 不生效

**原因**：证书未申请成功或 DNS 未生效

**解决**：
1. 确认 DNS 解析已生效：`ping dial.cilacila.cn`
2. 确认 80 端口未被防火墙阻挡：`netstat -tlnp | grep :80`
3. Let's Encrypt 申请证书时需要 80 端口可访问
4. 重新申请证书

### 9.4 字体文件无法加载

**原因**：CORS 策略或 MIME 类型配置问题

**解决**：
在 Nginx 配置文件中添加：

```nginx
location ~* \.(woff|woff2|ttf|eot)$ {
    add_header Access-Control-Allow-Origin "*";
    add_header Cache-Control "public, immutable";
}
```

### 9.5 浏览器缓存导致看不到更新

**解决**：
- 强制刷新：`Ctrl + Shift + R`（Windows）或 `Cmd + Shift + R`（Mac）
- 或打开浏览器开发者工具 → 右键刷新按钮 → 选择"清空缓存并硬性重新加载"

---

## 十、安全加固建议

| 项目 | 操作 |
|------|------|
| 关闭目录浏览 | 宝塔 → 网站设置 → 配置文件 → 确认 `autoindex off;` |
| 隐藏 Nginx 版本号 | 配置文件中添加 `server_tokens off;` |
| 配置防火墙 | 宝塔 → 安全 → 只开放必要端口（80/443/22/8888） |
| 定期备份 | 宝塔 → 计划任务 → 添加定期备份任务 |
| 更新面板 | 宝塔面板保持最新版本 |
