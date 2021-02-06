chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        chrome.tabs.create({ url: request.openUrl }, function(tab) {
            chrome.tabs.insertCSS(tab.id, { file: "styles.css" });
            chrome.tabs.executeScript(tab.id, { file: "content.js" });
        });
    }
);

chrome.runtime.onMessage.addListener((msg, sender) => {
    if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
        chrome.pageAction.show(sender.tab.id);
    }
});

// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
    // Replace all rules ...
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        // With a new rule ...
        chrome.declarativeContent.onPageChanged.addRules([{
            // That fires when a page's URL contains a 'g' ...
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { urlMatches: '.amazon.' },
                })
            ],
            // And shows the extension's page action.
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});