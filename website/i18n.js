// Quick Dial 官网 i18n — 字符串替换方案
(function() {
  var lang = localStorage.getItem('qd-site-lang') || 'zh-CN';
  if (location.search.includes('lang=en')) { lang = 'en'; localStorage.setItem('qd-site-lang', 'en'); }
  if (location.search.includes('lang=zh')) { lang = 'zh-CN'; localStorage.setItem('qd-site-lang', 'zh-CN'); }

  var map = {
    // Nav & Common
    '功能': 'Features','价格': 'Pricing','下载': 'Download','常见问题': 'FAQ','登录': 'Sign In','账户管理': 'Account','隐私政策': 'Privacy','开源代码': 'Source',
    '返回首页': 'Home',
    
    // Hero
    '每次打开浏览器，都是新的开始。': 'A fresh start, every time you open a tab.',
    '无广告、无追踪、极简设计的浏览器新标签页': 'No ads, no tracking, just a clean new tab page.',
    '⬇ 安装扩展': '⬇ Install',
    '在线使用': 'Try Online',
    
    // Features
    '你为什么需要它': 'Why you need it',
    '闪电搜索': '⚡ Lightning Search',
    'Google、百度、Bing、知乎、B站、GitHub……12 种引擎，Ctrl+K 聚焦，输入即搜。': 'Google, Baidu, Bing, Zhihu, Bilibili, GitHub… 12 engines. Ctrl+K to focus, type to search.',
    '快捷导航': '📌 Quick Dials',
    '高度自定义的导航卡片，支持图标、分组、拖拽排序。一键直达常用网站。': 'Fully customizable dial cards with icons, groups and drag-and-drop. One click to your favorite sites.',
    '十二种壁纸': '🎨 12 Wallpapers',
    '从深邃海洋到极光夜空，12 种精选渐变壁纸，Pro 版支持自定义上传。': 'From deep ocean to aurora nights, 12 handpicked gradients. Pro adds custom uploads.',
    '天气与农历': '☀️ Weather & Lunar',
    '实时天气、农历日期、节气提醒，一切尽在眼前。': 'Live weather, lunar calendar, solar terms — all at a glance.',
    '云端同步': '☁️ Cloud Sync',
    '登录账号即可跨设备同步导航数据。手动上传下载，数据由你掌控。': 'Sign in to sync dials across devices. Manual upload/download — you control your data.',
    '隐私优先': '🔒 Privacy First',
    '所有数据默认存储在本地。不会追踪、不卖数据、不用第三方分析工具。': 'All data stored locally by default. No tracking, no selling data, no third-party analytics.',

    // Pricing
    '简单定价，无隐藏费用': 'Simple pricing, no hidden fees',
    '免费版': 'Free',
    '¥0': '¥0',
    '6 种搜索引擎': '6 Search Engines',
    '3 个导航分组': '3 Dial Groups',
    '12 种预设壁纸': '12 Preset Wallpapers',
    '随机壁纸': 'Random Wallpapers',
    '天气 + 农历': 'Weather & Lunar',
    '数据统计': 'Analytics',
    '本地数据存储': 'Local Storage',
    '年度': 'Yearly',
    '¥68/年': '¥68/yr',
    '推荐': 'Best Value',
    '免费版全部功能': 'All Free Features',
    '12 种搜索引擎 + 自定义': '12 Engines + Custom',
    '无限导航分组': 'Unlimited Groups',
    '自定义上传壁纸': 'Custom Wallpaper Upload',
    '云端数据同步': 'Cloud Sync',
    '自定义 CSS 样式': 'Custom CSS',
    '终身': 'Lifetime',
    '¥198': '¥198',
    '一次付费，永久使用': 'Pay once, forever',

    // Download
    '下载安装': 'Download',
    'Chrome 商店': 'Chrome Web Store',
    '兼容 Chrome / Edge / Brave / Arc 等 Chromium 内核浏览器': 'Works with Chrome, Edge, Brave, Arc and all Chromium browsers',
    '即将上架，敬请期待': 'Coming soon',
    'Edge Add-ons': 'Edge Add-ons',
    'Microsoft Edge 浏览器官方商店': 'Microsoft Edge official store',
    'Gitee 开源': 'Gitee (Open Source)',
    '查看源码，二次开发，贡献代码': 'View source, customize, contribute',
    '在线使用': 'Try Online',
    '输入 cilacila.cn 直接开始': 'Go to cilacila.cn to start',

    // FAQ
    '免费版够用吗？': 'Is the free version enough?',
    '完全够用。免费版包含 6 种搜索引擎、3 个导航分组、全部壁纸预设和天气功能。Pro 版主要增加云同步、更多引擎和无限分组，适合多设备用户。': 'Absolutely. The free version includes 6 search engines, 3 dial groups, all wallpaper presets and weather. Pro adds cloud sync, more engines and unlimited groups for multi-device users.',
    '会收集我的数据吗？': 'Do you collect my data?',
    '不会。所有数据存储在本地浏览器。云同步由你主动触发上传，数据加密传输，我们无法查看你的导航内容。': 'No. All data is stored locally in your browser. Cloud sync is manually triggered, data is encrypted in transit, and we cannot read your dials.',
    '忘记密码怎么办？': 'Forgot password?',
    '登录后绑定邮箱，即可在官网找回密码。': 'Bind your email after logging in, then reset your password on the website.',
    '付费后能退款吗？': 'Can I get a refund?',
    '购买后 ≈72 小时内可申请退款，发送邮件到 admin@cilacila.cn。终身版不支持退款。': 'Refunds available within ≈72 hours of purchase. Email admin@cilacila.cn. Lifetime licenses are non-refundable.',
    '在手机浏览器上能用吗？': 'Does it work on mobile?',
    '可以在手机浏览器上使用（访问 cilacila.cn），但目前主要优化桌面体验。移动端适配即将上线。': 'Yes, visit cilacila.cn on your phone. Currently optimized for desktop; mobile improvements coming soon.',
    '© 2026 Quick Dial ·': '© 2026 Quick Dial ·',
    '如何找回密码？忘记密码怎么办？': 'Forgot password?',

    // Privacy page
    '隐私政策': 'Privacy Policy',
    '最后更新：2026年6月1日': 'Last updated: June 1, 2026',
    '数据存储': 'Data Storage',
    '的所有使用数据（包括导航书签、主题设置、壁纸偏好、最近访问记录）均存储在您的浏览器本地': ' stores all usage data (bookmarks, themes, wallpaper preferences, recent sites) in your browser\'s local',
    '中。我们不会将您的数据上传至任何服务器，除非您主动使用云同步功能。': '. We do not upload your data to any server unless you actively use the cloud sync feature.',
    '云同步': 'Cloud Sync',
    '用户可选择将数据同步至云端。数据通过': 'users can optionally sync data to the cloud. Data is encrypted via',
    '加密传输，存储于阿里云服务器。我们无法查看您的导航内容，仅保留加密后的数据副本用于跨设备同步。': 'and stored on Alibaba Cloud servers. We cannot view your dials; only encrypted copies are kept for cross-device sync.',
    '信息收集': 'Data Collection',
    '我们不收集任何个人身份信息。注册时仅需用户名和密码。我们不会使用任何分析工具追踪您的使用行为，不会展示第三方广告，不会向第三方出售或共享您的数据。': 'We collect no personally identifiable information. Registration requires only a username and password. We use no analytics tools, show no ads, and never sell or share your data.',
    '支付信息': 'Payments',
    '订阅支付由微信支付和': 'subscriptions are processed by WeChat Pay and',
    '支付宝': 'Alipay',
    '处理。我们不会存储您的支付卡号或银行信息。支付过程完全在微信': 'We do not store your payment card or banking details. Payments are fully handled within WeChat/',
    '支付宝的安全环境中完成。': 'secure environment.',
    '不使用': 'This site does not use',
    '或类似的追踪技术。所有偏好设置通过浏览器': 'or similar tracking technologies. All preferences are managed through browser standard',
    '存储，您可随时在浏览器设置中清除。': 'and can be cleared anytime from your browser settings.',
    '儿童隐私': 'Children\'s Privacy',
    '不面向': 'is not intended for',
    '岁以下的儿童。我们不会故意收集儿童的个人信息。': 'children under the age of 13. We do not knowingly collect personal information from children.',
    '政策变更': 'Policy Changes',
    '如果我们更新隐私政策，新版本将在本页面发布，同时更新页面上方的': 'If we update this privacy policy, the new version will be posted on this page with an updated',
    '。我们将在': 'If we make material changes, we will',
    '个工作日内回复。': 'update this page promptly.',
    '联系': 'Contact',
    '如有隐私相关问题，请发送邮件至': 'For privacy-related inquiries, data deletion requests, or complaints, please email',

    // Account page
    '个人信息': 'Profile',
    '已登录': 'Signed in',
    '已退出': 'Signed out',
    '用户名': 'Username',
    '密码': 'Password',
    '绑定邮箱': 'Bind Email',
    '修改密码': 'Change Password',
    '当前密码': 'Current Password',
    '新密码（至少': 'New Password (min ',
    '位）': ' chars)',
    '找回密码': 'Reset Password',
    '密码至少': 'Password min ',
    '位': ' chars',
    '个字符）': ' chars)',
    '位验证码': '-digit code',
    '发送验证码到绑定邮箱': 'Send code to email',
    '密码已重置': 'Password reset',
    '已发送验证码到': 'Verification code sent to',
    '已验证': 'Verified',
    '未绑定': 'Not bound',
    '使用扩展开通': 'Open in Extension',
    '免费': 'Free',
    '月度': 'Monthly',
    '终身': 'Lifetime',
    '订阅': 'Subscription',
    '扩展后在设置中开通': 'Upgrade in extension settings',
    '登录 / 注册': 'Sign In / Register',
    '已有账号？': 'Have an account?',
    '没有账号？': 'No account?',
    '去登录': 'Sign In',
    '去注册': 'Sign Up',
    '忘记密码？': 'Forgot password?',
    '请输入用户名和密码': 'Enter username and password',
    '登录失败': 'Sign in failed',
    '注册失败': 'Registration failed',
    '刷新': 'Refresh',
    '账户管理': 'Account',
    '账号': 'Account',
  };

  if (lang === 'en') {
    // Walk all text nodes and replace Chinese with English
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (var i = 0; i < nodes.length; i++) {
      var text = nodes[i].nodeValue;
      for (var k in map) {
        if (text.indexOf(k) !== -1) {
          text = text.split(k).join(map[k]);
        }
      }
      nodes[i].nodeValue = text;
    }
  }

  // Expose toggle
  window.qdSwitchLang = function(l) {
    localStorage.setItem('qd-site-lang', l);
    location.search = 'lang=' + (l === 'en' ? 'en' : 'zh');
  };
  window.qdLang = lang;
})();
