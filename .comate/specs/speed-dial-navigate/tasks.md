# Speed Dial 极速导航 - 开发任务计划

## 一、项目初始化与工程配置

- [x] 1. 初始化项目工程结构
    - 1.1: 创建 package.json，配置项目名、版本、脚本（dev/build/preview）
    - 1.2: 安装依赖：svelte、@sveltejs/vite-plugin-svelte、vite、typescript
    - 1.3: 创建 tsconfig.json（严格模式，svelte 相关配置）
    - 1.4: 创建 vite.config.ts（集成 svelte 插件）
    - 1.5: 创建 svelte.config.js
    - 1.6: 创建 index.html 入口文件
    - 1.7: 创建 src/ 目录结构（stores、components、utils、types 子目录）
    - 1.8: 创建浏览器扩展相关文件（public/manifest.json、public/icons/）

## 二、类型定义与工具层

- [x] 2. 实现 TypeScript 类型定义

- [x] 3. 实现工具函数
    - 3.1: 创建 src/utils/storage.ts（LocalStorage 封装：load、save、remove，含 JSON 解析错误处理、QUOTA_EXCEED_ERR 捕获）
    - 3.2: 创建 src/utils/search.ts（搜索引擎预设：百度/谷歌/必应，含 {keyword} 替换逻辑）
    - 3.3: 创建 src/utils/theme.ts（CSS 变量切换、主题色计算、内置壁纸预设列表）
    - 3.4: 创建 src/utils/bookmark.ts（浏览器书签 HTML 解析器，DOMParser 提取 <a> 标签）

## 三、Store 状态管理层

- [x] 4. 实现 Svelte Stores
    - 4.1: 创建 src/stores/dials.ts（导航卡片和分组数据的读写操作：增删改查、拖拽排序、分组管理）
    - 4.2: 创建 src/stores/theme.ts（主题模式切换：light/dark、主色调）
    - 4.3: 创建 src/stores/wallpaper.ts（壁纸配置管理：类型切换、本地上传 base64 存储、内置壁纸选择）
    - 4.4: 创建 src/stores/settings.ts（全局设置管理：搜索引擎选择、时钟样式、显示开关等）
    - 4.5: 创建 src/stores/recentSites.ts（最近访问站点记录管理：追加、去重、排序、清空）

## 四、核心 UI 组件开发

- [x] 5. 创建全局样式与根组件
    - 5.1: 创建 src/app.css（CSS 变量主题系统、亮色/暗色配色方案、全局 reset、响应式布局基础）
    - 5.2: 创建 src/main.ts（应用入口：挂载 App 组件）
    - 5.3: 创建 src/App.svelte（根组件：组装所有子组件、初始化 store、监听主题/壁纸变化）

- [x] 6. 实现搜索框组件

- [x] 7. 实现时钟组件
    - 7.1: 创建 src/components/ClockWidget.svelte（实时时钟更新、日期/星期显示、多种样式切换）

- [x] 8. 实现导航核心组件
    - 8.1: 创建 src/components/DialCard.svelte（导航卡片：图标加载 fallback、标题、点击跳转、右键菜单）
    - 8.2: 创建 src/components/DialGroup.svelte（分组容器：标题、折叠/展开、子卡片列表）
    - 8.3: 创建 src/components/SpeedDial.svelte（导航主容器：网格布局、拖拽排序（HTML5 DnD）、空状态）
    - 8.4: 创建 src/components/AddDialModal.svelte（添加/编辑弹窗：表单验证、自动抓取图标、分组选择）
    - 8.5: 创建 src/components/GroupManage.svelte（分组管理弹窗：增删改分组、重命名、拖拽排序）

- [x] 9. 实现辅助功能组件
    - 9.1: 创建 src/components/RecentSites.svelte（最近访问列表：展示、点击跳转、清空按钮）
    - 9.2: 创建 src/components/WallpaperPicker.svelte（壁纸选择器：内置壁纸/纯色/渐变/上传标签页切换）
    - 9.3: 创建 src/components/ImportExport.svelte（导入导出面板：JSON 导入导出、书签 HTML 导入）
    - 9.4: 创建 src/components/SettingsPanel.svelte（设置面板：搜索引擎、时钟样式、显示开关、关于信息）

## 五、集成调试与构建配置

- [x] 10. 集成验证与构建配置
    - 10.1: 确保所有组件在 App.svelte 中正确组装和布局
    - 10.2: 验证拖拽排序功能（同组和跨组拖动）
    - 10.3: 验证数据持久化（刷新后数据保持）
    - 10.4: 验证主题切换（亮色/暗色模式）
    - 10.5: 配置 Vite 构建输出，确保体积优化
    - 10.6: 创建 README.md 项目说明文件
