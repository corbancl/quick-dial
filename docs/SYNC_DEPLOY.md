# Quick Dial 云同步 — 部署指南

## 一、DNS 解析

阿里云 DNS 添加 A 记录：

| 主机记录 | 记录类型 | 记录值 |
|---------|---------|--------|
| sync | A | 你服务器的公网 IP |

生效时间：取决于 TTL，一般 1-10 分钟。

---

## 二、宝塔面板 — 创建站点

1. 登录宝塔面板
2. **网站** → **添加站点**
3. 填写：

| 字段 | 值 |
|------|-----|
| 域名 | `sync.ruseo.cn` |
| 根目录 | `/www/wwwroot/sync.ruseo.cn` |
| PHP 版本 | PHP 8.0 |
| 其他 | 默认即可 |

4. 点 **提交**

---

## 三、上传文件

### 3.1 创建目录结构

```bash
# SSH 登录服务器
mkdir -p /www/wwwroot/sync.ruseo.cn/api
```

### 3.2 上传 PHP 文件

将本地 `M:\new\api\sync.php` 上传到服务器：
```
/www/wwwroot/sync.ruseo.cn/api/sync.php
```

### 3.3 创建 config.php

在服务器上创建 `/www/wwwroot/sync.ruseo.cn/api/config.php`：

```php
<?php
$db = new PDO(
    'mysql:host=127.0.0.1;dbname=你的数据库名;charset=utf8mb4',
    '数据库用户名',
    '数据库密码',
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
);
```

> 如果用 ruseo.cn 已有的数据库，直接复用现有 config.php 的配置即可。

---

## 四、MySQL 建表

登录 MySQL 执行 `M:\new\api\sync.sql`：

```sql
-- 用户表
CREATE TABLE IF NOT EXISTS qd_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    token VARCHAR(64) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 同步数据表
CREATE TABLE IF NOT EXISTS qd_sync (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    data LONGTEXT NOT NULL,
    version INT NOT NULL DEFAULT 1,
    size_bytes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES qd_users(id) ON DELETE CASCADE,
    INDEX idx_user_version (user_id, version DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 五、Nginx 伪静态（可选）

如果宝塔新建站点后 PHP 不解析，在站点设置 → 伪静态中添加：

```nginx
location / {
    if (!-e $request_filename) {
        rewrite ^(.*)$ /index.php?s=$1 last;
        break;
    }
}
```

> 如果只用 sync.php 这一个文件，不配伪静态也行，直接 `https://sync.ruseo.cn/api/sync.php?action=xxx` 访问即可。

---

## 六、验证

### 6.1 测试注册

```bash
curl -X POST https://sync.ruseo.cn/api/sync.php?action=register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

预期返回：
```json
{"code":201,"msg":"注册成功","data":{"token":"...","username":"test"}}
```

### 6.2 测试登录

```bash
curl -X POST https://sync.ruseo.cn/api/sync.php?action=login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

### 6.3 测试上传（用上一步返回的 token）

```bash
curl -X POST https://sync.ruseo.cn/api/sync.php?action=upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 你的token" \
  -d '{"data":{"dials":[],"groups":[]},"version":0}'
```

### 6.4 测试下载

```bash
curl https://sync.ruseo.cn/api/sync.php?action=download \
  -H "Authorization: Bearer 你的token"
```

---

## 七、前端已就绪

代码已指向 `sync.ruseo.cn`，以上部署完成后前端即可使用。工具栏 ☁️ 按钮 → 登录 → 上传/下载。

---

## 八、后续：迁移到 cilacila.cn

备案通过后只需两步：

1. **服务器**：同一个 PHP 文件，改 Nginx server_name 为 `cilacila.cn`
2. **前端**：`sync.ts` 第 7 行 `API_BASE` 改为 `https://cilacila.cn/api/sync.php`，重新构建
