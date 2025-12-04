/**
 * DevTools Panel React 组件 - CSS 分析器版本
 */

import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types/index';
import './Panel.css';

const BACKEND_URL = 'http://localhost:3000';

export const Panel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedElementInfo, setSelectedElementInfo] = useState<string>('未选中元素');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 定期检查选中的元素
  useEffect(() => {
    const checkInterval = setInterval(() => {
      updateSelectedElementInfo();
    }, 1000);

    return () => clearInterval(checkInterval);
  }, []);

  /**
   * 更新选中元素的简要信息（用于显示提示）
   */
  const updateSelectedElementInfo = () => {
    chrome.devtools.inspectedWindow.eval(
      `$0 ? $0.tagName.toLowerCase() + (($0.id ? '#' + $0.id : '') + ($0.className ? '.' + Array.from($0.classList).join('.') : '')) : null`,
      (result, isException) => {
        if (!isException && result) {
          setSelectedElementInfo(result);
        } else {
          setSelectedElementInfo('未选中元素');
        }
      }
    );
  };

  /**
   * 获取选中元素的完整样式信息
   */
  const getSelectedElementStyles = (): Promise<any> => {
    return new Promise((resolve) => {
      chrome.devtools.inspectedWindow.eval(
        `
        (function() {
          const el = $0;
          if (!el) return null;
          
          const computed = window.getComputedStyle(el);
          
          return {
            tagName: el.tagName.toLowerCase(),
            id: el.id || 'N/A',
            classes: Array.from(el.classList).join(' ') || 'N/A',
            
            // 布局相关
            layout: {
              display: computed.display,
              position: computed.position,
              width: computed.width,
              height: computed.height,
              top: computed.top,
              left: computed.left,
              right: computed.right,
              bottom: computed.bottom,
              zIndex: computed.zIndex
            },
            
            // 盒模型
            boxModel: {
              padding: computed.padding,
              paddingTop: computed.paddingTop,
              paddingRight: computed.paddingRight,
              paddingBottom: computed.paddingBottom,
              paddingLeft: computed.paddingLeft,
              margin: computed.margin,
              marginTop: computed.marginTop,
              marginRight: computed.marginRight,
              marginBottom: computed.marginBottom,
              marginLeft: computed.marginLeft,
              border: computed.border,
              borderWidth: computed.borderWidth,
              borderStyle: computed.borderStyle,
              borderColor: computed.borderColor,
              borderRadius: computed.borderRadius
            },
            
            // 字体相关
            typography: {
              fontSize: computed.fontSize,
              fontFamily: computed.fontFamily,
              fontWeight: computed.fontWeight,
              fontStyle: computed.fontStyle,
              lineHeight: computed.lineHeight,
              letterSpacing: computed.letterSpacing,
              textAlign: computed.textAlign,
              textDecoration: computed.textDecoration,
              textTransform: computed.textTransform,
              color: computed.color
            },
            
            // 背景相关
            background: {
              backgroundColor: computed.backgroundColor,
              backgroundImage: computed.backgroundImage,
              backgroundSize: computed.backgroundSize,
              backgroundPosition: computed.backgroundPosition,
              backgroundRepeat: computed.backgroundRepeat
            },
            
            // Flexbox
            flexbox: computed.display.includes('flex') ? {
              flexDirection: computed.flexDirection,
              justifyContent: computed.justifyContent,
              alignItems: computed.alignItems,
              flexWrap: computed.flexWrap,
              gap: computed.gap,
              flex: computed.flex,
              flexGrow: computed.flexGrow,
              flexShrink: computed.flexShrink,
              flexBasis: computed.flexBasis
            } : null,
            
            // Grid
            grid: computed.display.includes('grid') ? {
              gridTemplateColumns: computed.gridTemplateColumns,
              gridTemplateRows: computed.gridTemplateRows,
              gap: computed.gap,
              justifyItems: computed.justifyItems,
              alignItems: computed.alignItems,
              gridAutoFlow: computed.gridAutoFlow
            } : null,
            
            // 其他常用属性
            others: {
              opacity: computed.opacity,
              overflow: computed.overflow,
              overflowX: computed.overflowX,
              overflowY: computed.overflowY,
              cursor: computed.cursor,
              visibility: computed.visibility,
              boxShadow: computed.boxShadow,
              transform: computed.transform,
              transition: computed.transition,
              animation: computed.animation
            }
          };
        })()
        `,
        (result, isException) => {
          if (isException) {
            console.error('获取样式失败:', isException);
            resolve(null);
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  /**
   * 从当前检查的页面获取 DOM 信息
   */
  const getPageDOM = (): Promise<any> => {
    return new Promise((resolve) => {
      chrome.devtools.inspectedWindow.eval(
        `({
          dom: document.documentElement.outerHTML.substring(0, 8000),
          title: document.title,
          url: window.location.href,
          bodyText: document.body.innerText.substring(0, 2000)
        })`,
        (result, isException) => {
          if (isException) {
            console.error('获取 DOM 失败:', isException);
            resolve('');
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  /**
   * 从当前检查的页面获取页面信息
   */
  const getPageInfo = (): Promise<any> => {
    return new Promise((resolve) => {
      chrome.devtools.inspectedWindow.eval(
        `({
          title: document.title,
          url: window.location.href,
          headingsCount: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
          imagesCount: document.querySelectorAll('img').length,
          linksCount: document.querySelectorAll('a').length,
          formsCount: document.querySelectorAll('form').length,
          buttons: document.querySelectorAll('button').length,
          inputs: document.querySelectorAll('input').length
        })`,
        (result, isException) => {
          if (isException) {
            resolve('');
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  /**
   * 获取页面整体样式信息
   */
  const getPageStyles = (): Promise<any> => {
    return new Promise((resolve) => {
      chrome.devtools.inspectedWindow.eval(
        `({
          bodyFont: window.getComputedStyle(document.body).fontFamily,
          bodyColor: window.getComputedStyle(document.body).color,
          bodyBg: window.getComputedStyle(document.body).backgroundColor,
          h1Style: document.querySelector('h1') ? {
            fontSize: window.getComputedStyle(document.querySelector('h1')).fontSize,
            color: window.getComputedStyle(document.querySelector('h1')).color,
            fontWeight: window.getComputedStyle(document.querySelector('h1')).fontWeight
          } : 'N/A',
          h2Style: document.querySelector('h2') ? {
            fontSize: window.getComputedStyle(document.querySelector('h2')).fontSize,
            color: window.getComputedStyle(document.querySelector('h2')).color
          } : 'N/A'
        })`,
        (result, isException) => {
          if (isException) {
            resolve('');
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  /**
   * 检测问题需要的工具
   */
  const detectTool = (question: string): string => {
    const lower = question.toLowerCase();

    // CSS/选中元素相关（优先级最高）
    if (
      lower.includes('这个元素') ||
      lower.includes('选中的元素') ||
      lower.includes('当前元素') ||
      lower.includes('该元素') ||
      lower.includes('此元素') ||
      lower.match(/padding|margin|border|font|color|background|width|height|display|position|flex|grid/i)
    ) {
      return 'SELECTED_ELEMENT';
    }

    // 整体样式相关
    if (lower.match(/页面.*样式|整体.*样式|css.*样式|h1|h2|body.*字体/i)) {
      return 'PAGE_STYLES';
    }

    // DOM 相关
    if (lower.match(/dom|html|结构|标签|语义/i)) {
      return 'DOM';
    }

    // 页面信息相关
    if (lower.match(/页面|标题|链接|图片|表单|统计/i)) {
      return 'INFO';
    }

    return 'NONE';
  };

  /**
   * 发送问题到后端并获取回答
   */
  const sendToBackend = async (question: string, context: string = '') => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: question,
          context: context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP 错误! 状态: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      throw error;
    }
  };

  /**
   * 处理用户提交的问题
   */
  const handleSendMessage = async () => {
    const question = input.trim();

    if (!question) {
      setError('请输入问题');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: question,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const tool = detectTool(question);
      console.log('🔧 检测到工具:', tool);

      let pageContext = '';

      if (tool === 'SELECTED_ELEMENT') {
        const styleInfo = await getSelectedElementStyles();
        
        if (!styleInfo) {
          pageContext = `❌ 未选中任何元素

请按照以下步骤操作：
1. 在 DevTools 的 Elements 面板中选中一个元素
2. 可以点击检查工具（🔍）然后点击页面元素
3. 或者直接在 Elements 树中点击元素
4. 选中后再来问我问题

示例问题：
- "这个元素的 padding 是多少？"
- "这个元素用的什么字体？"
- "这个元素的背景色是什么？"`;
        } else {
          pageContext = `【选中元素的样式信息】

元素: <${styleInfo.tagName}${styleInfo.id !== 'N/A' ? ' id="' + styleInfo.id + '"' : ''}${styleInfo.classes !== 'N/A' ? ' class="' + styleInfo.classes + '"' : ''}>

📐 布局信息:
${JSON.stringify(styleInfo.layout, null, 2)}

📦 盒模型:
${JSON.stringify(styleInfo.boxModel, null, 2)}

✍️ 字体排版:
${JSON.stringify(styleInfo.typography, null, 2)}

🎨 背景:
${JSON.stringify(styleInfo.background, null, 2)}

${styleInfo.flexbox ? `📊 Flexbox 布局:\n${JSON.stringify(styleInfo.flexbox, null, 2)}\n` : ''}
${styleInfo.grid ? `📊 Grid 布局:\n${JSON.stringify(styleInfo.grid, null, 2)}\n` : ''}

🔧 其他属性:
${JSON.stringify(styleInfo.others, null, 2)}`;
        }
      } else if (tool === 'PAGE_STYLES') {
        const styleInfo = await getPageStyles();
        if (styleInfo) {
          pageContext = `【页面整体样式信息】\n${JSON.stringify(styleInfo, null, 2)}`;
        }
      } else if (tool === 'DOM') {
        const domInfo = await getPageDOM();
        if (domInfo && domInfo.dom) {
          pageContext = `页面标题: ${domInfo.title}\nURL: ${domInfo.url}\n\nHTML 结构(前8000字符):\n${domInfo.dom}`;
        }
      } else if (tool === 'INFO') {
        const info = await getPageInfo();
        if (info) {
          pageContext = `页面: ${info.title}\nURL: ${info.url}\n\n页面元素统计:\n- 标题数: ${info.headingsCount}\n- 图片数: ${info.imagesCount}\n- 链接数: ${info.linksCount}\n- 表单数: ${info.formsCount}\n- 按钮数: ${info.buttons}\n- 输入框数: ${info.inputs}`;
        }
      }

      const data = await sendToBackend(question, pageContext);

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        timestamp: Date.now(),
        suggestions: data.suggestions
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '未知错误';
      setError(`错误: ${errorMsg}`);
      console.error('发送失败:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理操作建议按钮点击
   */
  const handleSuggestionClick = async (suggestion: any) => {
    console.log('💡 用户点击了建议:', suggestion.action);
    setInput(suggestion.label);
    setTimeout(() => handleSendMessage(), 100);
  };

  /**
   * 处理回车键发送
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="panel-container">
      <div className="panel-header">
        <h1>🎨 CSS 分析助手</h1>
        <p>选中元素，智能分析样式 - 基于 React + TypeScript</p>
      </div>

      {/* 元素选择提示 */}
      <div className="element-selector-hint">
        <span>💡 当前选中: <strong>{selectedElementInfo}</strong></span>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>👋 欢迎使用 CSS 分析助手</p>
            <p>我可以帮你分析页面元素的样式信息</p>
            <ul>
              <li>🎨 查询元素的 CSS 属性</li>
              <li>📐 分析布局方式（Flex/Grid）</li>
              <li>📊 检查页面整体样式</li>
              <li>✨ 提供样式优化建议</li>
            </ul>
            <div className="example-questions">
              <strong>📝 示例问题：</strong>
              <div onClick={() => setInput('这个元素的 padding 是多少？')}>
                "这个元素的 padding 是多少？"
              </div>
              <div onClick={() => setInput('这个元素用的什么字体？')}>
                "这个元素用的什么字体？"
              </div>
              <div onClick={() => setInput('分析这个元素的布局方式')}>
                "分析这个元素的布局方式"
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.timestamp} className={`message message-${msg.role}`}>
              <div className="message-header">
                <span className="message-role">
                  {msg.role === 'user' ? '👤 你' : '🤖 助手'}
                </span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{msg.content}</div>
              
              {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="suggestions">
                  {msg.suggestions.map((suggestion: any) => (
                    <button
                      key={suggestion.id}
                      className="suggestion-button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      title={suggestion.label}
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="message message-assistant">
            <div className="message-header">
              <span className="message-role">🤖 助手</span>
            </div>
            <div className="message-content">
              <div className="loading-spinner">正在分析样式...</div>
            </div>
          </div>
        )}

        {error && (
          <div className="message message-error">
            <div className="message-content">❌ {error}</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          className="input-box"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入你的问题... (Enter 发送)"
          disabled={loading}
        />
        <button
          className="send-button"
          onClick={handleSendMessage}
          disabled={loading || !input.trim()}
        >
          {loading ? '⏳' : '📤'} 发送
        </button>
      </div>
    </div>
  );
};

export default Panel;