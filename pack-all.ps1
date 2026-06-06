# 为不同浏览器打包扩展
# 每个 ZIP 中包含对应浏览器的 manifest 重命名为 manifest.json

$dist = "m:\new\dist"
$out = "m:\new\build"

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
  $zipPath = "$out\quick-dial-$Browser-v1.0.5.zip"
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

Write-Host "`nDone. All packages in: $out"
