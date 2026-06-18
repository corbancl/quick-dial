# Quick Dial 飞牛NAS应用 - 设计方案

## 一、现状梳理

Quick Dial 目前有 **两个交付形态**：

| 形态 | 技术 | 分发方式 | 更新机制 |
|------|------|---------|---------|
| **Web 端** | Svelte 5 + Vite，构建为纯静态文件 | 部署到 `cilacila.cn`（Nginx） | 直接覆盖文件 |
| **扩展端** | 同上 + Manifest V3 | Chrome/Edge/Firefox 商店 | 商店审核更新 |

两者共享同一份 `src/` 源码，`npm run build` → `dist/`，然后 Web 端直接部署 dist，扩展端从 dist 打包为各浏览器 ZIP/CRX。

---

## 二、目标：新增飞牛NAS应用，三者同步更新

新增第三个交付形态：**飞牛NAS应用（.fpk 包）**。

### 核心要求
- 与 Web 端、扩展端共享同一代码库
- 一次构建，三端同时产出
- 飞牛NAS应用具备与 Web 端同等的功能（搜索、导航、天气、AI 对话、Pro 同步等）

---

## 三、技术选型：Docker 应用

### 为什么选 Docker 应用而不是 Native 应用？

| 对比 | Native 应用 | Docker 应用 |
|------|-----------|------------|
| 需要后端服务 | 需要自己写 HTTP 服务 | Nginx 即可 |
| 静态文件托管 | 需要额外进程 | docker-compose 一行配置 |
| 镜像大小 | N/A | nginx:alpine ~5MB + 静态文件 ~150KB |
| 维护成本 | 高（需维护 HTTP 服务进程） | 低（Nginx 是成熟方案） |
| Quick Dial 的适配难度 | 需要重写服务端 | **零改动，直接用 dist/** |

**结论：用 Docker 应用类型，nginx:alpine 托管静态文件。**

---

## 四、飞牛应用包结构

```
fnos/
├── manifest                        # 应用元信息
├── ICON.PNG                        # 64×64 图标
├── ICON_256.PNG                    # 256×256 图标
├── LICENSE                         # MIT
│
├── app/
│   ├── docker/
│   │   └── docker-compose.yaml     # Nginx + 静态文件挂载
│   └── ui/                         # ← 构建时从 dist/ 复制
│       ├── index.html
│       ├── assets/
│       ├── fontawesome/
│       ├── icons/
│       ├── version.json            # 版本信息（用于更新检测）
│       └── ...
│
├── cmd/
│   └── main                        # 容器启停脚本
│
├── config/
│   ├── privilege                   # 权限配置
│   └── resource                    # 资源配置（docker-project）
│
└── wizard/
    └── install                     # 安装向导（端口配置）
```

### 关键设计决策

**1. 静态文件放在 app/ui/ 中，而不是推 Docker 镜像**

原因：
- Quick Dial 的 dist/ 只有 ~200KB，直接打包进 fpk 毫无压力
- 不需要额外维护 Docker registry
- 飞牛用户安装 fpk 即可使用，无需拉取外网镜像
- `nginx:alpine` 是官方镜像，飞牛NAS会自动缓存

**变通方案**（如果需要更好的更新体验）：也可以推一个 Docker 镜像到 Docker Hub/GitHub Container Registry，docker-compose 直接 `image: corbancc/quick-dial:latest`，用户在飞牛中用 Watchtower 自动更新。两种方式都支持，下面主要讨论 fpk 内嵌静态文件的方案。

**2. 版本更新检测**

在 `app/ui/version.json` 中写入版本号，应用启动时 fetch `https://cilacila.cn/version.json` 对比。如有新版本，在页面底部显示更新提示，引导用户去 GitHub Releases 下载最新 fpk。

---

## 五、docker-compose.yaml

```yaml
services:
  quick-dial:
    image: nginx:alpine
    container_name: quick-dial
    volumes:
      - ${TRIM_APPDEST}/ui:/usr/share/nginx/html:ro
      - ${TRIM_APPDEST}/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    ports:
      - "${TRIM_SERVICE_PORT}:80"
    restart: unless-stopped
    environment:
      - TZ=Asia/Shanghai
```

额外需要一个 `app/nginx.conf`（也可直接在 docker-compose 中用 `command` 注入）：

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip
    gzip on;
    gzip_types text/html text/css application/javascript application/json image/svg+xml;
}
```

> **注意**：Quick Dial 并非 SPA，但 index.html 中 `<script type="module" src="/src/main.ts">` 在构建后会被 Vite 转换为带 hash 的 JS 文件引用，try_files 确保路由回退。

---

## 六、cmd/main 脚本

```bash
#!/bin/bash
set -e

PROJECT_DIR="${TRIM_APPDEST}/docker"
COMPOSE_FILE="${PROJECT_DIR}/docker-compose.yaml"

case $1 in
start)
    docker compose -f "$COMPOSE_FILE" up -d
    exit 0
    ;;
stop)
    docker compose -f "$COMPOSE_FILE" down
    exit 0
    ;;
status)
    if docker compose -f "$COMPOSE_FILE" ps --status running | grep -q "Up"; then
        exit 0
    else
        exit 3
    fi
    ;;
*)
    exit 1
    ;;
esac
```

---

## 七、config 配置

### config/privilege

```json
{
    "defaults": {
        "run-as": "package"
    },
    "username": "quickdial",
    "groupname": "quickdial"
}
```

### config/resource

```json
{
    "docker-project": {
        "projects": [
            {
                "name": "quick-dial",
                "path": "docker"
            }
        ]
    }
}
```

---

## 八、wizard/install 安装向导

```json
[
    {
        "stepTitle": "欢迎使用 Quick Dial",
        "items": [
            {
                "type": "tips",
                "helpText": "Quick Dial 是一款极简无广告的浏览器起始页，安装后即可使用。"
            },
            {
                "type": "tips",
                "helpText": "默认端口 <strong>9527</strong>，安装后通过 <strong>http://你的NAS:9527</strong> 访问。"
            },
            {
                "type": "tips",
                "helpText": "如需修改端口，安装后到应用设置中编辑 docker-compose.yaml。"
            }
        ]
    }
]
```

---

## 九、manifest

```text
appname=quick-dial
version=1.0.6
display_name=Quick Dial
desc="""<p><strong>呲啦起始页 - Quick Dial</strong></p>
<p>极简、无广告的浏览器新标签页替代品。内置快捷导航、多引擎搜索、天气、农历、精美壁纸、AI 助手、待办清单、便签等功能。</p>
<p>部署在飞牛NAS上，局域网内所有设备都能通过浏览器访问，配合浏览器扩展的"自定义新标签页URL"功能，实现全设备统一起始页。</p>
<p><strong>功能亮点：</strong></p>
<ul>
<li>🔍 12 种搜索引擎一键切换</li>
<li>📌 拖拽排序的快捷导航</li>
<li>🌤️ 实时天气 + 农历黄历</li>
<li>🖼️ 精美壁纸库</li>
<li>🤖 AI 对话助手</li>
<li>✅ 待办清单 + 便签</li>
<li>☁️ Pro 云同步（跨设备同步数据）</li>
</ul>
<p><strong>使用方法：</strong></p>
<ol>
<li>安装后访问 http://你的NAS:端口</li>
<li>在浏览器扩展中设置自定义新标签页URL为该地址</li>
<li>所有设备访问同一地址，配合 Pro 云同步实现数据统一</li>
</ol>
"""
platform=all
source=thirdparty
maintainer=corbancc
maintainer_url=https://github.com/corbancc/quick-dial
distributor=corbancc
distributor_url=https://www.cilacila.cn
os_min_version=0.9.0
ctl_stop=true
desktop_uidir=ui
desktop_applaunchname=quick-dial.APPLICATION
service_port=9527
checkport=false
```

---

## 十、构建流水线

### 本地构建（开发者）

```bash
# 1. 构建前端
npm run build          # → dist/

# 2. 构建飞牛应用包
npm run build:fnos     # 新命令，自动完成以下步骤
```

### build:fnos 脚本逻辑

```
1. 确保 dist/ 已存在
2. 复制 dist/* → fnos/app/ui/
3. 复制 nginx.conf → fnos/app/nginx.conf
4. 写入 version.json → fnos/app/ui/version.json
5. 替换 manifest 中的 version 字段
6. 执行 fnpack build fnos/ → quick-dial-v1.0.6.fpk
7. 输出到 build/quick-dial-fnos-v1.0.6.fpk
```

### CI/CD（GitHub Actions / Gitee CI）

每次打 tag 或发布 release 时自动：
1. `npm run build`
2. Web 端部署 → rsync 到服务器
3. 扩展端打包 → 生成各浏览器 ZIP/CRX
4. 飞牛端打包 → `npm run build:fnos` 生成 .fpk
5. 全部产物上传到 GitHub Releases

---

## 十一、三者同步更新机制

```
代码仓库 (src/)
     │
     │ npm run build
     ▼
  dist/ 构建产物
     │
     ├──► Web 端：rsync → cilacila.cn
     │        更新 version.json
     │
     ├──► 扩展端：打包 Chrome/Edge/Firefox ZIP
     │        上传到各商店 → 审核 → 用户自动更新
     │
     └──► 飞牛端：复制 dist/ 到 fnos/app/ui/
              fnpack build → .fpk
              发布到 GitHub Releases / 论坛
              → 用户手动下载安装（或应用内提示更新）
```

### 版本一致性

- `package.json` 中的 `version` 字段作为单一版本源
- Web 端 `version.json`、扩展 `manifest.json`、飞牛 `manifest` 中的版本号全部由此派生
- 构建脚本自动注入 `__VERSION__` 常量

### 飞牛端更新检测

飞牛应用内嵌的 `version.json`：
```json
{
  "version": "1.0.6",
  "buildDate": "2026-06-17",
  "checkUrl": "https://cilacila.cn/version.json",
  "downloadUrl": "https://github.com/corbancc/quick-dial/releases/latest"
}
```

App.svelte 中已有的组件可以扩展：在页面某处显示版本号，如果检测到远端版本 > 本地版本，显示"有新版本可用"提示（带下载链接）。

> 飞牛NAS应用不支持自动 OTA 更新，用户需要手动下载新 .fpk 并安装。应用内更新提示是当前最优的用户体验方案。

---

## 十二、需要新增/修改的文件清单

### 新增文件（均在 `fnos/` 目录下）

| 文件 | 说明 |
|------|------|
| `fnos/manifest` | 应用元信息 |
| `fnos/ICON.PNG` | 64×64 图标 |
| `fnos/ICON_256.PNG` | 256×256 图标 |
| `fnos/LICENSE` | MIT 许可证 |
| `fnos/app/nginx.conf` | Nginx 配置 |
| `fnos/app/docker/docker-compose.yaml` | 容器编排 |
| `fnos/cmd/main` | 启停脚本 |
| `fnos/config/privilege` | 权限配置 |
| `fnos/config/resource` | 资源配置 |
| `fnos/wizard/install` | 安装向导 |

### 需要修改的现有文件

| 文件 | 修改内容 |
|------|---------|
| `package.json` | 新增 `build:fnos` 和 `pack:all` 脚本 |
| `src/App.svelte` | 新增飞牛版本更新检测逻辑（可选） |
| `vite.config.ts` | 无需修改（base: './' 已兼容） |
| `pack-all.ps1` | 新增飞牛 fpk 打包步骤 |
| `docs/DEPLOY.md` | 新增飞牛NAS部署章节 |

---

## 十三、风险与注意事项

| 风险 | 应对 |
|------|------|
| CSP 策略限制 | 飞牛NAS应用中请求天气/同步 API 等外部服务，CSP header 已在 nginx.conf 中配置放宽 |
| Pro 云同步跨域 | 云同步 API (`sync.ruseo.cn`) 已有 CORS 配置，无需额外处理 |
| favicon 代理 | 飞牛NAS内网环境可能无法访问 `api.ruseo.cn` 的 favicon 代理，导航卡片图标可能加载失败。可改为前端直接获取或使用默认图标 |
| 百度统计 | 内网环境百度统计无意义，可通过检测 `location.hostname` 动态禁用 |
| 飞牛 App Center 更新机制 | 目前不支持自动更新，依赖用户手动操作。如果飞牛后续开放自动更新 API，可以接入 |
| fnpack 工具 | 需在 Windows 开发机上安装 fnpack，或使用 Docker 构建 |

---

## 十四、后续可优化项

1. **Watchtower 自动更新**：如果推 Docker 镜像到 registry，用户配置 Watchtower 即可自动更新
2. **飞牛应用商店上架**：申请上架到飞牛官方应用商店，获得更多分发
3. **飞牛 CGI 集成**：利用飞牛统一网关，实现免端口访问（`https://nas地址/r/quick-dial/`）
4. **PWA 离线缓存**：利用 Service Worker 实现离线可用
5. **多架构支持**：虽然应用本身是静态文件无架构依赖，但 nginx:alpine 镜像需要 `platform=all`

---

*文档版本：v1.0 | 日期：2026-06-17 | 状态：待审核*
