# 呲啦起始页软件V1.0 — 软件说明书

> 计算机软件著作权登记申请材料 · 申请人：个人 · 日期：2026年6月

---

## 一、软件基本信息

| 项目 | 内容 |
|------|------|
| 软件全称 | 呲啦起始页软件 |
| 软件简称 | Quick Dial（呲啦起始页） |
| 版本号 | V1.0 |
| 开发完成日期 | 2026年5月 |
| 首次发表日期 | 2026年5月（Gitee 开源 + cilacila.cn 上线） |
| 软件分类 | 浏览器应用软件 |
| 开发方式 | 独立开发 |
| 开发语言 | TypeScript, CSS, HTML |
| 代码行数 | 约 8000 行 |

---

## 二、运行环境

### 硬件要求

| 项目 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 1GHz 双核 | 2GHz 四核 |
| 内存 | 2GB | 4GB+ |
| 硬盘 | 100MB 可用空间 | 200MB+ |
| 显示器 | 1024×768 | 1920×1080 |

### 软件要求

| 项目 | 要求 |
|------|------|
| 操作系统 | Windows 7+ / macOS 10.13+ / Linux |
| 浏览器 | Chrome 88+ / Edge 88+ / Brave / Arc / 其他 Chromium 内核浏览器 |
| 网络 | 正常运行需互联网连接（搜索、天气功能） |

### 开发环境

| 技术 | 版本 |
|------|------|
| Node.js | 18+ |
| 框架 | Svelte 5 |
| 构建工具 | Vite 6 |
| 语言 | TypeScript 5+ |

---

## 三、软件概述

**呲啦起始页（Quick Dial）** 是一款浏览器新标签页扩展软件，用于替换 Chrome、Edge 等浏览器的默认新标签页。软件聚焦"极简、快速、无广告"三大核心体验，为用户提供干净的浏览起始界面。

与传统浏览器起始页或导航网站不同，本软件强调**本地存储**和**隐私保护**：所有用户数据（导航书签、壁纸设置、使用偏好）均加密存储在用户本地浏览器中，不上传至服务器、不追踪用户行为、不展示第三方广告。

### 软件定位

- 替代 Chrome 默认新标签页（消除广告和推广链接）
- 提供快捷导航（自定义网站卡片、分组管理、拖拽排序）
- 集成多引擎搜索（Google、百度、Bing、知乎、B站等 12 种）
- 内置天气、农历、时钟等实用信息组件
- 12 种精美渐变壁纸，自适应明暗文字

### 用户群体

面向所有 Chromium 浏览器用户，特别适合：
- 对浏览器新标签页广告感到困扰的普通用户
- 需要高效导航的办公人士
- 注重隐私、不希望数据被追踪的用户
- 喜欢自定义和极简设计的用户

---

## 四、主要功能模块

### 4.1 多引擎搜索

用户可在搜索框输入关键词，选择 Google、百度、Bing、知乎、Bilibili、GitHub 等 12 种搜索引擎进行搜索。支持 `Ctrl+K` 快捷键聚焦搜索框，输入即搜。

### 4.2 快捷导航（Speed Dial）

- **导航卡片**：自定义网站名称、URL 和图标
- **图标系统**：70+ emoji + FontAwesome 专业图标库
- **拖拽排序**：鼠标拖拽调整卡片位置
- **分组管理**：支持创建、编辑、重命名、删除分组
- **智能识别**：粘贴网址自动识别网站名称和图标

### 4.3 壁纸系统

- 12 种预设渐变壁纸（深海、极光、竹青、日落、樱花、暮紫、墨灰、薄荷、赤霞、夜空、冰岛、琥珀）
- 支持自定义上传图片或输入图片 URL
- 自适应深浅文字颜色，确保壁纸上的文字始终可读
- 支持随机壁纸功能

### 4.4 天气与农历

- 实时天气（温度、湿度、风力、天气预报）
- 农历日期、节气显示
- 支持按城市查询

### 4.5 时钟组件

6 种时钟样式可选：数字、极简、经典、翻页、霓虹、二进制。

### 4.6 访问统计

- 导航点击计数
- 最常访问排行（Top 10）
- 支持导出 CSV 数据

### 4.7 导入导出

- 数据备份：导出为 JSON 文件
- 数据恢复：导入 JSON 备份
- 浏览器书签导入：自动解析 Chrome/Firefox 书签 HTML，按文件夹自动分组

### 4.8 云同步

用户可将导航数据加密同步至云端，实现跨设备数据互通。同步采用 HTTPS 加密传输，用户手动触发。

### 4.9 设置中心

- 外观主题切换
- 搜索引擎选择
- 语言切换（中文 / English）
- 显示选项（日期、星期、农历、天气、最近访问）
- 新标签页打开方式
- 自定义 CSS、自定义底部版权文字

---

## 五、技术架构

### 5.1 整体架构

```
┌──────────────────────────────────────┐
│         浏览器新标签页 (UI)            │
│  Svelte 5 组件系统 + 响应式状态管理    │
├──────────────────────────────────────┤
│  渲染引擎    │  数据层    │  工具层     │
│  Svelte 5   │ LocalStorage │ Weather │
│  TypeScript  │ 智能分片    │ Search  │
│  CSS Variables│ (>1MB数据) │ Bookmark│
│             │            │ Keyboard│
├──────────────────────────────────────┤
│         扩展 API (Chrome)             │
│  manifest.json · 新标签页覆盖         │
├──────────────────────────────────────┤
│       云端接口 (HTTPS API)            │
│  PHP + MySQL · 同步/账户管理           │
└──────────────────────────────────────┘
```

### 5.2 前端架构

- **框架**：Svelte 5（细粒度响应式，编译时优化，零运行时开销）
- **语言**：TypeScript（类型安全）
- **构建**：Vite 6（秒级热更新）
- **状态管理**：Svelte 原生 runes（无需第三方库）
- **样式**：CSS Variables 主题系统 + 组件级作用域
- **存储**：LocalStorage 智能分片（单键超 1MB 自动分片）

### 5.3 组件结构（19 个组件）

| 组件 | 文件 | 功能 |
|------|------|------|
| App | App.svelte | 根组件，全局布局 |
| SearchBox | SearchBox.svelte | 搜索框 + 引擎选择 |
| ClockWidget | ClockWidget.svelte | 时钟显示 |
| WeatherWidget | WeatherWidget.svelte | 天气卡片 |
| LunarWidget | LunarWidget.svelte | 农历卡片 |
| SpeedDial | SpeedDial.svelte | 导航主容器 |
| DialCard | DialCard.svelte | 单个导航卡片 |
| DialGroup | DialGroup.svelte | 分组容器 |
| AddDialModal | AddDialModal.svelte | 添加/编辑导航弹窗 |
| IconPicker | IconPicker.svelte | 图标选择器 |
| GroupManage | GroupManage.svelte | 分组管理 |
| RecentSites | RecentSites.svelte | 最近访问 |
| WallpaperPicker | WallpaperPicker.svelte | 壁纸选择器 |
| ImportExport | ImportExport.svelte | 导入导出 |
| SettingsPanel | SettingsPanel.svelte | 设置面板 |
| StatisticsPanel | StatisticsPanel.svelte | 访问统计 |
| HelpPanel | HelpPanel.svelte | 快捷键帮助 |
| OnboardingGuide | OnboardingGuide.svelte | 新用户引导 |
| SyncPanel | SyncPanel.svelte | 云同步面板 |

### 5.4 工具模块（11 个）

| 模块 | 文件 | 功能 |
|------|------|------|
| storage | storage.ts | localStorage 封装 + 智能分片 + 数据校验 |
| search | search.ts | 12 种搜索引擎管理 + 自定义引擎支持 |
| theme | theme.ts | 壁纸管理 + 自适应文字颜色算法 |
| keyboard | keyboard.ts | 全局键盘快捷键 |
| weather | weather.ts | 天气/农历数据获取 |
| bookmark | bookmark.ts | 浏览器书签 HTML 解析（Netscape 格式） |
| sync | sync.ts | 云同步 API |
| i18n | i18n.svelte.ts | 中英双语切换 |
| contextMenu | contextMenu.ts | 右键菜单 |
| toast | toast.svelte.ts | 轻量级通知提示 |

### 5.5 数据存储设计

- **存储介质**：浏览器 LocalStorage
- **存储内容**：导航数据、分组配置、搜索偏好、主题设置、壁纸选择、最近访问记录、点击统计
- **存储优化**：智能分片机制，数据量超过 1MB 时自动分割为多段存储，避免 LocalStorage 5MB 限制
- **隐私设计**：所有数据默认本地存储，不主动上传至任何服务器

---

## 六、操作说明

### 6.1 安装

**方式一：应用商店（推荐）**
待上架 Chrome Web Store、Edge Add-ons。

**方式二：手动安装**
1. 从 Gitee 下载源码
2. 执行 `npm install` 和 `npm run build`
3. 打开 Chrome，地址栏输入 `chrome://extensions`
4. 开启"开发者模式"
5. 点击"加载已解压的扩展程序"，选择 `dist/` 目录
6. 打开新标签页即可使用

**方式三：在线使用**
直接访问 https://cilacila.cn，无需安装。

### 6.2 基本使用

1. 打开新标签页，看到起始页主界面
2. 点击右下角 **+** 按钮添加导航网站
3. 粘贴网址，自动识别名称和图标
4. 在搜索框输入关键词，选择搜索引擎进行搜索
5. 点击工具栏按钮切换壁纸、查看统计、设置等

### 6.3 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + K` | 聚焦搜索框 |
| `Ctrl + ,` | 打开设置面板 |
| `Ctrl + Shift + B` | 壁纸设置 |
| `?` | 快捷键帮助 |
| `Escape` | 关闭弹窗 |

---

## 七、软件特色与创新点

1. **极致轻量**：打包后仅 ~135KB（gzip ~45KB），无外部运行时依赖
2. **隐私优先**：全本地存储，零数据收集，零追踪分析，零广告投放
3. **智能存储分片**：自研 LocalStorage 分片算法，突破 5MB 限制
4. **自适应壁纸算法**：根据壁纸主色调自动计算最优文字颜色
5. **双语支持**：运行时中英文切换，无需刷新页面
6. **高质量源代码**：TypeScript 类型安全，组件化架构，模块解耦清晰
7. **跨平台兼容**：一套代码覆盖所有 Chromium 内核浏览器

---

## 八、版权声明

本软件由开发者（Gitee: corbancc）独立开发，采用 MIT 开源协议发布。软件中使用的第三方开源组件（Svelte、Vite、FontAwesome）均遵循其各自的开源协议。

---

*本文档为计算机软件著作权登记申请材料之软件说明书。*
