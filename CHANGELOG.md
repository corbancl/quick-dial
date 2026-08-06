# 更新日志 / Changelog

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。所有发版均通过 `scripts/release.cjs` 一键四端同步，并生成出包 sha256 校验。

---

## v1.0.15（2026-08-06）

> Emlog 插件标题修复 + 管理后台图标修复 + 飞牛端启动配置修复 + 四端出包按官网命名重传

### 🐞 修复

- **Emlog 插件标题不再误显版本号**：修复插件头注释裸 `\r` 行尾，使 `Plugin Name` 与 `Version` 正确分两行，emlog 后台插件列表标题列只显示名称、版本归独立列。
- **管理后台「管理员」菜单图标显示异常**：原 `🧑‍💼` 为 ZWJ 组合序列，在缺对应字体的环境下裂成两个图标，改为单码位 `🔑`。
- **飞牛 NAS 端启动配置缺失**：还原 `app/ui/config` 真实 JSON 启动配置（含 `quick-dial.APPLICATION` 应用定义），`fnpack build` 不再报 `Required file "app/ui/config" is missing`。
- **平台标识注入修复**：飞牛端 / 插件端正确注入 `__QD_PLATFORM`，云同步端来源（Web / 扩展 / 插件 / 飞牛）识别准确。

### 🛠 工程化

- fnos 打包脚本修复：`fnos_download.py` 改为动态读取 `package.json` 版本（避免产物文件名滞后）；`fnos_pack.py` 上传前清理远端 `/tmp/quickdial-build` 残留。
- 四端 smoke 校验增强：新增平台标识 `__QD_PLATFORM` 检查、飞牛端 `config` 必须为合法 JSON 文件检查。
- `release.cjs` 四端同步 `syncEndpoint` keep 机制修复：飞牛端 `config` / `images` 不再被清空。

### 📦 发布物（v1.0.15）

| 端 | 产物 |
|---|---|
| Web 端 | `https://cilacila.cn`（dist/ 全量） |
| 官网 | `https://www.cilacila.cn` |
| 浏览器扩展 | `quickdial-chrome-v1.0.15.zip` / `quickdial-edge-v1.0.15.zip` / `quickdial-chromium-v1.0.15.zip`（通用离线）/ `quickdial-v1.0.15.crx`；Firefox 走 AMO 外链仅出包 `quick-dial-v1.0.15-firefox.zip` |
| Emlog 插件 | `quickdial-emlog-v1.0.15.zip` |
| 飞牛 NAS | `quick-dial_v1.0.15_fnos.fpk` |

---

## v1.0.13（2026-07-29）

> 云同步全面开放 + 同步记录（管理后台）+ 标题修复 + 移除 WebDAV 自托管

### ✨ 新功能

- **云同步全面开放**
  - 普通用户登录后即可**手动上传/下载**书签与导航（此前仅 Pro 可见），多设备无缝衔接。
  - Pro 用户额外支持**自动同步**：同步面板新增开关，开启后后台静默上传、多设备实时合并（带数据指纹去重，无变化不刷版本）；上传遇版本冲突（409）自动拉取云端合并。
  - 统一 `applyRemoteData`（`src/utils/sync.ts`）；前端 `detectPlatform()` 识别端来源（Web / 扩展 / 插件 / 飞牛）。
- **同步记录（管理后台 `api/admin.php`）**
  - 新增「同步记录」页，**30 条/页**分页，展示用户 / 类型（上传·下载）/ 来源（手动·自动）/ 版本 / 大小 / 时间。
  - 新增「端」与「IP」两列：端区分 Web 端 / 扩展端 / 插件端 / 飞牛端；IP 取客户端地址。后端 `api/sync.php` 写 `qd_sync_log` 日志表（幂等建表）。
- **Pro 扩容（纯前端能力）**
  - Pro 搜索历史：SearchBox 记录最近搜索，点击回填。
  - Pro 高级动效开关：SettingsPanel 新增「高级动效」，开启后 `<body>` 加 `pro-motion` 类，启用克制的微交互（卡片浮起、按钮按压、时钟淡入）。
- **帮助中心（官网）**
  - 新增 `help.html` / `en-help.html`：整合快速上手 / 使用指南 / 数据同步 / Pro 介绍 / FAQ。
  - 官网 `index.html` / `en.html` 导航与页脚加入口，`lang.js` 补语言切换映射。

### 🛠 工程化（P0）

- **版本号单源**：以 `public/version.json` 为唯一真相源，`scripts/sync-version.cjs` 自动同步 16 个 manifest + `package.json` + fnos manifest + `quickdial.php`（根治飞牛端版本滞后）。
- **一键四端 release**：`scripts/release.cjs` 串联 build → 同步插件端/飞牛端 → crx 打包 →（门控）飞牛 fnpack + 官网 FTP → 出包 sha256 校验。
- **出包校验**：本地 sha256 计算 + 线上 curl 比对闭环。

### 🐞 修复

- 飞牛端 `fnos/app/ui` 整目录同步现保留 `config` 与 `images/`（此前整目录清空会导致 `fnpack build` 缺 `app/ui/config` 而失败）。
- `version.json` 的 `downloadUrl` 与 `platforms.fnos` 升级指向 **v1.0.13**。
- 修复 Pro 高级动效 CSS 初版多写一个 `}` 导致构建失败的问题。
- **修复标签页标题偶发只显示域名**：云同步下载后 `document.title` 被空标题覆盖，现改为回退默认标题（`getDefaultTitle()`）。
- 移除 WebDAV 自托管同步（普通用户使用门槛高、稳定性差），同步入口统一为云端同步。

### 📦 发布物（v1.0.13）

| 端 | 产物 |
|---|---|
| Web 端 | `https://cilacila.cn`（dist/ 全量） |
| 官网 | `https://www.cilacila.cn` |
| 浏览器扩展 | `quickdial-{chrome,chromium,edge,firefox}-v1.0.13.zip` + `quickdial-v1.0.13.crx` |
| Emlog 插件 | `quickdial-emlog-v1.0.13.zip` |
| 飞牛 NAS | `quick-dial_v1.0.13_fnos.fpk` |

---

## v1.0.12（2026-07-22）

- 四端源码副本同步机制建立，版本号统一。
- 官网账户页、隐私页、联系页、版权页多语言完善。
- 旧版发布物清理规则确立（仅保留最新 crx/fpk）。

---

## v1.0.10（2026-07-xx）

- 初始公开发版工程化探索，`scripts/upload-*.cjs` 系列部署脚本落地。
