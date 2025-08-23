chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    if (msg.action === "getTabs") {
        chrome.tabs.query({}, (tabs) => {
            sendResponse(tabs);
        });
        return true;
    }

    if(msg.action === "activateTab") {
      chrome.tabs.update(msg.id, { active: true },(tab)=> {
        chrome.windows.update(tab.windowId, { focused: true });
      });
    }
});



chrome.commands.onCommand.addListener((command) => {
  if (command === "open_content_script") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;

      chrome.tabs.sendMessage(tabId, "is_open_content", (response) => {
        if (chrome.runtime.lastError || !response) {
          chrome.scripting.executeScript({
            target: { tabId },
            files: ["src/content.js"]
          });
        }
      });
    });
  }
});
