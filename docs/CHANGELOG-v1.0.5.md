# Quick Dial v1.0.5 更新日志

> 发布日期：2026-06-06
> 扩展 ID：`honmmkbobfapgdcglgibabnbmbifklia`

---

## 🐛 Bug 修复

### 1. 修复 `onMount is not defined` 报错
- **现象**：Chrome 新标签页控制台报错 `Uncaught ReferenceError: onMount is not defined`
- **原因**：WeatherWidget、LunarWidget、OnboardingGuide 三个组件使用了 Svelte 5 已废弃的 `onMount` 生命周期 API
- **修复**：全部改为 Svelte 5 runes 模式的 `$effect()`
- **涉及文件**：`WeatherWidget.svelte`、`LunarWidget.svelte`、`OnboardingGuide.svelte`

### 2. 修复英文版引导页内容仍显示中文
- **现象**：切换英文后，引导页按钮变为英文，但标题和描述仍为中文
- **原因**：`OnboardingGuide.svelte` 中 `steps` 数组用 `const` 声明，`t()` 翻译值在初始化时被固化
- **修复**：`const steps: Step[]` → `const steps = $derived(...)`，语言切换时自动重新求值

### 3. 修复编辑导航时背景色不回显
- **现象**：设置卡片背景色后再次编辑，颜色字段显示默认值而非之前设置的颜色
- **原因**：`SpeedDial.openEditDial()` 调用 `fillEditData` 时漏传 `bgColor` 字段
- **修复**：补上 `bgColor: dial.bgColor`

---

## ✨ 功能优化

### 4. 中文版默认百度 / 英文版默认 Google
- **现象**：首次使用时，无论中英文都默认 Google 搜索引擎
- **修复**：`App.svelte` 首次加载分支中根据语言设置默认搜索引擎
  - 中文（zh-CN）→ 百度
  - 英文（en）→ Google
- **影响范围**：仅首次使用（无保存数据时）生效，已有用户设置不受影响

---

## 🔧 工程改进

### 5. Manifest 添加 publicKey
- 4 个 manifest 文件统一添加 `key` 字段（从 `dist.pem` 提取的公钥）
- 确保「加载已解压」与「CRX 安装」两种方式的扩展 ID 一致

### 6. 签名密钥安全管理
- 从主仓库 git 历史中彻底移除 `dist.pem`
- `.gitignore` 添加 `dist.pem` / `*.pem` / `*.crx` / `*.xpi` / `build/`
- 创建独立私有仓库 `corbancc/quick-dial-keys` 存放密钥
- 密钥多地备份：DevBrain / 本地 keys / Gitee 私仓 / 桌面

### 7. 构建与打包文档
- 新增 `docs/BUILD_GUIDE.md`，完整归档构建、打包、密钥管理流程

---

## 📦 产出物

| 文件 | 用途 |
|------|------|
| `quick-dial-chrome-v1.0.5.zip` | Chrome Web Store 提交 |
| `quick-dial-chrome-v1.0.5.crx` | Chrome 离线安装（已签名） |
| `quick-dial-edge-v1.0.5.zip` | Edge 扩展商店提交 |
| `quick-dial-firefox-v1.0.5.zip` | Firefox AMO 提交 |
| `quick-dial-firefox-v1.0.5.xpi` | Firefox 离线安装 |
| `quick-dial-v1.0.5-universal.zip` | 通用离线包 |
