# Quick Dial · 呲啦起始页

> 极简无广告浏览器新标签页 — 开源免费版  
> Pro 增强功能：https://www.cilacila.cn

## 特性

- **快捷导航** — 自定义网站名称/链接/图标，70+ emoji + FontAwesome 选择器，拖拽排序
- **搜索框** — 6 种引擎（Google/百度/Bing/搜狗/360/知乎），Ctrl+K 聚焦
- **天气 & 农历** — 实时天气、农历日期、节气
- **时钟** — 6 种样式（数字/极简/经典/翻页/霓虹/二进制）
- **壁纸** — 12 种预设渐变 + 随机壁纸，自适应深浅文字
- **访问统计** — 点击计数 + 最常访问排行
- **导入导出** — JSON 备份/浏览器书签导入（按文件夹分组）
- **极致轻量** — ~135KB（gzip ~45KB）

## 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + K` | 聚焦搜索框 |
| `Ctrl + ,` | 打开设置 |
| `Ctrl + Shift + B` | 壁纸设置 |
| `?` | 快捷键帮助 |
| `Escape` | 关闭弹窗 |

## 快速开始

```bash
npm install
npm run dev      # 开发模式
npm run build    # 构建 → dist/
```

## 安装为浏览器扩展

1. `npm run build`
2. Chrome → `chrome://extensions` → 开发者模式
3. 加载已解压的扩展程序 → 选择 `dist/` 目录

或解压 `quick-dial-extension.zip` 直接加载。

## 技术栈

| 技术 | 用途 |
|------|------|
| Svelte 5 | 前端框架（runes 响应式） |
| TypeScript | 类型安全 |
| Vite 6 | 构建工具 |
| CSS Variables | 主题系统 |
| LocalStorage | 本地存储 + 智能分片 |
| FontAwesome 6 | 图标库 |

## 项目结构

```
quick-dial/
├── src/
│   ├── App.svelte             # 根组件
│   ├── app.css                # 全局样式 + 主题变量
│   ├── types/index.ts         # 类型定义 + 常量
│   ├── utils/
│   │   ├── storage.ts         # localStorage 封装 + 智能分片
│   │   ├── search.ts          # 搜索引擎管理
│   │   ├── theme.ts           # 主题/壁纸/自适应文字颜色
│   │   ├── keyboard.ts        # 键盘快捷键
│   │   ├── toast.svelte.ts    # Toast 通知
│   │   ├── weather.ts         # 天气/农历/壁纸 API
│   │   └── bookmark.ts        # 书签 HTML 解析
│   ├── stores/
│   │   ├── dials.svelte.ts    # 导航数据
│   │   ├── theme.svelte.ts    # 主题
│   │   ├── settings.svelte.ts # 设置
│   │   ├── subscription.svelte.ts # Pro 订阅状态
│   │   └── recentSites.svelte.ts  # 最近访问 + 点击计数
│   └── components/
│       ├── SearchBox.svelte       # 搜索框 + 引擎选择
│       ├── ClockWidget.svelte     # 时钟
│       ├── WeatherWidget.svelte   # 天气卡片
│       ├── LunarWidget.svelte     # 农历卡片
│       ├── SpeedDial.svelte       # 导航主容器
│       ├── DialCard.svelte        # 导航卡片
│       ├── DialGroup.svelte       # 分组容器
│       ├── AddDialModal.svelte    # 添加/编辑弹窗
│       ├── IconPicker.svelte      # 图标选择器
│       ├── GroupManage.svelte     # 分组管理
│       ├── RecentSites.svelte     # 最近访问
│       ├── WallpaperPicker.svelte # 壁纸选择器
│       ├── ImportExport.svelte    # 导入导出
│       ├── SettingsPanel.svelte   # 设置面板
│       ├── StatisticsPanel.svelte # 访问统计
│       ├── HelpPanel.svelte       # 快捷键帮助
│       └── OnboardingGuide.svelte # 新用户引导
├── public/
│   ├── manifest.json          # Chrome 扩展清单
│   ├── manifest-edge.json     # Edge 扩展清单
│   └── pwa-manifest.json      # PWA 清单
├── docs/                      # 部署指南
├── website/                   # （闭源）官网
├── api/                       # （闭源）Pro 后端
└── package.json
```

## 闭源说明

本项目采用**开放核心**模式：

| 开源（MIT） | 闭源 |
|------------|------|
| 前端全部组件和逻辑 | Pro 后端 API（同步/支付/账户） |
| 扩展清单和配置 | 官网和商业化页面 |
| 文档和部署指南 | 业务计划和定价 |

欢迎 Fork、Star、提 Issue。Pro 功能请访问 [cilacila.cn](https://www.cilacila.cn)。

## 开源协议

MIT License
