import os, shutil, zipfile, json

ROOT = "M:/new"
DIST = os.path.join(ROOT, "dist")
PKG = os.path.join(ROOT, "packages")
ver = json.load(open(os.path.join(ROOT, "public/version.json")))["version"]
print("version =", ver)

TMP = os.path.join(ROOT, "_ext_tmp")
# 输出名 -> 用于覆盖 manifest.json 的源文件（None 表示保留 dist 默认 manifest.json）
browsers = {
    f"quickdial-chrome-v{ver}.zip": "manifest-chrome.json",
    f"quickdial-chromium-v{ver}.zip": None,
    f"quickdial-edge-v{ver}.zip": "manifest-edge.json",
    f"quickdial-firefox-v{ver}.zip": "manifest-firefox.json",
}

for out, mf in browsers.items():
    if os.path.exists(TMP):
        shutil.rmtree(TMP)
    shutil.copytree(DIST, TMP)
    if mf:
        src = os.path.join(TMP, mf)
        if os.path.exists(src):
            # 移除默认 manifest.json，用专用版本覆盖
            os.remove(os.path.join(TMP, "manifest.json"))
            os.replace(src, os.path.join(TMP, "manifest.json"))
        else:
            print("  WARN: 缺少", mf)
    zpath = os.path.join(PKG, out)
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        for base, _, files in os.walk(TMP):
            for f in files:
                fp = os.path.join(base, f)
                z.write(fp, os.path.relpath(fp, TMP))
    print("  OK ->", out, os.path.getsize(zpath), "bytes")

shutil.rmtree(TMP, ignore_errors=True)
print("done")
