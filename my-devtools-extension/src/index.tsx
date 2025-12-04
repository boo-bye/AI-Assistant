/**
 * React 应用入口
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import Panel from './components/Panel';
import globalCss from './index.css';
import panelCss from './components/Panel.css';

// 创建样式元素并注入
const style1 = document.createElement('style');
style1.textContent = globalCss;
document.head.appendChild(style1);

const style2 = document.createElement('style');
style2.textContent = panelCss;
document.head.appendChild(style2);

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);

root.render(
  <React.StrictMode>
    <Panel />
  </React.StrictMode>
);