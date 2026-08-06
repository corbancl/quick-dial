# Quick Dial v1.0.6 打包脚本 — 各浏览器 ZIP + CRX

$dist = "m:\new\dist"
$out = "m:\new\build"
$version = "v1.0.8"
$keys = "m:\new\keys"

# 清理旧输出
if (Test-Path $out) { Remove-Item $out -Recurse -Force }
New-Item -ItemType Directory -Path $out -Force | Out-Null

# 通用打包函数
function Pack-Extension {
  param([string]$Browser, [string]$ManifestName)
  
  $tmp = "$out\$Browser"
  New-Item -ItemType Directory -Path $tmp -Force | Out-Null
  
  # 复制 dist 全部内容到临时目录
  Copy-Item "$dist\*" -Destination $tmp -Recurse -Force
  
  # 删除所有 manifest 文件
  Remove-Item "$tmp\manifest*.json" -Force -ErrorAction SilentlyContinue
  Remove-Item "$tmp\pwa-manifest.json" -Force -ErrorAction SilentlyContinue
  
  # 复制目标 manifest 并重命名为 manifest.json
  Copy-Item "$dist\$ManifestName" -Destination "$tmp\manifest.json" -Force
  
  # 打包 ZIP
  $zipPath = "$out\quick-dial-$Browser-$version.zip"
  Compress-Archive -Path "$tmp\*" -DestinationPath $zipPath -Force
  
  $size = [math]::Round((Get-Item $zipPath).Length / 1KB, 1)
  Write-Host "[$Browser] $zipPath ($size KB)"
  
  # 清理临时目录
  Remove-Item $tmp -Recurse -Force
}

# 打包三个浏览器
Pack-Extension "chrome" "manifest-chrome.json"
Pack-Extension "edge" "manifest-edge.json"
Pack-Extension "firefox" "manifest-firefox.json"

# 生成 Chrome CRX
Write-Host "`nGenerating Chrome CRX..."
$chromeDir = "$out\chrome-crx"
New-Item -ItemType Directory -Path $chromeDir -Force | Out-Null
Copy-Item "$dist\*" -Destination $chromeDir -Recurse -Force
Remove-Item "$chromeDir\manifest*.json" -Force -ErrorAction SilentlyContinue
Remove-Item "$chromeDir\pwa-manifest.json" -Force -ErrorAction SilentlyContinue
Copy-Item "$dist\manifest-chrome.json" -Destination "$chromeDir\manifest.json" -Force

$pemPath = "$keys\dist.pem"
if (Test-Path $pemPath) {
  $crxPath = "$out\quick-dial-chrome-$version.crx"
  # Use Chrome's built-in packer
  $chromeExe = Get-Command chrome -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
  if (-not $chromeExe) {
    $chromeExe = "C:\Program Files\Google\Chrome\Application\chrome.exe"
  }
  if (-not (Test-Path $chromeExe)) {
    $chromeExe = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
  }
  
  if (Test-Path $chromeExe) {
    & $chromeExe --pack-extension="$chromeDir" --pack-extension-key="$pemPath" --no-message-box 2>&1 | Out-Null
    Start-Sleep -Seconds 2
    $genCrx = "$chromeDir.crx"
    if (Test-Path $genCrx) {
      Move-Item $genCrx $crxPath -Force
      $crxSize = [math]::Round((Get-Item $crxPath).Length / 1KB, 1)
      Write-Host "[CRX] $crxPath ($crxSize KB)"
    } else {
      Write-Host "[CRX] Failed: $genCrx not found"
    }
  } else {
    Write-Host "[CRX] Chrome not found, skipping"
  }
} else {
  Write-Host "[CRX] No key found at $pemPath, skipping"
}

Remove-Item $chromeDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "`nDone. All packages in: $out"
Get-ChildItem $out | ForEach-Object { Write-Host "  $($_.Name) ($([math]::Round($_.Length/1KB,1)) KB)" }
