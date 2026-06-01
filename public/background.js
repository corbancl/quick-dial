// 点击扩展图标时打开新标签页
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});

// 安装时注册右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'add-to-quick-dial',
    title: '添加到 Quick Dial',
    contexts: ['page', 'link']
  });
});

// 右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'add-to-quick-dial') {
    const pageData = {
      title: info.linkUrl ? (info.selectionText || info.linkUrl) : tab.title || '',
      url: info.linkUrl || tab.url || ''
    };
    // 存储到 chrome.storage，由 App 读取
    chrome.storage.local.set({ 'qd-context-add': pageData });
  }
});
