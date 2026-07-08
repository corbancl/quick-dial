# Quick Dial 构建与发布指南

## 签名密钥

| 项目 | 值 |
|------|-----|
| 密钥文件 | `M:\new\keys\dist.pem` |
| 密钥类型 | RSA 2048-bit PKCS#8 |
| 扩展 ID | `honmmkbobfapgdcglgibabnbmbifklia` |
| 备份位置 1 | Gitee 私仓 `corbancc/quick-dial-keys` |
| 备份位置 2 | 桌面 `dist.pem.backup` |
| 本地仓库 | `M:\new\keys\`（已配置 remote） |

### ⚠️ 安全规则
- `corbancc/quick-dial-keys` 必须保持**永久私有**
- 主仓库 `corbancc/quick-dial` 已从 git 历史中清除密钥，`.gitignore` 屏蔽 `dist.pem` / `*.pem`
- 密钥泄露 = 任何人可伪造你的扩展

---

## 构建命令

```bash
# 1. 修改版本号（3 个地方）
#    - package.json: "version": "X.Y.Z"
#    - public/manifest*.json（4 个文件）: "version" + "version_name"

# 2. 构建
cd M:\new
npm run build

# 3. 输出在 dist/ 目录
```

---

## 打包命令

### Chrome CRX（离线安装包）

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --pack-extension="M:\new\dist" ^
  --pack-extension-key="M:\new\keys\dist.pem" ^
  --no-message-box
```

生成的 `.crx` 文件在 `M:\new\dist.crx`，移动到 `build/` 并重命名。

### 浏览器 ZIP 提交包

运行 `pack-all.ps1`（需更新版本号）：

```powershell
# M:\new\pack-all.ps1
$dist = "m:\new\dist"
$out  = "m:\new\build"
$ver  = "1.0.X"

function Pack-Extension {
  param([string]$Browser, [string]$ManifestName)
  $tmp = "$out\$Browser"
  New-Item -ItemType Directory -Path $tmp -Force | Out-Null
  Copy-Item "$dist\*" -Destination $tmp -Recurse -Force
  Remove-Item "$tmp\manifest*.json","$tmp\pwa-manifest.json" -Force -ErrorAction SilentlyContinue
  Copy-Item "$dist\$ManifestName" -Destination "$tmp\manifest.json" -Force
  $zipPath = "$out\quick-dial-$Browser-v$ver.zip"
  Compress-Archive -Path "$tmp\*" -DestinationPath $zipPath -CompressionLevel Optimal -Force
  Remove-Item $tmp -Recurse -Force
}

Pack-Extension "chrome"  "manifest-chrome.json"
Pack-Extension "edge"    "manifest-edge.json"
Pack-Extension "firefox" "manifest-firefox.json"
```

### Firefox XPI 离线安装包

```bash
cp M:\new\build\quick-dial-firefox-v1.0.X.zip M:\new\build\quick-dial-firefox-v1.0.X.xpi
```

---

## 开发调试

```bash
# 加载未打包扩展：chrome://extensions → 开发者模式 → 加载已解压 → 选 M:\new\dist\
# 修改代码后 npm run build，再点刷新按钮

npm run build
```

---

## 最终产出物清单

每次发版 `build/` 目录应包含：

| 文件 | 用途 |
|------|------|
| `quick-dial-chrome-v1.0.X.zip` | Chrome Web Store 提交 |
| `quick-dial-chrome-v1.0.X.crx` | Chrome 离线安装（已签名） |
| `quick-dial-edge-v1.0.X.zip` | Edge 扩展商店提交 |
| `quick-dial-firefox-v1.0.X.zip` | Firefox AMO 提交 |
| `quick-dial-firefox-v1.0.X.xpi` | Firefox 离线安装 |
| `quick-dial-v1.0.X-universal.zip` | 通用离线包 |

---

## 密钥备份同步

```bash
# 从 Gitee 拉取密钥
cd M:\new\keys
git pull origin master

# 更新密钥后推送
cd M:\new\keys
git add dist.pem
git commit -m "更新签名密钥"
git push origin master
```
