type Lang = 'zh-CN' | 'en';
type Dict = Record<string, string>;

const zh: Dict = {
  'search.placeholder': '搜索或输入网址','search.go': '搜索','search.engine': '搜索引擎',
  'clock.styles': '时钟样式','clock.digital': '数字','clock.minimal': '极简','clock.classic': '经典','clock.flip': '翻页','clock.neon': '霓虹','clock.binary': '二进制','clock.hour': '时','clock.minute': '分','clock.second': '秒',
  'settings.title': '设置','settings.theme': '外观主题','settings.themeHint': '壁纸自动适配深浅模式','settings.showDate': '显示日期','settings.showWeekday': '显示星期','settings.showLunar': '显示农历','settings.showWeather': '显示天气','settings.showRecent': '显示最近访问','settings.recentCount': '最近访问数量','settings.newTab': '新标签页打开',
  'pro.title': 'Quick Dial Pro','pro.active': '已激活','pro.inactive': '未激活','pro.upgrade': '升级 Quick Dial Pro','pro.renew': '续费 / 升级','pro.feature1': '6 种免费 + 6 种 Pro 引擎 + 自定义','pro.feature2': '云端数据同步','pro.feature3': '自定义上传壁纸','pro.feature4': '自定义 CSS 样式','pro.customCss': '自定义 CSS','pro.customCssDesc': '注入自定义样式，实时生效','pro.customFooter': '自定义底部','pro.customFooterDesc': '替换版权栏中的域名',
  'sync.title': '云同步','sync.manual': '数据不会自动同步，点按钮手动上传或下载','sync.upload': '上传到云端','sync.download': '从云端下载','sync.downloaded': '已下载云端数据，3秒后自动刷新...','sync.logout': '退出登录','sync.login': '登录','sync.register': '注册','sync.noAccount': '没有账号？','sync.hasAccount': '已有账号？','sync.goRegister': '立即注册','sync.goLogin': '去登录','sync.user': '用户名','sync.password': '密码','sync.proRequired': '云同步需 Pro，去设置升级','sync.syncTime': '同步时间',
  'ie.title': '导入 / 导出','ie.export': '导出备份','ie.import': '导入备份','ie.importBookmarks': '导入浏览器书签','ie.clear': '清空所有数据','ie.close': '关闭','ie.bookmarkHint': '免费版最多 3 个分组，超出的文件夹自动归入"默认收藏"。开通 Pro 可创建无限分组。',
  'dial.add': '添加导航','dial.edit': '编辑导航','dial.name': '网站名称','dial.url': '网站链接','dial.urlPlaceholder': '粘贴链接自动识别名称','dial.icon': '图标','dial.group': '分组','dial.save': '保存','dial.cancel': '取消',
  'wp.title': '壁纸设置','wp.random': '随机壁纸','wp.upload': '上传图片',
  'sub.title': '升级 Quick Dial Pro','sub.pay': '立即支付','sub.creating': '创建订单中...','sub.scanHint': '请使用{method}扫码支付','sub.paidRefresh': '支付完成后，刷新页面即可激活 Pro',
  'stats.title': '访问统计','stats.total': '总点击','stats.sites': '站点数','stats.ranking': '点击排行','stats.empty': '暂无访问数据','stats.clear': '清除数据','stats.export': '导出 CSV',
  'onboard.skip': '跳过','onboard.next': '下一步','onboard.start': '开始使用','onboard.step1Title': '搜索直达','onboard.step1Desc': '在搜索框输入关键词，按 Enter 或点搜索按钮','onboard.step2Title': '添加导航','onboard.step2Desc': '点右下角 + 按钮，粘贴网址自动识别名称和图标','onboard.step3Title': '自定义壁纸','onboard.step3Desc': '点 🎨 按钮选择 12 种精美渐变，打造专属风格','onboard.step4Title': '账户管理','onboard.step4Desc': '前往官网 www.cilacila.cn 绑定邮箱、找回密码、管理订阅',
  'help.title': '键盘快捷键','help.tip': '按 ? 随时打开此面板',
  'shortcut.search': '聚焦搜索','shortcut.settings': '设置','shortcut.wallpaper': '壁纸设置','shortcut.sync': '云同步','shortcut.help': '快捷键帮助',
  'footer.about': '关于我们','footer.privacy': '隐私政策','footer.copyright': '版权声明','footer.contact': '联系方式','footer.domain': '呲啦起始页',
  'wallpaper.blur': '模糊度','wallpaper.brightness': '亮度',
  'group.manage': '分组管理','group.default': '默认收藏','group.unnamed': '未命名',
  'common.close': '关闭','common.save': '保存','common.cancel': '取消','common.loading': '处理中...','common.confirmDelete': '确定删除','common.delete': '删除','common.edit': '编辑','common.add': '添加',
  'cat.common': '常用',
  'weather.humidity': '湿度','weather.wind': '风力','weather.forecast': '天气预报',
  'pay.wechat': '微信支付','pay.alipay': '支付宝','pay.monthly': '月度','pay.yearly': '年度','pay.lifetime': '终身',
  // Additional UI
  'recent.title': '最近访问','recent.empty': '暂无最近访问',
  'dial.empty': '点击 + 添加第一个导航',
  'group.limit': '{current}/{max} 个分组 · Pro 无限',
  'group.add': '添加分组','group.done': '完成','group.addBtn': '添加',
  'wp.local': '上传本地图片','wp.url': '输入图片链接','wp.apply': '应用','wp.placeholder': '输入图片链接...',
  'sync.never': '从未同步','sync.fillRequired': '请填写用户名和密码','sync.loginOk': '登录成功','sync.registerOk': '注册成功','sync.syncing': '同步中...','sync.plUser': '至少2个字符','sync.plPwd': '至少6位','sync.processing': '处理中...','sync.proReq': '云同步需 Pro，去设置升级',
  'ie.success': '操作成功','ie.exportOk': '导出成功','ie.importOk': '导入成功','ie.importedN': '成功导入 {count} 个书签至 {groups} 个分组','ie.extraMerged': '，超出 {extra} 个文件夹自动归入默认收藏','ie.cleared': '已清空数据','ie.invalidFile': '无效的备份文件格式','ie.invalidUrl': 'URL 格式不正确','ie.noBookmark': '未找到有效的书签','ie.allExist': '书签已全部存在','ie.failed': '操作失败',
  'dial.addToGroup': '添加到本组',
  'pro.monthly': '月度会员','pro.yearly': '年度会员','pro.lifetime': '终身会员','pro.expire': '到期：','pro.expireTip': 'Pro 将于 {days} 天后到期，请及时续费','pro.days': '天',
  'settings.engine': '默认搜索引擎',
  'pro.customFooterEg': '例如：我的公司','pro.customTitle': '自定义标题','pro.customTitleDesc': '替换浏览器标签页标题','pro.customTitleEg': '例如：我的起始页','cat.social': '社交','cat.dev': '开发','cat.media': '媒体','cat.office': '办公','cat.study': '学习','cat.brand': '品牌',
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
  'search.switchEngine': '切换搜索引擎',
  // Default group names (stored in data, translated at render)
  '常用': '常用','默认收藏': '默认收藏',
};

const en: Dict = {
  'search.placeholder': 'Search or enter URL','search.go': 'Search','search.engine': 'Search Engine',
  'clock.styles': 'Clock Style','clock.digital': 'Digital','clock.minimal': 'Minimal','clock.classic': 'Classic','clock.flip': 'Flip','clock.neon': 'Neon','clock.binary': 'Binary','clock.hour': 'H','clock.minute': 'M','clock.second': 'S',
  'settings.title': 'Settings','settings.theme': 'Appearance','settings.themeHint': 'Adapts to wallpaper','settings.showDate': 'Show Date','settings.showWeekday': 'Show Weekday','settings.showLunar': 'Show Lunar','settings.showWeather': 'Show Weather','settings.showRecent': 'Show Recent Sites','settings.recentCount': 'Recent Sites Count','settings.newTab': 'Open in New Tab',
  'pro.title': 'Quick Dial Pro','pro.active': 'Active','pro.inactive': 'Inactive','pro.upgrade': 'Upgrade to Pro','pro.renew': 'Renew','pro.feature1': '6 free + 6 Pro engines + custom','pro.feature2': 'Cloud sync','pro.feature3': 'Custom wallpaper upload','pro.feature4': 'Custom CSS','pro.customCss': 'Custom CSS','pro.customCssDesc': 'Inject custom styles','pro.customFooter': 'Custom Footer','pro.customFooterDesc': 'Replace domain in copyright',
  'sync.title': 'Cloud Sync','sync.manual': 'Sync is manual - upload or download on demand','sync.upload': 'Upload','sync.download': 'Download','sync.downloaded': 'Downloaded! Refreshing...','sync.logout': 'Logout','sync.login': 'Login','sync.register': 'Register','sync.noAccount': 'No account?','sync.hasAccount': 'Already have one?','sync.goRegister': 'Sign up','sync.goLogin': 'Sign in','sync.user': 'Username','sync.password': 'Password','sync.proRequired': 'Cloud sync requires Pro','sync.syncTime': 'Last sync',
  'ie.title': 'Import / Export','ie.export': 'Export','ie.import': 'Import','ie.importBookmarks': 'Import Bookmarks','ie.clear': 'Clear All','ie.close': 'Close','ie.bookmarkHint': 'Free: up to 3 groups. Extra folders merged into "Default". Pro: unlimited.',
  'dial.add': 'Add Dial','dial.edit': 'Edit Dial','dial.name': 'Site Name','dial.url': 'Site URL','dial.urlPlaceholder': 'Paste URL to auto-detect','dial.icon': 'Icon','dial.group': 'Group','dial.save': 'Save','dial.cancel': 'Cancel',
  'wp.title': 'Wallpaper','wp.random': 'Random','wp.upload': 'Upload',
  'sub.title': 'Upgrade to Pro','sub.pay': 'Pay Now','sub.creating': 'Creating...','sub.scanHint': 'Scan with {method}','sub.paidRefresh': 'Refresh after payment',
  'stats.title': 'Statistics','stats.total': 'Total Clicks','stats.sites': 'Sites','stats.ranking': 'Top Sites','stats.empty': 'No data','stats.clear': 'Clear','stats.export': 'Export CSV',
  'onboard.skip': 'Skip','onboard.next': 'Next','onboard.start': 'Start','onboard.step1Title': 'Search','onboard.step1Desc': 'Type and press Enter','onboard.step2Title': 'Add Dials','onboard.step2Desc': 'Click + to add sites','onboard.step3Title': 'Wallpapers','onboard.step3Desc': 'Pick from 12 gradients','onboard.step4Title': 'Account','onboard.step4Desc': 'Visit cilacila.cn to bind email',
  'help.title': 'Shortcuts','help.tip': 'Press ? anytime',
  'shortcut.search': 'Focus Search','shortcut.settings': 'Settings','shortcut.wallpaper': 'Wallpaper','shortcut.sync': 'Cloud Sync','shortcut.help': 'Shortcuts',
  'footer.about': 'About','footer.privacy': 'Privacy','footer.copyright': 'Copyright','footer.contact': 'Contact','footer.domain': 'Quick Dial',
  'wallpaper.blur': 'Blur','wallpaper.brightness': 'Brightness',
  'group.manage': 'Groups','group.default': 'Default','group.unnamed': 'Unnamed',
  'common.close': 'Close','common.save': 'Save','common.cancel': 'Cancel','common.loading': 'Loading...','common.confirmDelete': 'Confirm delete','common.delete': 'Delete','common.edit': 'Edit','common.add': 'Add',
  'weather.humidity': 'Humidity','weather.wind': 'Wind','weather.forecast': 'Forecast',
  'pay.wechat': 'WeChat','pay.alipay': 'Alipay','pay.monthly': 'Monthly','pay.yearly': 'Yearly','pay.lifetime': 'Lifetime',
  'recent.title': 'Recent Sites','recent.empty': 'No recent sites',
  'dial.empty': 'Click + to add your first dial',
  'group.limit': '{current}/{max} groups · Pro unlimited',
  'group.add': 'Add Group','group.done': 'Done','group.addBtn': 'Add',
  'wp.local': 'Upload Image','wp.url': 'Image URL','wp.apply': 'Apply','wp.placeholder': 'Paste image URL...',
  'sync.never': 'Never synced','sync.fillRequired': 'Fill username and password','sync.loginOk': 'Login OK','sync.registerOk': 'Registered','sync.syncing': 'Syncing...','sync.plUser': 'Min 2 chars','sync.plPwd': 'Min 6 chars','sync.processing': 'Processing...','sync.proReq': 'Cloud sync requires Pro',
  'dial.addToGroup': 'Add to Group',
  'pro.monthly': 'Monthly','pro.yearly': 'Yearly','pro.lifetime': 'Lifetime','pro.expire': 'Expires: ','pro.expireTip': 'Pro expires in {days} days, please renew','pro.days': 'd',
  'settings.engine': 'Default Engine',
  'pro.customFooterEg': 'e.g. My Company',
  'pro.customTitle': 'Custom Title',
  'pro.customTitleDesc': 'Replace browser tab title',
  'pro.customTitleEg': 'e.g. My Start Page',
  'cat.common': 'Common','cat.social': 'Social','cat.dev': 'Dev','cat.media': 'Media','cat.office': 'Office','cat.study': 'Study','cat.brand': 'Brand',
  'pro.cssPlaceholder': '/* Enter custom CSS here */',
  'icon.customUrl': 'Custom Icon URL',
  'ie.success': 'Success','ie.exportOk': 'Exported','ie.importOk': 'Imported','ie.importedN': 'Imported {count} bookmarks into {groups} groups','ie.extraMerged': ', {extra} folders merged','ie.cleared': 'Data cleared','ie.invalidFile': 'Invalid file','ie.invalidUrl': 'Invalid URL','ie.noBookmark': 'No bookmarks found','ie.allExist': 'All already exist','ie.failed': 'Failed',
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
  '常用': 'Default','默认收藏': 'Default',
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

// 初始化
setLang(currentLang);
