type Lang = 'zh-CN' | 'en';
type Dict = Record<string, string>;

const zh: Dict = {
  'search.placeholder': '搜索或输入网址','search.go': '搜索','search.engine': '搜索引擎',
  'clock.styles': '时钟样式','clock.digital': '数字','clock.minimal': '极简','clock.classic': '经典','clock.flip': '翻页','clock.neon': '霓虹','clock.binary': '二进制','clock.hour': '时','clock.minute': '分','clock.second': '秒',
  'settings.title': '设置','settings.theme': '外观主题','settings.themeHint': '壁纸自动适配深浅模式','settings.showDate': '显示日期','settings.showWeekday': '显示星期','settings.showLunar': '显示农历','settings.showWeather': '显示天气','settings.showRecent': '显示最近访问','settings.showTodo': '显示待办清单','settings.showNotes': '显示便签','settings.showAI': '显示 AI 助手','settings.recentCount': '最近访问数量','settings.newTab': '新标签页打开',
  'pro.title': 'Quick Dial Pro','pro.active': '已激活','pro.inactive': '未激活','pro.upgrade': '升级 Quick Dial Pro','pro.renew': '续费 / 升级','pro.feature1': '6 种免费 + 6 种 Pro 引擎 + 自定义','pro.feature2': '云端数据同步','pro.feature3': '自定义上传壁纸','pro.feature4': '自定义 CSS 样式','pro.customCss': '自定义 CSS','pro.customCssDesc': '注入自定义样式，实时生效','pro.customFooter': '自定义底部','pro.customFooterDesc': '替换版权栏中的域名','pro.hideBranding': '隐藏品牌名','pro.hideBrandingDesc': '在页脚隐藏"呲啦起始页"品牌名称',
  'sync.title': '云同步','sync.manual': '数据不会自动同步，点按钮手动上传或下载','sync.upload': '上传到云端','sync.download': '从云端下载','sync.downloaded': '已下载云端数据，3秒后自动刷新...','sync.logout': '退出登录','sync.login': '登录','sync.register': '注册','sync.noAccount': '没有账号？','sync.hasAccount': '已有账号？','sync.goRegister': '立即注册','sync.goLogin': '去登录','sync.user': '用户名','sync.password': '密码','sync.proRequired': '云同步需 Pro，去设置升级','sync.syncTime': '同步时间',
  'ie.title': '导入 / 导出','ie.export': '导出备份','ie.import': '导入备份','ie.importBookmarks': '导入浏览器书签','ie.clear': '清空所有数据','ie.clearHint': '仅清除导航卡片，不影响其他设置','ie.close': '关闭','ie.bookmarkHint': '免费版最多 3 个分组，超出的文件夹自动归入"默认收藏"。开通 Pro 可创建无限分组。',
  'dial.add': '添加导航','dial.edit': '编辑导航','dial.name': '网站名称','dial.url': '网站链接','dial.urlPlaceholder': '粘贴链接自动识别名称','dial.icon': '图标','dial.group': '分组','dial.save': '保存','dial.cancel': '取消','dial.bgColor': '背景色',
  'wp.title': '壁纸设置','wp.random': '随机壁纸','wp.upload': '上传图片','wp.autoSwitch': '定时切换','wp.autoSwitchEnable': '启用定时切换','wp.switchInterval': '切换间隔','wp.eachHour': '每小时','wp.eachDay': '每天','wp.autoSwitchPro': '定时切换壁纸为 Pro 专属功能，请升级后使用','wp.autoSwitchLocked': '🔒 升级 Pro 解锁定时切换壁纸',
  'sub.title': '升级 Quick Dial Pro','sub.pay': '立即支付','sub.creating': '创建订单中...','sub.scanHint': '请使用{method}扫码支付','sub.paidRefresh': '支付完成后，刷新页面即可激活 Pro','sub.opened': '已在新窗口打开支付页面','sub.failed': '获取支付链接失败','sub.qrAlt': '支付二维码','sub.scanWith': '使用{method}扫码支付','sub.back': '返回','sub.perDay': '/{days}天','sub.perMonth': '/月','sub.perYear': '/年','sub.lifetimeLabel': '终身','sub.pkgLabel': '{name}套餐','sub.badge': '最划算','sub.lifetime': '永久',
  'stats.title': '访问统计','stats.total': '总点击','stats.sites': '站点数','stats.ranking': '点击排行','stats.empty': '暂无访问数据','stats.clear': '清除数据','stats.export': '导出 CSV','stats.today': '今日','stats.weekly': '近 7 天趋势',
  'onboard.skip': '跳过','onboard.next': '下一步','onboard.start': '开始使用','onboard.step1Title': '搜索直达','onboard.step1Desc': '在搜索框输入关键词，按 Enter 或点搜索按钮','onboard.step2Title': '添加导航','onboard.step2Desc': '点右下角 + 按钮，粘贴网址自动识别名称和图标','onboard.step3Title': '自定义壁纸','onboard.step3Desc': '点 🎨 按钮选择 12 种精美渐变，打造专属风格','onboard.step4Title': '账户管理','onboard.step4Desc': '前往官网 www.cilacila.cn 绑定邮箱、找回密码、管理订阅',
  'help.title': '键盘快捷键','help.tip': '按 ? 随时打开此面板',
  'shortcut.search': '聚焦搜索','shortcut.settings': '设置','shortcut.wallpaper': '壁纸设置','shortcut.sync': '云同步','shortcut.help': '快捷键帮助',
  'footer.about': '关于我们','footer.privacy': '隐私政策','footer.copyright': '版权声明','footer.contact': '联系方式','footer.domain': '呲啦起始页','footer.psbNumber': '鲁公网安备37098202000884号',
  'wallpaper.blur': '模糊度','wallpaper.brightness': '亮度',
  'group.manage': '分组管理','group.default': '默认收藏','group.unnamed': '未命名',
  'common.close': '关闭','common.save': '保存','common.cancel': '取消','common.confirm': '确认','common.loading': '处理中...','common.confirmDelete': '确定删除','common.delete': '删除','common.edit': '编辑','common.add': '添加',
  'cat.common': '常用',
  'weather.humidity': '湿度','weather.wind': '风力','weather.forecast': '天气预报',
  'pay.wechat': '微信支付','pay.alipay': '支付宝','pay.monthly': '月度','pay.yearly': '年度','pay.lifetime': '终身',
  // Additional UI
  'recent.title': '最近访问','recent.empty': '暂无最近访问',
  'dial.empty': '点击 + 添加第一个导航',
  'todo.title': '待办清单','todo.placeholder': '输入新任务，Enter 添加','todo.pending': '个待办','todo.done': '标记完成','todo.undo': '取消完成','todo.empty': '暂无待办，输入上方添加','todo.clearDone': '清除已完成','todo.filterAll': '全部','todo.filterActive': '未完成','todo.filterDone': '已完成','todo.priority': '优先级','todo.priorityLow': '低','todo.priorityNormal': '中','todo.priorityHigh': '高','todo.dueDate': '截止日期','todo.dueOverdue': '已过期','todo.dueToday': '今天','todo.dueTomorrow': '明天','todo.noDueDate': '无截止','todo.mode': '待办显示','todo.modeList': '列表视图','todo.modeKanban': '看板视图','todo.statusTodo': '待办','todo.statusInProgress': '进行中','todo.statusDone': '已完成','todo.proRequired': '看板视图为 Pro 专属，当前使用列表模式',  'todo.setPriority': '设置优先级','todo.setDueDate': '设置截止',
  // 星座运势
  'horoscope.title': '星座运势','horoscope.loading': '加载中...','horoscope.error': '加载失败','horoscope.retry': '重试','horoscope.today': '今日','horoscope.week': '本周','horoscope.month': '本月','horoscope.year': '本年','horoscope.proTime': '本周/月/年运势为 Pro 专属','horoscope.overall': '综合','horoscope.health': '健康','horoscope.love': '爱情','horoscope.money': '财运','horoscope.work': '事业','horoscope.lucky': '幸运','horoscope.luckyColor': '幸运色','horoscope.luckyNumber': '幸运数字','horoscope.luckyConst': '幸运星座','horoscope.todo': '宜忌','horoscope.yi': '宜','horoscope.ji': '忌','horoscope.settings': '显示星座运势','horoscope.zodiac': '我的星座',
  'note.title': '便签','note.placeholder': '输入笔记，Enter 保存','note.empty': '暂无便签，输入上方添加','note.add': '添加便签','note.mode': '便签显示','note.modeColorful': '彩色便签卡','note.modeStructured': '结构化卡片','note.modeList': '列表+预览','note.statusNormal': '普通','note.statusImportant': '重要','note.statusDone': '完成','note.pin': '置顶','note.unpin': '取消置顶','note.edit': '编辑','note.color': '颜色','note.proRequired': '彩色便签卡为 Pro 专属，当前使用免费模式','note.selectHint': '← 点击左侧便签查看详情',
  'ai.title': 'AI 助手','ai.icon': '🤖','ai.placeholder': '向 AI 提问...','ai.send': '提问','ai.thinking': '思考中...','ai.welcome': '你好！我是 AI 助手，可以帮你搜索、生成文案、整理笔记。有什么需要帮忙的吗？','ai.suggest1': '帮我整理今天的工作计划','ai.suggest2': '用 Markdown 写个周报模板','ai.suggest3': '总结一下当前有哪些功能','ai.clear': '清空对话','ai.config': '设置','ai.provider': 'AI 提供商','ai.apiKey': 'API Key','ai.apiKeyHint': '输入 API Key','ai.model': '模型名称','ai.customModel': '自定义模型','ai.copy': '复制到剪贴板','ai.saveToNotes': '保存到便签','ai.copied': '已复制！','ai.noteSaved': '已保存到便签','ai.systemPrompt': '系统提示词','ai.systemPromptHint': '为 AI 设定角色或回答风格','ai.systemPromptPro': '系统提示词为 Pro 专属功能，请升级后使用','ai.systemPromptLocked': '🔒 升级 Pro 解锁自定义 System Prompt',
  'group.limit': '{current}/{max} 个分组 · Pro 无限',
  'group.add': '添加分组','group.done': '完成','group.addBtn': '添加',
  'wp.local': '上传本地图片','wp.url': '输入图片链接','wp.apply': '应用','wp.placeholder': '输入图片链接...',
  'sync.never': '从未同步','sync.fillRequired': '请填写用户名和密码','sync.loginOk': '登录成功','sync.registerOk': '注册成功','sync.syncing': '同步中...','sync.plUser': '至少2个字符','sync.plPwd': '至少6位','sync.processing': '处理中...','sync.proReq': '云同步需 Pro，去设置升级',
  'ie.success': '操作成功','ie.exportOk': '导出成功','ie.importOk': '导入成功','ie.imported': '成功导入','ie.skipped': '跳过重复','ie.groups': '个分组','ie.merged': '合并','ie.importedN': '成功导入 {count} 个书签至 {groups} 个分组','ie.extraMerged': '，超出 {extra} 个文件夹自动归入默认收藏','ie.cleared': '已清空数据','ie.invalidFile': '无效的备份文件格式','ie.invalidUrl': 'URL 格式不正确','ie.noBookmark': '未找到有效的书签','ie.allExist': '书签已全部存在','ie.failed': '操作失败',
  'dial.addToGroup': '添加到本组',
  'pro.monthly': '月度会员','pro.yearly': '年度会员','pro.lifetime': '终身会员','pro.expire': '到期：','pro.expireTip': 'Pro 将于 {days} 天后到期，请及时续费','pro.days': '天',
  'settings.engine': '默认搜索引擎',
  'theme.tech': '深色科技','theme.glass': '毛玻璃','theme.minimal': '极简扁平','theme.neu': '新拟态','theme.paper': '素纸暖调','theme.ocean': '深海幽蓝','theme.cyberpunk': '赛博朋克','theme.retro': '复古终端','theme.proRequired': '该主题为 Pro 专属，请升级后使用',
  'pro.customFooterEg': '例如：我的公司','pro.customTitle': '自定义标题','pro.customTitleDesc': '替换浏览器标签页标题','pro.customTitleEg': '例如：我的起始页','pro.guideText': '开通 Pro 解锁全部功能','pro.guideBtn': '访问官网开通 Pro','cat.social': '社交','cat.dev': '开发','cat.media': '媒体','cat.office': '办公','cat.study': '学习','cat.brand': '品牌',
  'pro.cssPlaceholder': '/* 在此输入自定义 CSS */',
  'icon.customUrl': '自定义图标 URL',
  'search.customTag': '自定义','search.locked': 'Pro 解锁','search.engineName': '引擎名称','search.engineUrl': '搜索URL（用{keyword}占位）','search.addEngine': '+ 添加自定义引擎',
  'wp.none': '无','wp.loading': '加载中...','wp.proTip': '上传壁纸需 Pro','wp.selectFile': '请选择图片文件','wp.tooLarge': '图片大小不能超过 5MB','wp.invalidUrl': '请输入有效的图片链接',
  'speedDial.empty': '暂无导航，点击下方按钮添加','speedDial.edit': '编辑','speedDial.delete': '删除',
  'stats.times': '次',
  'dial.urlInvalid': 'URL 格式不正确',
  'dial.placeholder': '例如：GitHub',
  'dial.selectIcon': '选择图标',
  'weather.today': '今天','weather.tomorrow': '明天',
  'lunar.year': '{ganzhi}年',
  'lunar.yi': '宜','lunar.ji': '忌',
  'settings.lifetime': '终身有效',
  'pro.featureSync': '云端数据同步','pro.featureWallpaper': '自定义上传壁纸',
  'toolbar.expand': '展开','toolbar.collapse': '折叠','toolbar.expandGroup': '展开分组','toolbar.collapseGroup': '折叠分组',
  'toolbar.wallpaper': '壁纸设置','toolbar.ie': '导入/导出','toolbar.stats': '访问统计','toolbar.sync': '云同步','toolbar.upgrade': '升级 Pro','toolbar.settings': '设置','toolbar.help': '快捷键',
  'search.switchEngine': '切换搜索引擎',
  'search.local': '本地导航',
  'search.localHint': '按 Enter 使用 {engine} 搜索 "{keyword}"',
  // 汇率换算
  'currency.title': '汇率换算','currency.amount': '金额','currency.base': '基准货币','currency.refresh': '刷新','currency.updated': '更新时间','settings.showCurrency': '显示汇率换算',
  'top': '返回顶部',
  // 每日一言
  'quote.title': '每日一言','quote.empty': '点击刷新获取一言','quote.loading': '加载中...','quote.error': '加载失败','quote.refresh': '换一句','quote.settings': '显示每日一言','quote.type': '一言类型','quote.hitokoto': '随机一言','quote.qinggan': '情感一言','quote.love': '随机情话','quote.saylove': '土味情话','quote.dog': '舔狗日记','quote.wanan': '晚安心语','quote.zaoan': '早安心语','quote.saohua': '骚话文案','quote.poison_soup': '毒鸡汤',
  // Tab 导航
  'tab.dials': '导航',
  // Default group names (stored in data, translated at render)
  '常用': '常用','默认收藏': '默认收藏',
  // 星座名
  'zodiac.aries': '白羊座','zodiac.taurus': '金牛座','zodiac.gemini': '双子座','zodiac.cancer': '巨蟹座','zodiac.leo': '狮子座','zodiac.virgo': '处女座','zodiac.libra': '天秤座','zodiac.scorpio': '天蝎座','zodiac.sagittarius': '射手座','zodiac.capricorn': '摩羯座','zodiac.aquarius': '水瓶座','zodiac.pisces': '双鱼座',
  // 番茄钟
  'pomodoro.work': '专注','pomodoro.break': '休息','pomodoro.start': '开始','pomodoro.pause': '暂停','pomodoro.reset': '重置','pomodoro.title': '番茄钟','settings.showPomodoro': '显示番茄钟',
  // RSS
  'rss.title': 'RSS 订阅','rss.add': '添加 RSS 源','rss.refresh': '刷新','rss.markAllRead': '全部已读','rss.readMore': '阅读原文','rss.empty': '暂无文章','rss.noFeed': '暂无订阅源，点击上方按钮添加','rss.invalid': '无效的 RSS 地址','rss.limit': '免费版最多 5 个 RSS 源','settings.showRss': '显示 RSS 订阅',
  // Layout
  'layout.title': '页面布局','layout.centered': '居中','layout.wide': '宽屏','layout.sidebar': '侧栏',
};

const en: Dict = {
  'search.placeholder': 'Search or enter URL','search.go': 'Search','search.engine': 'Search Engine',
  'clock.styles': 'Clock Style','clock.digital': 'Digital','clock.minimal': 'Minimal','clock.classic': 'Classic','clock.flip': 'Flip','clock.neon': 'Neon','clock.binary': 'Binary','clock.hour': 'H','clock.minute': 'M','clock.second': 'S',
  'settings.title': 'Settings','settings.theme': 'Appearance','settings.themeHint': 'Adapts to wallpaper','settings.showDate': 'Show Date','settings.showWeekday': 'Show Weekday','settings.showLunar': 'Show Lunar','settings.showWeather': 'Show Weather','settings.showRecent': 'Show Recent Sites','settings.showAI': 'Show AI','settings.recentCount': 'Recent Sites Count','settings.newTab': 'Open in New Tab',
  'pro.title': 'Quick Dial Pro','pro.active': 'Active','pro.inactive': 'Inactive','pro.upgrade': 'Upgrade to Pro','pro.renew': 'Renew','pro.feature1': '6 free + 6 Pro engines + custom','pro.feature2': 'Cloud sync','pro.feature3': 'Custom wallpaper upload','pro.feature4': 'Custom CSS','pro.customCss': 'Custom CSS','pro.customCssDesc': 'Inject custom styles','pro.customFooter': 'Custom Footer','pro.customFooterDesc': 'Replace domain in copyright','pro.hideBranding': 'Hide Branding','pro.hideBrandingDesc': 'Hide brand name in footer',
  'sync.title': 'Cloud Sync','sync.manual': 'Sync is manual - upload or download on demand','sync.upload': 'Upload','sync.download': 'Download','sync.downloaded': 'Downloaded! Refreshing...','sync.logout': 'Logout','sync.login': 'Login','sync.register': 'Register','sync.noAccount': 'No account?','sync.hasAccount': 'Already have one?','sync.goRegister': 'Sign up','sync.goLogin': 'Sign in','sync.user': 'Username','sync.password': 'Password','sync.proRequired': 'Cloud sync requires Pro','sync.syncTime': 'Last sync',
  'ie.title': 'Import / Export','ie.export': 'Export','ie.import': 'Import','ie.importBookmarks': 'Import Bookmarks','ie.clear': 'Clear All','ie.clearHint': 'Clears dials only, settings preserved','ie.close': 'Close','ie.bookmarkHint': 'Free: up to 3 groups. Extra folders merged into "Default". Pro: unlimited.',
  'dial.add': 'Add Dial','dial.edit': 'Edit Dial','dial.name': 'Site Name','dial.url': 'Site URL','dial.urlPlaceholder': 'Paste URL to auto-detect','dial.icon': 'Icon','dial.group': 'Group','dial.save': 'Save','dial.cancel': 'Cancel','dial.bgColor': 'Bg Color',
  'wp.title': 'Wallpaper','wp.random': 'Random','wp.upload': 'Upload','wp.autoSwitch': 'Auto Switch','wp.autoSwitchEnable': 'Enable auto switch','wp.switchInterval': 'Interval','wp.eachHour': 'Every hour','wp.eachDay': 'Every day','wp.autoSwitchPro': 'Auto-switch wallpaper is a Pro feature. Upgrade to unlock.','wp.autoSwitchLocked': '🔒 Upgrade to Pro to unlock auto wallpaper',
  'sub.title': 'Upgrade to Pro','sub.pay': 'Pay Now','sub.creating': 'Creating...','sub.scanHint': 'Scan with {method}','sub.paidRefresh': 'Refresh after payment',
  'stats.title': 'Statistics','stats.total': 'Total Clicks','stats.sites': 'Sites','stats.ranking': 'Top Sites','stats.empty': 'No data','stats.clear': 'Clear','stats.export': 'Export CSV','stats.today': 'Today','stats.weekly': 'Last 7 Days',
  'onboard.skip': 'Skip','onboard.next': 'Next','onboard.start': 'Start','onboard.step1Title': 'Search','onboard.step1Desc': 'Type and press Enter','onboard.step2Title': 'Add Dials','onboard.step2Desc': 'Click + to add sites','onboard.step3Title': 'Wallpapers','onboard.step3Desc': 'Pick from 12 gradients','onboard.step4Title': 'Account','onboard.step4Desc': 'Visit cilacila.cn to bind email',
  'help.title': 'Shortcuts','help.tip': 'Press ? anytime',
  'shortcut.search': 'Focus Search','shortcut.settings': 'Settings','shortcut.wallpaper': 'Wallpaper','shortcut.sync': 'Cloud Sync','shortcut.help': 'Shortcuts',
  'footer.about': 'About','footer.privacy': 'Privacy','footer.copyright': 'Copyright','footer.contact': 'Contact','footer.domain': 'Quick Dial','footer.psbNumber': 'LuGongWangAnBei 37098202000884',
  'wallpaper.blur': 'Blur','wallpaper.brightness': 'Brightness',
  'group.manage': 'Groups','group.default': 'Default','group.unnamed': 'Unnamed',
  'common.close': 'Close','common.save': 'Save','common.cancel': 'Cancel','common.loading': 'Loading...','common.confirmDelete': 'Confirm delete','common.delete': 'Delete','common.edit': 'Edit','common.add': 'Add',
  'weather.humidity': 'Humidity','weather.wind': 'Wind','weather.forecast': 'Forecast',
  'pay.wechat': 'WeChat','pay.alipay': 'Alipay','pay.monthly': 'Monthly','pay.yearly': 'Yearly','pay.lifetime': 'Lifetime',
  'recent.title': 'Recent Sites','recent.empty': 'No recent sites',
  'dial.empty': 'Click + to add your first dial',
  'todo.title': 'Todo List','todo.placeholder': 'Add a task, press Enter','todo.pending': ' pending','todo.done': 'Mark done','todo.undo': 'Undo','todo.empty': 'No tasks yet, add one above','todo.clearDone': 'Clear completed','todo.filterAll': 'All','todo.filterActive': 'Active','todo.filterDone': 'Done','todo.priority': 'Priority','todo.priorityLow': 'Low','todo.priorityNormal': 'Normal','todo.priorityHigh': 'High','todo.dueDate': 'Due date','todo.dueOverdue': 'Overdue','todo.dueToday': 'Today','todo.dueTomorrow': 'Tomorrow','todo.noDueDate': 'No due','todo.mode': 'Todo Display','todo.modeList': 'List View','todo.modeKanban': 'Kanban Board','todo.statusTodo': 'Todo','todo.statusInProgress': 'In Progress','todo.statusDone': 'Done','todo.proRequired': 'Kanban view is Pro-only. Using list mode instead.',  'todo.setPriority': 'Set Priority','todo.setDueDate': 'Set Due',
  'horoscope.title': 'Horoscope','horoscope.loading': 'Loading...','horoscope.error': 'Load failed','horoscope.retry': 'Retry','horoscope.today': 'Today','horoscope.week': 'This Week','horoscope.month': 'This Month','horoscope.year': 'This Year','horoscope.proTime': 'Week/Month/Year horoscope is Pro-only','horoscope.overall': 'Overall','horoscope.health': 'Health','horoscope.love': 'Love','horoscope.money': 'Wealth','horoscope.work': 'Career','horoscope.lucky': 'Lucky','horoscope.luckyColor': 'Color','horoscope.luckyNumber': 'Number','horoscope.luckyConst': 'Sign','horoscope.todo': 'Tips','horoscope.yi': 'Do','horoscope.ji': 'Don\'t','horoscope.settings': 'Show Horoscope','horoscope.zodiac': 'My Sign',
  'note.title': 'Notes','note.placeholder': 'Type a note, press Enter','note.empty': 'No notes yet','note.add': 'Add note','note.mode': 'Notes Display','note.modeColorful': 'Colorful Cards','note.modeStructured': 'Structured Cards','note.modeList': 'List + Preview','note.statusNormal': 'Normal','note.statusImportant': 'Important','note.statusDone': 'Done','note.pin': 'Pin','note.unpin': 'Unpin','note.edit': 'Edit','note.color': 'Color','note.proRequired': 'Colorful Cards is Pro-only. Using free mode instead.','note.selectHint': '← Click a note to view details',
  'ai.title': 'AI Assistant','ai.icon': '🤖','ai.placeholder': 'Ask AI anything...','ai.send': 'Ask','ai.thinking': 'Thinking...','ai.welcome': 'Hi! I\'m your AI assistant. I can search, write, and organize notes. How can I help?','ai.suggest1': 'Plan my work today','ai.suggest2': 'Write a weekly report template','ai.suggest3': 'Summarize available features','ai.clear': 'Clear chat','ai.config': 'Settings','ai.provider': 'AI Provider','ai.apiKey': 'API Key','ai.apiKeyHint': 'Enter API Key','ai.model': 'Model name','ai.customModel': 'Custom model','ai.copy': 'Copy to clipboard','ai.saveToNotes': 'Save to notes','ai.copied': 'Copied!','ai.noteSaved': 'Saved to notes','ai.systemPrompt': 'System Prompt','ai.systemPromptHint': 'Set AI role or response style','ai.systemPromptPro': 'System Prompt is a Pro feature. Upgrade to unlock.','ai.systemPromptLocked': '🔒 Upgrade to Pro to unlock System Prompt',
  'group.limit': '{current}/{max} groups · Pro unlimited',
  'group.add': 'Add Group','group.done': 'Done','group.addBtn': 'Add',
  'wp.local': 'Upload Image','wp.url': 'Image URL','wp.apply': 'Apply','wp.placeholder': 'Paste image URL...',
  'sync.never': 'Never synced','sync.fillRequired': 'Fill username and password','sync.loginOk': 'Login OK','sync.registerOk': 'Registered','sync.syncing': 'Syncing...','sync.plUser': 'Min 2 chars','sync.plPwd': 'Min 6 chars','sync.processing': 'Processing...','sync.proReq': 'Cloud sync requires Pro',
  'dial.addToGroup': 'Add to Group',
  'pro.monthly': 'Monthly','pro.yearly': 'Yearly','pro.lifetime': 'Lifetime','pro.expire': 'Expires: ','pro.expireTip': 'Pro expires in {days} days, please renew','pro.days': 'd',
  'settings.engine': 'Default Engine',
  'theme.tech': 'Dark Tech','theme.glass': 'Glass Morphism','theme.minimal': 'Minimal Flat','theme.neu': 'Neumorphic','theme.paper': 'Warm Paper','theme.ocean': 'Deep Ocean','theme.cyberpunk': 'Cyberpunk','theme.retro': 'Retro Terminal','theme.proRequired': 'This theme is Pro-only. Please upgrade to unlock.',
  'pro.customFooterEg': 'e.g. My Company',
  'pro.customTitle': 'Custom Title',
  'pro.customTitleDesc': 'Replace browser tab title',
  'pro.customTitleEg': 'e.g. My Start Page',
  'cat.common': 'Common','cat.social': 'Social','cat.dev': 'Dev','cat.media': 'Media','cat.office': 'Office','cat.study': 'Study','cat.brand': 'Brand',
  'pro.cssPlaceholder': '/* Enter custom CSS here */',
  'icon.customUrl': 'Custom Icon URL',
  'ie.success': 'Success','ie.exportOk': 'Exported','ie.importOk': 'Imported','ie.imported': 'Imported','ie.skipped': 'skipped','ie.groups': 'groups','ie.merged': 'merged','ie.importedN': 'Imported {count} bookmarks into {groups} groups','ie.extraMerged': ', {extra} folders merged','ie.cleared': 'Data cleared','ie.invalidFile': 'Invalid file','ie.invalidUrl': 'Invalid URL','ie.noBookmark': 'No bookmarks found','ie.allExist': 'All already exist','ie.failed': 'Failed',
  'search.customTag': 'Custom','search.locked': 'Pro only','search.engineName': 'Engine Name','search.engineUrl': 'URL ({keyword} placeholder)','search.addEngine': '+ Add Engine',
  'wp.none': 'None','wp.loading': 'Loading...','wp.proTip': 'Upload needs Pro','wp.selectFile': 'Select image','wp.tooLarge': 'Max 5MB','wp.invalidUrl': 'Invalid URL',
  'speedDial.empty': 'No dials yet, click + to add','speedDial.edit': 'Edit','speedDial.delete': 'Delete',
  'stats.times': ' times',
  'dial.urlInvalid': 'Invalid URL format',
  'dial.placeholder': 'e.g. GitHub',
  'dial.selectIcon': 'Select Icon',
  'weather.today': 'Today','weather.tomorrow': 'Tomorrow',
  'lunar.year': '{ganzhi}','lunar.yi': 'Auspicious','lunar.ji': 'Inauspicious',
  'settings.lifetime': 'Lifetime',
  'pro.featureSync': 'Cloud Sync','pro.featureWallpaper': 'Custom Wallpaper',
  'sub.badge': 'Best Deal','sub.lifetime': 'Forever','sub.perDay': '/{days} days','sub.perMonth': '/month','sub.perYear': '/year','sub.lifetimeLabel': 'Lifetime','sub.scanWith': 'Pay with {method}','sub.back': 'Back','sub.opened': 'Payment page opened','sub.failed': 'Failed to get link','sub.qrAlt': 'QR Code','sub.pkgLabel': '{name}',
  'toolbar.wallpaper': 'Wallpaper','toolbar.ie': 'Import/Export','toolbar.stats': 'Stats','toolbar.sync': 'Cloud Sync','toolbar.upgrade': 'Upgrade','toolbar.settings': 'Settings','toolbar.help': 'Shortcuts',
  'toolbar.expand': 'Expand','toolbar.collapse': 'Collapse','toolbar.expandGroup': 'Expand','toolbar.collapseGroup': 'Collapse',
  'search.switchEngine': 'Switch Engine',
  'search.local': 'Local Dials',
  'search.localHint': 'Press Enter to search "{keyword}" with {engine}',
  // 汇率换算
  'currency.title': 'Currency','currency.amount': 'Amount','currency.base': 'Base','currency.refresh': 'Refresh','currency.updated': 'Updated','settings.showCurrency': 'Show Currency',
  'top': 'Back to Top',
  'bottom': 'Go to Bottom',
  // 每日一言
  'quote.title': 'Daily Quote','quote.empty': 'Click refresh for a quote','quote.loading': 'Loading...','quote.error': 'Load failed','quote.refresh': 'New quote','quote.settings': 'Show Daily Quote','quote.type': 'Quote Type','quote.hitokoto': 'Random','quote.qinggan': 'Love Quotes','quote.love': 'Love Words','quote.saylove': 'Cheesy Pickup Lines','quote.dog': 'Simp Diary','quote.wanan': 'Good Night','quote.zaoan': 'Good Morning','quote.saohua': 'Cheeky Lines','quote.poison_soup': 'Dark Soup',
  // Tab 导航
  'tab.dials': 'Dials',
  '常用': 'Default','默认收藏': 'Default',
  'zodiac.aries': 'Aries','zodiac.taurus': 'Taurus','zodiac.gemini': 'Gemini','zodiac.cancer': 'Cancer','zodiac.leo': 'Leo','zodiac.virgo': 'Virgo','zodiac.libra': 'Libra','zodiac.scorpio': 'Scorpio','zodiac.sagittarius': 'Sagittarius','zodiac.capricorn': 'Capricorn','zodiac.aquarius': 'Aquarius','zodiac.pisces': 'Pisces',
  // Pomodoro
  'pomodoro.work': 'Focus','pomodoro.break': 'Break','pomodoro.start': 'Start','pomodoro.pause': 'Pause','pomodoro.reset': 'Reset','pomodoro.title': 'Pomodoro','settings.showPomodoro': 'Show Pomodoro',
  // RSS
  'rss.title': 'RSS Feeds','rss.add': 'Add RSS Feed','rss.refresh': 'Refresh','rss.markAllRead': 'Mark All Read','rss.readMore': 'Read More','rss.empty': 'No articles','rss.noFeed': 'No feeds yet, add one above','rss.invalid': 'Invalid RSS URL','rss.limit': 'Free: max 5 feeds','settings.showRss': 'Show RSS Feeds',
  // Layout
  'layout.title': 'Page Layout','layout.centered': 'Centered','layout.wide': 'Wide','layout.sidebar': 'Sidebar',
};

let currentLang = $state<Lang>((localStorage.getItem('qd-lang') as Lang) || 'zh-CN');
let _v = $state(0); // 版本号，强制 Svelte 追踪变化

export function t(key: string, params?: Record<string, string>): string {
  void _v;
  const dict = currentLang === 'zh-CN' ? zh : en;
  let val = dict[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      val = val.replace(`{${k}}`, v);
    }
  }
  return val;
}

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang) {
  currentLang = lang;
  _v++;
  localStorage.setItem('qd-lang', lang);
  document.documentElement.setAttribute('lang', lang);
  const ct = localStorage.getItem('quick-dial-custom-title');
  document.title = ct
    ? ct
    : (lang === 'zh-CN'
      ? '呲啦起始页 - 极简无广告浏览器新标签页'
      : 'Quick Dial - Clean, Ad-Free Browser New Tab');
}

// 初始化 - read from localStorage directly to avoid state_referenced_locally warning
setLang((localStorage.getItem('qd-lang') as Lang) || 'zh-CN');
