/**
 * Background Service Worker
 * 处理扩展级别的后台任务和通信
 */

console.log('✓ Background Service Worker 已加载');

/**
 * 监听来自 Content Script 或 DevTools Panel 的消息
 */
chrome.runtime.onMessage.addListener(
  (request: any, sender: any, sendResponse: (response?: any) => void) => {
    console.log('📨 Background 收到消息:', request);

    // 示例：处理来自 content script 的消息
    if (request.action === 'analyzePagePerformance') {
      console.log('🔍 分析页面性能');
      sendResponse({ status: 'analyzing' });
    }

    // 示例：处理来自 devtools 的消息
    if (request.action === 'storeAnalysisResult') {
      console.log('💾 存储分析结果');
      sendResponse({ status: 'stored' });
    }

    // 必须返回 true 来表示会异步调用 sendResponse
    return true;
  }
);

/**
 * 监听标签页更新事件
 */
chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: any, tab: any) => {
  if (changeInfo.status === 'complete') {
    console.log('✓ 标签页加载完成:', tab.url);
  }
});

/**
 * 标签页被激活
 */
chrome.tabs.onActivated.addListener((activeInfo: any) => {
  console.log('🔄 标签页已激活:', activeInfo.tabId);
  
  // 获取激活标签页的信息
  chrome.tabs.get(activeInfo.tabId, (tab: any) => {
    console.log('📄 当前标签页 URL:', tab.url);
    console.log('📄 当前标签页标题:', tab.title);
  });
});

/**
 * 扩展被安装或更新
 */
chrome.runtime.onInstalled.addListener((details: any) => {
  if (details.reason === 'install') {
    console.log('🎉 扩展已安装');
  } else if (details.reason === 'update') {
    console.log('🔄 扩展已更新');
  }
});

export {};