# Quick Dial - 呲啦起始页

> 极简无广告浏览器新标签页 — 快速导航、多引擎搜索、天气农历、深色主题  
> 官网：https://www.cilacila.cn · 在线使用：https://cilacila.cn

## 特性

- **快捷导航** — 自定义网站名称/链接/图标，内置 70+ emoji + FontAwesome 图标选择器，拖拽排序，分组管理
- **搜索框** — 免费 6 种引擎（Google/百度/Bing/搜狗/360/知乎），Pro 解锁 12 种 + 自定义
- **天气 & 农历** — 实时天气预报、农历日期、节气，展开卡片查看详情
- **时钟** — 实时时钟，6 种样式（数字/极简/经典/翻页/霓虹/二进制）
- **壁纸系统** — 12 种预设渐变 + 随机壁纸，Pro 解锁上传/URL自定义
- **云同步** — Pro 用户支持跨设备数据同步（手动上传下载）
- **访问统计** — 点击计数 + 最常访问排行
- **自定义 CSS** — Pro 用户注入自定义样式
- **导入导出** — JSON 配置备份/恢复，支持导入浏览器书签 HTML
- **极致轻量** — 打包体积 ~135KB（gzip ~45KB）

## 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + K` | 聚焦搜索框 |
| `Ctrl + ,` | 打开设置 |
| `Ctrl + Shift + B` | 壁纸设置 |
| `Ctrl + Shift + S` | 云同步 |
| `?` | 快捷键帮助 |
| `Escape` | 关闭弹窗 |

## 快速开始

```bash
npm install
npm run dev      # 开发模式
npm run build    # 构建 → dist/
```

## 浏览器扩展

1. `npm run build`
2. Chrome → `chrome://extensions` → 开发者模式
3. 加载已解压的扩展程序 → 选择 `dist/` 目录

## 技术栈

| 技术 | 用途 |
|------|------|
| Svelte 5 | 前端框架（runes 响应式） |
| TypeScript | 类型安全 |
| Vite 6 | 构建工具 |
| CSS Variables | 主题系统 |
| LocalStorage | 本地存储 + 智能分片 |
| PHP 8 + MySQL | 云同步/支付/账户管理后端 |
| FontAwesome 6 | 图标库 |

## Free vs Pro

| 免费版 | Pro（¥9.9/月起） |
|--------|------------------|
| 6 种搜索引擎 | 12 种 + 自定义引擎 |
| 3 个分组 | 无限分组 |
| 12 种预设 + 随机壁纸 | + 自定义上传壁纸 |
| 天气/农历/时钟 | ✅ |
| 数据统计 | ✅ |
| 本地存储 | 云端同步 |
| — | 自定义 CSS |

## 项目结构

```
quick-dial/
├── api/
│   ├── sync.php               # 云同步 API
│   ├── pay.php                # 微信/支付宝支付
│   ├── account.php            # 账户管理（邮箱/改密/找回）
│   ├── admin.php              # 管理后台
│   ├── sync.sql               # 数据库建表
│   └── pay.sql                # 支付表
├── website/
│   ├── index.html             # 官网（产品站）
│   ├── account.html           # 账户管理页面
│   └── privacy.html           # 隐私政策
├── src/
│   ├── App.svelte             # 根组件
│   ├── app.css                # 全局样式 + 主题变量
│   ├── types/index.ts         # 类型定义 + 常量
│   ├── utils/
│   │   ├── storage.ts         # localStorage 封装 + 智能分片
│   │   ├── search.ts          # 搜索引擎 + 自定义引擎管理
│   │   ├── theme.ts           # 主题/壁纸/自适应文字颜色
│   │   ├── keyboard.ts        # 键盘快捷键
│   │   ├── sync.ts            # 云同步 SDK
│   │   ├── payment.ts         # 支付 SDK
│   │   ├── toast.svelte.ts    # Toast 通知
│   │   ├── weather.ts         # 天气/农历/壁纸 API
│   │   └── bookmark.ts        # 书签 HTML 解析
│   ├── stores/
│   │   ├── dials.svelte.ts    # 导航数据
│   │   ├── theme.svelte.ts    # 主题
│   │   ├── wallpaper.svelte.ts# 壁纸
│   │   ├── settings.svelte.ts # 设置
│   │   ├── subscription.svelte.ts # Pro 订阅
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
│       ├── IconPicker.svelte      # 图标选择器（emoji+FA）
│       ├── GroupManage.svelte     # 分组管理
│       ├── RecentSites.svelte     # 最近访问
│       ├── WallpaperPicker.svelte # 壁纸选择器
│       ├── ImportExport.svelte    # 导入导出
│       ├── SettingsPanel.svelte   # 设置面板（含 Pro）
│       ├── StatisticsPanel.svelte # 访问统计
│       ├── SyncPanel.svelte       # 云同步面板
│       ├── SubscribePanel.svelte  # 购买面板
│       ├── HelpPanel.svelte       # 快捷键帮助
│       └── OnboardingGuide.svelte # 新用户引导
├── docs/
│   ├── BUSINESS_PLAN.md       # 盈利方案
│   ├── STORE_LISTING.md       # 商店上架文案
│   ├── SYNC_DEPLOY.md         # 云同步部署指南
│   └── DEPLOY.md              # 部署指南
└── public/
    ├── manifest.json          # Chrome 扩展清单
    ├── manifest-edge.json     # Edge 扩展清单
    └── pwa-manifest.json      # PWA 清单
```

## 开源协议

MIT License
