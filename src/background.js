function getAllTabs(callback) {
  chrome.tabs.query({}, function(tabs) {
    callback(tabs);
  });
}


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