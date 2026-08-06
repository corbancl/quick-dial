# 呲啦起始页 更新日志（v1.0.13）

本次更新带来云同步的全面开放与多项体验优化。Web 端、浏览器扩展、Emlog 插件、飞牛 NAS 四端均已同步更新至 v1.0.13。

## ✨ 新功能

- **普通用户也能云同步了**
  登录后即可手动上传 / 下载你的书签与导航，在公司、家里多设备之间无缝衔接。
- **Pro 自动同步**
  Pro 用户新增「自动同步」开关，开启后后台静默同步、多设备实时合并，无需任何手动操作。
- **同步记录（管理后台）**
  新增「同步记录」页面，每页 30 条，清晰展示每次同步的：用户、类型（上传 · 下载）、来源（手动 · 自动）、版本、大小与时间。
- **同步来源可追溯**
  同步记录新增「端」与「IP」信息，可明确区分本次同步来自 **Web 端 / 扩展端 / 插件端 / 飞牛端**，方便排查与审计。

## 🐛 问题修复

- 修复了标签页标题偶尔只显示域名「cilacila.cn」、不显示「呲啦起始页」的问题（触发于云同步下载之后，刷新可暂时恢复），现已稳定显示正确标题。

## 🔧 优化

- 精简同步入口：移除使用门槛较高的自托管同步方式，统一走云端同步，更简单、更稳定。

---

# Quick Dial Changelog (v1.0.13)

This release opens up cloud sync for everyone and brings several experience improvements. All four platforms — Web, browser extension, Emlog plugin, and FnOS NAS — are updated to v1.0.13.

## ✨ New Features

- **Cloud sync now available to all users**
  Once signed in, free users can manually upload / download their bookmarks and dials, keeping them in sync across devices.
- **Pro auto-sync**
  Pro users get a new "Auto Sync" toggle. When enabled, syncing runs silently in the background and merges across devices in real time — no manual steps needed.
- **Sync history (admin console)**
  A new "Sync History" page lists 30 records per page, showing user, type (upload · download), source (manual · auto), version, size, and time for each sync.
- **Sync source tracking**
  Sync history now shows the **platform** (Web / Extension / Plugin / FnOS) and the client **IP** for each sync, making auditing and troubleshooting easier.

## 🐛 Bug Fixes

- Fixed an issue where the tab title occasionally showed only the domain "cilacila.cn" instead of "呲啦起始页 / Quick Dial" (triggered after a cloud download, recoverable by refresh). The correct title now displays reliably.

## 🔧 Improvements

- Simplified the sync entry point: removed the high-friction self-hosted sync option and unified everything onto cloud sync for a simpler, more stable experience.
