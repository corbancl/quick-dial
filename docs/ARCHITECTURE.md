# Quick Dial · 呲啦起始页 — 完整架构与部署文档

> 版本：v1.0.3 | 最后更新：2026-06-01

---

## 一、产品定位

极简无广告浏览器新标签页，替代 Chrome 自带标签页和臃肿导航站。

| 维度 | 说明 |
|------|------|
| 前端 | Svelte 5 + TypeScript + Vite 6 |
| 后端 | PHP 8 + MySQL（阿里云 + 宝塔） |
| 支付 | 微信 Native 扫码 + 支付宝 page_pay |
| 域名 | cilacila.cn（在线使用）· www.cilacila.cn（官网）· sync.ruseo.cn（API） |
| 商业模式 | Freemium：免费版足够好，Pro 解锁高级功能 |
| 开源策略 | 开放核心：前端 MIT 开源，后端闭源 |

---

## 二、系统架构

```
┌─────────────────────────────────────────────────────────┐
│                      用户侧                              │
├──────────────┬──────────────────┬────────────────────────┤
│ 浏览器扩展    │  cilacila.cn     │  www.cilacila.cn       │
│ (Chrome/Edge)│  在线使用         │  官网产品站             │
│ Svelte 5 SPA │  同扩展源码部署    │  静态 HTML             │
└──────┬───────┴────────┬─────────┴──────────┬─────────────┘
       │                │                    │
       └────────┬───────┘                    │
                │ HTTPS                      │
       ┌────────▼────────────────────────────┴─────────────┐
       │              sync.ruseo.cn (Nginx)                │
       ├───────────────────────────────────────────────────┤
       │  /api/sync.php    云同步（上传/下载/登录/注册）     │
       │  /api/pay.php     支付（微信/支付宝下单+回调）      │
       │  /api/account.php 账户（邮箱绑定/改密/找回密码）    │
       │  /api/admin.php   管理后台（用户管理/订单/封禁）    │
       ├───────────────────────────────────────────────────┤
       │                    MySQL 8                        │
       │  qd_users · qd_sync · qd_orders · qd_subscriptions│
       │  qd_admins                                         │
       └───────────────────────────────────────────────────┘

        支付回调           邮件发送
       ┌──┴──┐         ┌───┴───┐
       │ 微信  │         │163企业 │
       │ 支付宝│         │ 邮箱   │
       └──────┘         └───────┘
```

---

## 三、数据库设计

```
qd_users
├── id, username, password (hash), token
├── email, email_verified
├── banned (封禁)
├── reset_code, reset_expire
└── created_at, updated_at

qd_sync
├── id, user_id (FK → qd_users)
├── data (LONGTEXT, JSON)
├── version, size_bytes
└── created_at

qd_orders
├── id, order_no (唯一), user_id (FK)
├── plan (monthly/yearly/lifetime)
├── amount, pay_method (wechat/alipay)
├── status (0待支付/1已支付/2已取消)
├── pay_time, created_at

qd_subscriptions
├── id, user_id (唯一 FK)
├── plan, start_at, expire_at (NULL=终身)
├── order_id (FK), updated_at

qd_admins
├── id, username, password (hash)
└── created_at
```

---

## 四、功能清单

### 免费版（开源）

| 功能 | 说明 |
|------|------|
| 🔍 搜索引擎 | Google / 百度 / Bing / 搜狗 / 360 / 知乎 |
| 📌 快捷导航 | 自定义图标+名称+链接，拖拽排序，3 个分组 |
| ⏰ 时钟 | 6 种样式：数字/极简/经典/翻页/霓虹/二进制 |
| 🌤️ 天气 | 实时天气/温度，展开卡片看详情 |
| 📅 农历 | 阴历日期、节气、黄历 |
| 🎨 壁纸 | 12 种预设渐变 + 随机壁纸，自动适配深浅文字 |
| 📊 数据统计 | 点击次数排行 + 最近访问 |
| 📥 导入导出 | JSON 备份/恢复，浏览器书签按文件夹导入 |
| ⌨️ 快捷键 | Ctrl+K 搜索 / Ctrl+, 设置 / Ctrl+Shift+B 壁纸 / ? 帮助 |

### Pro 版（闭源 · ¥9.9/月起）

| 功能 | 说明 |
|------|------|
| 🔍 12 种引擎 | 免费 6 种 + 微博/B站/GitHub/DuckDuckGo/X/YouTube |
| 🔧 自定义引擎 | 添加任意搜索引擎 |
| 📌 无限分组 | 超越 3 组限制 |
| 🖼️ 上传壁纸 | 自定义图片作为壁纸 |
| ☁️ 云同步 | 手动上传/下载，跨设备同步导航数据 |
| 🎨 自定义 CSS | 注入自定义样式到页面 |
| 🏷️ PRO 徽章 | 底部版权栏显示 PRO 标识 |

### 官网（www.cilacila.cn）

| 页面 | 内容 |
|------|------|
| 首页 | Hero + 功能介绍 + 定价 + 下载 + FAQ |
| 账户管理 | 登录/注册/找回密码/绑定邮箱/改密/查看订阅 |
| 隐私政策 | 独立页面，法律合规 |

---

## 五、前端架构

```
src/
├── App.svelte                 # 根组件：布局 + 路由 + 键盘快捷键
├── app.css                    # 全局样式 + CSS 变量主题
├── main.ts                    # 入口
├── types/index.ts             # TS 类型 + 常量 + 默认配置
│
├── stores/                    # 响应式状态（Svelte runes）
│   ├── dials.svelte.ts        # 导航数据 + 分组（FREE_GROUP_LIMIT=3）
│   ├── theme.svelte.ts        # 主题模式 + 自适应壁纸
│   ├── wallpaper.svelte.ts    # 壁纸选择
│   ├── settings.svelte.ts     # 全局设置
│   ├── subscription.svelte.ts # Pro 状态（syncProStatus 从 API 拉取）
│   └── recentSites.svelte.ts  # 最近访问 + 点击计数
│
├── utils/
│   ├── storage.ts             # localStorage 封装 + 智能分片（>1MB 自动拆分）
│   ├── search.ts              # 搜索引擎 + 免费/Pro 分级
│   ├── theme.ts               # 主题/壁纸 + adaptTextColor() 自适应文字
│   ├── keyboard.ts            # 快捷键注册/管理
│   ├── sync.ts                # 云同步 SDK（REST 客户端）
│   ├── payment.ts             # 支付 SDK（下单/查状态）
│   ├── toast.svelte.ts        # Toast 通知（success/error/info）
│   ├── weather.ts             # 天气/农历/随机壁纸 API
│   └── bookmark.ts            # 浏览器书签 HTML 解析（按文件夹分组）
│
└── components/
    ├── SearchBox.svelte       # 搜索框 + 下拉引擎选择
    ├── ClockWidget.svelte     # 时钟（6 种样式）
    ├── WeatherWidget.svelte   # 天气卡片
    ├── LunarWidget.svelte     # 农历卡片
    ├── SpeedDial.svelte       # 导航主容器
    ├── DialCard.svelte        # 单个导航卡片
    ├── DialGroup.svelte       # 分组容器
    ├── AddDialModal.svelte    # 添加/编辑弹窗 + 粘贴 URL 自动识别
    ├── IconPicker.svelte      # 图标选择器（emoji 分类 + FA 图标）
    ├── GroupManage.svelte     # 分组管理（增删改）
    ├── RecentSites.svelte     # 最近访问网格
    ├── WallpaperPicker.svelte # 壁纸选择器（预设/随机/上传）
    ├── ImportExport.svelte    # 导入导出 + 书签导入
    ├── SettingsPanel.svelte   # 设置面板（引擎/时钟/Pro/自定义CSS）
    ├── StatisticsPanel.svelte # 访问统计排行
    ├── SyncPanel.svelte       # 云同步（登录/注册/上传/下载）
    ├── SubscribePanel.svelte  # 购买面板（套餐/支付方式/扫码）
    ├── HelpPanel.svelte       # 快捷键帮助（按 ? 唤起）
    └── OnboardingGuide.svelte # 新用户 4 步引导
```

---

## 六、后端 API 清单

### sync.php — 云同步

| 端点 | 说明 |
|------|------|
| `POST ?action=register` | 注册 `{username, password}` → token |
| `POST ?action=login` | 登录 `{username, password}` → token |
| `POST ?action=sync_upload` | 上传数据（需 Bearer token） |
| `POST ?action=sync_download` | 下载数据（需 Bearer token） |

### pay.php — 支付

| 端点 | 说明 |
|------|------|
| `POST ?action=create_order` | 创建订单 `{plan, method}` → qr_code / pay_url |
| `GET ?action=status` | 查询订阅状态（需 token） |
| `POST ?action=notify_wechat` | 微信支付异步回调 |
| `POST ?action=notify_alipay` | 支付宝异步回调 |
| `POST ?action=activate` | 手动激活 Pro（管理用） |

### account.php — 账户

| 端点 | 说明 |
|------|------|
| `GET ?action=profile` | 获取个人信息 + 订阅（需 token） |
| `POST ?action=bind_email` | 绑定邮箱 |
| `POST ?action=change_password` | 修改密码 |
| `POST ?action=send_reset_code` | 发送重置验证码到邮箱 |
| `POST ?action=reset_password` | 用验证码重置密码 |

### admin.php — 管理后台

| Tab | 功能 |
|-----|------|
| 仪表盘 | 注册用户数 / Pro 用户数 / 今日订单 / 本月收入 |
| 用户管理 | 搜索 + 分页 + 激活 Pro（月/年/终身）/ 封禁 / 重置密码 / 在线改管理员密码 |
| 订单记录 | 最近 30 笔，显示用户/金额/支付方式/状态 |
| 设置 | 修改管理员密码 |

---

## 七、部署清单

### 前置条件

- 阿里云服务器已安装宝塔面板
- 域名 sync.ruseo.cn 已解析并配置 SSL
- PHP 8.0+（需 openssl 扩展）
- MySQL 8.0+

### 服务器部署步骤

```
1. 上传后端文件
   M:\new\api\sync.php    → /www/wwwroot/sync.ruseo.cn/api/sync.php
   M:\new\api\pay.php     → /www/wwwroot/sync.ruseo.cn/api/pay.php
   M:\new\api\account.php → /www/wwwroot/sync.ruseo.cn/api/account.php
   M:\new\api\admin.php   → /www/wwwroot/sync.ruseo.cn/api/admin.php

2. 创建 config.php（已存在则跳过）
   /www/wwwroot/sync.ruseo.cn/api/config.php
   内容：<?php
   $db = new PDO('mysql:host=localhost;dbname=YOUR_DB;charset=utf8mb4',
                 'YOUR_USER', 'YOUR_PASSWORD');

3. 执行 SQL 建表
   宝塔 → 数据库 → phpMyAdmin → 依次执行：
   api/sync.sql
   api/pay.sql

4. 访问 admin.php 自动创建管理员表
   https://sync.ruseo.cn/api/admin.php
   默认账号: corban / 7832518ycx

5. 测试
   curl https://sync.ruseo.cn/api/sync.php?action=ping
   → {"code":200,"msg":"pong"}
```

### 网站部署（备案通过后）

```
cilacila.cn 域名绑定两个站点：

站点A: www.cilacila.cn
  目录: /www/wwwroot/www.cilacila.cn/
  上传: website/index.html（官网）
        website/privacy.html（隐私政策）
        website/account.html（账户管理）
        website/favicon.png

站点B: cilacila.cn
  目录: /www/wwwroot/cilacila.cn/
  上传: dist/*（构建产物，即 Quick Dial 应用）

Nginx（可选）:
  server { server_name cilacila.cn; }
  → 无需 301，两个域名独立使用
```

### 扩展构建与更新

```bash
cd M:\new
npm run build          # 生成 dist/
                       # 构建产物：
                       #   dist/index.html
                       #   dist/assets/index-xxx.css (~43KB)
                       #   dist/assets/index-xxx.js  (~138KB, gzip ~46KB)

# 打包扩展
# 将 dist/ + public/manifest.json + public/background.js + public/js.png
# 打包为 quick-dial-extension.zip 上传商店
```

---

## 八、安全与维护

| 项目 | 说明 |
|------|------|
| 管理员密码 | 登录 admin.php → 设置 → 在线修改 |
| 数据库备份 | 宝塔面板 → 计划任务 → 每日备份 MySQL |
| 密钥管理 | pay.php 中的微信/支付宝密钥仅在服务器，不提交 Git |
| 邮箱发送 | account.php 使用 163 企业邮箱 SMTP（smtphz.qiye.163.com:994） |
| 封禁用户 | admin.php → 用户管理 → 封禁，设置 banned=1 |
| 封禁生效 | 需在 sync.php 的 login 端点加 banned 检查： |
|           | `AND banned = 0` → 封禁用户无法登录 |

---

## 九、常见维护操作

### 手动激活用户 Pro
```
admin.php → 用户管理 → 找到用户 → 点 [月]/[年]/[终身]
```

### 查看今日收入
```
admin.php → 仪表盘 → "今日订单" / "本月收入"
```

### 用户忘了密码
```
admin.php → 用户管理 → 点 [密码] → 输入新密码
```

### 用户自己找回密码（前提：绑定了邮箱）
```
www.cilacila.cn/account.html → 忘记密码 → 输入用户名 → 收验证码 → 重置
```
