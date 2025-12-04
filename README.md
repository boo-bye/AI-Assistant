

# AI DevTools Assistant

> 一个嵌入 Chrome DevTools 的智能页面分析助手，通过自然语言与网页交互，实时获取 DOM / CSS / 布局信息，并提供结构化建议。

------

## 📌 项目简介

AI DevTools Assistant 是一个基于 **Chrome DevTools 扩展**的前端开发辅助工具。
 它允许用户使用自然语言直接在 DevTools 面板中查询当前网页的结构、样式、布局与性能问题。

工具通过 `chrome.devtools.inspectedWindow.eval()` 在被检查页面的上下文执行代码，将提取到的页面信息传递给后端，再由 LLM 模型（硅基流动 / DeepSeek）进行分析并返回优化建议。

本项目的目标是**简化 Debug 流程、提升前端开发效率**，适合作为课程作业/工程实践项目。

------

## ✨ 主要功能列表

- **自然语言查询页面结构**
   例如 "帮我分析这段 DOM 是否语义化合理"
- **自动识别布局方式**（Flex / Grid / Flow）
   并返回优化建议
- **实时读取选中元素信息**
   包括：computed style、盒模型、布局约束
- **代码注入执行**
   使用 `inspectedWindow.eval()` 在被检查页面执行 JS
- **后端代理 LLM 请求**
   隐藏 API Key，避免前端暴露
- **结构化返回结果**
   适合作为 Prompt 输入或页面提示

------

## 🏗 技术架构图与说明


<img src="./assets/image1.png" alt="图片说明" style="zoom: 33%;" />

### 架构说明

- **DevTools Panel（前端）**
   使用 React + TypeScript 构建，负责 UI、输入输出展示、调用 eval。

- **inspectedWindow.eval()**
   将用户请求注入被检查页面，并获取 DOM/CSS 信息。

- Node.js 后端代理

  用 Express 构建，负责：

  - 接收 DevTools 请求
  - 转发 LLM API
  - 保护 API Key
  - 格式化响应

- **LLM API**
   使用硅基流动访问 DeepSeek-V3 或其他大模型。

------

## 🔧 核心模块设计与实现描述

### 1. DevTools 面板模块（React）

负责：

- 创建自定义 DevTools Panel
- UI 输入框、日志窗口
- 将用户指令封装成请求对象
- 调用 `inspectedWindow.eval()` 采集信息

关键点：
 使用 `chrome.devtools.panels.create()` 创建独立面板。

------

### 2. 页面信息采集模块（eval 注入）

通过：

```javascript
chrome.devtools.inspectedWindow.eval(
  (function() {
    const el = $0; // DevTools 当前选中元素
    return {
      tag: el.tagName,
      styles: getComputedStyle(el),
      rect: el.getBoundingClientRect()
    };
  })();
, callback);
```

返回 DOM、样式、布局等数据。

### 3. 后端接口模块（Node.js + Express）

职责：

- 接收前端提交的 eval 结果和用户问题
- 调用 LLM API
- 返回结构化建议

示例路由：

```javascript
app.post("/api/analyze", async (req, res) => {
  const { question, pageData } = req.body;
  const answer = await callLLM({ question, pageData });
  res.json(answer);
});
```

### 4. LLM 代理模块（硅基流动）

通过硅基流动 API 调用 DeepSeek-V3：

```javascript
const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", { ... });
```

------

## 🧪 开发与调试指南

### 1. 安装依赖

```bash
npm install
cd backend
npm install
```

### 2. 配置 API Key（后端）

文件：`backend/.env`

```env
SILICONFLOW_API_KEY=你的密钥
```

### 3. 启动后端

```bash
cd backend
node server.js
```

### 4. 启动前端（DevTools Panel）

```bash
npm run build
```

将生成的 `dist/` 作为扩展加载。

### 5. 加载 Chrome 扩展

- 打开 `chrome://extensions/`
- 开启 **开发者模式**
- 选择"加载已解压的扩展程序"
- 指向项目根目录
- 打开 DevTools → 切换到 **AI Assistant** 面板
