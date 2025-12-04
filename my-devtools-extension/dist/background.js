"use strict";
(() => {
  // src/background.ts
  console.log("\u2713 Background Service Worker \u5DF2\u52A0\u8F7D");
  chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
      console.log("\u{1F4E8} Background \u6536\u5230\u6D88\u606F:", request);
      if (request.action === "analyzePagePerformance") {
        console.log("\u{1F50D} \u5206\u6790\u9875\u9762\u6027\u80FD");
        sendResponse({ status: "analyzing" });
      }
      if (request.action === "storeAnalysisResult") {
        console.log("\u{1F4BE} \u5B58\u50A8\u5206\u6790\u7ED3\u679C");
        sendResponse({ status: "stored" });
      }
      return true;
    }
  );
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
      console.log("\u2713 \u6807\u7B7E\u9875\u52A0\u8F7D\u5B8C\u6210:", tab.url);
    }
  });
  chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log("\u{1F504} \u6807\u7B7E\u9875\u5DF2\u6FC0\u6D3B:", activeInfo.tabId);
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      console.log("\u{1F4C4} \u5F53\u524D\u6807\u7B7E\u9875 URL:", tab.url);
      console.log("\u{1F4C4} \u5F53\u524D\u6807\u7B7E\u9875\u6807\u9898:", tab.title);
    });
  });
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      console.log("\u{1F389} \u6269\u5C55\u5DF2\u5B89\u88C5");
    } else if (details.reason === "update") {
      console.log("\u{1F504} \u6269\u5C55\u5DF2\u66F4\u65B0");
    }
  });
})();
