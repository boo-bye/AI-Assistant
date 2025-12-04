/**
 * Content Script
 * 运行在网页上下文中，能访问页面 DOM 和全局对象
 */

console.log('✓ Content Script 已加载');

/**
 * 监听来自其他脚本的消息
 */
chrome.runtime.onMessage.addListener(
  (request: any, sender: any, sendResponse: (response?: any) => void) => {
    console.log('📨 Content Script 收到消息:', request);

    try {
      // 获取页面 DOM 结构
      if (request.action === 'getPageDOM') {
        const dom = document.documentElement.outerHTML;
        const limitedDOM = dom.substring(0, 10000);

        sendResponse({
          success: true,
          data: {
            dom: limitedDOM,
            title: document.title,
            url: window.location.href,
            characterCount: dom.length
          }
        });
        return true;
      }

      // 获取所有图片信息
      if (request.action === 'getImages') {
        const images = Array.from(document.querySelectorAll('img')).map(
          (img: HTMLImageElement) => ({
            src: img.src,
            alt: img.alt,
            width: img.width,
            height: img.height,
            loading: img.loading
          })
        );

        sendResponse({
          success: true,
          data: { images: images.slice(0, 20) }
        });
        return true;
      }

      // 检测页面中的链接质量
      if (request.action === 'checkLinks') {
        const links = Array.from(document.querySelectorAll('a')).map(
          (link: HTMLAnchorElement) => ({
            href: link.href,
            text: link.textContent?.substring(0, 50),
            hasTitle: !!link.title,
            target: link.target
          })
        );

        const brokenLinks = links.filter(
          (l: any) => !l.href || l.href === '#' || l.href.startsWith('javascript:')
        );

        sendResponse({
          success: true,
          data: {
            totalLinks: links.length,
            brokenLinks: brokenLinks.length,
            externalLinks: links.filter((l: any) => l.href.startsWith('http')).length
          }
        });
        return true;
      }

      // 检查无障碍性问题
      if (request.action === 'checkAccessibility') {
        const issues = {
          missingAlt: Array.from(document.querySelectorAll('img:not([alt])')).length,
          missingLabel: Array.from(
            document.querySelectorAll('input:not([aria-label]):not([id])')
          ).length,
          missingHeading: !document.querySelector('h1'),
          missingLanguage: !document.documentElement.lang,
          lowContrast: 0 // 这需要更复杂的颜色计算
        };

        sendResponse({
          success: true,
          data: issues
        });
        return true;
      }

      // 默认响应
      sendResponse({
        success: false,
        error: '未知的操作'
      });

    } catch (error) {
      console.error('Content Script 错误:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      });
    }

    return true;
  }
);

export {};