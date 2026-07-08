# Quick Dial RSS 订阅功能 - 设计方案

## 一、功能定位

在 Quick Dial 起始页新增 RSS 订阅阅读器，用户可添加常用 RSS 源，快速浏览最新文章标题和摘要，点击跳转到原文。作为独立 Widget 模块，与现有天气、待办、便签等组件并列。

## 二、技术方案

### 2.1 RSS 抓取代理

浏览器端 JS 无法直接跨域请求 RSS 源（CORS 限制），需要代理层。

**方案 A（推荐）：rss2json.com 免费 API**
- 免费额度：每天 1000 次请求，足以覆盖个人使用
- 接口：`https://api.rss2json.com/v1/api.json?rss_url={url}`
- 无需后端开发，零维护成本
- 缺点：依赖第三方稳定性

**方案 B（备选）：自建代理**
- 在 `sync.ruseo.cn` 新增 `/api/rss?url=` 端点
- 服务端用 PHP/Python 抓取 + 缓存（30min TTL）
- 与现有 Pro 后端同一服务器，无需额外资源
- 长期更可控

> **决策**：先用方案 A 快速上线，若用户量增长或稳定性有问题再切方案 B。

### 2.2 数据存储

使用 localStorage，Key：`quick-dial-rss`

```typescript
interface RssData {
  feeds: {
    url: string;          // RSS 源地址
    title: string;        // 源名称（自动获取或手动输入）
    icon?: string;        // favicon
  }[];
  lastFetch: number;      // 最后刷新时间戳
  articles: {
    feedUrl: string;
    title: string;
    link: string;
    pubDate: string;
    snippet: string;      // 摘要（纯文本，前 200 字）
    read: boolean;
  }[];
}
```

- 文章缓存最多 200 条，超出时淘汰最旧的
- 刷新间隔：手动刷新 + 后台 30 分钟自动刷新（打开新标签页时检查）

### 2.3 组件结构

```
src/
├── components/
│   └── RssWidget.svelte        # RSS 主组件（新增）
├── stores/
│   └── rss.svelte.ts            # RSS 数据状态管理（新增）
└── utils/
    └── rss.ts                   # RSS 拉取解析工具（新增）
```

### 2.4 UI 设计

```
┌─────────────────────────────────────────┐
│ 📡 RSS 订阅              [+ 添加] [↻]  │  ← 标题栏
├─────────────────────────────────────────┤
│ ● 阮一峰的网络日志                  2h  │  ← 源标签（可切换）
│ ○ 少数派                            1d  │
│ ○ 知乎每日精选                      3d  │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 科技爱好者周刊（第 350 期）     10h │ │  ← 文章卡片
│ │ 本周话题：AI 编程工具的现状与……    │ │
│ │ 🔗 阅读原文                       │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ React 19 正式发布              1d  │ │
│ │ React 团队宣布……                  │ │
│ │ 🔗 阅读原文                       │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

- 默认折叠，点击展开，与天气/Todo Widget 样式统一
- 左侧源列表，右侧文章列表
- 点击文章跳转原文（新标签页）
- 已读文章文字变灰
- 添加源：输入框填入 RSS URL → 自动获取名称 → 确认添加

### 2.5 与现有 Widget 集成

在 `App.svelte` 中与其他 Widget 并列排列，用户可通过 Settings 控制显隐：

```svelte
{#if settings.showRss}
  <RssWidget />
{/if}
```

### 2.6 设置项（SettingsPanel 新增）

| 设置项 | 默认值 | 说明 |
|--------|--------|------|
| 显示 RSS 订阅 | 开 | 控制 Widget 显隐 |
| 自动刷新间隔 | 30 分钟 | 打开新标签页时检查 |

## 三、开发步骤

| 步骤 | 内容 | 预估 |
|------|------|------|
| 1 | `src/utils/rss.ts` — RSS 拉取工具（调 rss2json API） | 20 行 |
| 2 | `src/stores/rss.svelte.ts` — 状态管理 | 60 行 |
| 3 | `src/components/RssWidget.svelte` — UI 组件 | 150 行 |
| 4 | `src/App.svelte` — 集成 Widget | 5 行 |
| 5 | `src/components/SettingsPanel.svelte` — 设置入口 | 10 行 |
| 6 | `src/types/index.ts` — 类型定义 | 10 行 |
| 7 | `src/stores/settings.svelte.ts` — 新增 showRss | 5 行 |
| 8 | `src/utils/i18n.svelte.ts` — 多语言 key | 10 行 |

## 四、边界与取舍

| 项目 | 决策 |
|------|------|
| 订阅数上限 | 免费版 5 个，Pro 无限 |
| 全文 vs 摘要 | 仅展示摘要（rss2json 自带 description），点击跳原文 |
| OPML 导入 | v1 不做，后续考虑 |
| 通知提醒 | v1 不做 |
| 离线缓存 | 每次打开新标签页拉取最新，不持久化文章内容（仅存源列表） |

## 五、示例 RSS 源

| 名称 | RSS URL |
|------|---------|
| 阮一峰的网络日志 | `https://feeds.feedburner.com/ruanyifeng` |
| 少数派 | `https://sspai.com/feed` |
| 知乎每日精选 | `https://www.zhihu.com/rss` |
| V2EX 最新主题 | `https://www.v2ex.com/index.xml` |
| Hacker News | `https://hnrss.org/frontpage` |
