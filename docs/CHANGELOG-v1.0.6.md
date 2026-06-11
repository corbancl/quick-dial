# Quick Dial v1.0.6 更新日志

> 发布日期：2026-06-11
> 扩展 ID：`honmmkbobfapgdcglgibabnbmbifklia`
> 上一版本：v1.0.5（2026-06-06）

---

## ✨ 新增功能

### 1. AI 对话助手
- 新增 `AIWidget` 组件，位于页面右下角浮窗
- 内置 **14 个 AI 提供商**：DeepSeek（V3/R1）、OpenAI（GPT-4o/o1/o3）、通义千问、Kimi、智谱 GLM、文心一言、Claude、Mistral、Groq、腾讯混元、豆包、硅基流动、Together、Ollama
- **DeepSeek 默认可用**（内置加密 API Key，无需用户配置）
- 支持流式输出、对话历史记忆、上下文理解
- 自定义模型选择 + 自定义 API Key
- 涉及文件：`AIWidget.svelte`、`stores/chat.svelte.ts`、`utils/ai.ts`

### 2. Todo 待办清单
- 新增 `TodoWidget` 组件
- 支持添加/完成/删除待办事项
- 本地持久化存储，无需登录
- 涉及文件：`TodoWidget.svelte`、`stores/todos.svelte.ts`

### 3. Notes 便签
- 新增 `NotesWidget` 组件
- 支持自由文本便签编辑
- 本地持久化存储
- 涉及文件：`NotesWidget.svelte`、`stores/notes.svelte.ts`

### 4. 百度统计分析
- 新增 `analytics.js`，使用图片像素追踪方案
- 兼容 Manifest V3 CSP（不加载外部脚本）
- 匿名化统计：PV/UV/来源

### 5. 官网页面体系
- 新增 8 个官网页面（dist/ 中英双语）：
  - `about.html` / `en-about.html` — 关于页面
  - `contact.html` / `en-contact.html` — 联系方式
  - `copyright.html` / `en-copyright.html` — 版权声明
  - `privacy.html` / `en-privacy.html` — 隐私政策
- 统一深色主题 #0a0f1a 配色

### 6. PWA 支持
- 新增 `pwa-manifest.json`
- 支持浏览器将官网安装为桌面应用
- 主题色 #3b82f6，背景色 #0f172a

---

## 🔧 工程改进

### 7. Manifest CSP 安全更新
- `connect-src` 白名单新增 7 个域名：
  - `https://hm.baidu.com`（百度统计）
  - `https://api.deepseek.com`（DeepSeek）
  - `https://dashscope.aliyuncs.com`（通义千问）
  - `https://api.moonshot.cn`（Kimi）
  - `https://open.bigmodel.cn`（智谱 GLM）
  - `https://aip.baidubce.com`（文心一言）
  - `https://api.openai.com`（OpenAI）
- 4 个 manifest（通用/Chrome/Edge/Firefox）统一更新

### 8. Firefox 后台适配
- Firefox manifest 保持 `background.scripts` 模式
- 兼容 Firefox 109+ strict_min_version

### 9. App.svelte 组件整合
- 新增 3 个 Widget 的导入和渲染逻辑
- 组件按需条件渲染，不影响基础性能

---

## 📦 产出物

| 文件 | 大小 | 用途 |
|------|------|------|
| `quick-dial-chrome-v1.0.6.zip` | 1.6 MB | Chrome Web Store 提交 |
| `quick-dial-chrome-v1.0.6.crx` | 1.6 MB | Chrome 离线安装（已签名） |
| `quick-dial-edge-v1.0.6.zip` | 1.6 MB | Edge 扩展商店提交 |
| `quick-dial-firefox-v1.0.6.zip` | 1.6 MB | Firefox AMO 提交 |

---

## 📊 文件变更统计

| 类别 | 新增 | 修改 |
|------|:--:|:--:|
| 组件（Svelte） | 3 | 1 |
| 状态管理（stores） | 3 | 0 |
| 工具函数 | 1 | 0 |
| 静态页面（HTML） | 8 | 0 |
| Manifest | 0 | 4 |
| 配置文件 | 2 | 1 |
| **合计** | **17** | **6** |
