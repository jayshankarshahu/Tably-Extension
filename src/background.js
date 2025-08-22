chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "getTabs") {
        chrome.tabs.query({}, (tabs) => {
            sendResponse(tabs);
        });
        return true;
    }
});



chrome.commands.onCommand.addListener((command) => {
  if (command === "open_content_script") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["src/content.js"]
      }).catch(() => {
      });
    });
  }
});