chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
      chrome.tabs.create({ url: request.openUrl },function(tab) {
          chrome.tabs.insertCSS(tab.id, { file: "styles.css" });
          chrome.tabs.executeScript(tab.id, { file: "content.js" });
      });
    }
  );