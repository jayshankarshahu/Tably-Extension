(function() {

  const getTabs = () => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({action: "getTabs"}, (res) => {
        resolve(res);
      })
    })
  }

  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.zIndex = "999999";
  overlay.style.opacity = "1";

  document.body.appendChild(overlay);

  const box = document.createElement("div");
  box.style.position = "absolute";
  box.style.top = "50%";
  box.style.left = "50%";
  box.style.transform = "translate(-50%, -50%)";
  box.style.backgroundColor = "#000";
  box.style.padding = "20px";
  box.style.borderRadius = "12px";
  box.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
  box.style.maxHeight = "70%";
  box.style.overflowY = "auto";
  box.style.minWidth = "300px";
  box.style.textAlign = "left";
  overlay.appendChild(box);

  getTabs().then(tabs => {
    if (!tabs || !tabs.length) {
      box.innerText = "No tabs found.";
      return; 
    }

    tabs.sort((a,b) => {
      return b.lastAccessed - a.lastAccessed;
    })

    tabs.forEach((tab) => {
      const row = document.createElement("div");
      row.innerText = `${tab.title}`;
      row.style.padding = "6px 0";
      row.style.borderBottom = "1px solid #ddd";
      row.style.fontFamily = "sans-serif";
      row.style.fontSize = "14px";
      box.appendChild(row);
    });
    
  });
  
  document.addEventListener('keyup', handleKeyUp, true);

  let isAltPressed = true;

  function cleanup() {
    if (overlay && overlay.parentNode) {
      overlay.style.opacity = "0";
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.remove();
        }
      }, 200);
    }

    document.removeEventListener('keyup', handleKeyUp);
  }

  function handleKeyUp(e) {
    if (e.key === 'Alt' || !e.altKey) {
      isAltPressed = false;
      if (!isAltPressed) cleanup();
    }
  }

})();




