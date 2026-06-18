#!/usr/bin/env python3
"""
重新发布 v1.0.6 博客 — 创建新文章（article_update 无效）
修复：标题不用括号，避免 emlog 解析截断
"""

import json
import os
import urllib.request
import urllib.parse
import mimetypes

EMLOG_URL = "https://chenliang.xyz"
API_KEY = "5b1f43f3fda587993a598cd6753f6541"
CATEGORY_ID = 3

SCREENSHOTS_DIR = r"M:\new\项目截图"

SCREENSHOTS_ORDER = [
    ("主页.png", "主界面概览"),
    ("AI助手.png", "AI 对话助手"),
    ("待办清单.png", "待办清单"),
    ("便签.png", "便签功能"),
    ("星座运势.png", "星座运势"),
    ("番茄钟.png", "番茄钟"),
    ("汇率换算.png", "汇率换算"),
    ("设置页1.png", "设置面板"),
    ("云同步.png", "数据云同步"),
    ("访问统计.png", "访问统计面板"),
]


def upload_image(filepath):
    """Upload image via emlog REST API with proper multipart."""
    filename = os.path.basename(filepath)
    content_type = mimetypes.guess_type(filepath)[0] or "image/png"
    boundary = "----FormBoundary" + os.urandom(8).hex()

    with open(filepath, "rb") as f:
        file_data = f.read()

    body = b""
    body += f"--{boundary}\r\n".encode("utf-8")
    body += f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'.encode("utf-8")
    body += f"Content-Type: {content_type}\r\n\r\n".encode("utf-8")
    body += file_data
    body += f"\r\n--{boundary}--\r\n".encode("utf-8")

    url = f"{EMLOG_URL}/?rest-api=upload&api_key={API_KEY}"

    req = urllib.request.Request(
        url, data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode("utf-8")
            if raw:
                result = json.loads(raw)
                if result.get("code") == 0:
                    data = result.get("data", {})
                    url_val = data.get("url", "")
                    if url_val:
                        return url_val
    except Exception as e:
        print(f"    Upload error: {e}")
    return None


def post_article(title, content, sort_id):
    """Post article to emlog. Use urlencode for proper UTF-8."""
    params = {
        "title": title,
        "content": content,
        "sort_id": str(sort_id),
        "draft": "n",
    }
    encoded = urllib.parse.urlencode(params).encode("utf-8")

    url = f"{EMLOG_URL}/?rest-api=article_post&api_key={API_KEY}"
    req = urllib.request.Request(
        url, data=encoded,
        headers={"Content-Type": "application/x-www-form-urlencoded; charset=utf-8"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"  Post failed: {e}")
        return None


def build_html(image_urls):
    """Build article HTML. NO parentheses in critical positions."""

    def img(name, desc):
        url = image_urls.get(name, "")
        if not url:
            return ""
        return f'<p style="text-align:center"><img src="{url}" alt="{desc}" style="max-width:100%;height:auto;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.1)"></p>'

    links = (
        '<p style="text-align:center;margin:20px 0">'
        '<a href="https://www.cilacila.cn" target="_blank" rel="noopener">官网</a>'
        ' &middot; '
        '<a href="https://cilacila.cn" target="_blank" rel="noopener">在线体验</a>'
        ' &middot; '
        '<a href="https://url06.ctfile.com/d/26378206-165166249-ac2ade?p=3586" target="_blank" rel="noopener">离线安装包下载</a>'
        ' &middot; '
        '<a href="https://gitee.com/corbancc/quick-dial" target="_blank" rel="noopener">Gitee 开源</a>'
        '</p>'
    )

    parts = []
    parts.append('<h1>Quick Dial 呲啦起始页 v1.0.6 正式发布</h1>')
    parts.append('')
    parts.append('<p>Quick Dial 是一款极简无广告的浏览器新标签页扩展，替代原生标签页，提供自定义导航、多引擎搜索、天气农历、AI 对话、待办便签等实用功能。支持 Chrome / Edge / Firefox 三大浏览器。</p>')
    parts.append('')
    parts.append(links)
    parts.append('')
    parts.append(img("主页.png", "主界面"))
    parts.append('')
    parts.append('<hr>')
    parts.append('')
    parts.append('<h2>v1.0.6 更新概览</h2>')
    parts.append('<p>本版本是 Quick Dial 迄今为止<strong>功能增量最大</strong>的一次更新，新增 7 大核心功能，超过 50 项优化改进，总代码变更 60+ 次提交。</p>')
    parts.append('')

    # Feature 1
    parts.append('<h2>新增功能</h2>')
    parts.append('')
    parts.append('<h3>1. AI 智能对话助手</h3>')
    parts.append('<p>内置 <strong>14 个 AI 提供商</strong>：DeepSeek V3/R1、OpenAI GPT-4o/o1/o3、通义千问、Kimi、智谱 GLM、文心一言、Claude、豆包、腾讯混元、Mistral、Groq、硅基流动、Together。DeepSeek <strong>默认免配置可用</strong>，内置加密 API Key，支持流式输出、对话历史记忆、自定义模型。所有 API Key 使用 XOR+Base64 加密存储，安全不泄露。</p>')
    parts.append(img("AI助手.png", "AI 对话助手"))
    parts.append('')

    # Feature 2
    parts.append('<h3>2. 待办清单 Todo</h3>')
    parts.append('<p>支持添加/完成/删除待办事项，列表模式和看板模式（Pro），优先级标记和截止日期。数据本地持久化存储，无需登录即可使用。看板模式提供待办/进行中/已完成三列管理。</p>')
    parts.append(img("待办清单.png", "待办清单"))
    parts.append('')

    # Feature 3
    parts.append('<h3>3. 便签 Notes</h3>')
    parts.append('<p>三种显示模式：彩色便签卡（Pro专属 Post-it 风格）、结构化卡片（状态标签+颜色标识）、列表预览（左侧列表+右侧全文）。支持五色标签、状态切换、置顶、双击编辑。</p>')
    parts.append(img("便签.png", "便签"))
    parts.append('')

    # Feature 4
    parts.append('<h3>4. 星座运势</h3>')
    parts.append('<p>支持 12 星座今日/本周/本月/年度运势。综合评分 + 五项运势分析（爱情/事业/财富/健康/心情），宜忌提醒，幸运色/数字。12 星座横向滚动选择，一键切换。</p>')
    parts.append(img("星座运势.png", "星座运势"))
    parts.append('')

    # Feature 5
    parts.append('<h3>5. 番茄钟</h3>')
    parts.append('<p>经典 25 分钟专注 / 5 分钟休息番茄工作法。SVG 圆环倒计时动画，Web Audio API 提示音，自动循环。开始/暂停/重置三按钮控制。</p>')
    parts.append(img("番茄钟.png", "番茄钟"))
    parts.append('')

    # Feature 6
    parts.append('<h3>6. 汇率换算</h3>')
    parts.append('<p>支持 9 种基准货币实时汇率换算，自动缓存到本地减少 API 请求。输入金额即时计算，下拉选择目标货币。</p>')
    parts.append(img("汇率换算.png", "汇率换算"))
    parts.append('')

    # Feature 7
    parts.append('<h3>7. Tab 导航系统</h3>')
    parts.append('<p>搜索框下方新增 Tab 切换栏，默认导航 tab 始终显示，可选功能 tab（星座运势/待办/便签/番茄钟/汇率换算）由设置面板控制开关，一键切换无需滚动。</p>')
    parts.append('')

    # UI/UX
    parts.append('<h2>UI/UX 优化</h2>')
    parts.append('<ul>')
    parts.append('<li>四主题系统：深色科技 / 毛玻璃 / 极简扁平 / 新拟态，Pro 额外解锁素纸暖调 / 深海幽蓝 / 赛博朋克 / 复古终端</li>')
    parts.append('<li>每日一言：紧凑行内显示，实时刷新无缓存，支持随机一言和情感一言</li>')
    parts.append('<li>全局去 Emoji：所有菜单、Tab、设置面板移除 emoji，界面更专业</li>')
    parts.append('<li>返回顶部/底部：右侧中间固定垂直双按钮</li>')
    parts.append('<li>手机端适配：Tab 栏自动换行，便签流式网格，响应式布局</li>')
    parts.append('</ul>')
    parts.append(img("设置页1.png", "设置面板"))
    parts.append('')

    # Pro
    parts.append('<h2>Pro 会员增值功能</h2>')
    parts.append('<ul>')
    parts.append('<li>AI 对话：14 家提供商自由切换，自定义 API Key + 模型</li>')
    parts.append('<li>四款专属主题：毛玻璃 / 新拟态 / 赛博朋克 / 复古终端</li>')
    parts.append('<li>待办看板模式：三列任务管理</li>')
    parts.append('<li>便签彩色便签卡模式：Post-it 五色 + 折角装饰</li>')
    parts.append('<li>定时壁纸切换：每小时/每天自动更换壁纸</li>')
    parts.append('<li>自定义底部：隐藏品牌标识 + 自定义页脚文字</li>')
    parts.append('<li>自定义浏览器标题</li>')
    parts.append('<li>数据云同步：导航、设置、待办、便签全量同步</li>')
    parts.append('</ul>')
    parts.append(img("云同步.png", "云同步"))
    parts.append('')

    # Stats
    parts.append('<h2>数据统计</h2>')
    parts.append('<p>本地使用统计面板：累计打开次数、使用天数、导航点击分布、搜索次数等。纯本地计算，不收集隐私数据。</p>')
    parts.append(img("访问统计.png", "访问统计"))
    parts.append('')

    # Tech
    parts.append('<h2>技术改进</h2>')
    parts.append('<ul>')
    parts.append('<li>百度统计分析（图片像素追踪，兼容 Manifest V3 CSP）</li>')
    parts.append('<li>8 个官网页面（关于/隐私/版权/联系方式，中英双语，深色主题）</li>')
    parts.append('<li>PWA 支持（官网可安装为桌面应用）</li>')
    parts.append('<li>右键菜单快速添加导航</li>')
    parts.append('<li>Pro 过期提醒优化（持久徽章 + 脉冲动画）</li>')
    parts.append('<li>API Key XOR+Base64 加密存储</li>')
    parts.append('<li>CSP 安全策略更新，新增 7 个 AI/统计域名白名单</li>')
    parts.append('<li>暗色主题壁纸覆盖修复、浅色主题下拉菜单修复</li>')
    parts.append('<li>图标类型检测增强（支持本地路径和图片扩展名）</li>')
    parts.append('</ul>')
    parts.append('')

    # Install
    parts.append('<h2>安装方式</h2>')
    parts.append('')
    parts.append('<h3>方式一：在线使用，推荐</h3>')
    parts.append('<p>直接访问 <a href="https://cilacila.cn" target="_blank" rel="noopener">https://cilacila.cn</a> 即可使用 Web 版，无需安装任何扩展。</p>')
    parts.append('')
    parts.append('<h3>方式二：浏览器扩展商店，即将上架</h3>')
    parts.append('<p>Chrome Web Store / Edge Add-ons / Firefox Add-ons 审核中，敬请期待。</p>')
    parts.append('')
    parts.append('<h3>方式三：离线安装包</h3>')
    parts.append('<p><strong>下载地址：</strong><a href="https://url06.ctfile.com/d/26378206-165166249-ac2ade?p=3586" target="_blank" rel="noopener">城通网盘</a>，提取码：3586</p>')
    parts.append('<p>包含 Chrome .crx 和通用离线文件夹安装包，安装步骤：</p>')
    parts.append('<ol>')
    parts.append('<li>打开 Chrome 或 Edge 浏览器</li>')
    parts.append('<li>地址栏输入 chrome://extensions/ 或 edge://extensions/</li>')
    parts.append('<li>打开右上角<strong>开发者模式</strong>开关</li>')
    parts.append('<li>将 .crx 文件拖入浏览器窗口，或点击加载已解压的扩展选择文件夹</li>')
    parts.append('<li>完成！打开新标签页即可看到 Quick Dial</li>')
    parts.append('</ol>')
    parts.append('')

    # Tech stack
    parts.append('<h2>技术栈</h2>')
    parts.append('<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">')
    parts.append('<tr><td style="width:120px"><strong>前端框架</strong></td><td>Svelte 5 + TypeScript + Vite 6</td></tr>')
    parts.append('<tr><td><strong>扩展标准</strong></td><td>Manifest V3，兼容 Chrome / Edge / Firefox</td></tr>')
    parts.append('<tr><td><strong>数据存储</strong></td><td>localStorage 本地 + REST API 云同步，Pro</td></tr>')
    parts.append('<tr><td><strong>后端服务</strong></td><td>PHP + MySQL，宝塔面板</td></tr>')
    parts.append('<tr><td><strong>AI 代理</strong></td><td>Node.js 代理转发，防 API Key 泄露</td></tr>')
    parts.append('<tr><td><strong>扩展 ID</strong></td><td>honmmkbobfapgdcglgibabnbmbifklia</td></tr>')
    parts.append('<tr><td><strong>版本</strong></td><td>v1.0.6，2026-06-12</td></tr>')
    parts.append('</table>')
    parts.append('')

    # Links
    parts.append('<h2>相关链接</h2>')
    parts.append('<ul>')
    parts.append('<li>官方网站：<a href="https://www.cilacila.cn" target="_blank" rel="noopener">https://www.cilacila.cn</a></li>')
    parts.append('<li>在线使用：<a href="https://cilacila.cn" target="_blank" rel="noopener">https://cilacila.cn</a></li>')
    parts.append('<li>开源仓库：<a href="https://gitee.com/corbancc/quick-dial" target="_blank" rel="noopener">Gitee</a></li>')
    parts.append('<li>离线下载：<a href="https://url06.ctfile.com/d/26378206-165166249-ac2ade?p=3586" target="_blank" rel="noopener">城通网盘</a>，提取码：3586</li>')
    parts.append('</ul>')
    parts.append('')
    parts.append('<hr>')
    parts.append('<p style="color:#999;font-size:13px">Quick Dial v1.0.6 · 发布于 2026-06-12 · 本地环境无忧，云端自由同步</p>')

    return "\n".join(parts)


def main():
    print("=" * 60)
    print("  Quick Dial v1.0.6 — 重新发布博客")
    print("=" * 60)

    # Step 1: Upload images
    print("\n[1/3] 上传截图...")
    image_urls = {}
    ok = 0

    for filename, desc in SCREENSHOTS_ORDER:
        filepath = os.path.join(SCREENSHOTS_DIR, filename)
        if not os.path.exists(filepath):
            print(f"  SKIP: {filename}")
            continue
        size_kb = os.path.getsize(filepath) / 1024
        print(f"  Upload: {filename} ({size_kb:.0f}KB)...")
        url = upload_image(filepath)
        if url:
            image_urls[filename] = url
            ok += 1
            print(f"    OK: {url}")
        else:
            print(f"    FAILED")

    print(f"\n  Uploaded: {ok}/{len(SCREENSHOTS_ORDER)}")

    # Step 2: Build content
    print("\n[2/3] 构建文章...")
    content = build_html(image_urls)
    print(f"  Length: {len(content)} chars, {len(image_urls)} images")

    # Step 3: Post
    print("\n[3/3] 发布文章...")
    title = "Quick Dial 呲啦起始页 v1.0.6 正式发布 - 7大新功能 + AI助手 + 待办便签 + 星座运势"

    result = post_article(title, content, CATEGORY_ID)
    if result:
        if result.get("code") == 0:
            aid = result["data"]["article_id"]
            print(f"\n  发布成功！")
            print(f"  文章 ID: {aid}")
            print(f"  访问地址: {EMLOG_URL}/?post={aid}")
            print(f"  文章长度: {len(content)} 字符")
            print(f"  图片数: {len(image_urls)}")
        else:
            print(f"\n  失败: {result}")
    else:
        print("\n  请求失败")

    print("=" * 60)


if __name__ == "__main__":
    main()
