// devtools.js - 在 DevTools 打开时运行

// 创建一个新的 Panel，标题是 "AI Assistant"
chrome.devtools.panels.create(
  "AI Assistant",      // 这是标签页的名字，用户会看到这个文字
  null,                 // 图标（暂时不需要）
  "panel.html"          // 这个 Panel 对应的 HTML 文件
);

console.log('DevTools Panel 已注册');