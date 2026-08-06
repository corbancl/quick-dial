#!/usr/bin/env python3
"""打包 Quick Dial v1.0.12 CRX（Chrome 签名，使用 keys/dist.pem 保持扩展 ID）"""
import os, shutil, subprocess, json

ROOT = r"M:\new"
DIST = os.path.join(ROOT, "dist")
PACKAGES = os.path.join(ROOT, "packages")
PEM = os.path.join(ROOT, "keys", "dist.pem")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
VERSION = "1.0.16"

crx_tmp = os.path.join(PACKAGES, "tmp_crx")
if os.path.exists(crx_tmp):
    shutil.rmtree(crx_tmp)
shutil.copytree(DIST, crx_tmp)

# 清理：其他浏览器 manifest、非扩展页面、PWA 文件
for fn in list(os.listdir(crx_tmp)):
    p = os.path.join(crx_tmp, fn)
    if fn.startswith("manifest-") and fn != "manifest.json":
        os.remove(p)
    elif fn.endswith(".html") and fn != "index.html":
        os.remove(p)
    elif fn in ["pwa-manifest.json", "theme-detect.js"]:
        os.remove(p)

# 校验 manifest 版本
with open(os.path.join(crx_tmp, "manifest.json"), encoding="utf-8") as f:
    m = json.load(f)
print("manifest version:", m.get("version"))
print("manifest name:", m.get("name"))
print("background:", m.get("background"))
assert m.get("version") == VERSION, "版本号不是 %s" % VERSION  # 1.0.16

r = subprocess.run([
    CHROME, "--headless", "--disable-gpu",
    "--pack-extension=" + crx_tmp,
    "--pack-extension-key=" + PEM,
], capture_output=True, text=True, timeout=60)
print("stdout:", r.stdout.strip())
print("stderr:", r.stderr.strip())

expected = crx_tmp + ".crx"
target = os.path.join(PACKAGES, "quickdial-v%s.crx" % VERSION)
if os.path.exists(expected):
    if os.path.exists(target):
        os.remove(target)
    shutil.move(expected, target)
    print("OK ->", target, "%.2f MB" % (os.path.getsize(target) / 1048576))
else:
    print("FAIL: crx not generated")

shutil.rmtree(crx_tmp)
