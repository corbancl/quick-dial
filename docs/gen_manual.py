"""呲啦起始页软件V1.0 用户操作手册 PDF — >=10 pages, no commercial content"""
from fpdf import FPDF
import os, glob

font_path = None
for p in glob.glob(r'C:\Windows\Fonts\simsun*'):
    font_path = p; break
for p in glob.glob(r'C:\Windows\Fonts\msyh*'):
    if not font_path: font_path = p; break

screenshot_dir = r'M:\new\docs\screenshots'

class Manual(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font('CJK', '', 7)
            self.set_text_color(120, 120, 120)
            self.cell(0, 5, '呲啦起始页软件V1.0  用户操作手册', align='C')
            self.ln(6)
    def footer(self):
        self.set_y(-12)
        self.set_font('CJK', '', 7)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, f'- {self.page_no()} -', align='C')
    def title_page(self):
        self.add_page()
        self.ln(50)
        self.set_font('CJK', '', 28)
        self.set_text_color(0, 0, 0)
        self.cell(0, 14, '呲啦起始页软件V1.0', align='C', new_x='LMARGIN', new_y='NEXT')
        self.ln(8)
        self.set_font('CJK', '', 18)
        self.cell(0, 10, '用户操作手册', align='C', new_x='LMARGIN', new_y='NEXT')
        self.ln(30)
        self.set_font('CJK', '', 11)
        self.cell(0, 8, '开发完成日期：2026年06月01日', align='C', new_x='LMARGIN', new_y='NEXT')
        self.ln(6)
        self.cell(0, 8, '版本：V1.0', align='C', new_x='LMARGIN', new_y='NEXT')
    def section_title(self, title):
        self.ln(4)
        self.set_font('CJK', '', 14)
        self.set_text_color(0, 0, 0)
        self.cell(0, 8, title, new_x='LMARGIN', new_y='NEXT')
        self.set_draw_color(59, 130, 246)
        self.line(self.l_margin, self.get_y()+1, self.w - self.r_margin, self.get_y()+1)
        self.ln(6)
    def body(self, text):
        self.set_font('CJK', '', 10)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 6, text)
        self.ln(2)
    def add_img(self, name, caption=''):
        path = os.path.join(screenshot_dir, name)
        if os.path.exists(path):
            self.ln(2)
            self.image(path, x=(210-170)/2, w=170)
            if caption:
                self.ln(2)
                self.set_font('CJK', '', 9)
                self.set_text_color(100, 100, 100)
                self.cell(0, 5, caption, align='C', new_x='LMARGIN', new_y='NEXT')
            self.ln(2)

pdf = Manual('P', 'mm', 'A4')
pdf.add_font('CJK', '', font_path)
pdf.set_auto_page_break(auto=True, margin=20)
pdf.set_left_margin(20)
pdf.set_right_margin(20)

# ===== 封面 =====
pdf.title_page()

# ===== 1. 软件概述 =====
pdf.add_page()
pdf.section_title('一、软件概述')
pdf.body(
    '呲啦起始页软件V1.0 是一款浏览器新标签页扩展软件，用于替换 Chrome、Edge 等浏览器'
    '的默认新标签页。软件聚焦"极简、快速、无广告"三大核心体验，为用户提供干净的浏览起始界面。'
    '\n\n软件所有数据默认存储在用户本地浏览器中，不主动上传至服务器、不追踪用户行为、'
    '不展示第三方广告，充分保护用户隐私。'
)
pdf.body(
    '技术特性：\n'
    '• 采用 Svelte 5 前端框架，编译后体积约 135KB\n'
    '• TypeScript 类型安全开发，保障代码质量\n'
    '• LocalStorage 智能分片存储，突破 5MB 单键限制\n'
    '• 支持中英文双语实时切换\n'
    '• 一套代码兼容 Chrome / Edge / Brave / Arc 等所有 Chromium 内核浏览器\n'
    '• 壁纸自适应文字颜色算法，确保任何壁纸上文字始终清晰可读'
)
pdf.body(
    '主要功能模块：\n'
    '• 多引擎搜索：支持 Google、百度、Bing、知乎、B站、GitHub 等 12 种搜索引擎\n'
    '• 快捷导航：自定义网站卡片，支持分组管理、拖拽排序、图标选择\n'
    '• 精美壁纸：12 种预设渐变壁纸，自适应深浅文字\n'
    '• 天气与农历：实时天气、温度、节气、黄历日期\n'
    '• 多款时钟：数字、极简、经典、翻页、霓虹、二进制共 6 种样式\n'
    '• 数据统计：点击计数与最常访问排行\n'
    '• 导入导出：JSON 备份与浏览器书签导入\n'
    '• 云同步：跨设备加密同步导航数据\n'
)

# ===== 2. 运行环境 =====
pdf.section_title('二、运行环境')
pdf.body(
    '硬件最低要求：CPU 1GHz 双核，内存 2GB，硬盘 100MB 可用空间。\n\n'
    '软件要求：\n'
    '• 操作系统：Windows 7+ / macOS 10.13+ / Linux\n'
    '• 浏览器：Chrome 88+ / Edge 88+ / Brave / Arc / 其他 Chromium 内核浏览器\n'
    '• 网络：正常运行需互联网连接（搜索、天气功能需联网）'
)

# ===== 3. 安装方式 =====
pdf.section_title('三、安装方式')

pdf.body('方式一：Chrome 应用商店安装\n待上架 Chrome Web Store 和 Edge Add-ons 后，可直接搜索"呲啦起始页"一键安装。')

pdf.body('方式二：手动安装\n'
    '1. 从 Gitee（https://gitee.com/corbancc/quick-dial）下载源码\n'
    '2. 在项目目录中执行 npm install 安装依赖\n'
    '3. 执行 npm run build 构建扩展\n'
    '4. 打开 Chrome 浏览器，在地址栏输入 chrome://extensions\n'
    '5. 打开右上角"开发者模式"开关\n'
    '6. 点击"加载已解压的扩展程序"，选择 dist/ 目录\n'
    '7. 安装完成后，打开新标签页即可使用')

pdf.body('方式三：在线使用\n直接访问 https://cilacila.cn，无需安装即可体验。可设为浏览器主页。')

# ===== 4. 主界面 =====
pdf.add_page()
pdf.section_title('四、主界面介绍')
pdf.body(
    '打开新标签页后，进入呲啦起始页主界面。主界面由上至下分为以下几个区域：\n\n'
    '1. 搜索栏：位于页面顶部，支持输入关键词并选择搜索引擎进行搜索\n'
    '2. 信息栏：显示当前时间、日期、星期、天气、农历信息\n'
    '3. 导航区：显示用户自定义的网站快捷导航卡片，支持分组折叠展开\n'
    '4. 工具栏：位于页面右上方，提供壁纸、导入导出、统计、云同步、设置等功能入口\n'
    '5. 添加按钮：右下角"+"按钮，点击添加新的导航网站'
)
pdf.add_img('02-main-clean.png', '图 1：呲啦起始页软件V1.0 主界面')

# ===== 5. 搜索功能 =====
pdf.section_title('五、搜索功能')
pdf.body(
    '1. 在搜索框中输入关键词\n'
    '2. 点击搜索框左侧的引擎名称可以切换搜索引擎，'
    '支持 Google、百度、Bing、搜狗、360 搜索、知乎、微博、B站、GitHub 等 12 种引擎\n'
    '3. 按 Enter 键或点击"搜索"按钮开始搜索\n'
    '4. 也可直接输入网址（如 github.com），按 Enter 直接打开网站\n'
    '5. 快捷键：Ctrl+K 可快速聚焦搜索框'
)

# ===== 6. 导航管理 =====
pdf.add_page()
pdf.section_title('六、快捷导航管理')
pdf.body(
    '添加导航：\n'
    '1. 点击右下角"+"按钮，或点击分组中的"添加导航"\n'
    '2. 在弹出的对话框中输入网站名称和网址\n'
    '3. 可直接粘贴网址，系统会自动识别网站名称\n'
    '4. 选择图标（70+ emoji 或 FontAwesome 专业图标）\n'
    '5. 选择所属分组，点击"保存"完成添加'
)
pdf.add_img('05-add-dial.png', '图 2：添加导航对话框')

pdf.body(
    '编辑导航：点击已有导航卡片，弹出编辑对话框，修改后保存。\n\n'
    '删除导航：在编辑对话框底部点击删除按钮。\n\n'
    '拖拽排序：鼠标按住导航卡片拖拽到目标位置即可。\n\n'
    '分组管理：点击工具栏分组管理按钮，可添加、重命名、删除分组。'
)

# ===== 7. 设置中心 =====
pdf.add_page()
pdf.section_title('七、设置中心')
pdf.body(
    '点击右上角齿轮图标打开设置面板，可进行以下配置：\n\n'
    '• 外观主题：选择壁纸主题（12 种预设渐变可选）\n'
    '• 默认搜索引擎：设置搜索框默认使用的搜索引擎\n'
    '• 时钟样式：6 种样式可选（数字、极简、经典、翻页、霓虹、二进制）\n'
    '• 语言切换：中文 / English 双语切换\n'
    '• 显示选项：日期、星期、农历、天气、最近访问的显示开关\n'
    '• 最近访问数量：设置最近访问栏显示的网站数量（3-20）\n'
    '• 新标签页打开：开关控制导航链接是否在新标签页打开\n'
    '• 自定义 CSS 样式：可注入自定义样式代码\n'
    '• 自定义底部文字：可替换版权栏中的文字'
)
pdf.add_img('03-settings.png', '图 3：设置面板')

# ===== 8. 数据统计 =====
pdf.section_title('八、访问统计')
pdf.body(
    '点击右上角统计图标，打开访问统计面板：\n\n'
    '• 总点击：显示所有导航网站的累计点击次数\n'
    '• 站点数：已添加的导航网站数量\n'
    '• 点击排行：按点击次数降序排列的 Top 10 排行\n'
    '• 支持导出为 CSV 文件，方便数据分析\n'
    '• 支持清除统计数据'
)
pdf.add_img('04-stats.png', '图 4：访问统计面板')

# ===== 9. 导入导出 =====
pdf.add_page()
pdf.section_title('九、数据导入与导出')
pdf.body(
    '导出备份：\n'
    '点击工具栏导入导出按钮 → 选择"导出备份"，系统将生成 JSON 格式的完整数据备份文件，'
    '包含所有导航数据、分组配置、主题设置等。建议定期导出备份以防数据丢失。\n\n'
    '导入备份：\n'
    '点击"导入备份"→ 选择之前导出的 JSON 文件 → 系统自动恢复所有数据。\n\n'
    '导入浏览器书签：\n'
    '支持从 Chrome / Firefox 等浏览器导出书签 HTML 文件，系统会自动按书签文件夹分组导入。\n\n'
    '清空数据：\n'
    '点击"清空所有数据"可一键清除本地存储的所有数据，操作不可撤销。'
)

# ===== 10. 云同步 =====
pdf.section_title('十、云同步')
pdf.body(
    '使用步骤：\n'
    '1. 在设置面板中登录或注册账号\n'
    '2. 登录后，点击工具栏同步按钮打开同步面板\n'
    '3. 点击"上传到云端"将本地数据同步至服务器\n'
    '4. 在另一台设备登录同一账号，点击"从云端下载"获取数据\n\n'
    '注意：云同步为手动触发，系统不会自动上传数据。数据传输采用 HTTPS 加密，保障隐私安全。'
)

# ===== 11. 键盘快捷键 =====
pdf.section_title('十一、键盘快捷键')
pdf.body(
    'Ctrl + K           聚焦搜索框\n'
    'Ctrl + ,           打开设置面板\n'
    'Ctrl + Shift + B   壁纸设置\n'
    '?                  查看快捷键帮助\n'
    'Escape              关闭弹窗 / 对话框'
)

# ===== 12. 常见问题 =====
pdf.add_page()
pdf.section_title('十二、数据安全与隐私说明')
pdf.body(
    '数据存储方式：\n'
    '呲啦起始页软件V1.0 的所有使用数据（包括导航书签、主题设置、壁纸偏好、'
    '最近访问记录）均默认存储在用户浏览器本地的 LocalStorage 中。系统不会将用户数据主动上传至任何服务器。\n\n'
    '云同步数据安全：\n'
    '用户可选择将数据同步至云端以实现跨设备访问。同步数据通过 HTTPS 加密传输，'
    '在服务器端以隔离的数据库表存储。系统采用合理的技术措施保护用户数据安全。\n\n'
    '信息收集：\n'
    '本软件不收集任何个人身份信息。注册账号时仅需提供用户名和密码，无需手机号或邮箱。'
    '软件不包含任何第三方分析工具、不追踪用户使用行为、不展示第三方广告。\n\n'
    '用户权利：\n'
    '用户可随时通过浏览器设置清除本地存储的数据。云同步数据可由用户手动删除。'
    '软件不会将用户数据出售、共享或提供给任何第三方。'
)

pdf.section_title('十三、常见问题')
pdf.body(
    'Q：免费版够用吗？\n'
    'A：完全够用。免费版包含 6 种搜索引擎、3 个导航分组、全部 12 种壁纸预设和天气功能。'
    '日常使用场景均能覆盖。\n\n'
    'Q：会收集我的数据吗？\n'
    'A：不会。所有数据默认存储在浏览器本地 LocalStorage 中。云同步由用户主动触发上传，'
    '数据传输全程 HTTPS 加密，开发者无法查看用户的导航内容。\n\n'
    'Q：在手机上能用吗？\n'
    'A：可以。网页版（cilacila.cn）适配移动端，可设为手机浏览器主页。'
    'Chrome 移动版暂不支持扩展安装，但可以通过网页版正常使用所有功能。\n\n'
    'Q：如何更新到新版本？\n'
    'A：通过 Chrome 应用商店安装的扩展会自动更新到最新版本。'
    '手动安装的用户需从 Gitee 重新下载最新源码，执行 npm run build 构建后重新加载扩展。\n\n'
    'Q：忘记了账号密码怎么办？\n'
    'A：登录后绑定邮箱，即可在官网通过邮箱找回密码。'
    '建议首次使用后尽快在设置中绑定邮箱，以便后续进行密码重置。\n\n'
    'Q：数据会丢失吗？\n'
    'A：建议定期使用导出功能备份数据。导出为 JSON 文件后妥善保存，'
    '可在重装系统或更换设备后导入恢复。'
)

output = r'M:\new\docs\user-manual.pdf'
pdf.output(output)
print(f'Done: {output} ({pdf.page_no()} pages)')
