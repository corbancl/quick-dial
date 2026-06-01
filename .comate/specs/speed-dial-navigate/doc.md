# Speed Dial 极速导航 - 浏览器新标签页

## 一、项目概述

### 1.1 定位
极简无广告浏览器新标签页插件 / 网页应用，替代浏览器原生标签页和国内臃肿导航站。主打清爽、隐私、个性化。

### 1.2 核心模式
- **前端主体完全开源**（MIT 协议）
- **云同步功能作为付费点**（闭源）
- 单人 3~7 天可上线 MVP

### 1.3 部署形态
- 浏览器扩展（Chrome/Edge 等 Chromium 内核，打包为 .crx）
- 独立网页版（纯前端，可直接设为默认新标签页）

---

## 二、功能拆解

### 2.1 开源免费版功能

| 模块 | 功能点 | 说明 |
|------|--------|------|
| Speed Dial | 自定义图标/名称/链接 | 每个导航卡片可编辑 icon、title、url |
| Speed Dial | 拖拽排序 | 支持卡片间拖拽重排 |
| Speed Dial | 分组管理 | 创建/删除分组，卡片归属分组 |
| Speed Dial | 批量导入书签 | 解析浏览器导出的 HTML 书签文件 |
| Speed Dial | 导出导航配置 | 导出为 JSON 文件 |
| 搜索框 | 自定义搜索引擎 | 可选百度/谷歌/必应，可新增自定义引擎 |
| 时间组件 | 时钟/日期/星期 | 多种简约样式 |
| 最近访问 | 最近访问站点记录 | 本地存储，不上传云端 |
| 壁纸 | 内置壁纸 | 内置多张极简壁纸、纯色、渐变 |
| 壁纸 | 本地上传 | 支持上传本地图片作背景 |
| 外观 | 明暗模式 | 一键切换亮色/暗色主题 |
| 数据 | LocalStorage | 全部配置本地存储 |
| 适配 | 浏览器兼容 | 兼容 Chrome/Edge/360/百分等 |
| 适配 | 响应式布局 | 适配不同屏幕尺寸 |

### 2.2 付费增值功能（闭源）

| 模块 | 功能点 |
|------|--------|
| 云同步 | 跨设备导航布局、壁纸、配置一键同步 |
| 高级素材 | 高清壁纸、动态壁纸、图标包、主题模板 |
| 拓展组件 | 实时天气、待办清单、备忘录、名言短句、番茄钟 |
| 白标 | 去版权、自定义 LOGO、自定义域名 |
| 进阶 | 密码保护、分组加密、云端备份 |

---

## 三、技术架构

### 3.1 技术选型

| 层面 | 技术 | 原因 |
|------|------|------|
| 框架 | **Svelte 5** | 极轻量（打包约 3-5KB runtime），编译型，无虚拟 DOM |
| 构建 | Vite 6 | 快速冷启动、HMR、打包产物小 |
| 语言 | TypeScript | 类型安全，更好的开发体验 |
| 样式 | CSS + CSS Variables | 轻量无依赖，主题切换通过 CSS Variables 实现 |
| 本地存储 | LocalStorage | 简单高效，5MB 足够存储导航配置 |
| 图标 | SVG + 简单 icon 方案 | 无需依赖图标库 |
| 拖拽 | HTML5 Drag & Drop API | 零依赖实现拖拽排序 |
| 路由 | 无路由（单页） | 新标签页无需路由 |

### 3.2 项目结构

```
speed-dial-navigate/
├── public/                    # 静态资源
│   ├── manifest.json          # 浏览器扩展清单
│   └── icons/                 # 扩展图标
├── src/
│   ├── App.svelte             # 根组件
│   ├── main.ts                # 入口文件
│   ├── app.css                # 全局样式 + CSS 变量主题
│   ├── stores/                # Svelte stores（状态管理）
│   │   ├── dials.ts           # 导航数据 store
│   │   ├── theme.ts           # 主题配置 store
│   │   ├── wallpaper.ts       # 壁纸配置 store
│   │   └── settings.ts        # 全局设置 store
│   ├── components/
│   │   ├── SearchBox.svelte   # 搜索框
│   │   ├── ClockWidget.svelte # 时钟/日期组件
│   │   ├── SpeedDial.svelte   # 导航主容器
│   │   ├── DialCard.svelte    # 单个导航卡片
│   │   ├── DialGroup.svelte   # 导航分组
│   │   ├── AddDialModal.svelte# 添加/编辑导航弹窗
│   │   ├── GroupManage.svelte # 分组管理
│   │   ├── RecentSites.svelte # 最近访问
│   │   ├── WallpaperPicker.svelte # 壁纸选择器
│   │   ├── ImportExport.svelte# 导入导出
│   │   └── SettingsPanel.svelte# 设置面板
│   ├── utils/
│   │   ├── storage.ts         # LocalStorage 封装
│   │   ├── bookmark.ts        # 书签解析工具
│   │   ├── search.ts          # 搜索引擎配置
│   │   └── theme.ts           # 主题工具函数
│   └── types/
│       └── index.ts           # TypeScript 类型定义
├── index.html                 # 入口 HTML
├── package.json
├── tsconfig.json
├── vite.config.ts
├── svelte.config.js
└── README.md
```

### 3.3 数据流设计

```
用户操作 → Svelte 组件 → Store 更新 → LocalStorage 持久化
                                ↓
                          组件自动响应重绘
```

- **单向数据流**：用户操作触发 store 更新，store 自动同步到 LocalStorage，组件订阅 store 自动更新视图
- **LocalStorage 封装**：提供 `load(key)` 和 `save(key, data)` 方法，带 JSON 序列化/反序列化和错误处理
- **数据模型**：每个 dial 条目包含 `id, title, url, icon, groupId, sortOrder`

### 3.4 数据模型（TypeScript 类型）

```typescript
// 导航卡片
interface DialItem {
  id: string;          // 唯一 ID（nanoid/uuid）
  title: string;       // 显示名称
  url: string;         // 跳转链接
  icon: string;        // 图标 URL 或 emoji
  groupId: string;     // 所属分组 ID
  sortOrder: number;   // 排序序号
  createdAt: number;   // 创建时间戳
}

// 分组
interface DialGroup {
  id: string;
  name: string;
  sortOrder: number;
  isCollapsed?: boolean;  // 是否折叠
}

// 搜索引擎
interface SearchEngine {
  id: string;
  name: string;      // 显示名：Google、百度
  url: string;       // 搜索 URL，用 {keyword} 占位
  icon?: string;     // 可选图标
}

// 壁纸配置
interface WallpaperConfig {
  type: 'solid' | 'gradient' | 'image' | 'builtin';
  value: string;     // 颜色值 / 渐变值 / 图片 URL / 内置壁纸 ID
  blur?: number;     // 模糊程度
  brightness?: number; // 亮度
}

// 主题配置
interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  wallpaper: WallpaperConfig;
}

// 全局设置
interface AppSettings {
  searchEngine: string;   // 当前搜索引擎 ID
  clockStyle: 'digital' | 'analog' | 'minimal';
  showDate: boolean;
  showWeekday: boolean;
  showRecentSites: boolean;
  recentSitesCount: number;
  openInNewTab: boolean;  // 点击是否新标签页打开
}

// 根数据
interface AppData {
  version: number;
  dials: DialItem[];
  groups: DialGroup[];
  searchEngines: SearchEngine[];
  theme: ThemeConfig;
  settings: AppSettings;
  recentSites: { url: string; title: string; lastVisit: number }[];
}
```

---

## 四、组件详细设计

### 4.1 App.svelte（根组件）

**职责**：
- 组装所有子组件
- 监听主题变化，设置 `data-theme` 属性到根元素
- 监听壁纸变化，设置背景样式
- 从 LocalStorage 初始化所有 store

**处理逻辑**：
```
onMount → 从 LocalStorage 加载数据 → 初始化 Store → 渲染子组件
```

### 4.2 SearchBox.svelte（搜索框）

**功能**：
- 居中搜索输入框
- 回车或点击搜索按钮，跳转到当前搜索引擎
- 点击引擎图标可切换搜索引擎（下拉选择）
- 键盘快捷键：`Ctrl+K` 或 `/` 聚焦搜索框

**处理逻辑**：
```
用户输入 → 回车 → 替换 {keyword} → location.href = 搜索URL
```

### 4.3 SpeedDial.svelte（导航主容器）

**功能**：
- 网格布局展示所有分组和导航卡片
- 支持拖拽排序（卡片之间、跨组拖拽）
- 空状态提示（"点击 + 添加第一个导航"）

**拖拽实现**：
```
dragstart: 记录被拖拽卡片 ID 和源分组
dragover: 阻止默认，计算插入位置
drop: 更新 Store 中的 sortOrder
dragend: 清理状态
```

### 4.4 DialCard.svelte（导航卡片）

**功能**：
- 显示图标（优先显示网站 favicon，fallback 到首字母）
- 显示网站名称
- 点击跳转
- 右键菜单（编辑、删除、复制）
- 拖拽手柄

**图标加载策略**：
```
icon 字段有值 → 显示 icon
无值 → 尝试 https://www.google.com/s2/favicons?domain=XXX
失败 → 显示 URL 首字母大写
```

### 4.5 DialGroup.svelte（分组）

**功能**：
- 显示分组名称
- 折叠/展开分组内容
- 分组级别的拖拽放置区
- 「添加到本组」按钮

### 4.6 AddDialModal.svelte（添加编辑弹窗）

**功能**：
- 模态弹窗，支持添加和编辑两种模式
- 表单字段：名称、链接、图标、所属分组
- 自动抓取网站图标（输入 URL 后自动填充 icon 字段）
- 表单验证（必填项检查）

### 4.7 GroupManage.svelte（分组管理）

**功能**：
- 弹窗形式展示所有分组
- 新增分组、重命名、删除（删除时确认是否同时删除组内卡片）
- 拖拽调整分组顺序

### 4.8 ClockWidget.svelte（时钟组件）

**功能**：
- 实时时钟（每秒更新）
- 日期显示
- 星期显示
- 多种样式：数字时钟 / 极简

**实现**：
```
setInterval(1000) → new Date() → 格式化显示
```

### 4.9 RecentSites.svelte（最近访问）

**功能**：
- 显示最近访问的网站列表
- 限制数量（可配置）
- 点击直接跳转
- 可清空历史

**记录策略**：
```
window.addEventListener('beforeunload') 或
拦截 DialCard 点击事件 → 记录到 recentSites store
去重、按时间排序、限制数量
```

### 4.10 WallpaperPicker.svelte（壁纸选择器）

**功能**：
- 标签页切换：内置壁纸 / 纯色 / 渐变 / 本地上传
- 内置壁纸网格展示（带预览缩略图）
- 纯色选择器（预设颜色 + 自定义取色器）
- 渐变选择器（预设渐变组合）
- 本地上传（FileReader → base64 → 存入 LocalStorage）

**壁纸数据存储**：
- 内置壁纸：存 ID，URL 为项目内路径
- 本地上传：存 base64 数据（注意大小限制 5MB，超出则提示）
- 纯色/渐变：存 CSS 值

### 4.11 ImportExport.svelte（导入导出）

**功能**：
- **导出**：将 AppData 序列化为 JSON，触发下载
- **导入**：解析 JSON 文件，校验数据版本，覆盖当前数据
- **书签导入**：解析浏览器书签 HTML，提取 URL 和标题，批量创建 DialItem

**书签解析**：
```
读取 HTML 文件 → 正则 / DOMParser 提取 <a> 标签
→ 读取 href 和 textContent → 批量创建 DialItem（存入 default 分组）
```

### 4.12 SettingsPanel.svelte（设置面板）

**功能**：
- 搜索引擎选择
- 时钟样式切换
- 日期/星期显示开关
- 最近访问开关
- 新标签页打开开关
- 主题色自定义
- 关于信息

---

## 五、浏览器扩展集成

### 5.1 manifest.json
```json
{
  "manifest_version": 3,
  "name": "Speed Dial 极速导航",
  "version": "1.0.0",
  "description": "极简无广告浏览器新标签页",
  "chrome_url_overrides": {
    "newtab": "index.html"
  },
  "permissions": ["storage", "bookmarks"],
  "host_permissions": ["<all_urls>"],
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### 5.2 浏览器书签读取（仅扩展版本）
```
chrome.bookmarks.getTree() → 递归遍历 → 提取 URL 和标题
→ 用户选择导入哪些 → 批量创建 DialItem
```

---

## 六、付费功能架构（闭源，仅设计参考）

### 6.1 云同步
```
客户端（LocalStorage） → 手动 / 自动触发同步 → REST API
                            ↕
                  Node.js + Express + SQLite
                            ↕
                      JWT 鉴权 / 账号体系
```

### 6.2 拓展组件
```
每个组件独立挂载：组件插槽 / 动态组件加载
- WeatherWidget: 调用免费天气 API（如和风天气免费版）
- TodoWidget: 本地存储待办列表
- NotesWidget: 纯文本笔记
- QuoteWidget: 名言短句（内置库 + API 刷新）
- PomodoroWidget: 番茄钟倒计时
```

---

## 七、边界条件与异常处理

| 场景 | 处理方式 |
|------|----------|
| LocalStorage 数据损坏 | JSON 解析失败时，重置为默认配置，控制台警告 |
| LocalStorage 空间满 | 捕获 QUOTA_EXCEED_ERR，提示用户清理数据 |
| 浏览器不支持 LocalStorage | 检查 navigator.cookieEnabled，提示用户启用 |
| 上传图片过大 | 限制文件大小 <= 2MB，超出提示压缩后上传 |
| 导入 JSON 格式错误 | 校验数据结构，出错时回滚并提示 |
| 网络图标加载失败 | 显示 fallback（首字母 + 背景色） |
| 大量导航数据（>100 条） | 虚拟滚动 / 分页加载（暂不实现，后续优化） |
| 多标签页同步 | 监听 storage 事件，多标签页间自动同步数据变更 |

---

## 八、影响文件清单

| 文件路径 | 操作 | 职责 |
|----------|------|------|
| `m:\new\package.json` | 创建 | 项目依赖与脚本 |
| `m:\new\tsconfig.json` | 创建 | TypeScript 配置 |
| `m:\new\vite.config.ts` | 创建 | Vite 构建配置 |
| `m:\new\svelte.config.js` | 创建 | Svelte 编译配置 |
| `m:\new\index.html` | 创建 | 入口页面 |
| `m:\new\src\main.ts` | 创建 | 应用入口 |
| `m:\new\src\app.css` | 创建 | 全局样式与主题变量 |
| `m:\new\src\App.svelte` | 创建 | 根组件 |
| `m:\new\src\types\index.ts` | 创建 | 类型定义 |
| `m:\new\src\utils\storage.ts` | 创建 | LocalStorage 封装 |
| `m:\new\src\utils\bookmark.ts` | 创建 | 书签解析 |
| `m:\new\src\utils\search.ts` | 创建 | 搜索引擎 |
| `m:\new\src\utils\theme.ts` | 创建 | 主题工具 |
| `m:\new\src\stores\dials.ts` | 创建 | 导航数据 store |
| `m:\new\src\stores\theme.ts` | 创建 | 主题 store |
| `m:\new\src\stores\wallpaper.ts` | 创建 | 壁纸 store |
| `m:\new\src\stores\settings.ts` | 创建 | 设置 store |
| `m:\new\src\stores\recentSites.ts` | 创建 | 最近访问 store |
| `m:\new\src\components\SearchBox.svelte` | 创建 | 搜索框 |
| `m:\new\src\components\ClockWidget.svelte` | 创建 | 时钟 |
| `m:\new\src\components\SpeedDial.svelte` | 创建 | 导航容器 |
| `m:\new\src\components\DialCard.svelte` | 创建 | 导航卡片 |
| `m:\new\src\components\DialGroup.svelte` | 创建 | 分组 |
| `m:\new\src\components\AddDialModal.svelte` | 创建 | 添加编辑 |
| `m:\new\src\components\GroupManage.svelte` | 创建 | 分组管理 |
| `m:\new\src\components\RecentSites.svelte` | 创建 | 最近访问 |
| `m:\new\src\components\WallpaperPicker.svelte` | 创建 | 壁纸选择 |
| `m:\new\src\components\ImportExport.svelte` | 创建 | 导入导出 |
| `m:\new\src\components\SettingsPanel.svelte` | 创建 | 设置面板 |

---

## 九、预期成果

1. 一个可直接运行的浏览器新标签页应用（网页版 + 浏览器扩展）
2. 完整覆盖开源免费版全部功能
3. MIT 开源协议，干净的代码结构
4. 响应式布局，兼容主流 Chromium 浏览器
5. 零外部运行时依赖，打包体积控制在 50KB 以内
6. 付费功能预留清晰的扩展接口和架构