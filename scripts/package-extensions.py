#!/usr/bin/env python3
"""
Quick Dial 浏览器扩展打包脚�?生成�?  1. Chrome 商店提交�?(zip)
  2. Edge 商店提交�?(zip)
  3. Firefox 商店提交�?(zip)
  4. Chrome CRX 离线安装�?(crx)
  5. 各平台源码包 (zip, �?manifest �?
"""

import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
PACKAGES = os.path.join(ROOT, "packages")
KEYS = os.path.join(ROOT, "keys")
VERSION = "1.0.6"

# 浏览器配�?BROWSERS = {
    "chrome": {
        "manifest_src": "manifest.json",   # Chrome 使用�?manifest.json (�?key)
        "label": "Chrome",
    },
    "edge": {
        "manifest_src": "manifest-edge.json",
        "label": "Edge",
    },
    "firefox": {
        "manifest_src": "manifest-firefox.json",
        "label": "Firefox",
    },
}

CHROME_EXE = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PEM_FILE = os.path.join(KEYS, "dist.pem")


def cmd(cmdline, **kwargs):
    """Run a command and print output."""
    print(f"  $ {cmdline}")
    result = subprocess.run(cmdline, shell=True, capture_output=True, text=True, **kwargs)
    if result.stdout:
        for line in result.stdout.strip().split("\n"):
            print(f"    {line}")
    if result.returncode != 0:
        if result.stderr:
            print(f"  ERR: {result.stderr.strip()}")
        raise RuntimeError(f"Command failed with code {result.returncode}")
    return result


def zip_dir(src_dir, dest_zip):
    """Zip a directory using PowerShell Compress-Archive."""
    # Use PowerShell since zip isn't available in git bash
    ps_cmd = f'Compress-Archive -Path "{src_dir}\\*" -DestinationPath "{dest_zip}" -Force'
    print(f"  Zipping: {os.path.basename(dest_zip)}")
    result = subprocess.run(
        ["powershell", "-Command", ps_cmd],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"  ERR: {result.stderr}")
        raise RuntimeError("Zip failed")
    size_mb = os.path.getsize(dest_zip) / (1024 * 1024)
    print(f"    Size: {size_mb:.2f} MB")
    return dest_zip


def build_zip_package(browser_key, config):
    """Build a zip package for a specific browser."""
    label = config["label"]
    manifest_src = config["manifest_src"]

    print(f"\n{'='*60}")
    print(f"  Building {label} 提交�?)
    print(f"{'='*60}")

    # Create temp directory
    tmp_dir = os.path.join(PACKAGES, f"tmp_{browser_key}")
    if os.path.exists(tmp_dir):
        shutil.rmtree(tmp_dir)
    shutil.copytree(DIST, tmp_dir)

    # Replace manifest.json with browser-specific version
    src_manifest = os.path.join(ROOT, manifest_src)
    dst_manifest = os.path.join(tmp_dir, "manifest.json")
    shutil.copy2(src_manifest, dst_manifest)
    print(f"  Manifest: {manifest_src} -> manifest.json")

    # Also copy the source manifest for store submission reference
    shutil.copy2(src_manifest, os.path.join(tmp_dir, f"manifest-{browser_key}-source.json"))

    # Remove other browser manifests from package
    for fn in os.listdir(tmp_dir):
        if fn.startswith("manifest-") and fn != "manifest.json" and fn != f"manifest-{browser_key}-source.json":
            os.remove(os.path.join(tmp_dir, fn))

    # Remove unrelated assets
    for fn in list(os.listdir(tmp_dir)):
        if fn.endswith(".html") and fn not in ["index.html"]:
            os.remove(os.path.join(tmp_dir, fn))
        if fn in ["pwa-manifest.json", "theme-detect.js"]:
            os.remove(os.path.join(tmp_dir, fn))

    # Create zip
    zip_name = f"quick-dial-v{VERSION}-{browser_key}.zip"
    zip_path = os.path.join(PACKAGES, zip_name)
    zip_dir(tmp_dir, zip_path)

    # Clean up temp
    shutil.rmtree(tmp_dir)

    return zip_path


def build_crx():
    """Build Chrome CRX package using Chrome's built-in packer."""
    print(f"\n{'='*60}")
    print(f"  Building Chrome CRX 离线安装�?)
    print(f"{'='*60}")

    if not os.path.exists(CHROME_EXE):
        print("  WARNING: Chrome not found, skipping CRX build")
        return None

    if not os.path.exists(PEM_FILE):
        print("  WARNING: PEM key not found, skipping CRX build")
        return None

    # Prepare extension directory for packing (must be a clean dist copy)
    crx_tmp = os.path.join(PACKAGES, "tmp_crx")
    if os.path.exists(crx_tmp):
        shutil.rmtree(crx_tmp)
    shutil.copytree(DIST, crx_tmp)

    # Use manifest.json (already Chrome-specific)
    # Remove extra manifests and non-extension files
    for fn in os.listdir(crx_tmp):
        if fn.startswith("manifest-") and fn != "manifest.json":
            os.remove(os.path.join(crx_tmp, fn))
        if fn.endswith(".html") and fn not in ["index.html"]:
            os.remove(os.path.join(crx_tmp, fn))
        if fn in ["pwa-manifest.json", "theme-detect.js"]:
            os.remove(os.path.join(crx_tmp, fn))

    # Chrome packing: generates .crx and .pem (we provide .pem)
    crx_output = os.path.join(PACKAGES, f"quick-dial-v{VERSION}")
    print(f"  Running Chrome extension packer...")
    print(f"  Extension dir: {crx_tmp}")
    print(f"  Key file: {PEM_FILE}")

    try:
        result = subprocess.run([
            CHROME_EXE,
            "--headless",
            "--disable-gpu",
            "--pack-extension=" + crx_tmp,
            "--pack-extension-key=" + PEM_FILE,
        ], capture_output=True, text=True, timeout=30)

        print(f"  Chrome output: {result.stdout.strip()}")
        if result.stderr:
            print(f"  Chrome stderr: {result.stderr.strip()}")

        # Chrome outputs .crx next to the extension dir
        expected_crx = f"{crx_tmp}.crx"
        if os.path.exists(expected_crx):
            target_crx = os.path.join(PACKAGES, f"quick-dial-v{VERSION}.crx")
            shutil.move(expected_crx, target_crx)
            size_mb = os.path.getsize(target_crx) / (1024 * 1024)
            print(f"  CRX built: {target_crx} ({size_mb:.2f} MB)")
        else:
            print(f"  CRX not generated at expected path: {expected_crx}")
            # Check if chrome put it elsewhere
            import glob
            possible = glob.glob(os.path.join(PACKAGES, "*.crx"))
            if possible:
                print(f"  Found CRX at: {possible[0]}")

    except subprocess.TimeoutExpired:
        print("  WARNING: Chrome packing timed out (30s)")
    except Exception as e:
        print(f"  WARNING: CRX packing failed: {e}")

    shutil.rmtree(crx_tmp)

    # Check for generated CRX
    crx_file = os.path.join(PACKAGES, f"quick-dial-v{VERSION}.crx")
    if os.path.exists(crx_file):
        return crx_file
    return None


def build_offline_zip():
    """Build a universal offline installation zip (for dev mode loading)."""
    print(f"\n{'='*60}")
    print(f"  Building 离线安装�?(通用)")
    print(f"{'='*60}")

    tmp_dir = os.path.join(PACKAGES, "tmp_offline")
    if os.path.exists(tmp_dir):
        shutil.rmtree(tmp_dir)
    shutil.copytree(DIST, tmp_dir)

    # Keep manifest.json as-is (Chrome compatible)
    # Remove extra manifests
    for fn in os.listdir(tmp_dir):
        if fn.startswith("manifest-") and fn != "manifest.json":
            os.remove(os.path.join(tmp_dir, fn))
        if fn.endswith(".html") and fn not in ["index.html"]:
            os.remove(os.path.join(tmp_dir, fn))
        if fn in ["pwa-manifest.json", "theme-detect.js"]:
            os.remove(os.path.join(tmp_dir, fn))

    # Add an installation README
    readme_path = os.path.join(tmp_dir, "安装说明.txt")
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write("""呲啦起始�?Quick Dial v{VERSION} �?离线安装说明
=============================================

Chrome / Edge 安装�?  1. 打开浏览器，地址栏输�?chrome://extensions/ �?edge://extensions/
  2. 打开右上�?开发者模�?开�?  3. 将本文件夹拖入浏览器窗口
  4. 完成！打开新标签页即可看到

Firefox 安装�?  1. 打开 Firefox，地址栏输�?about:debugging
  2. 点击"�?Firefox" �?"临时载入附加组件"
  3. 选择本文件夹中的 manifest-firefox.json
  4. 完成�?
注意：离线安装的扩展不会自动更新，请定期下载最新版本�?官方网站：https://www.cilacila.cn
""".format(VERSION=VERSION))

    zip_name = f"quick-dial-v{VERSION}-offline.zip"
    zip_path = os.path.join(PACKAGES, zip_name)
    zip_dir(tmp_dir, zip_path)

    shutil.rmtree(tmp_dir)
    return zip_path


def build_source_zip():
    """Build source code package (for store review / open source)."""
    print(f"\n{'='*60}")
    print(f"  Building 源码�?)
    print(f"{'='*60}")

    zip_name = f"quick-dial-v{VERSION}-source.zip"
    zip_path = os.path.join(PACKAGES, zip_name)

    # Exclude node_modules, packages, dist, .git
    exclude_dirs = ["node_modules", "packages", "dist", ".git", "__pycache__", ".workbuddy", "scripts"]
    exclude_files = [".DS_Store", "Thumbs.db", "web.zip", "website.zip", "*.crx"]

    # Create temporary source directory with only needed files
    tmp_src = os.path.join(PACKAGES, "tmp_source")
    if os.path.exists(tmp_src):
        shutil.rmtree(tmp_src)
    os.makedirs(tmp_src, exist_ok=True)

    for item in os.listdir(ROOT):
        if item in exclude_dirs:
            continue
        src_path = os.path.join(ROOT, item)
        dst_path = os.path.join(tmp_src, item)
        if os.path.isdir(src_path):
            shutil.copytree(src_path, dst_path,
                            ignore=shutil.ignore_patterns(*exclude_dirs, *exclude_files))
        else:
            # Skip excluded files
            skip = False
            for pattern in exclude_files:
                if pattern.startswith("*") and item.endswith(pattern[1:]):
                    skip = True
                    break
                if item == pattern:
                    skip = True
                    break
            if not skip:
                shutil.copy2(src_path, dst_path)

    # Also include keys directory for reference (skip .git)
    shutil.copytree(KEYS, os.path.join(tmp_src, "keys"), dirs_exist_ok=True,
                    ignore=shutil.ignore_patterns('.git'))

    zip_dir(tmp_src, zip_path)
    shutil.rmtree(tmp_src)
    return zip_path


def main():
    print("=" * 60)
    print(f"  Quick Dial v{VERSION} �?多平台打包构�?)
    print("=" * 60)

    # Ensure dist exists
    if not os.path.exists(DIST):
        print("ERROR: dist/ directory not found. Run 'npm run build' first.")
        sys.exit(1)

    # Create packages output directory
    os.makedirs(PACKAGES, exist_ok=True)

    # Clean previous packages
    for fn in os.listdir(PACKAGES):
        if fn.endswith(".zip") or fn.endswith(".crx"):
            os.remove(os.path.join(PACKAGES, fn))
    print(f"  Cleaned {PACKAGES}/")

    results = []

    # 1. Build browser-specific zip packages
    for browser_key, config in BROWSERS.items():
        try:
            path = build_zip_package(browser_key, config)
            results.append(("提交�?, config["label"], path))
        except Exception as e:
            print(f"  FAILED: {e}")

    # 2. Build offline installation zip
    try:
        path = build_offline_zip()
        results.append(("离线�?, "通用", path))
    except Exception as e:
        print(f"  FAILED: {e}")

    # 3. Build CRX
    try:
        path = build_crx()
        if path:
            results.append(("CRX", "Chrome", path))
    except Exception as e:
        print(f"  FAILED: {e}")

    # 4. Build source package
    try:
        path = build_source_zip()
        results.append(("源码�?, "通用", path))
    except Exception as e:
        print(f"  FAILED: {e}")

    # Summary
    print(f"\n{'='*60}")
    print(f"  构建完成！产出清单：")
    print(f"{'='*60}")
    for pkg_type, browser, path in results:
        size = os.path.getsize(path) / (1024 * 1024) if os.path.exists(path) else 0
        print(f"  [{pkg_type}] {browser:8s}  {os.path.basename(path):40s}  {size:.2f} MB")
    print(f"\n  输出目录: {PACKAGES}")
    print("=" * 60)


if __name__ == "__main__":
    main()
