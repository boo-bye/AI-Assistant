"use strict";
(() => {
  // src/content.ts
  console.log("\u2713 Content Script \u5DF2\u52A0\u8F7D");
  chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
      console.log("\u{1F4E8} Content Script \u6536\u5230\u6D88\u606F:", request);
      try {
        if (request.action === "getPageDOM") {
          const dom = document.documentElement.outerHTML;
          const limitedDOM = dom.substring(0, 1e4);
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
        if (request.action === "getImages") {
          const images = Array.from(document.querySelectorAll("img")).map(
            (img) => ({
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
        if (request.action === "checkLinks") {
          const links = Array.from(document.querySelectorAll("a")).map(
            (link) => ({
              href: link.href,
              text: link.textContent?.substring(0, 50),
              hasTitle: !!link.title,
              target: link.target
            })
          );
          const brokenLinks = links.filter(
            (l) => !l.href || l.href === "#" || l.href.startsWith("javascript:")
          );
          sendResponse({
            success: true,
            data: {
              totalLinks: links.length,
              brokenLinks: brokenLinks.length,
              externalLinks: links.filter((l) => l.href.startsWith("http")).length
            }
          });
          return true;
        }
        if (request.action === "checkAccessibility") {
          const issues = {
            missingAlt: Array.from(document.querySelectorAll("img:not([alt])")).length,
            missingLabel: Array.from(
              document.querySelectorAll("input:not([aria-label]):not([id])")
            ).length,
            missingHeading: !document.querySelector("h1"),
            missingLanguage: !document.documentElement.lang,
            lowContrast: 0
            // 这需要更复杂的颜色计算
          };
          sendResponse({
            success: true,
            data: issues
          });
          return true;
        }
        sendResponse({
          success: false,
          error: "\u672A\u77E5\u7684\u64CD\u4F5C"
        });
      } catch (error) {
        console.error("Content Script \u9519\u8BEF:", error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : "\u672A\u77E5\u9519\u8BEF"
        });
      }
      return true;
    }
  );
})();
