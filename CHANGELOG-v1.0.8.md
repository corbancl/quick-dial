# Changelog - Quick Dial v1.0.8

## 🎨 极简重构
- **删除5个组件**: Horoscope（星座运势）、Todo（待办事项）、Notes（便签）、Pomodoro（番茄钟）、Currency（汇率换算）
- **删除3个Store**: horoscope、todo、notes 相关状态管理
- **移除底部 Tab 导航**: 简化页面结构，专注核心功能
- **AI 改为悬浮对话框**: 480px 宽，82vh 高，居中浮窗，不透明深色背景，可拖拽

## 🎯 界面优化
- **默认主题改为深色科技**: 全新视觉风格
- **分组名称水平 Tab 栏**: 紫色高亮标签，保留折叠功能
- **时钟布局改为横排**: 更紧凑的视觉呈现
- **导航卡片重新设计**: 移除侧栏布局，卡片式展示
- **设置面板改为居中 Modal**: scale-fade 动画，透明关闭按钮
- **RSS 订阅改为浮动对话框**: 与 AI 浮窗对称，480px 居中，可滚动 Tab 栏

## 📱 移动端适配
- **天气/农历合并胶囊**: ≤640px 时折叠为紧凑浮动胶囊（天气图标+温度+农历日期），点击展开完整卡片
- **工具栏遮挡修复**: 增加 padding-bottom 防止底部工具栏遮挡内容

## 🐛 Bug 修复
- 修复农历年显示问题（`compact` prop + 正则去除年份）
- 修复设置面板关闭按钮可见性
- 修复主题下拉框同步问题
- 修复 manifest.json 编码损坏导致 CRX 打包失败

## 🔧 技术改进
- 版本号统一更新至 1.0.8
- 所有 manifest 文件编码修复（中文乱码）
- 网站文件编码修复
- 多项 a11y 改进（键盘事件、角色属性）

## 📦 发布包
- Chrome: `quick-dial-v1.0.8-chrome.zip`
- Edge: `quick-dial-v1.0.8-edge.zip`
- Firefox: `quick-dial-v1.0.8-firefox.zip`
- 离线安装: `quick-dial-v1.0.8-offline.zip`
- CRX: `quick-dial-v1.0.8.crx`
- 源码: `quick-dial-v1.0.8-source.zip`
- 网站: `quick-dial-v1.0.8-web.zip`
